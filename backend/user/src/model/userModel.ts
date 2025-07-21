import mongoose, { Schema } from "mongoose";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
}


const userSchema:Schema<IUser>  = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true
    }
},{
    timestamps:true
});

export const User = mongoose.model("User",userSchema);