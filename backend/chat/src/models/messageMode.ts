import mongoose,{Document,Schema,Types} from "mongoose";
import { Chat } from "./chatModel";


export interface IMessage extends Document{
   chatId: Types.ObjectId;
   sender:string;
   text?:string;
   image?:{
     url:string;
     publicName:string;
   };
   messageType: 'image' | 'text';
   seen: boolean;
   seenAt?: Date;
   createdAt:Date;
   updatedAt:Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
    chatId:{
        type:Schema.Types.ObjectId,
        ref:Chat,
        required:true
    },
    sender:{
        type:String,
        required:true
    },
    text:{
        type:String
    },
    image:{
        url:String,
        publicName:String
    },
    messageType:{
       type:String,
       enum:["text","image"],
       default:"text"
    },
    seen:{
        type:Boolean,
        default:false
    },
    seenAt:{
        type:Date,
        default:null
    }
},{
    timestamps:true
});

export const Messages = mongoose.model<IMessage>("Messages",messageSchema);


