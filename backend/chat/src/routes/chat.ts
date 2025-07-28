import express from "express";
import { authenticate } from "../middlewares/authenticate";
import { createChat, getAllChats, getAllMessages, sendMessage } from "../controllers/chat";
import { upload } from "../config/multerHandler";

const router = express.Router();

router.post("/chat/new",authenticate,createChat);

router.get("/chats",authenticate,getAllChats)

router.post("/message",authenticate,upload.single('image'),sendMessage);

router.get("/chat/:chatId",authenticate,getAllMessages)


export default router;