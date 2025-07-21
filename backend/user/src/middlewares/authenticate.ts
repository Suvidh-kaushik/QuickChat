import { NextFunction, Request, Response } from "express";
import { IUser, User } from "../model/userModel.js";
import { verifyJWTtoken } from "../utils/genJwtToken.js";

export interface AuthenticatedRequest extends Request{
    user?: IUser | null;
}


export const authenticate = async(req:AuthenticatedRequest,res:Response,next:NextFunction)=>{
    try{

      const authHeader = req.headers.authorization;

      if(!authHeader || !authHeader.startsWith("Bearer ")){
         return res.status(401).json({
            message:"Unauthenticated user"
         })
      }
     
      const token = authHeader.split(" ")[1];

      const decodedValue = await verifyJWTtoken(token);

      if(!decodedValue || !decodedValue.userId){
         return res.status(401).json({
            message:"Unauthenticated user"
         })
      }

      const userData = await User.findOne({id:decodedValue.userId});

      req.user = userData;

      next();

    }catch(error){
        res.status(500).json({
            message:"Internal server error"
        })
    }
}