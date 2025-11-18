import { DOMAndSanitizeService } from "@/api/packages/utils/DOMAndSanitize";
import { t } from "../server/trpc/procedures";
import { HandlerTRPCError } from "../utils/handleTRPCError";

export class DomAndSanitizeTRPCBodyMiddleware {
    public static validateBody = t.middleware(async ({ ctx, next }) => {
        const body = await ctx.honoContext.req.json();
        if (!body) throw HandlerTRPCError.TRPCErrorMessage("Body data is required", "FORBIDDEN");
        const sanitizeBody = DOMAndSanitizeService.domAndSanitizeObject(body);
        if (sanitizeBody) {
            ctx.honoContext.set("body", sanitizeBody);
            return next();
        }
        throw HandlerTRPCError.TRPCErrorMessage("Sanitized body data is required", "FORBIDDEN");
    });
}