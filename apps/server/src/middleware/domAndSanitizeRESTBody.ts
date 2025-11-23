import { HandlerTRPCError } from "../utils/handleTRPCError";
import type { MyContext } from "../server/trpc/context";
import { DOMAndSanitizedServices } from "@/api/packages/utils/DOMAndSanitize";

export class DomAndSanitizeRESTBodyMiddleware {
    public static setData(bodyData: any, data: any) {
        const keyObjects = ["page", "limit"];
        for (const key in data) {
            if (key && data[key] && data[key] !== undefined) {
                if (keyObjects.includes(key) && (keyObjects.some(ko => ko === key))) {
                    bodyData[key] = Number(data[key]) || 0;
                } else
                    bodyData[key] = data[key];
            }
        }
        return bodyData;
    }

    public static async validateQueries(ctx: MyContext['honoContext']) {
        const queries: any = ctx.req.query();
        const bodyQueries: any = {};
        if (queries && typeof queries === "object") {
            this.setData(bodyQueries, queries);
        }
        const sanitizeQueries = DOMAndSanitizedServices.domAndSanitizeObject(bodyQueries);
        if (sanitizeQueries) {
            ctx.set("body", sanitizeQueries);
            return ctx;
        }
        throw HandlerTRPCError.TRPCErrorMessage("Sanitized body queries is required", "FORBIDDEN");
    }

    public static async validateParamAndBody(ctx: MyContext['honoContext']) {
        const body = await ctx.req.json();
        const params: any = ctx.req.param();
        const bodyData: any = {};
        if (params && typeof params === "object") {
            this.setData(bodyData, params);
        }
        if (body && typeof body === "object") {
            this.setData(bodyData, body);
        }
        const sanitizeBody = DOMAndSanitizedServices.domAndSanitizeObject(bodyData);
        if (sanitizeBody) {
            ctx.set("body", sanitizeBody);
            return ctx;
        }
        throw HandlerTRPCError.TRPCErrorMessage("Sanitized param and body data is required", "FORBIDDEN");
    }

    public static async validateBody(ctx: MyContext['honoContext']) {
        const body = await ctx.req.json();
        const bodyData: any = {};
        if (body && typeof body === "object") {
            this.setData(bodyData, body);
        }
        if (!bodyData) throw HandlerTRPCError.TRPCErrorMessage("BodyData is required", "FORBIDDEN");
        const sanitizeBody = DOMAndSanitizedServices.domAndSanitizeObject(bodyData);
        if (sanitizeBody) {
            ctx.set("body", sanitizeBody);
            return ctx;
        }
        throw HandlerTRPCError.TRPCErrorMessage("Sanitized body data is required", "FORBIDDEN");
    }

    public static async ValidationFile(ctx: MyContext) {

    }
}