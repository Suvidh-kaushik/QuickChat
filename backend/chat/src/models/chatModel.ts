import mongoose,{Document, Schema} from "mongoose";


export interface iChat extends Document{
    users:string[];
    latestMessage:{
        text:string;
        sender: string;
    };
    createdAt: Date;
    updatedAt: Date;
}


export const chatSchema:Schema<iChat> = new mongoose.Schema({
    users:[{type:String,required:true}],
    latestMessage:{
        text:{
            type:String
        },
        sender:{
            type:String
        }
    }
},
    {
        timestamps: true
    }
)


export const Chat = mongoose.model<iChat>("Chat", chatSchema);
