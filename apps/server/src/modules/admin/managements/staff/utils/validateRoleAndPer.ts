import db from "@/server/config/db";
import { staffs } from "@/server/db";
import type { StaffPermissionDto, StaffRoleDto } from "@/server/packages/types/constants";
import { eq } from "drizzle-orm";
import { CheckedRolePermissions, UserValidRolePermissions } from "@/server/packages/utils/constants";
import type { ZodValidationAddOneStaff, ZodValidationEditMyData, ZodValidationEditStaff } from "@/server/packages/validations/staff";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import type { StatusCodeErrorDto } from "@/server/utils/constants";

export class ValidationStaffRoleAndPerServices {

    public static permissions = (
        userPermissions: StaffPermissionDto[],
        requiredPermissions: StaffPermissionDto[]
    ): boolean => {
        const validLength = userPermissions.length === requiredPermissions.length;
        const validPermission = requiredPermissions.every(permission =>
            userPermissions.includes(permission)
        );
        return validLength && validPermission;
    };

    public static somePermissions = (
        userPermissions: StaffPermissionDto[],
        requiredPermissions: StaffPermissionDto[]
    ): boolean => {
        const validLength = userPermissions.length === requiredPermissions.length;
        const validPermission = requiredPermissions.some(permission =>
            userPermissions.includes(permission)
        );
        return validLength && validPermission;
    };

    public static async roleAndPermissions(role: StaffRoleDto, permissions: StaffPermissionDto[]) {
        try {
            // check user role and permissions
            const isValidRoleAndPer = !this.permissions(permissions, UserValidRolePermissions[role]);
            if (isValidRoleAndPer) {
                return {
                    message: "Invalid user role and permissions",
                    code: "403",
                    error: true
                }
            }
            return {
                message: "",
                code: "200",
                error: false
            }
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async addOneUser({ addByStaffId, ...data }: ZodValidationAddOneStaff) {
        try {
            const valid = await this.roleAndPermissions(data.role, data.permissions);
            if (valid.error) {
                throw new HTTPErrorMessage(valid.message, valid.code as StatusCodeErrorDto);
            }

            // check email existing in the database
            const emailExisting = await db.query.staffs.findFirst({
                where: eq(staffs.email, data.email)
            });
            if (emailExisting) throw new HTTPErrorMessage("Email already existing", "403");

            const findMyAddData = await db.query.staffs.findFirst({
                where: eq(staffs.id, addByStaffId),
                with: {
                    sessions: true
                }
            });
            if (!findMyAddData) throw new HTTPErrorMessage("Find not found", "404");

            const myRole = findMyAddData.role;
            // check if role is VIEWER can't add user
            if (myRole === "VIEWER") {
                throw new HTTPErrorMessage("VIEWER have no an permissions to add user", "403")
            }
            return true;
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editOneUserById(data: ZodValidationEditStaff) {
        try {

            const { targetStaffId, updatedByStaffId } = data;
            const isValidMe = targetStaffId === updatedByStaffId;
            if (isValidMe) throw new HTTPErrorMessage("Invalid edit my data", "403");

            const valid = await this.roleAndPermissions(data.role, data.permissions);
            if (valid.error) {
                throw new HTTPErrorMessage(valid.message, valid.code as StatusCodeErrorDto);
            }

            const myData = await db.query.staffs.findFirst({
                where: eq(staffs.id, updatedByStaffId),
            });

            const targetData = await db.query.staffs.findFirst({
                where: eq(staffs.id, targetStaffId),
            });

            const isEmptyData = !myData || !targetData;
            if (isEmptyData) throw new HTTPErrorMessage("Find not found", "404");

            const myRole = myData.role;
            const targetRole = targetData.role;

            // user can be edit other user by condition here
            const isCanEdit = Boolean(CheckedRolePermissions[myRole]?.includes(targetRole));
            if (!isCanEdit) throw new HTTPErrorMessage("You have no an permission to edit user data", "403");
            return isCanEdit;
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async removeOneById({
        removeByStaffId,
        targetStaffId,
    }: {
        removeByStaffId: string;
        targetStaffId: string;
    }) {
        try {
            // find my data need to remove other user data
            const myData = await db.query.staffs.findFirst({
                where: eq(staffs.id, removeByStaffId),
                with: {
                    sessions: true
                }
            });
            // check my empty data 
            if (!myData) throw new HTTPErrorMessage("Find not found", "404");

            // find target data need to remove
            const targetStaffInfo = await db.query.staffs.findFirst({
                where: eq(staffs.id, targetStaffId)
            });
            // check target data is empty or not
            if (!targetStaffInfo) throw new HTTPErrorMessage("Find target user not found", "404");

            // check can't remove my account
            const isMe = myData.id === targetStaffInfo.id;
            if (isMe) return false;

            const myRole = myData.role;
            const targetRole = targetStaffInfo.role;

            // admin can be remove user by condition here
            const isCanRemove = Boolean(
                myRole === "SUPER_ADMIN" && ["ADMIN", "VIEWER", "EDITOR"].includes(targetRole) ||
                myRole === "ADMIN" && ["VIEWER", "EDITOR"].includes(targetRole) || false
            )
            if (!isCanRemove) {
                throw new HTTPErrorMessage("You have no an permissions to remove this user", "403");
            }
            return isCanRemove;
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editMyData(input: ZodValidationEditMyData) {
        try {
            const { targetStaffId, updatedByStaffId, role, permissions } = input;
            const valid = await this.roleAndPermissions(role, permissions);
            if (valid.error) {
                throw new HTTPErrorMessage(valid.message, valid.code as StatusCodeErrorDto);
            }
            const isValidMe = targetStaffId === updatedByStaffId;
            if (!isValidMe) throw new HTTPErrorMessage("Invalid my id", "403");
            // find my data
            const myData = await db.query.staffs.findFirst({
                where: eq(staffs.id, updatedByStaffId)
            });
            if (!myData) throw new HTTPErrorMessage("Find not found", "403");
            const myRole = myData.role;
            const isValidationStaffRoleAndPer = Boolean(
                (myRole === "ADMIN" && !["ADMIN", "EDITOR", "VIEWER"].includes(role)) ||
                (myRole === "EDITOR" && !["EDITOR", "VIEWER"].includes(role)) ||
                (myRole === "VIEWER" && !["VIEWER"].includes(role)) || false
            )
            if (isValidationStaffRoleAndPer) {
                throw new HTTPErrorMessage("Invalid edit my role and permissions", "403");
            }
            return myData;
        } catch (error) {
            throw getHTTPError(error);
        }
    }
}