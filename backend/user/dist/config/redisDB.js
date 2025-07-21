import "dotenv/config";
import { createClient } from "redis";
export const redisClient = createClient({
    url: process.env.REDIS_URL,
});
const connectToRedis = async () => {
    try {
        await redisClient.connect();
        console.log("Redis has been connected successfully");
    }
    catch (error) {
        console.error("Error while connecting to redis", error);
        process.exit(1);
    }
};
export default connectToRedis;
