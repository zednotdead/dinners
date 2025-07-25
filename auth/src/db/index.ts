import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.AUTH_DATABASE_URL,
});

export const db = drizzle({ client: pool });
