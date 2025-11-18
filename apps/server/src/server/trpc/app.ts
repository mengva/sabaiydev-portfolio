import { Hono } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { logger } from 'hono/logger'
import { appRouter } from './router';
import { createdTRPCContext, handleSetKeyInHono } from './context';
import { header } from '../../config/env';
import restAPIRoute from './routes';
import { HandlerHonoError } from '@/api/utils/handlerHonoError';
import { updatedSession } from '@/api/middleware/updateSession';

const app = new Hono();

app.use("/*", logger());

app.use("*", async (c, next) => {
    await handleSetKeyInHono(c); // ✅ set before using
    await next();
});

// update staff session
app.use("/*", updatedSession);

// Enable CORS for all routes

header.setupCORS(app);

header.setupSecurityHeaders(app);

app.use('/trpc/*', trpcServer({
    router: appRouter,
    createContext: async (req, c) => {
        const context = await createdTRPCContext(c);
        return typeof context === 'object' ? context : {};
    },
}));

app.onError(HandlerHonoError.onError);

app.route("/api", restAPIRoute);

// Test route
app.get('/', async (c) => {
    return c.json({
        message: "Hello Hono + trpc",
    });
});

export default app;

