import { Redis } from "ioredis";
let redis: Redis;
if (process.env.NODE_ENV === "production") {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL environment variable is not set");
  }
  redis = new Redis(process.env.REDIS_URL);
} else {
  redis = new Redis({
    host: "localhost",
    port: 6379,
  });
}


export default redis;