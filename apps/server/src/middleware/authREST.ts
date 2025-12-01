import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { SecureSessionManagerServices } from "../utils/secureSession";
import { Helper } from "../utils/helper";
import { AuthEnumMessage } from "@/api/modules/admin/auth/utils/authEnumMessage";
import { RateLimiterMiddleware } from "./rateLimiterMiddleware";
import { adminSessionTokenName } from "@/api/packages/utils/constants/variables/auth";
import type { MyContext } from "../server/trpc/context";
import { DomAndSanitizeRESTBodyMiddleware } from "./domAndSanitizeRESTBody";

export class AuthRestMiddleware {

    public static async authSessionFunc(c: MyContext['honoContext']) {
        const error = await RateLimiterMiddleware.rateLimitAPI(c);
        if (error.error && error.message) {
            throw new HTTPException(429, { message: error.message });
        }
        const authHeader = c.req.header("authorization");
        const sessionToken = c.get("getCookie").get(adminSessionTokenName) || authHeader?.replace("Bearer ", "");
        if (!sessionToken || sessionToken === undefined) {
            throw new HTTPException(401, { message: AuthEnumMessage.unauthorized });
        }
        const result = await SecureSessionManagerServices.verifySession(sessionToken, c);
        if (result?.message !== "success") {
            throw new HTTPException(403, { message: result.message });
        }
        const session = result.data;
        if (!session) {
            throw new HTTPException(404, { message: AuthEnumMessage.notFound });
        }
        if (session.expired < Helper.currentDate()) {
            throw new HTTPException(401, { message: AuthEnumMessage.expiredSessionToken });
        }
        if (session.staff && session.staff.status !== "ACTIVE") {
            c.get("deleteCookie").del(adminSessionTokenName)
            throw new HTTPException(401, { message: AuthEnumMessage.disabledAccount });
        }
        c.set("session", {
            sessionId: session.id,
            sessionToken: session.sessionToken,
            staffId: session.staffId
        });
        return c;
    }

    public static authSession = createMiddleware(async (c, next) => {
        const result = await this.authSessionFunc(c);
        if (!result) throw new HTTPException(401, { message: "Unauthorized" });
        return await next();
    });

    public static alreadySignIn = createMiddleware(async (c, next) => {
        const error = await RateLimiterMiddleware.rateLimitAuth(c);
        if (error.error && error.message) {
            throw new HTTPException(429, { message: error.message });
        }
        const authHeader = c.req.header("authorization");
        const sessionToken = c.get("getCookie").get(adminSessionTokenName) || authHeader?.replace("Bearer ", "");
        if (!sessionToken) {
            return await next();
        }
        const result = await SecureSessionManagerServices.verifySession(sessionToken, c);
        if (result?.message !== "success") {
            throw new HTTPException(403, { message: result.message });
        }
        const session = result.data;
        if (!session) throw new HTTPException(400, { message: "Session is required" });
        const hasSessionAndValid = session.updatedAt as Date > Helper.currentDate();
        const hasSessionTokenAndInfo = sessionToken && session;
        if (hasSessionAndValid || hasSessionTokenAndInfo) {
            throw new HTTPException(403, { message: AuthEnumMessage.alreadySignIn });
        }
        return await next();
    });

    public static authSanitizedBody = createMiddleware(async (c, next) => {
        const result = await this.authSessionFunc(c);
        if (!result) throw new HTTPException(401, { message: "Unauthorized" });
        const res = await DomAndSanitizeRESTBodyMiddleware.validateBody(c);
        if (res) return await next();
        throw new HTTPException(409, { message: "Sanitize body data is required" });
    });

    public static authSanitizedParamAndBody = createMiddleware(async (c, next) => {
        const result = await this.authSessionFunc(c);
        if (!result) throw new HTTPException(401, { message: "Unauthorized" });
        const res = await DomAndSanitizeRESTBodyMiddleware.validateParamAndBody(c);
        if (res) return await next();
        throw new HTTPException(409, { message: "Sanitize param and body data is required" });
    });

    public static authSanitizedQueries = createMiddleware(async (c, next) => {
        const result = await this.authSessionFunc(c);
        if (!result) throw new HTTPException(401, { message: "Unauthorized" });
        const res = await DomAndSanitizeRESTBodyMiddleware.validateQueries(c);
        if (res) return await next();
        throw new HTTPException(409, { message: "Sanitize body queries is required" });
    });

    public static authSanitizedFile = createMiddleware(async (c, next) => {
        const result = await this.authSessionFunc(c);
        if (!result) throw new HTTPException(401, { message: "Unauthorized" });
        await next();
    });
}