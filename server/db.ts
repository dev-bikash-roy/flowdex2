import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

dotenv.config();

let pool: any;
let db: any;

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not found in environment variables. Using mock database.");
  
  // Mock database connection to avoid breaking imports
  pool = {
    query: () => Promise.resolve({ rows: [] }),
    connect: () => Promise.resolve({
      query: () => Promise.resolve({ rows: [] }),
      release: () => {}
    }),
    end: () => Promise.resolve()
  };

  // Mock drizzle db to avoid breaking imports
  db = {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve([]),
        orderBy: () => Promise.resolve([])
      })
    }),
    insert: () => ({
      values: () => ({
        onConflictDoUpdate: () => ({
          returning: () => Promise.resolve([])
        }),
        returning: () => Promise.resolve([])
      })
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([])
        })
      })
    }),
    delete: () => ({
      where: () => ({
        rowCount: 0
      })
    })
  } as any;
} else {
  console.log("Connecting to PostgreSQL database...");
  
  // Create a PostgreSQL pool using the DATABASE_URL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Create Drizzle ORM instance
  db = drizzle(pool, { schema });
  
  // Test the connection
  pool.query('SELECT 1', (err: any, res: any) => {
    if (err) {
      console.error('Database connection failed:', err.message);
    } else {
      console.log('Database connection successful!');
    }
  });
}

export { pool, db };