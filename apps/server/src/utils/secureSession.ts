import { createHmac, randomBytes } from "crypto";
import { env } from "../config/env";
import db from "../config/db";
import type { MyContext } from "../server/trpc/context";

export class SecureSessionManagerServices {
    public static generateSecureToken(): string {
        return randomBytes(32).toString('hex');
    }

    public static signToken(payload: string, secret: string): string {
        return createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
    }

    public static async createSession() {
        const sessionToken = this.generateSecureToken();
        const signature = this.signToken(sessionToken, env('SESSION_SECRET'));
        const secureToken = `${sessionToken}.${signature}`;
        return secureToken;
    }

    public static async verifySession(token: string, ctx: MyContext) {
        const [sessionToken, signature] = token.split('.');

        if (!sessionToken || !signature) return null;

        const expectedSignature = this.signToken(sessionToken, env('SESSION_SECRET'));

        if (signature !== expectedSignature) return null;

        const ipAddress = ctx.get("ip") ?? '';
        const userAgent = ctx.get("userAgent") ?? '';

        const findSession = await db.query.sessions.findFirst({
            where: (sessions, { eq }) => eq(sessions.sessionToken, token),
            with: {
                staff: true
            }
        });
        if (!findSession) return null;
        // check if sessionToken is valid but ipAddress or userAgent invalid
        if (findSession.userAgent !== userAgent) return null;
        return findSession;
    }
}