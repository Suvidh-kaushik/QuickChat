import express from "express";
import {getAllUsers, getUser, getUserProfile, initiateSignup, login   , sendLoginOTP, verifySignup } from "../controllers/user.js";
import { getUserProfileSchema, sendOTPSchema, SignupSchema, verifyOTPSchema } from "../middlewares/validators/ZodSchemas/ZodUserSchemas.js";
import { validateRequestBodyMiddleware, validateRequestQueryMiddleware } from "../middlewares/validators/validateRequestMiddleware.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post("/send",validateRequestBodyMiddleware(sendOTPSchema),sendLoginOTP);
router.post("/login",validateRequestBodyMiddleware(verifyOTPSchema),login);


router.post("/signup",validateRequestBodyMiddleware(SignupSchema),initiateSignup);
router.post("/verifySignup", validateRequestBodyMiddleware(verifyOTPSchema), verifySignup);

router.get("/users",getAllUsers);

router.get("/users/:userId",validateRequestQueryMiddleware(getUserProfileSchema),getUser);
router.get("/user/profile",authenticate,getUserProfile);

export default router;