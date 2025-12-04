import type { AuthResetPasswordDto } from "../types/auth";
import { AuthFuncHelperServices } from "./authFuncHelper";
import { and, eq } from "drizzle-orm";
import { type ServerErrorDto } from "@/server/packages/types/constants";
import type { AuthSignInDto, AuthSignInWithOTPAndEmailDto, AuthSignUpDto } from "@/server/packages/types/auth";
import { AuthEnumMessage } from "./authEnumMessage";
import type { StaffSchema } from "@/server/packages/schema/staff";
import type { Context as HonoContext } from "hono"
import { adminSessionTokenName } from "@/server/packages/utils/constants/variables/auth";
import GlobalHelper from "@/server/packages/utils/globalHelper";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { sessions } from "../entities";
import { staffs } from "@/server/db";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import db from "@/server/config/db";
import type { MyContext } from "@/server/server/trpc/context";
import { RateLimiterMiddleware } from "@/server/middleware/rateLimiterMiddleware";
import { AuthFuncFindStaffServices } from "./authFuncFindStaff";

export class AuthFuncServices {

    public static signInFunc = async (input: AuthSignInDto, ctx: HonoContext) => {
        try {
            const staff = await AuthFuncFindStaffServices.findStaffSignIn(input) as StaffSchema;
            await AuthFuncHelperServices.signIn(staff, ctx);
            return HandlerSuccess.success(AuthEnumMessage.successSignin);
        } catch (error: ServerErrorDto) {
            throw getHTTPError(error);
        }
    }

    public static async signInOTPFunc(input: AuthSignInWithOTPAndEmailDto, ctx: HonoContext) {
        try {
            const { userAgent, ipAddress } = AuthFuncHelperServices.getIpAddressAndUserAgent(ctx);
            const staff = await AuthFuncFindStaffServices.findStaffSignInOTP({ ...input, userAgent, ipAddress }) as StaffSchema;
            await AuthFuncHelperServices.signIn(staff, ctx);
            return HandlerSuccess.success(AuthEnumMessage.successSignin);
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static signOutFunc = async (c: HonoContext) => {
        try {
            const { sessionToken } = c.get("session");
            const userAgent = c.get("userAgent") ?? '';
            const { ipAddress } = AuthFuncHelperServices.getIpAddressAndUserAgent(c);
            if (!sessionToken) throw new HTTPErrorMessage(AuthEnumMessage.requiredSessionToken, "401")
            await db.delete(sessions).where(
                and(
                    eq(sessions.sessionToken, sessionToken),
                    eq(sessions.userAgent, userAgent)
                )
            );
            c.get("deleteCookie").del(adminSessionTokenName);
            if (ipAddress) {
                RateLimiterMiddleware.authLimiter.delete(ipAddress);
            }
            return HandlerSuccess.success(AuthEnumMessage.successSignout);
        } catch (error: ServerErrorDto) {
            throw getHTTPError(error);
        }
    }

    public static signUpFunc = async (input: AuthSignUpDto) => {
        try {
            await db.transaction(async tx => {
                const { hastPassword } = await AuthFuncFindStaffServices.findStaffSignUp(input);
                const uniquePermissions = GlobalHelper.uniquePermissions(input.permissions);
                await tx.insert(staffs).values({
                    ...input,
                    permissions: uniquePermissions,
                    password: hastPassword,
                });
            });
            return HandlerSuccess.success("Sign up successfully");
        } catch (error: ServerErrorDto) {
            throw getHTTPError(error);
        }
    }

    public static verifiedEmailFunc = async (email: string, userAgent: string, ipAddress: string) => {
        try {
            const staff = await AuthFuncFindStaffServices.findStaffVerifiedEmail(email) as StaffSchema;
            await AuthFuncHelperServices.verifiedEmail({ staff, email, userAgent, ipAddress });
            return HandlerSuccess.success(AuthEnumMessage.successSendOTP);
        } catch (error: ServerErrorDto) {
            throw getHTTPError(error);
        }
    }

    public static verifiedOTPCodeFunc = async ({ email, code, userAgent, ipAddress }: {
        email: string, code: string, userAgent: string | null, ipAddress: string | null
    }) => {
        try {
            const staff = await AuthFuncFindStaffServices.findStaffVerifiedOTPCode(email) as StaffSchema;
            await AuthFuncHelperServices.verifiedOTPCode({ staff, clientOTP: code, userAgent, ipAddress });
            return HandlerSuccess.success(AuthEnumMessage.successVerifiedOTP);
        } catch (error: ServerErrorDto) {
            throw getHTTPError(error);
        }
    }

    public static resetPasswordFunc = async (input: AuthResetPasswordDto, ctx: MyContext['honoContext']) => {
        try {
            const { ipAddress, userAgent } = AuthFuncHelperServices.getIpAddressAndUserAgent(ctx);
            const staff = await AuthFuncFindStaffServices.findStaffResetPassword(input.email) as StaffSchema;
            await AuthFuncHelperServices.resetPassword({ staff, ...input, userAgent, ipAddress });
            return HandlerSuccess.success("Reset password successfully");
        } catch (error: ServerErrorDto) {
            throw getHTTPError(error);
        }
    }

}