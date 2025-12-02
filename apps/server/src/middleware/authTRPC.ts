import { t } from "../server/trpc/procedures";
import { SecureSessionManagerServices } from "../utils/secureSession";
import { Helper } from "../utils/helper";
import { AuthEnumMessage } from "@/api/modules/admin/auth/utils/authEnumMessage";
import { RateLimiterMiddleware } from "./rateLimiterMiddleware";
import { adminSessionTokenName } from "@/api/packages/utils/constants/variables/auth";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import type { MyContext } from "../server/trpc/context";
import { DOMAndSanitizedServices } from "@/api/packages/utils/DOMAndSanitize";

export class AuthTRPCMiddleware {

    public static async authSessionFunc(ctx: MyContext) {
        const c = ctx.honoContext;
        const error = await RateLimiterMiddleware.rateLimitAPI(c);
        if (error.error && error.message) {
            throw HandlerTRPCError.TRPCErrorMessage(error.message, "TOO_MANY_REQUESTS");
        }
        const authHeader = c.req.header("authorization");
        const sessionToken = c.get("getCookie").get(adminSessionTokenName) || authHeader?.replace("Bearer ", "");
        if (!sessionToken || sessionToken === undefined) throw HandlerTRPCError.TRPCErrorMessage(AuthEnumMessage.unauthorized, "UNAUTHORIZED");
        const result = await SecureSessionManagerServices.verifySession(sessionToken, c);
        if (result.error) {
            throw HandlerTRPCError.TRPCErrorMessage(result?.message, "FORBIDDEN");
        }
        const session = result.data;
        if (!session) throw HandlerTRPCError.TRPCErrorMessage("Session is required", "FORBIDDEN");
        if (session.expired < Helper.currentDate()) throw HandlerTRPCError.TRPCErrorMessage(AuthEnumMessage.expiredSessionToken, "UNAUTHORIZED");
        if (session.staff && session.staff.status !== "ACTIVE") {
            c.get("deleteCookie").del(adminSessionTokenName);
            throw HandlerTRPCError.TRPCErrorMessage(AuthEnumMessage.disabledAccount, "UNAUTHORIZED");
        }
        c.set("session", {
            sessionId: session.id,
            sessionToken: session.sessionToken,
            staffId: session.staffId
        });
        return c;
    }

    // trpc auth
    public static authSession = t.middleware(async ({ ctx, next }) => {
        const result = await this.authSessionFunc(ctx);
        if (!result) throw HandlerTRPCError.TRPCErrorMessage("Unauthorized", "UNAUTHORIZED");
        return next();
    });

    public static alreadySignIn = t.middleware(async ({ ctx, next }) => {
        const c = ctx.honoContext;
        const error = await RateLimiterMiddleware.rateLimitAuth(c);
        if (error.error && error.message) {
            throw HandlerTRPCError.TRPCErrorMessage(error.message, "TOO_MANY_REQUESTS");
        }
        const authHeader = c?.req?.header("authorization");
        const sessionToken = c.get("getCookie").get(adminSessionTokenName) || authHeader?.replace("Bearer ", "");
        if (sessionToken) {
            const result = await SecureSessionManagerServices.verifySession(sessionToken, c);
            if (result.error) {
                throw HandlerTRPCError.TRPCErrorMessage(result?.message, "FORBIDDEN");
            }
            const session = result.data;
            if (!session) throw HandlerTRPCError.TRPCErrorMessage("Session is required", "FORBIDDEN");
            const hasSessionAndValid = session && session.updatedAt as Date > Helper.currentDate();
            const hasSessionTokenAndInfo = sessionToken && session;
            if (hasSessionAndValid || hasSessionTokenAndInfo) {
                throw HandlerTRPCError.TRPCErrorMessage(AuthEnumMessage.alreadySignIn, "FORBIDDEN");
            }
            c.get("deleteCookie").del(adminSessionTokenName);
        }
        return next();
    });

    public static authSanitizedBody = t.middleware(async ({ ctx, input, next }) => {
        const result = await this.authSessionFunc(ctx);
        if (!result) throw HandlerTRPCError.TRPCErrorMessage("Unauthorized", "UNAUTHORIZED");
        const sanitizeBody = DOMAndSanitizedServices.domAndSanitizeObject(input);
        if (sanitizeBody) {
            ctx.honoContext.set("body", sanitizeBody);
            return next();
        }
        throw HandlerTRPCError.TRPCErrorMessage("Sanitize body data is required", "FORBIDDEN");
    });
}
