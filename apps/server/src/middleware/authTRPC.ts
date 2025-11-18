import { t } from "../server/trpc/procedures";
import { SecureSessionManagerServices } from "../utils/secureSession";
import { Helper } from "../utils/helper";
import { AuthEnumMessage } from "@/api/modules/admin/auth/utils/authEnumMessage";
import { RateLimiterMiddleware } from "./rateLimiterMiddleware";
import { adminSessionTokenName } from "@/api/packages/utils/constants/auth";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import type { MyContext } from "../server/trpc/context";
import { DOMAndSanitizeService } from "@/api/packages/utils/DOMAndSanitize";

export class AuthTRPCMiddleware {

    public static async authSessionFunc(ctx: MyContext) {
        const error = await RateLimiterMiddleware.rateLimitAPI(ctx);
        if (error.error && error.message) {
            throw HandlerTRPCError.TRPCErrorMessage(error.message, "TOO_MANY_REQUESTS");
        }
        const authHeader = ctx.req.header("authorization");
        const sessionToken = ctx.get("getCookie").get(adminSessionTokenName) || authHeader?.replace("Bearer ", "");
        if (!sessionToken || sessionToken === undefined) throw HandlerTRPCError.TRPCErrorMessage(AuthEnumMessage.unauthorized, "UNAUTHORIZED");
        const sessionInfo = await SecureSessionManagerServices.verifySession(sessionToken, ctx);
        if (!sessionInfo) throw HandlerTRPCError.TRPCErrorMessage(AuthEnumMessage.notFound, "UNAUTHORIZED");
        if (sessionInfo.expired < Helper.currentDate()) throw HandlerTRPCError.TRPCErrorMessage(AuthEnumMessage.expiredSessionToken, "UNAUTHORIZED");
        if (sessionInfo.staff && sessionInfo.staff.status !== "ACTIVE") {
            ctx.get("deleteCookie").del(adminSessionTokenName);
            throw HandlerTRPCError.TRPCErrorMessage(AuthEnumMessage.disabledAccount, "UNAUTHORIZED");
        }
        ctx.set("session", {
            sessionId: sessionInfo.id,
            sessionToken: sessionInfo.sessionToken,
            staffId: sessionInfo.staffId
        });
        return ctx;
    }

    // trpc auth
    public static authSession = t.middleware(async ({ ctx, next }) => {
        const result = await this.authSessionFunc(ctx);
        if (!result) throw HandlerTRPCError.TRPCErrorMessage("Unauthorized", "UNAUTHORIZED");
        return next();
    });

    public static alreadySignIn = t.middleware(async ({ ctx, next }) => {
        const error = await RateLimiterMiddleware.rateLimitAuth(ctx);
        if (error.error && error.message) {
            throw HandlerTRPCError.TRPCErrorMessage(error.message, "TOO_MANY_REQUESTS");
        }
        const authHeader = ctx?.req?.header("authorization");
        const sessionToken = ctx.get("getCookie").get(adminSessionTokenName) || authHeader?.replace("Bearer ", "");
        if (sessionToken) {
            const sessionInfo = await SecureSessionManagerServices.verifySession(sessionToken, ctx);
            const hasSessionAndValid = sessionInfo && sessionInfo.updatedAt as Date > Helper.currentDate();
            const hasSessionTokenAndInfo = sessionToken && sessionInfo;
            if (hasSessionAndValid || hasSessionTokenAndInfo) {
                throw HandlerTRPCError.TRPCErrorMessage(AuthEnumMessage.alreadySignIn, "FORBIDDEN");
            }
            ctx.get("deleteCookie").del(adminSessionTokenName);
        }
        return next();
    });

    public static authSanitizedBody = t.middleware(async ({ ctx, input, next }) => {
        const result = await this.authSessionFunc(ctx);
        if (!result) throw HandlerTRPCError.TRPCErrorMessage("Unauthorized", "UNAUTHORIZED");
        const sanitizeBody = DOMAndSanitizeService.domAndSanitizeObject(input);
        if (sanitizeBody) {
            ctx.set("body", sanitizeBody);
            return next();
        }
        throw HandlerTRPCError.TRPCErrorMessage("Sanitize body data is required", "FORBIDDEN");
    });
}
