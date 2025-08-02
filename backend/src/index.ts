import express, { Application } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import redis from "./config/redis.js";
import Routes from "./routes/index.js";
import { setupSocket } from "./socket.js";

const app: Application = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", Routes);

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://admin.socket.io"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
  adapter: createAdapter(redis),
});

setupSocket(io);

const PORT = process.env.PORT ?? 8000;
server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
