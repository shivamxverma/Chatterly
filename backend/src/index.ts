import express from "express";
import Loaders from './loaders';
import logger from './loaders/logger';
import env from './config/index';
import { closeDatabaseConnection } from "./loaders/postgres";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import redis from "./loaders/redis";
import { setupSocket } from "./loaders/socket";

const corsOptions = {
  origin: ["http://localhost:3000", "https://admin.socket.io"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}

async function startServer(){
  const app = express();
  await Loaders({ expressApp: app });

  const port = Number(env.PORT) || 8020;

  const server = createServer(app);

  const io = new Server(server, {
    cors : corsOptions,
    adapter : createAdapter(redis)
  })

  setupSocket(io);

  const socketserver = server
    .listen(port, '0.0.0.0', () => {
      logger.info(`🛡️ Server listening on port: ${port} 🛡️`);
    })
    .on('error', (err) => {
      logger.error(err);
      process.exit(1);
    });


    let isShuttingDown = false;
    const shutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      logger.info(`${signal} received, closing server gracefully...`);

      try {
        await new Promise<void>((resolve, reject) => {
          io.close((err) => (err ? reject(err) : resolve()));
        });
        logger.info('Socket.IO server closed');
      } catch (error) {
        logger.error('Error closing Socket.IO server:', error);
      }

      socketserver.close(async () => {
        logger.info('HTTP server closed');
        try {
          await closeDatabaseConnection();
          try {
            await redis.quit();
          } catch (error) {
            logger.error('Error closing Redis connection:', error);
          }
          logger.info('All connections closed successfully');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
  
      setTimeout(() => {
        logger.error('Forcefully shutting down...');
        process.exit(1);
      }, 10000);
    };
  
    // Signal listeners for graceful shutdown:
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();