import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export const verifyJWTtoken = async(token:string)=>{
    return jwt.verify(token,JWT_SECRET) as JwtPayload;
}
