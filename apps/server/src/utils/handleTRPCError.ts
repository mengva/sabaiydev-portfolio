import type { ServerErrorDto } from "@/api/packages/types/constants";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/unstable-core-do-not-import";
import type { TRPCCodeError } from "./constants";
import { ErrorHandler } from "@/api/packages/utils/handleError";

export class HandlerTRPCError {
    public static TRPCErrorMessage(message: string, code: TRPCCodeError) {
        throw new TRPCError({
            code,
            message
        });
    }

    public static TRPCError(error: ServerErrorDto) {
        const message = ErrorHandler.getErrorMessage(error);
        if (error instanceof TRPCError) {
            let code = "BAD_REQUEST" as TRPCCodeError
            const httpCode = getHTTPStatusCodeFromError(error);
            if (httpCode === 400) {
                code = "BAD_REQUEST";
            } else if (httpCode === 401) {
                code = "UNAUTHORIZED";
            } else if (httpCode === 402) {
                code = "PAYMENT_REQUIRED";
            } else if (httpCode === 403) {
                code = "FORBIDDEN";
            } else if (httpCode === 404) {
                code = "NOT_FOUND";
            } else if (httpCode === 405) {
                code = "METHOD_NOT_SUPPORTED";
            } else if (httpCode === 406) {
                code = "NOT_IMPLEMENTED";
            } else if (httpCode === 409) {
                code = "CONFLICT";
            } else if (httpCode === 429) {
                code = "TOO_MANY_REQUESTS";
            } else if (httpCode === 500) {
                code = "INTERNAL_SERVER_ERROR";
            } else {
                code = "NOT_IMPLEMENTED";
            }
            throw this.TRPCErrorMessage(message, code);
        }
        throw new Error(message);
    }
}