import { Server, Socket } from "socket.io";
import { produceMessage } from "./helper.js";

interface CustomSocket extends Socket {
  room?: string;
}
export function setupSocket(io: Server) {
  io.use((socket: CustomSocket, next) => {
    const room = socket.handshake.auth.room || socket.handshake.headers.room;
    if (!room) {
      return next(new Error("Invalid room"));
    }
    socket.room = room;
    next();
  });

  io.on("connection", (socket: CustomSocket) => {
    // * Join the room
    if (socket.room) {
      socket.join(socket.room);
    } else {
      console.error("socket.room is undefined for socket:", socket.id);
    }

    socket.on("message", async (data) => {
      try {
        await produceMessage("chats", data);
      } catch (error) {
        console.log("The kafka produce error is", error);
      }
      if (socket.room) {
        socket.to(socket.room).emit("message", data);
      } else {
        console.error("Cannot emit message, socket.room is undefined for socket:", socket.id);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
}