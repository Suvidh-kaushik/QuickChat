import { NextFunction, Request, Response } from "express";
import { IUser, User } from "../models/userMode.js";
import { verifyJWTtoken } from "../utils/verfiyJWTtoken.js";

export interface AuthenticatedRequest extends Request{
    user?: IUser | null;
}


export const authenticate = async(req:AuthenticatedRequest,res:Response,next:NextFunction)=>{
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(401).json({
                error:"unauthorized no token found"
            })
        }

        const decoded=await verifyJWTtoken(token);

        if(!decoded){
            return res.status(401).json({
                error:"unauthorized invalid token found"
            })
        }

        const user=await User.findById(decoded.userId)
       
        if(!user){
            return res.status(404).json({
                error:"user not found"
            })
        }

        req.user=user
        next();

    }catch(error){
        console.log(error);
       return res.status(500).json({
            message:"Internal server error"
        })
    }
}