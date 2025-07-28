import {z} from "zod";
import { Gender } from "../../../model/userModel.js";

export const sendOTPSchema = z.object({
    email: z.email({message: "Invalid email format"})
}).strict();

export const SignupSchema = z.object({
    email: z.email({message: "Invalid email format"}),
    username: z.string().nonempty({message: "Username is required"}).min(3, {message: "username must be at least 3 characters long"}).max(20, {message: "username must not exceed 20 characters"}),
    gender: z.enum(Object.values(Gender) as [Gender, ...Gender[]], { message: "gender is required" })
}).strict();

export const verifyOTPSchema = z.object({
    email: z.email({ message: "Invalid email format" }),
    otp: z.string().length(6, { message: "OTP must be 6 digits long" }),
}).strict();


export const getUserProfileSchema = z.object({
    userId: z.string().nonempty({ message: "User ID is required" })
}).strict();