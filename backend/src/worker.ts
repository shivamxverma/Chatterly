import redis from "./config/redis.js";
import prisma from "./config/db.config.js";

async function flushPending(room: string) {
  const pendingKey = `chat:${room}:pending`;
  const items = await redis.lrange(pendingKey, 0, -1);
  if (!items.length) return;
  await redis.del(pendingKey);
  const chats = items.reverse().map((s : any) =>
    JSON.parse(s) as { name: string; message?: string; file?: string }
  );
  await prisma.chats.createMany({
    data: chats.map((c : any) => ({
      group_id: room,
      name: c.name,
      message: c.message ?? null,
      file: c.file ?? null,
    })),
    skipDuplicates: true,
  });
}

async function main() {
  while (true) {
    const keys = await redis.keys("chat:*:pending");
    const rooms = keys.map((k : any) => k.replace(/:pending$/, ""));
    await Promise.all(rooms.map(flushPending));
    await new Promise((r) => setTimeout(r, 5000));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});