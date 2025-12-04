import db from "@/server/config/db";
import { Helper } from "@/server/utils/helper";
import { AuthEnumMessage } from "./authEnumMessage";
import type { ServerErrorDto } from "@/server/packages/types/constants";
import { eq, and } from "drizzle-orm";
import { staffs } from "@/server/db";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import type { AuthSignInDto } from "@/server/packages/types/auth";
import type { StaffSchema, StaffVerificationSchema } from "@/server/packages/schema/staff";
import { AuthFuncHelperServices } from "./authFuncHelper";

export class AuthFuncFindStaffServices {
    public static async findStaffSignIn({ email, password }: AuthSignInDto) {
        try {
            const staff = await db.query.staffs.findFirst({
                where: (staffs, { eq }) => eq(staffs.email, email),
                with: { sessions: true }
            });
            if (!staff) throw new HTTPErrorMessage(AuthEnumMessage.notFoundEmail, "404");
            if (staff.status !== "ACTIVE") throw new HTTPErrorMessage(AuthEnumMessage.disabledAccount, "403");
            const match = await Helper.bcryptCompare(password, staff.password);
            if (!match) {
                throw new HTTPErrorMessage(AuthEnumMessage.incorrectPassword, "400");
            }
            return staff;
        } catch (error: ServerErrorDto) {
            throw getHTTPError(error);
        }
    }

    public static async findStaffSignInOTP({ email, code, userAgent, ipAddress }: {
        email: string, code: string, userAgent: string | null, ipAddress: string | null
    }) {
        try {
            const staff = await db.query.staffs.findFirst({
                where: (staffs, { eq }) => eq(staffs.email, email),
                with: {
                    sessions: true, verifications: {
                        where: (verifications, { eq, or }) => {
                            return and(
                                or(
                                    userAgent ? eq(verifications.userAgent, userAgent) : undefined,
                                    ipAddress ? eq(verifications.ipAddress, ipAddress) : undefined
                                )
                            );
                        }
                    }
                }
            }) as StaffSchema;
            if (!staff) throw new HTTPErrorMessage(AuthEnumMessage.notFoundEmail, "404");
            if (staff.status !== "ACTIVE") throw new HTTPErrorMessage(AuthEnumMessage.disabledAccount, "403");
            const verification = await AuthFuncHelperServices.verifiedOTPCode({
                staff, clientOTP: code,
                userAgent,
                ipAddress
            }) as StaffVerificationSchema;
            staff.verifications = [...verification ? [verification] : []];
            return staff;
        } catch (error: ServerErrorDto) {
            throw getHTTPError(error);
        }
    }

    public static async findStaffSignUp({ email, password }: { email: string, password: string }) {
        const emailExisting = await db.query.staffs.findFirst({
            where: eq(staffs.email, email)
        });
        if (emailExisting) throw new HTTPErrorMessage("Email already existing", "403");
        const hastPassword: string = await Helper.bcryptHast(password);
        return {
            hastPassword
        }
    }

    public static async findStaffVerifiedEmail(email: string) {
        try {
            const staff = await db.query.staffs.findFirst({
                where: (staffs, { eq }) => eq(staffs.email, email),
                with: { verifications: true }
            });
            if (!staff) throw new HTTPErrorMessage(AuthEnumMessage.notFoundEmail, "404");
            if (staff.status !== "ACTIVE") throw new HTTPErrorMessage(AuthEnumMessage.disabledAccount, "403");
            return staff;
        } catch (error: ServerErrorDto) {
            throw getHTTPError(error);
        }
    }

    public static async findStaffVerifiedOTPCode(email: string) {
        try {
            const staff = await this.findStaffVerifiedEmail(email) as StaffSchema;
            if (!staff) throw new HTTPErrorMessage(AuthEnumMessage.notVerifiedEmail, "400");
            if (staff.status !== "ACTIVE") throw new HTTPErrorMessage(AuthEnumMessage.disabledAccount, "403");
            return staff;
        } catch (error: ServerErrorDto) {
            throw getHTTPError(error);
        }
    }

    public static async findStaffResetPassword(email: string) {
        return await this.findStaffVerifiedEmail(email);
    }
}