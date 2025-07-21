import express from "express";
import { loginUser, verifyUser, viewProfile } from "../controllers/user.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post("/login",loginUser);
router.post("/verify",verifyUser);
router.get("/profile",authenticate,viewProfile);

export default router;