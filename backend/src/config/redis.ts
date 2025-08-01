import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config();
let redis: Redis;
if (process.env.NODE_ENV === "production") {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL environment variable is not defined");
  }
  redis = new Redis(process.env.REDIS_URL as string);
} else {
  redis = new Redis({
    host: "localhost",
    port: 6379,
  });
}


export default redis;