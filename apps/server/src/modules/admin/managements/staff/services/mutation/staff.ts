import db from "@/server/config/db";
import { addAndEditStaffs, staffs } from "@/server/db";
import type { ZodValidationAddOneStaff, ZodValidationSearchQueryStaff, ZodValidationEditMyData, ZodValidationEditStaff } from "@/server/packages/validations/staff";
import { Helper } from "@/server/utils/helper";
import { StaffManageServices } from "../../utils/staff";
import { count, desc, eq, ne } from "drizzle-orm";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { getHTTPError, HTTPError } from "@/server/packages/utils/httpJsError";
import type { ZodValidationStaffPermissions } from "@/server/packages/validations/variables/staff";

export class StaffManageMutationServices {

    public static async addOne(input: ZodValidationAddOneStaff) {
        try {
            const { permissions, addByStaffId, email, ...data } = input;
            const newPermissions: ZodValidationStaffPermissions = await StaffManageServices.validationAddOne(email, permissions);
            await db.transaction(async tx => {
                const hastPassword = await Helper.bcryptHast(data.password);
                const newStaff = await tx.insert(staffs).values({
                    ...data,
                    email,
                    password: hastPassword,
                    permissions: newPermissions
                }).returning({ id: staffs.id });
                const targetStaffId = newStaff[0]?.id;
                if (!addByStaffId || !targetStaffId) {
                    throw new HTTPError("addByStaffId or newStaff is required", "403");
                }
                await tx.insert(addAndEditStaffs).values({
                    addByStaffId,
                    targetStaffId,
                });
            });
            return HandlerSuccess.success("Add one staff successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editById(input: ZodValidationEditStaff) {
        try {
            const { permissions, updatedByStaffId, targetStaffId, ...data } = input;
            const newPermissions: ZodValidationStaffPermissions = StaffManageServices.validationPermission(permissions);
            await db.transaction(async tx => {
                await tx.update(staffs).set({
                    ...data,
                    permissions: newPermissions
                }).where(eq(staffs.id, targetStaffId));
                await tx.update(addAndEditStaffs).set({
                    updatedByStaffId
                }).where(eq(addAndEditStaffs.targetStaffId, targetStaffId))
            });
            return HandlerSuccess.success("Edit staff data successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editMyDataById(input: ZodValidationEditMyData) {
        try {
            const { updatedByStaffId, targetStaffId, permissions, ...data } = input;
            const newPermissions: ZodValidationStaffPermissions = StaffManageServices.validationPermission(permissions);
            const response = await db.transaction(async tx => {
                let updateStaff = null;
                if (["SUPER_ADMIN", "ADMIN"].includes(data.role)) {
                    updateStaff = await tx.update(staffs).set({
                        ...data,
                        permissions: newPermissions
                    }).where(eq(staffs.id, targetStaffId)).returning(StaffManageServices.selectStaffData);
                } else {
                    updateStaff = await tx.update(staffs).set({
                        role: data.role,
                        status: data.status,
                        permissions: newPermissions
                    }).where(eq(staffs.id, targetStaffId)).returning(StaffManageServices.selectStaffData);
                }
                await tx.update(addAndEditStaffs).set({
                    updatedByStaffId
                }).where(eq(addAndEditStaffs.targetStaffId, targetStaffId));
                return updateStaff;
            });
            return HandlerSuccess.success("Edit my data successfully", response);
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async searchQuery(input: ZodValidationSearchQueryStaff) {
        try {
            const { page, limit } = input;
            const offset = (page - 1) * limit;
            const where = await StaffManageServices.searchQuery(input);
            // count total
            const totalResult = await db
                .select({ total: count() })
                .from(staffs)
                .where(where);
            const total = totalResult[0]?.total ?? 1;
            // query staff data
            const results = await db
                .select(StaffManageServices.selectStaffData)
                .from(staffs)
                .where(where)
                .orderBy(desc(staffs.createdAt))
                .limit(limit)
                .offset(offset);
            const totalPage = Math.ceil(Number(total) / limit) || 1;
            return HandlerSuccess.success("Queries staff successfully", {
                data: results,
                pagination: {
                    total,
                    page,
                    totalPage,
                    limit,
                },
            });
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static removeOneById = async (targetStaffId: string) => {
        try {
            await db.delete(staffs).where(eq(staffs.id, targetStaffId));
            return HandlerSuccess.success("Remove staff by id successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static removeAll = async () => {
        try {
            await db.delete(staffs).where(ne(staffs.role, "SUPER_ADMIN"));
            return HandlerSuccess.success("Remove all staff successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

}