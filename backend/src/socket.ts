import { Server, Socket } from "socket.io";
import { pushMessage, getHistory } from "./lib/redis.js";

type Msg = { name: string; message?: string; file?: string };

function extractRoom(socket: Socket): string | null {
  const src =
    (socket.handshake.auth as any)?.room ??
    (socket.handshake.query as any)?.room ??
    (socket.handshake.headers as any)?.room;
  if (!src) return null;
  if (Array.isArray(src)) return (src[0] ?? "").toString().trim();
  return src.toString().trim();
}

export function setupSocket(io: Server) {
  io.use((socket, next) => {
    const room = extractRoom(socket);
    socket.data.room = room && room.length ? room : "lobby";
    next();
  });

  io.on("connection", async (socket) => {
    const room = (socket.data.room as string) || "lobby";
    await socket.join(room);

    try {
      const history = await getHistory(room, 30);
      socket.emit("history", history || []);
    } catch {
      socket.emit("history", []);
    }

    socket.on("message", async (data: Msg) => {
      socket.to(room).emit("message", data);
      try {
        await pushMessage(room, data);
      } catch {}
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected from room: ${room}`);
    });
  });
}