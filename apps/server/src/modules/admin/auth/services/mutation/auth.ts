import type { MyContext } from "@/api/server/trpc/context";
import { type ServerErrorDto } from "@/api/packages/types/constants";
import type { AuthSignUpDto } from "@/api/packages/types/auth";
import type { AuthResetPasswordDto, AuthTRPCSignInDto, AuthTRPCSignInWithOTPAndEmailDto, AuthVerifiedOTPCodeDto } from "../../types/auth";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import { AuthFuncUtils } from "../../utils/AuthFuncUtils";
import { AuthFuncHelperServices } from "../../utils/authFuncHelperUtils";

export class AuthServices {
    public static async signIn({ input, ctx }: AuthTRPCSignInDto) {
        try {
            return await AuthFuncUtils.signInFunc(input, ctx['honoContext']);
        } catch (error: ServerErrorDto) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async signInOTP({ input, ctx }: AuthTRPCSignInWithOTPAndEmailDto) {
        try {
            return await AuthFuncUtils.signInOTPFunc(input, ctx['honoContext']);
        } catch (error: ServerErrorDto) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async signOut({ ctx }: { ctx: MyContext }) {
        try {
            return await AuthFuncUtils.signOutFunc(ctx['honoContext']);
        } catch (error: ServerErrorDto) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async signUp(input: AuthSignUpDto) {
        try {
            return await AuthFuncUtils.signUpFunc(input);
        } catch (error: ServerErrorDto) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async verifiedEmail(email: string, ctx: MyContext) {
        const { ipAddress, userAgent } = AuthFuncHelperServices.getIpAddressAndUserAgent(ctx['honoContext']);
        return await AuthFuncUtils.verifiedEmailFunc(email, userAgent, ipAddress);
    }

    public static async verifiedOTPCode(input: AuthVerifiedOTPCodeDto, ctx: MyContext) {
        const { ipAddress, userAgent } = AuthFuncHelperServices.getIpAddressAndUserAgent(ctx['honoContext']);
        return await AuthFuncUtils.verifiedOTPCodeFunc({ ...input, userAgent, ipAddress });
    }

    public static async resetPassword(input: AuthResetPasswordDto, ctx: MyContext['honoContext']) {
        return await AuthFuncUtils.resetPasswordFunc(input, ctx);
    }
}