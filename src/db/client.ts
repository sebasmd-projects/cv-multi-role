import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

/**
 * Un solo proceso Node bajo Passenger: un solo pool, reutilizado entre
 * peticiones y conservado en globalThis para sobrevivir al HMR en desarrollo.
 * connectionLimit bajo — el hosting compartido limita conexiones simultáneas.
 */
const globalForDb = globalThis as unknown as { pool?: mysql.Pool };

const pool =
  globalForDb.pool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
    charset: 'utf8mb4_unicode_ci',
    timezone: 'Z',
    enableKeepAlive: true,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

export const db = drizzle(pool, { schema, mode: 'default' });
export { schema };
