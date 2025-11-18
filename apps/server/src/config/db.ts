import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from './env';
// Import only the schema object from '../db' to avoid circular dependency issues
import * as all from '../db';

const db = drizzle(env("DATABASE_URL"), {
    schema: all
});

export default db;