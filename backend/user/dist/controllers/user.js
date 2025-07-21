import { publishToQueue } from "../config/rabbitMQ.js";
import { redisClient } from "../config/redisDB.js";
import { User } from "../model/userModel.js";
import { generateJWTtoken } from "../utils/genJwtToken.js";
import TryCatch from "../utils/TryCatch.js";
import { uniqueUsernameGen } from "../utils/uniqueNameGen.js";
export const loginUser = TryCatch(async (req, res) => {
    const { email } = req.body;
    const rateLimitKey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if (rateLimit) {
        res.status(429).json({
            message: "Too many requests. Please wait before requesting new opt"
        });
        return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, {
        EX: 300,
    });
    await redisClient.set(rateLimitKey, 'true', {
        EX: 60
    });
    const message = {
        to: email,
        subject: "Your login otp code",
        body: `Your OTP to login is ${otp}, It is valid for 5 minutes`
    };
    await publishToQueue("send-otp", message);
    return res.status(200).json({
        message: "OTP sent successfully to your mail."
    });
});

export const verifyUser = TryCatch(async (req, res) => {
    const { email, otp: enteredOTP } = req.body;
    if (!email || !enteredOTP) {
        return res.status(400).json({
            message: "Both Email and OTP are required"
        });
    }
    const otpKey = `otp:${email}`;
    const storedOTP = await redisClient.get(otpKey);
    console.log(storedOTP, " ", enteredOTP);
    if (!storedOTP || storedOTP !== enteredOTP) {
        return res.status(400).json({
            message: "Invalid/expired OTP"
        });
    }
    await redisClient.del(otpKey);
    let user = await User.findOne({ email });
    if (!user) {
        const name = uniqueUsernameGen;
        user = await User.create({ name, email });
    }
    const token = await generateJWTtoken(user.id);
    return res.status(200).json({
        message: "User verified",
    });
});
