import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config();
let redis: Redis;
redis = new Redis(process.env.REDIS_URL as string);
export default redis;