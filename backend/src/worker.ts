import redis from "./config/redis.js";
import prisma from "./config/db.config.js";

async function flushPending(roomId: string) {
  const pendingKey = `chat:${roomId}:pending`;
  const processingKey = `chat:${roomId}:processing`;

  try {
    await redis.rename(pendingKey, processingKey);
  } catch (err) {
    // If rename fails, the key likely doesn't exist anymore. Safe to skip.
    return;
  }

  // Retrieve items from the processing list
  const items = await redis.lrange(processingKey, 0, -1);
  if (!items.length) {
    await redis.del(processingKey);
    return;
  }

  const chats = items.map((s: string) => JSON.parse(s));

  try {
    // Bulk insert into Prisma, including the original ID and timestamp
    await prisma.chats.createMany({
      data: chats.map((c: any) => ({
        id: c.id,                                   
        group_id: roomId,                          
        name: c.name,
        message: c.message ?? null,
        file: c.file ?? null,
        created_at: new Date(c.created_at),       
      })),
      skipDuplicates: true,
    });

    await redis.del(processingKey);
    
  } catch (error) {
    console.error(`Failed to flush room ${roomId} to database:`, error);
  }
}

async function scanKeys(pattern: string) {
  let cursor = "0";
  const keys: string[] = [];

  do {
    const [nextCursor, batch] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = nextCursor;
    keys.push(...batch);
  } while (cursor !== "0");

  return keys;
}

async function runWithLimit(tasks: (() => Promise<any>)[], limit: number) {
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const current = i++;
      await tasks[current]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
}

async function main() {
  console.log("Worker started: Monitoring Redis for pending chats...");

  while (true) {
    try {
      const keys = await scanKeys("chat:*:pending");
      
      const rooms = keys.map((k) => {
        const parts = k.split(':');
        return parts[1]; 
      });

      if (rooms.length > 0) {
        await runWithLimit(
          rooms.map((room) => () => flushPending(room)),
          10
        );
      }
    } catch (err) {
      console.error("Loop error:", err);
    }

    await new Promise((r) => setTimeout(r, 5000));
  }
}

main().catch((e) => {
  console.error("Fatal Worker Error:", e);
  process.exit(1);
});