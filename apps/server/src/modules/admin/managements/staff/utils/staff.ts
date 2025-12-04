import db from "@/server/config/db";
import GlobalHelper from "@/server/packages/utils/globalHelper";
import { staffs } from "../entities";
import type { ZodValidationSearchQueryStaff } from "@/server/packages/validations/staff";
import { and, between, eq, ilike, or, sql } from "drizzle-orm";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import type { ZodValidationStaffPermissions } from "@/server/packages/validations/variables/staff";

export class StaffManageServices {
    public static selectStaffData = {
        id: staffs.id,
        fullName: staffs.fullName,
        email: staffs.email,
        role: staffs.role,
        status: staffs.status,
        permissions: staffs.permissions,
        createdAt: staffs.createdAt,
        updatedAt: staffs.updatedAt
    }
    public static async validationAddOne(email: string, permissions: ZodValidationStaffPermissions) {
        try {
            const newPermissions: ZodValidationStaffPermissions = this.validationPermission(permissions);
            const emailExisting = await db.query.staffs.findFirst({
                where: (staffs, { eq }) => eq(staffs.email, email),
            });
            if (emailExisting) throw new HTTPErrorMessage("Email already exists", "403");
            return newPermissions;
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static validationPermission(permissions: ZodValidationStaffPermissions) {
        try {
            const newPermissions: ZodValidationStaffPermissions = GlobalHelper.uniquePermissions(permissions);
            if (!newPermissions.length) throw new HTTPErrorMessage("Permissions is required", "403");
            return newPermissions;
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async searchQuery(input: ZodValidationSearchQueryStaff) {
        const { query, role, startDate, endDate, status } = input;
        const conditions: any[] = [];
        if (query) {
            conditions.push(
                or(
                    ilike(staffs.fullName, `%${query}%`),
                    ilike(staffs.email, `%${query}%`)
                )
            );
        }
        if (role && role !== "DEFAULT") {
            conditions.push(eq(staffs.role, role));
        }
        if (status && status !== "DEFAULT") {
            conditions.push(eq(staffs.status, status));
        }
        // Date range
        if (startDate && endDate) {
            conditions.push(between(staffs.createdAt, new Date(startDate), new Date(endDate)));
        }
        return and(...conditions);
    }
}