import type { MyContext } from "@/server/server/trpc/context";
import { type ServerErrorDto } from "@/server/packages/types/constants";
import type { AuthSignUpDto } from "@/server/packages/types/auth";
import type { AuthResetPasswordDto, AuthTRPCSignInDto, AuthTRPCSignInWithOTPAndEmailDto, AuthVerifiedOTPCodeDto } from "../../types/auth";
import { HandlerTRPCError } from "@/server/utils/handleTRPCError";
import { AuthFuncHelperServices } from "../../utils/authFuncHelper";
import type { StaffSchema } from "@/server/packages/schema/staff";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { AuthEnumMessage } from "../../utils/authEnumMessage";
import { AuthFuncFindStaffServices } from "../../utils/authFuncFindStaff";
import { AuthFuncServices } from "../../utils/authFunc";

export class AuthServices {
    public static async signIn({ input, ctx }: AuthTRPCSignInDto) {
        try {
            return await AuthFuncServices.signInFunc(input, ctx['honoContext']);
        } catch (error: ServerErrorDto) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async sendOTPSignIn(email: string, ctx: MyContext['honoContext']) {
        try {
            const { ipAddress, userAgent } = AuthFuncHelperServices.getIpAddressAndUserAgent(ctx);
            const staff = await AuthFuncFindStaffServices.findStaffVerifiedEmail(email) as StaffSchema;
            await AuthFuncHelperServices.sendOTPSignIn({ staff, email, userAgent, ipAddress });
            return HandlerSuccess.success(AuthEnumMessage.successSendOTP);
        } catch (error: ServerErrorDto) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async signInOTP({ input, ctx }: AuthTRPCSignInWithOTPAndEmailDto) {
        try {
            return await AuthFuncServices.signInOTPFunc(input, ctx['honoContext']);
        } catch (error: ServerErrorDto) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async signOut({ ctx }: { ctx: MyContext }) {
        try {
            return await AuthFuncServices.signOutFunc(ctx['honoContext']);
        } catch (error: ServerErrorDto) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async signUp(input: AuthSignUpDto) {
        try {
            return await AuthFuncServices.signUpFunc(input);
        } catch (error: ServerErrorDto) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async verifiedEmail(email: string, ctx: MyContext) {
        const { ipAddress, userAgent } = AuthFuncHelperServices.getIpAddressAndUserAgent(ctx['honoContext']);
        return await AuthFuncServices.verifiedEmailFunc(email, userAgent, ipAddress);
    }

    public static async verifiedOTPCode(input: AuthVerifiedOTPCodeDto, ctx: MyContext) {
        const { ipAddress, userAgent } = AuthFuncHelperServices.getIpAddressAndUserAgent(ctx['honoContext']);
        return await AuthFuncServices.verifiedOTPCodeFunc({ ...input, userAgent, ipAddress });
    }

    public static async resetPassword(input: AuthResetPasswordDto, ctx: MyContext['honoContext']) {
        return await AuthFuncServices.resetPasswordFunc(input, ctx);
    }
}