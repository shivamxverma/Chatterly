import express from "express";
import Loaders from './loaders';
import logger from './loaders/logger';
import env from './config/index';

async function startServer(){
  const app = express();
  await Loaders({ expressApp: app });

  const port = Number(env.PORT) || 8020;

  const server = app
    .listen(port, '0.0.0.0', () => {
      logger.info(`🛡️ Server listening on port: ${port} 🛡️`);
    })
    .on('error', (err) => {
      logger.error(err);
      process.exit(1);
    });

    let isServerClosed : boolean = false;

    const shutdown = async (signal: string) => {
      if(isServerClosed){
        logger.info("Server closed is already being processed");
      }
      logger.info(`${signal} received, closing server gracefully...`);
  
      server.close(async () => {
        logger.info('HTTP server closed');
        try {
          await closeDatabaseConnection();
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