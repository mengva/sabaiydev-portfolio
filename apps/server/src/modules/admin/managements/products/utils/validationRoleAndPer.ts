import db from "@/api/config/db";
import { staffs } from "@/api/db";
import type { TRPCCodeError } from "@/api/utils/constants";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import { eq } from "drizzle-orm";

interface ProductDto {
    message: string;
    status: TRPCCodeError
}

export class ValidationProductRoleAndPerUtils {

    public static userNotFound: ProductDto = {
        message: "Find user not found",
        status: "NOT_FOUND"
    }

    public static disabledAccount: ProductDto = {
        message: "Your account has been disabled",
        status: "FORBIDDEN"
    }

    public static success: ProductDto = {
        message: "success",
        status: "BAD_REQUEST"
    }

    public static async canBeRemove(removeByStaffId: string): Promise<ProductDto> {
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
                    message: "You have no an permissions to remove this product",
                    status: "FORBIDDEN"
                }
            }
            return this.success;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

    public static async canBeAddAndEdit(staffId: string): Promise<ProductDto> {
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
                    message: "You have no an permissions to add or edit this product",
                    status: "FORBIDDEN"
                }
            }
            return this.success;
        } catch (error) {
            throw HandlerTRPCError.TRPCError(error);
        }
    }

}