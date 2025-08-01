import redis from "../config/redis.js";

function toJson(msg: unknown) {
  return JSON.stringify(msg);
}

export async function pushMessage(
  room: string,
  msg: unknown,
  maxHistory = 100
) {
  const historyKey = `chat:${room}`;
  const pendingKey = `chat:${room}:pending`;

  await redis
    .multi()
    .lpush(historyKey, toJson(msg))
    .ltrim(historyKey, 0, maxHistory - 1)
    .lpush(pendingKey, toJson(msg))
    .exec();
}

export async function getHistory(room: string, n = 30) {
  const historyKey = `chat:${room}`;
  const raw = await redis.lrange(historyKey, 0, n - 1);
  return raw.reverse().map((s) => JSON.parse(s));
}