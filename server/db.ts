import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use in-memory database for development if DATABASE_URL is not set
const isDevelopment = process.env.NODE_ENV?.trim().toLowerCase() === 'development' || 
                     process.env.DEVELOPMENT === 'true' ||
                     (!process.env.NODE_ENV && !process.env.REPL_ID);

if (!process.env.DATABASE_URL) {
  if (isDevelopment) {
    console.warn("DATABASE_URL not set. Using in-memory database for development.");
    // We'll handle this in the storage layer instead
  } else {
    throw new Error("DATABASE_URL environment variable is required in production");
  }
}

export const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
export const db = pool ? drizzle({ client: pool, schema }) : null;