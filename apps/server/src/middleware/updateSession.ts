import db from "@/server/config/db";
import { adminSessionTokenName } from "@/server/packages/utils/constants/variables/auth";
import { Helper } from "@/server/utils/helper";
import { SecureSessionManagerServices } from "@/server/utils/secureSession";
import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { sessions } from "../modules/admin/auth/entities";
import { HandlerTRPCError } from "../utils/handleTRPCError";

export const updatedSession = createMiddleware(async (c, next) => {
    try {
        const oneDay = 24 * 60 * 60 * 1000;
        const sevenDay = 7 * oneDay;
        const sessionToken = c.get("getCookie").get(adminSessionTokenName) || c.req.header("Authorization")?.replace("Bearer ", "");
        if (!sessionToken) {
            await next();
            return;
        }
        const result = await SecureSessionManagerServices.verifySession(sessionToken, c);
        if (result.error) {
            throw HandlerTRPCError.TRPCErrorMessage(result?.message, "FORBIDDEN");
        }
        const session = result.data;
        if (session) {
            const age = Date.now() - new Date(session.updatedAt as Date).getTime();
            if (age <= sevenDay) {
                await db.transaction(async tx => {
                    const maxSessionDate = 30 * oneDay;
                    const expired: Date = Helper.setCurrentDate(maxSessionDate);
                    await tx.update(sessions).set({
                        staffId: session.staffId,
                        sessionToken: session.sessionToken,
                        expired,
                    });
                    await tx.delete(sessions).where(eq(sessions.id, session.id));
                    c.get("setCookie").set(adminSessionTokenName, session.sessionToken, Helper.cookieOption);
                });
            }
        }
        await next();
    } catch (error) {
        await next();
    }
});