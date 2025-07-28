import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authenticate";
import TryCatch from "../utils/TryCatch";
import { Chat } from "../models/chatModel";
import { IMessage, Messages } from "../models/messageMode";
import axios from "axios";
import { IUser } from "../models/userMode";

export const createChat = TryCatch(async(req: AuthenticatedRequest, res: Response) => {
   const userId = req.user?._id;
   const {otherUserId} = req.body;
   if(!otherUserId){
       return res.status(400).json({
           error: "otheruserId is required to create a chat"
       });
   }
    
   const existingChat = await Chat.findOne({users:{$all:[userId,otherUserId],$size: 2}});

   if(existingChat){
    return res.status(200).json({
        message:"Chat already exists",
        chatId : existingChat._id
    });
   }
   
   const newChat = await Chat.create(
    {
        users:[userId,otherUserId]
    }
   );

   return res.status(201).json({
      message:"New chat created successfully",
      chatId: newChat._id
   });
})


interface GetUserResponse {
  message: string;
  user: IUser;
}

export const getAllChats = TryCatch(async(req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if(!userId){
        return res.status(401).json({
            message: "Unauthenticated user"
        });
    }

    const chats = await Chat.find({users:userId}).sort({updatedAt: -1});
    
    const chatWithUserData = await Promise.all(
        chats.map(async(chat)=>{
           const otherUserId = chat.users.find((id)=>id!==userId) //return the id which is not the userId since there are only 2 there


           // unseenCount gives the number of messages which are unseen
           const unSeenCount = await Messages.countDocuments({
            chatId:chat._id,
            sender:otherUserId,
            seen:false
           })

           try{
            const res = await axios.get<GetUserResponse>(`${process.env.USER_SERVICE}/api/v1/users/${otherUserId}`);

            return {
                user:res.data.user,
                chat:{
                    ...chat.toObject(),
                    latestMessage:chat.latestMessage || null,
                    unSeenCount,
                }
            }
           }catch(error){
            console.log(error);
            return {
                user:{_id:otherUserId,username:"Unknown"},
                chat:{
                    ...chat.toObject(),
                    lastestMessage:chat.latestMessage || null,
                    unSeenCount,
                }
            }
           }
        })
    )
    return res.status(200).json({
        chats:chatWithUserData
    })
});


export const sendMessage = TryCatch(async(req:AuthenticatedRequest,res:Response)=>{
    const senderId = req.user?._id;
    const{chatId,text} = req.body;
    const imageFile = req.file;
    
     if(!senderId){
        return res.status(401).json({
            message: "Unauthenticated user"
        });
    }

    if(!chatId){
        return res.status(400).json({
            message:"ChatId is required"
        })
    }

    if(!text && !imageFile){
        return res.status(400).json({
            message:"Either Text/Image is required"
        })
    }
    
    const chat = await Chat.findById(chatId);

    if(!chat){
        return res.status(404).json({
            message:"Chat not Found"
        })
    }

    const isUserInChat = chat.users.some((userId)=>userId.toString()===senderId.toString());

    if(!isUserInChat){
        return res.status(403).json({
            message:"Unauthorized to message here"
        })
    }
    
    const otherUserId = chat.users.find((userId)=>userId.toString()!== senderId.toString());

    if(!otherUserId){
        return res.status(404).json({
            message:"Other User is Not found"
        })
    }


    //SOCKET SETUP



    let messageData:any = {
        chatId,
        sender:senderId.toString(),
        seen:false,
        seenAt:undefined,
    };

    if(imageFile){
        messageData.image = {
            url: imageFile.path,
            publicName: imageFile.filename
        };
        messageData.messageType = "image";
        messageData.text = text || "";
    }
    else{
        messageData.text=text;
        messageData.messageType="text"
    }

    const message = new Messages(messageData);

    const savedMessage = await message.save();

    const latestMessageText = imageFile? "📷- Image" : text;
    await Chat.findByIdAndUpdate(chatId,{
        latestMessage:{
            text:latestMessageText,
            sender:senderId
        },
        updatedAt: new Date()
    },{new: true});


    // emit to sockets

    return res.status(201).json({
        message:savedMessage,
        sender:senderId
    })
})


export const getAllMessages = TryCatch(async(req:AuthenticatedRequest,res:Response)=>{
    const userId = req.user?._id;
    const {chatId} = req.params;

    if(!chatId){
       return res.status(400).json({
        message:"chatId is required"
       })
    }

    const chat = await Chat.findById(chatId);
    if(!chat){
        return res.status(404).json({
            message:"Not Found"
        })
    }
    const isAuthorized = chat?.users.some((id)=>id === userId);

    if(!isAuthorized){
         return res.status(403).json({
            message:"Unauthorized Request"
        })
    }

    const messagesToMarkSeen = await Messages.find({
        chatId:chatId,
        sender:{$ne: userId},
        seen:false
    });

    await Messages.updateMany({
        chatId:chatId,
        sender:{$ne: userId},
        seen:false
    },{
        seen:true,
        seenAt:new Date()
    })

    const messages = await Messages.find({chatId}).sort({createdAt:1});

    const otherUserId = chat.users.find((id)=>id.toString()!==userId);
    
    try{
     const {data} = await axios.get<GetUserResponse>(`${process.env.USER_SERVICE}/api/v1/users/${otherUserId}`);

     if(!otherUserId){
         return res.status(404).json({
            message:"User Not Found"
        })
     }

     //SOCKET WORK

     return res.status(200).json({
        messages,
        user:data //other user data
     });

    }catch(err){
     console.log(err);
     return res.status(200).json({
        messages,
        user:{_id:otherUserId,username:"Unknown_user"}
     });
    }
})