import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./env";

export class SecurityHeaders {
    public static setupCORS(app: Hono) {
        const allowedOrigins = process.env.NODE_ENV === 'production'
            ? [...env("CORS_ORIGIN").split(",").map(c => c.trim())]
            : ['http://localhost:3000', 'http://localhost:3001'];

        return app.use("/*", cors({
            origin: (origin, c) => {
                if (!origin) return null; // Reject requests without origin
                return allowedOrigins.includes(origin) ? origin : null;
            },
            credentials: true,
            maxAge: 86400, // 24 hours
            allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowHeaders: ['Content-Type', 'Authorization', "Cookie", 'X-Requested-With', 'Header'],
        }));
    }

    public static setupSecurityHeaders(app: Hono) {
        return app.use("/*", async (c, next) => {
            // Security headers
            c.header('X-Content-Type-Options', 'nosniff');
            c.header('X-Frame-Options', 'DENY');
            c.header('X-XSS-Protection', '1; mode=block');
            c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
            c.header("x-real-ip", '127.0.0.1')

            if (process.env.NODE_ENV === 'production') {
                c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
                c.header('Content-Security-Policy',
                    "default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "img-src 'self' data: https://res.cloudinary.com; " +
                    "connect-src 'self';"
                );
            }

            await next();
        });
    }
}