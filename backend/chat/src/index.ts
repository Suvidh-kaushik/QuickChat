import express from "express";
import dotenv from "dotenv";
import connectToMongoDB from "./config/mongoDB";
import chatRoutes from "./routes/chat";
import cookieParser from "cookie-parser";
dotenv.config();
connectToMongoDB();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1",chatRoutes)

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});