import db from "@/server/config/db";
import { env } from "@/server/config/env";
import type { StaffSchema, StaffVerificationSchema } from "@/server/packages/schema/staff";
import type { ServerErrorDto } from "@/server/packages/types/constants";
import CookieHelper from "@/server/packages/utils/cookie";
import { Helper } from "@/server/utils/helper";
import { SecureSessionManagerServices } from "@/server/utils/secureSession";
import { and, eq, or } from "drizzle-orm";
import { sessions, verifications } from "../entities";
import { staffs } from "@/server/db";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import { AuthEnumMessage } from "./authEnumMessage";
import type { Context as HonoContext } from "hono"
import { RateLimiterMiddleware } from "@/server/middleware/rateLimiterMiddleware";
import { adminSessionTokenName } from "@/server/packages/utils/constants/variables/auth";

export interface GenerateAuthSessionDto {
    sessionToken: string;
    expired: Date;
}

export class AuthFuncHelperServices {

    public static async generateAuthSessionToken() {
        try {
            const sessionToken = await SecureSessionManagerServices.createSession();
            const maxSessionDate = CookieHelper.setMaxAgeCookie(30); //30day
            const expired: Date = Helper.setCurrentDate(maxSessionDate);
            return {
                sessionToken,
                expired
            } as GenerateAuthSessionDto;
        } catch (error: ServerErrorDto) {
            throw getHTTPError(error);
        }
    }

    public static getIpAddressAndUserAgent(ctx: HonoContext) {
        const userAgent = ctx.get("userAgent") || '';
        const ipAddress = ctx.get("ip") || '';
        return { userAgent, ipAddress };
    }

    public static async signIn(staff: StaffSchema, ctx: HonoContext) {
        try {
            await db.transaction(async (tx) => {
                const sessionTokenInfo = await AuthFuncHelperServices.generateAuthSessionToken() as GenerateAuthSessionDto;
                if (!sessionTokenInfo) throw new HTTPErrorMessage(AuthEnumMessage.requiredSessionInfo, "402");
                const { sessionToken, expired } = sessionTokenInfo;
                const userAgent = ctx.get("userAgent");
                const ipAddress = ctx.get("ip");

                if (staff?.verifications?.length > 0) {
                    await tx.delete(verifications).where(and(
                        eq(verifications.staffId, staff.id),
                        or(
                            userAgent ? eq(verifications.userAgent, userAgent) : undefined,
                        )
                    ));
                }

                if (staff?.sessions?.length > 0) {
                    await tx.delete(sessions).where(and(
                        eq(sessions.staffId, staff.id),
                        or(
                            userAgent ? eq(sessions.userAgent, userAgent) : undefined,
                        )
                    ));
                }

                await tx.insert(sessions).values({
                    sessionToken,
                    expired,
                    staffId: staff.id,
                    userAgent,
                    ipAddress
                });
                ctx.get("setCookie").set(adminSessionTokenName, sessionToken, Helper.cookieOption);
                if (ipAddress) {
                    RateLimiterMiddleware.authLimiter.delete(ipAddress);
                }
                return true;
            });
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async sendOTPSignIn({ staff, email, userAgent, ipAddress }: {
        staff: StaffSchema;
        email: string;
        userAgent: string;
        ipAddress: string
    }) {
        try {
            const code = Helper.generateOTPSignIn();
            const hashedOtp = await Helper.bcryptHast(code as string);
            const codeExpired = Helper.codeExpiredIn(30); // OTP expires for 30 second
            const mailOption = Helper.mailOptions({
                from: env('EMAIL_ADDRESS'),
                to: email,
                subject: "Sabaiydev - Sign In Code",
                html: `
                    <div style="background-color: #e7e7e7; border-radius: 16px; padding: 10px; font-family: sans-serif, serif; letter-spacing: 1px;">
                        <img width="100" height="100" style="border-radius: 50%; object-fit: cover; shape-outside: circle(); float: left; margin-right: 15px;"
                            src="https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-thumbnail/s3/112014/logo_sabai_pantone_326u.png?itok=c2j9eT5E"
                            alt="sabaydev url" />
                        <div style="display: block;">
                            <div style="font-size: 28px; font-weight: 600;">Hi ${staff.fullName}</div>
                            <div style="margin-top: 4px">Your sign in OTP code is:</div>
                            <div style="font-size: 25px; margin-top: 4px; font-weight: 600;">${code}</div>
                            <div style="margin-top: 4px">This code will expire in 5 minutes.</div>
                        </div>
                    </div>
                `
            });
            await this.sendMailOTP({
                staff,
                userAgent,
                ipAddress,
                hashedOtp,
                codeExpired,
                mailOption
            });
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async verifiedEmail({
        staff, email, userAgent, ipAddress
    }: {
        staff: StaffSchema;
        email: string;
        userAgent: string;
        ipAddress: string
    }) {
        try {
            const code = Helper.generateOTP();
            const hashedOtp = await Helper.bcryptHast(code as string);
            const codeExpired = Helper.codeExpiredIn(30); // OTP expires for 30 second
            const mailOption = Helper.mailOptions({
                from: env('EMAIL_ADDRESS'),
                to: email,
                subject: "Sabaiydev",
                html: `
                    <div style="background-color: #e7e7e7; border-radius: 16px; padding: 10px; font-family: sans-serif, serif; letter-spacing: 1px;">
                        <img width="100" height="100" style="border-radius: 50%; object-fit: cover; shape-outside: circle(); float: left; margin-right: 15px;"
                            src="https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-thumbnail/s3/112014/logo_sabai_pantone_326u.png?itok=c2j9eT5E"
                            alt="sabaydev url" />
                        <div style="display: block;">
                            <div style="font-size: 28px; font-weight: 600;">Hi ${staff.fullName}</div>
                            <div style="margin-top: 4px">Your verification OTP code is:</div>
                            <div style="font-size: 25px; margin-top: 4px; font-weight: 600;">${code}</div>
                            <div style="margin-top: 4px">This code will expire in 30 seconds.</div>
                        </div>
                    </div>
                `
            });
            await this.sendMailOTP({
                staff,
                userAgent,
                ipAddress,
                hashedOtp,
                codeExpired,
                mailOption
            });
        } catch (error: ServerErrorDto) {
            throw getHTTPError(error);
        }
    }

    public static async sendMailOTP({
        staff, userAgent, ipAddress, hashedOtp, codeExpired, mailOption
    }: {
        staff: StaffSchema;
        userAgent: string;
        ipAddress: string;
        hashedOtp: string;
        codeExpired: Date;
        mailOption: { from: string; to: string; subject: string; html: string; }
    }) {
        try {
            await db.transaction(async tx => {
                if (staff && staff?.verifications?.length > 0) {
                    await tx.delete(verifications).where(and(
                        eq(verifications.staffId, staff.id),
                        or(
                            userAgent ? eq(verifications.userAgent, userAgent) : undefined,
                            ipAddress ? eq(verifications.ipAddress, ipAddress) : undefined
                        )
                    ));
                }
                await tx.insert(verifications).values({
                    code: hashedOtp,
                    codeExpired,
                    staffId: staff.id,
                    userAgent,
                    ipAddress
                });
                const transporter = Helper.transporter();
                await transporter.sendMail(mailOption);
                if (ipAddress) {
                    RateLimiterMiddleware.authLimiter.delete(ipAddress);
                }
            });
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async verifiedOTPCode({
        staff, clientOTP, userAgent, ipAddress
    }: {
        staff: StaffSchema;
        clientOTP: string;
        userAgent: string | null;
        ipAddress: string | null
    }) {
        try {
            const verification = staff.verifications.find(v => (v.userAgent === userAgent || v.ipAddress === ipAddress)) as StaffVerificationSchema;
            if (!verification) throw new HTTPErrorMessage("Verification not found, Please request again", "403");
            const { codeExpired, code, isVerifiedCode } = verification as StaffVerificationSchema;
            if (!codeExpired || !code) throw new HTTPErrorMessage("OTP code not found, Please request again", "403");
            // Check otp code is expired or not
            const isCodeExpired = codeExpired < Helper.currentDate();
            const isValidCode = await Helper.bcryptCompare(clientOTP, code as string);
            // working if user no verified otp code or no receive otp
            if (isVerifiedCode) throw new HTTPErrorMessage("Already verified OTP", "403");
            // working if otp code expired
            if (isCodeExpired) throw new HTTPErrorMessage("OTP code is expired", "403");
            // working if no expire and invalid otp
            if (!isCodeExpired && !isValidCode) throw new HTTPErrorMessage("Invalid OTP code", "403");
            const resetPasswordExpired = Helper.codeExpiredIn(30) as Date; // Reset password valid for 30 second
            const updateVerification = await db.update(verifications).set({
                isVerifiedCode: true,
                resetPasswordExpired
            }).where(
                and(
                    eq(verifications.staffId, staff.id),
                    or(
                        userAgent ? eq(verifications.userAgent, userAgent) : undefined,
                        ipAddress ? eq(verifications.ipAddress, ipAddress) : undefined
                    )
                )
            ).returning();
            if (ipAddress) {
                RateLimiterMiddleware.authLimiter.delete(ipAddress);
            }
            return updateVerification[0];
        } catch (error: ServerErrorDto) {
            throw getHTTPError(error);
        }
    }

    public static async resetPassword({
        staff,
        newPassword,
        email,
        userAgent,
        ipAddress
    }: {
        staff: StaffSchema;
        newPassword: string;
        email: string;
        userAgent: string | null;
        ipAddress: string | null
    }) {
        try {
            const verification = staff.verifications.find(v => (v.userAgent === userAgent || v.ipAddress === ipAddress)) as StaffVerificationSchema;
            if (!verification) throw new HTTPErrorMessage("Verification not found, Please request again", "403");
            const { isVerifiedCode, resetPasswordExpired } = verification as StaffVerificationSchema;
            if (!isVerifiedCode) throw new HTTPErrorMessage("Not verified OTP", "403");
            if (!resetPasswordExpired) throw new HTTPErrorMessage("Reset password expired date is required", "403");
            const isExpired = new Date(resetPasswordExpired) < Helper.currentDate();
            if (isExpired && isVerifiedCode) {
                await db.delete(verifications).where(
                    and(
                        eq(verifications.staffId, staff.id),
                        or(
                            userAgent ? eq(verifications.userAgent, userAgent) : undefined,
                            ipAddress ? eq(verifications.ipAddress, ipAddress) : undefined
                        )
                    )
                );
                throw new HTTPErrorMessage("Reset password is expired, Please try later", "409");
            }
            const hastPassword = await Helper.bcryptHast(newPassword);
            await db.update(staffs).set({ password: hastPassword }).where(eq(staffs.email, email));
            await db.delete(verifications).where(
                and(
                    eq(verifications.staffId, staff.id),
                    or(
                        userAgent ? eq(verifications.userAgent, userAgent) : undefined,
                        ipAddress ? eq(verifications.ipAddress, ipAddress) : undefined
                    )
                )
            );
            if (ipAddress) {
                RateLimiterMiddleware.authLimiter.delete(ipAddress);
            }
        } catch (error: ServerErrorDto) {
            throw getHTTPError(error);
        }
    }
}