import { createHmac, randomBytes } from "crypto";
import { env } from "../config/env";
import db from "../config/db";
import type { MyContext } from "../server/trpc/context";
import { AuthEnumMessage } from "../modules/admin/auth/utils/authEnumMessage";

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

    public static async verifySession(token: string, ctx: MyContext['honoContext']) {
        const [sessionToken, signature] = token.split('.');

        if (!sessionToken || !signature) {
            return {
                message: "SessionToken and signature is required",
            }
        }

        const expectedSignature = this.signToken(sessionToken, env('SESSION_SECRET'));

        if (signature !== expectedSignature) {
            return {
                message: "Invalid signatire",
            }
        }

        const userAgent = ctx.get("userAgent") ?? '';

        const sessionInfo = await db.query.sessions.findFirst({
            where: (sessions, { eq }) => eq(sessions.sessionToken, token),
            with: {
                staff: true
            }
        });
        if (!sessionInfo){
            return {
                message: "Find not found",
            }
        }
        // check if sessionToken is valid but ipAddress or userAgent invalid
        if (sessionInfo.userAgent !== userAgent){
            return {
                message: "Invalid user system",
            }
        }

        if(sessionInfo.staff.status !== "ACTIVE"){
            return {
                message: AuthEnumMessage.disabledAccount,
            }
        }
        return {
            message: "success",
            data: sessionInfo
        };
    }
}