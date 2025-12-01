import db from "@/api/config/db";
import { env } from "@/api/config/env";
import type { StaffSchema, StaffVerificationSchema } from "@/api/packages/schema/staff";
import type { ServerErrorDto } from "@/api/packages/types/constants";
import CookieHelper from "@/api/packages/utils/Cookie";
import { Helper } from "@/api/utils/helper";
import { SecureSessionManagerServices } from "@/api/utils/secureSession";
import { and, eq, or } from "drizzle-orm";
import { sessions, verifications } from "../entities";
import { staffs } from "@/api/db";
import { getHTTPError, HTTPErrorMessage } from "@/api/packages/utils/HttpJsError";
import { AuthEnumMessage } from "./authEnumMessage";
import type { Context as HonoContext } from "hono"
import { RateLimiterMiddleware } from "@/api/middleware/rateLimiterMiddleware";
import { adminSessionTokenName } from "@/api/packages/utils/constants/variables/auth";

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
                const userAgent = ctx.get("userAgent")
                const ipAddress = ctx.get("ip");
                if (staff?.verifications?.length > 0) {
                    await tx.delete(verifications).where(and(
                        eq(verifications.staffId, staff.id),
                        or(
                            userAgent ? eq(verifications.userAgent, userAgent) : undefined,
                            ipAddress ? eq(verifications.ipAddress, ipAddress) : undefined
                        )
                    ));
                }
                if (staff?.sessions?.length > 0) {
                    await tx.delete(sessions).where(and(
                        eq(sessions.staffId, staff.id),
                        or(
                            userAgent ? eq(sessions.userAgent, userAgent) : undefined,
                            ipAddress ? eq(sessions.ipAddress, ipAddress) : undefined
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
                RateLimiterMiddleware.authLimiter.delete(ipAddress);
                return true;
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
                            src="https://scontent.fvte2-2.fna.fbcdn.net/v/t39.30808-6/325631385_1321444245066443_3088853530505435799_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFnA5KH5XlezNuJTNDmOte6WFnGpL0VnRFYWcakvRWdEW-eziVHD67qhvLpqmRcE-c5WcgMGja2xPj0z_hRHzVV&_nc_ohc=4h5UQR0AzKcQ7kNvwF_OcS5&_nc_oc=AdmKRC3T7gsYqHpclBKuHI2FPS0QJVcI8jYRhn0-YVxpWmEzw6x66sADU-q27Bo4d1w&_nc_zt=23&_nc_ht=scontent.fvte2-2.fna&_nc_gid=oSUp6plNUoU21YYaRbcooA&oh=00_Afd6GralS6JuS8a6QzNJUhHa7UP4DZHb_Pj7KVlAaeXkjA&oe=68F28380"
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
        } catch (error: ServerErrorDto) {
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