import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

// Determine if the current environment is development
const isDevelopment =
  process.env.NODE_ENV?.trim().toLowerCase() === 'development' ||
  process.env.DEVELOPMENT === 'true' ||
  (!process.env.NODE_ENV && !process.env.REPL_ID);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  if (isDevelopment) {
    console.warn('DATABASE_URL not set. Using in-memory database for development.');
    // We'll handle this in the storage layer instead
  } else {
    throw new Error(
      'DATABASE_URL environment variable is required. Set DATABASE_URL to connect to your database.'
    );
  }
}

export const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;
export const db = pool ? drizzle({ client: pool, schema }) : null;

// Perform a startup test query to verify the connection and log detailed errors
if (pool) {
  pool.query('SELECT 1').catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Database connection test failed: ${message}`, err);
  });
}

