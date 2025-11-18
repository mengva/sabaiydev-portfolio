import dotenv from 'dotenv'

dotenv.config()

import { defineConfig, type Config } from 'drizzle-kit';
import { env } from './src/config/env';
export default defineConfig({
  out: './drizzle',
  schema: './src/db/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env("DATABASE_URL"),
  },
}) satisfies Config;