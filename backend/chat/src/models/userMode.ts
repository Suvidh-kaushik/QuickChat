import mongoose, { Schema } from "mongoose";

export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other"
}

export interface IUser extends mongoose.Document {
    username: string;
    email: string;
    image_url:string;
    gender:Gender
}


const userSchema:Schema<IUser>  = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    image_url:{
        type:String,
        default:""
    },
    gender:{
        type:String,
        enum:Object.values(Gender),  //restrict values to enum
        required:true
    }
},{
    timestamps:true
});

export const User = mongoose.model("User",userSchema);