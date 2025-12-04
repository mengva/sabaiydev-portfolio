import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { Context as HonoContext } from "hono"
import { HandlerTRPCError } from '@/server/utils/handleTRPCError';

export class RateLimiterMiddleware {
    public static authLimiter = new RateLimiterMemory({
        points: 5, // 5 attempts
        duration: 900, // per 15 minutes
        blockDuration: 900, // block for 15 minutes
    });

    public static apiLimiter = new RateLimiterMemory({
        points: 100, // 100 requests
        duration: 60, // per minute
    });

    public static getClientIP(c: HonoContext): string {
        const reqHeader = c.req.raw.headers;
        const resHeader = c.res.headers;
        // Try various headers in order of preference
        const forwardedFor = resHeader.get('x-forwarded-for')
        if (forwardedFor) {
            // x-forwarded-for can be a list, take the first one
            const firstForwarded = forwardedFor.split(',')[0];
            return firstForwarded ? firstForwarded.trim() : '';
        }
        const realIP = resHeader.get('x-real-ip')
        if (realIP) {
            return realIP;
        }
        const cfConnectingIP = resHeader.get('cf-connecting-ip');
        if (cfConnectingIP) {
            return cfConnectingIP;
        }
        // Fallback to remote address (if available in your environment)
        // @ts-ignore - env specific
        const remoteAddr = c.env?.remoteAddr || reqHeader.get('x-forwarded-for') || resHeader.get("x-forwarded-for")
        return remoteAddr || '';
    }

    public static rateLimitAuth = async (c: HonoContext) => {
        try {
            const key = this.getClientIP(c);
            await this.authLimiter.consume(key);
            return {
                error: false
            }
        } catch (rateLimiterRes) {
            const res = rateLimiterRes as { msBeforeNext: number };
            return {
                error: true,
                // message: `Too many authentication attempts. Try again in ${Math.round(res.msBeforeNext / 1000)} seconds`
                message: `Too many authentication attempts. Try again after in 5 minutes`
            }
        }
    };

    public static getUserAgent(reqHeader: HonoContext['req']['raw']['headers']) {
        return reqHeader.get('User-Agent');
    }

    public static rateLimitAPI = async (c: HonoContext) => {
        try {
            const key = this.getClientIP(c);
            await this.apiLimiter.consume(key);
            return {
                error: false
            }
        } catch (rateLimiterRes) {
            return {
                error: true,
                message: `Too many requests`
            }
        }
    };

    public static async rateLimitAuthAndApi(c: HonoContext) {
        try {
            const url = c.req.url;
            // check which limiter to use
            if (['admin.auth', 'auth'].includes(url)) {
                await this.rateLimitAuth(c);
            } else {
                await this.rateLimitAPI(c);
            }
        } catch {
            throw HandlerTRPCError.TRPCErrorMessage(
                "Too many requests",
                "TOO_MANY_REQUESTS"
            );
        }
    }
}