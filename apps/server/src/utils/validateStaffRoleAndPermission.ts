import db from "@/api/config/db";
import { staffs } from "@/api/db";
import type { TRPCCodeError } from "@/api/utils/constants";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import { eq } from "drizzle-orm";

interface StaffErrorMessageDto {
    message: string;
    status: TRPCCodeError
}

// using by (product, news, faq, career and product) manage
export class ValidationStaffRoleAndPerUtils {

    public static userNotFound: StaffErrorMessageDto = {
        message: "Find user not found",
        status: "NOT_FOUND"
    }

    public static disabledAccount: StaffErrorMessageDto = {
        message: "Your account has been disabled",
        status: "FORBIDDEN"
    }

    public static success: StaffErrorMessageDto = {
        message: "success",
        status: "BAD_REQUEST"
    }

    public static async canBeRemove(removeByStaffId: string): Promise<StaffErrorMessageDto> {
        try {
            const staff = await db.query.staffs.findFirst({
                where: eq(staffs.id, removeByStaffId)
            });

            if (!staff || staff === undefined) {
                return this.userNotFound;
            }

            if (staff.status !== "ACTIVE") {
                return this.disabledAccount;
            }

            const isCanBeRemove = Boolean(
                ["SUPER_ADMIN", "ADMIN"].includes(staff.role) &&
                staff.permissions.includes("DELETE")
            )

            if (!isCanBeRemove) {
                return {
                    message: "You have no an permissions to remove",
                    status: "FORBIDDEN"
                }
            }
            return this.success;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async canBeAddAndEdit(staffId: string): Promise<StaffErrorMessageDto> {
        try {
            const staff = await db.query.staffs.findFirst({
                where: eq(staffs.id, staffId)
            });

            if (!staff || staff === undefined) {
                return this.userNotFound;
            }

            if (staff.status !== "ACTIVE") {
                return this.disabledAccount;
            }

            const isCanBeAddAndEdit = Boolean(
                ["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(staff.role) &&
                staff.permissions.some(per => ["CREATE", "UPDATE"].includes(per))
            )

            if (!isCanBeAddAndEdit) {
                return {
                    message: "You have no an permissions to add or edit",
                    status: "FORBIDDEN"
                }
            }
            return this.success;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

}