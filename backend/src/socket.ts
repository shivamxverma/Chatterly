import { Server, Socket } from "socket.io";
import { pushMessage, getHistory } from "./lib/redis.js";

interface CustomSocket extends Socket {
  room?: string;
}

export function setupSocket(io: Server) {
  io.use((socket: CustomSocket, next) => {
    const room = socket.handshake.auth.room || socket.handshake.headers["room"];
    if (!room) return next(new Error("Invalid room"));
    socket.room = room;
    next();
  });

  io.on("connection", async (socket: CustomSocket) => {
    if (!socket.room) return socket.disconnect(true);
    socket.join(socket.room);
    const history = await getHistory(socket.room, 30);
    socket.emit("history", history);

    socket.on("message", async (data: { name: string; message?: string; file?: string }) => {
      socket.to(socket.room!).emit("message", data);
      await pushMessage(socket.room!, data);
    });

    socket.on("disconnect", () => {
      console.log(socket.id, "disconnected");
    });
  });
}
