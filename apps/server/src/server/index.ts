import { serve } from 'bun';
import app from './trpc/app';
import { env } from '../config/env';
import { websocket } from 'hono/bun'

serve({
  fetch: app.fetch,
  port: `${env("PORT")}` as any,
  websocket
});

console.log(`✅ Server running at http://localhost:${env("PORT")}`);
