import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
export const generateJWTtoken = async (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15d" });
};