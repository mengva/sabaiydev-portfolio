import type { ServerErrorDto } from "@/api/packages/types/constants";
import { getHTTPStatusCodeFromError, TRPCError } from "@trpc/server/unstable-core-do-not-import";
import type { Context as HonoContext } from "hono"
import { HTTPException } from "hono/http-exception";
import type { HTTPResponseError } from "hono/types";
import type { StatusCodeErrorDto } from "./constants";
import { ErrorHandler } from "@/api/packages/utils/HandleError";

export class HandlerHonoError {
    public static onError(err: Error | HTTPResponseError, c: HonoContext) {
        if (err instanceof HTTPException) {
            // If there's a custom response, use it
            if (err.res) {
                return err.res;
            }
            // Otherwise, return consistent error format
            return c.json({
                message: err.message,
                success: false
            }, err.status);
        }
        // Handle other errors
        return c.json({
            message: err.message || "Internal Server Error",
            success: false
        }, 500);
    }

    public static handleHonoError(error: ServerErrorDto) {
        const message = ErrorHandler.getErrorMessage(error);
        let httpCode = 400;
        if (error instanceof TRPCError) {
            httpCode = getHTTPStatusCodeFromError(error);
        }
        throw new HTTPException(httpCode as any, { message });
    }

    public static HTTPException(message: string, httpCode: StatusCodeErrorDto = "400") {
        const code: number = httpCode ? Number(httpCode) : 400;
        throw new HTTPException(code as any, { message });
    }
};