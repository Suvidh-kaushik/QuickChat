import express from 'express';
import dotenv from 'dotenv';
import connectToMongoDB from './config/mongoDB.js';
import connectToRedis from './config/redisDB.js';
import userRouter from './routes/user.js';
import { connectToRabbitMQ } from './config/rabbitMQ.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
connectToRedis();
connectToMongoDB();
connectToRabbitMQ();
app.use(express.json());
app.use("/api/v1", userRouter);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
