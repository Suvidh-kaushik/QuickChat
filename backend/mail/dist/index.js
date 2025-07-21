import express from "express";
import dotenv from "dotenv";
import { startSendOtpConsumer } from "./consumer.js";
dotenv.config();
startSendOtpConsumer();
const app = express();
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
