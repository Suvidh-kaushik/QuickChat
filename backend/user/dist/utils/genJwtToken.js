import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: "15d" // in how many days does token expire
    });
    // creating a cookie and storing the token there instead of localstorage
    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, //in count of millie seconds 
        httpOnly: true, // prevents XSS attacks cross-site scripting attacks 
        sameSite: "strict", //prevents CSRF attacks cross-site request forgery attacks
    });
};
export const verifyJWTtoken = async (token) => {
    return jwt.verify(token, JWT_SECRET);
};
