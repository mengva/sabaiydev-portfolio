import { zValidator } from "@hono/zod-validator";
import type { MyContext } from "@/api/server/trpc/context";
import { HandlerTRPCError } from "./handleTRPCError";

type bodyType = "cookie" | 'form' | "json" | "header" | "param" | "query";

export class ZodValidateRestApi {
    public static validate(target: bodyType, zodValidate: any) {
        return zValidator(target, zodValidate, (result) => {
            if (!result?.success) {
                throw HandlerTRPCError.TRPCError(result.error);
            }
        });
    }

    public static async validateRestApiBodyData(c: MyContext['honoContext'], zodValidate: any) {
        const body = await c.req.json();
        const validate = zodValidate.safeParse(body);
        if (!validate?.success) {
            throw HandlerTRPCError.TRPCError(validate.error);
        }
        return validate.data;
    }
}