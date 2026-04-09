import * as schema from '../drizzle/schema';
import * as relations from '../drizzle/relations';
import logger from './logger';
import env from '../config/index';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';

export let db: NodePgDatabase<typeof schema & typeof relations>;
let pool: Pool;

export async function getDrizzleClient() {
  if (!db) {
    try {
      pool = new Pool({
        connectionString: env.DATABASE_URL,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
        allowExitOnIdle: false, // Keep pool alive even if all clients are idle
      });

      // Handle pool errors
      pool.on('error', (err) => {
        logger.error('Unexpected database pool error:', err);
      });

      // Test the connection
      const client = await pool.connect();
      client.release(); // Important: release the client back to the pool

      db = drizzle({ client: pool, schema: { ...schema, ...relations } });

      logger.info('🛡️  Database connection established successfully  🛡️');
    } catch (error) {
      logger.error('‼️    Failed to initialize database connection:', error);
      throw error;
    }
  }
  return db;
}

export async function closeDatabaseConnection() {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
  }
}
