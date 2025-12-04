import type { ServerResponseDto } from "@/server/packages/types/constants";
import { HandlerTRPCError } from "./handleTRPCError";
import { DOMPurifyServices } from "@/server/packages/utils/domPurify";

export class ValidateAuthServices {
    public static async validateAuth({
        input,
        callback,
    }: {
        callback: (input: any) => Promise<any | null>;
        input: any,
    }) {
        const domValidate = DOMPurifyServices.domSanitizedObject(input);
        if (domValidate) {
            return await callback(domValidate) as ServerResponseDto;
        }
        throw HandlerTRPCError.TRPCErrorMessage("Invalid Validate Auth", "FORBIDDEN");
    }
}