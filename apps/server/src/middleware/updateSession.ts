import db from "@/api/config/db";
import { adminSessionTokenName } from "@/api/packages/utils/constants/auth";
import { Helper } from "@/api/utils/helper";
import { SecureSessionManagerServices } from "@/api/utils/secureSession";
import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { sessions } from "../modules/admin/auth/entities";
export const updatedSession = createMiddleware(async (c, next) => {
    try {
        const oneDay = 24 * 60 * 60 * 1000;
        const sevenDay = 7 * oneDay;
        const sessionToken = c.get("getCookie").get(adminSessionTokenName) || c.req.header("Authorization")?.replace("Bearer ", "");
        if (!sessionToken) {
            await next();
            return;
        }
        const sessionInfo = await SecureSessionManagerServices.verifySession(sessionToken, c);
        if (sessionInfo) {
            const age = Date.now() - new Date(sessionInfo.updatedAt as Date).getTime();
            if (age <= sevenDay) {
                await db.transaction(async tx => {
                    const maxSessionDate = 30 * oneDay;
                    const expired: Date = Helper.setCurrentDate(maxSessionDate);
                    await tx.update(sessions).set({
                        staffId: sessionInfo.staffId,
                        sessionToken: sessionInfo.sessionToken,
                        expired,
                    });
                    await tx.delete(sessions).where(eq(sessions.id, sessionInfo.id));
                    c.get("setCookie").set(adminSessionTokenName, sessionInfo.sessionToken, Helper.cookieOption);
                });
            }
        }
        await next();
    } catch (error) {
        await next();
    }
});