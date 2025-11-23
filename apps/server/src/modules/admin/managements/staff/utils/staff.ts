import db from "@/api/config/db";
import GlobalHelper from "@/api/packages/utils/GlobalHelper";
import { staffs } from "../entities";
import type { ZodValidationPermissions } from "@/api/packages/validations/constants";
import type { ZodValidationSearchStaffData } from "@/api/packages/validations/staff";
import { and, between, eq, ilike, or, sql } from "drizzle-orm";
import { getHTTPError, HTTPErrorMessage } from "@/api/packages/utils/HttpJsError";

export class ManageStaffUtils {
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
    public static async validationAddOne(email: string, permissions: ZodValidationPermissions) {
        try {
            const newPermissions: ZodValidationPermissions = this.validationPermission(permissions);
            const emailExisting = await db.query.staffs.findFirst({
                where: (staffs, { eq }) => eq(staffs.email, email),
            });
            if (emailExisting) throw new HTTPErrorMessage("Email already exists", "403");
            return newPermissions;
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static validationPermission(permissions: ZodValidationPermissions) {
        try {
            const newPermissions: ZodValidationPermissions = GlobalHelper.uniquePermissions(permissions);
            if (!newPermissions.length) throw new HTTPErrorMessage("Permissions is required", "403");
            return newPermissions;
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async searchQuery(input: ZodValidationSearchStaffData) {
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
        // Permissions filter (example for text[] or jsonb column)
        // if (permissions?.length) {
        //     const validPermissions = permissions.filter(p => p !== "DEFAULT");
        //     if (validPermissions.length > 0) {
        //         // Use PostgreSQL array operator @>
        //         conditions.push(sql`${staffs.permissions} @> ${validPermissions}`);
        //     }
        // }
        return and(...conditions);
    }
}