import { Request, Response } from "express";
import { publishToQueue } from "../config/rabbitMQ.js";
import { redisClient } from "../config/redisDB.js";
import { AuthenticatedRequest } from "../middlewares/authenticate.js";
import { User } from "../model/userModel.js";
import { generateToken } from "../utils/genJwtToken.js";
import TryCatch from "../utils/TryCatch.js";
import { generateAvatarURL } from "../utils/genDefaultAvatar.js";

export const initiateSignup = TryCatch(async (req: Request, res: Response) => {
  const { email, username, gender } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email already registered." });
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return res.status(409).json({ message: "Username already taken." });
  }

  const rateLimitKey = `otp:ratelimit:${email}`;
  if (await redisClient.get(rateLimitKey)) {
    return res.status(429).json({ message: "Too many requests." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await redisClient.set(`signup:data:${email}`, JSON.stringify({ username, gender }), {
    EX: 600, 
  });

  await redisClient.set(`otp:${email}`, otp, { EX: 300 }); 
  await redisClient.set(rateLimitKey, "true", { EX: 60 }); 

  await publishToQueue("send-otp", {
    to: email,
    subject: "Your verification code",
    body: `Your OTP is ${otp}`,
  });

  res.status(200).json({ message: "OTP sent to your email." });
});


export const verifySignup = TryCatch(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const storedOtp = await redisClient.get(`otp:${email}`);
  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const storedData = await redisClient.get(`signup:data:${email}`);
  if (!storedData) {
    return res.status(400).json({ message: "Signup data expired or not found." });
  }

  const { username, gender } = JSON.parse(storedData);

  const avatar = generateAvatarURL(gender, username);

  const user = await User.create({
    email,
    username,
    gender,
    image_url: avatar,
  });

  await redisClient.del(`otp:${email}`);
  await redisClient.del(`signup:data:${email}`);

  generateToken(user.id, res);

  res.status(201).json({
    message: "User registered successfully",
    user: { id: user.id, username, email },
  });
});

export const sendLoginOTP = TryCatch(async(req,res)=>{
    const {email} = req.body;

    const rateLimitKey = `otp:ratelimit:${email}`
    const rateLimit = await redisClient.get(rateLimitKey)
    if(rateLimit){
        res.status(429).json({
            message:"Too many requests. Please wait before requesting new opt"
        })
        return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpKey = `otp:${email}`
    await redisClient.set(otpKey,otp,{
        EX:300,
    });

    await redisClient.set(rateLimitKey,'true',{
        EX:60
    })
    
    const message ={
        to:email,
        subject:"Your login otp code",
        body:`Your OTP to login is ${otp}, It is valid for 5 minutes`
    }

    await publishToQueue("send-otp",message);

    return res.status(200).json({
        message:"OTP sent successfully to your mail."
    })
})

export const login = TryCatch(async(req:Request,res:Response)=>{
    const {email,otp} = req.body;
    
    const user = await User.findOne({email});
    if(!user){
        return res.status(401).json({
            message:"User not found. Please register first."
        })
    }

    const otpKey = `otp:${email}`;
    const storedOTP = await redisClient.get(otpKey);
    
    if(!storedOTP || storedOTP !== otp){
        return res.status(400).json({
            message:"Invalid or expired OTP"
        })
    } 

    await redisClient.del(otpKey);

    generateToken(user.id, res);

    return res.status(200).json({
        message:"User logged in successfully"
    })
})


export const getAllUsers = TryCatch(async(req:Request,res:Response)=>{
    const {next,limit=10,prev} = req.query;
    
    let query;

     if (next && prev) {
        return res.status(400).json({
            message: "Cannot use both 'next' and 'prev' cursors at the same time."
        });
    }

    if(next){
        query = { _id: { $gt: next } };
    }
    else if(prev){
        query = { _id: { $lt: prev } };
    } else {
        query = {};
    }

    const users = await User.find(query).sort({ _id: 1 }).limit(Number(limit));
    const nextCursor = users.length > 0 ? users[users.length - 1]._id : null;
    const prevCursor = users.length > 0 ? users[0]._id : null;
    const count = users.length;

    return res.status(200).json({
        message: "Users fetched successfully",
        users: users,
        next: nextCursor,
        prev: prevCursor,
        count
    });
});


export const getUser = TryCatch(async(req:Request,res:Response)=>{
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    return res.status(200).json({
        message: "User profile fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            image_url: user.image_url
        }
    });
});


export const getUserProfile = TryCatch(async(req:AuthenticatedRequest,res:Response)=>{
    const data = req.user;

   if(!data){
    return res.status(401).json({
        message:"Unauthenticated user"
    })
   }

   return res.status(200).json({
     data
   })

})