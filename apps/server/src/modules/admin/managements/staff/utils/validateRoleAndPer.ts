import db from "@/api/config/db";
import { staffs } from "@/api/db";
import type { StaffPermissionDto, StaffRoleDto } from "@/api/packages/types/constants";
import { eq } from "drizzle-orm";
import { RolePermissions } from "@/api/packages/utils/constants";
import type { ZodValidateAddNewStaff, ZodValidateUpdatedStaff } from "@/api/packages/validations/staff";
import { getHTTPError, HTTPErrorMessage } from "@/api/packages/utils/HttpJsError";

export class ValidateStaffRoleAndPerUtils {

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

    public static async roleAndPer(role: StaffRoleDto, permissions: StaffPermissionDto[]) {
        // check user role and permissions
        const superAdmin = role === "SUPER_ADMIN" && !this.permissions(permissions, RolePermissions.SUPER_ADMIN);
        const admin = role === "ADMIN" && !this.permissions(permissions, RolePermissions.ADMIN);
        const editor = role === "EDITOR" && !this.permissions(permissions, RolePermissions.EDITOR);
        const viewer = role === "VIEWER" && !this.permissions(permissions, RolePermissions.VIEWER);
        if (superAdmin || admin || editor || viewer) {
            throw new HTTPErrorMessage("Invalid user role and permissions", "403");
        }
        return true;
    }

    public static async addOneUser({ addByStaffId, ...data }: ZodValidateAddNewStaff) {
        try {
            const valid = await this.roleAndPer(data.role, data.permissions);
            if (!valid) return;

            // check email existing in the database
            const emailExisting = await db.query.staffs.findFirst({
                where: eq(staffs.email, data.email)
            });
            if (emailExisting) throw new HTTPErrorMessage("Email already existing", "403");

            const findOwnerAddData = await db.query.staffs.findFirst({
                where: eq(staffs.id, addByStaffId),
                with: {
                    sessions: true
                }
            });
            if (!findOwnerAddData) throw new HTTPErrorMessage("Find not found", "404");

            const ownerRole = findOwnerAddData.role;
            // check if role is VIEWER can't add user
            if (ownerRole === "VIEWER") {
                throw new HTTPErrorMessage("VIEWER have no an permissions to add user", "403")
            }

            return true;

        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editOneUserById(data: ZodValidateUpdatedStaff) {
        try {
            const valid = await this.roleAndPer(data.role, data.permissions);
            if (!valid) return;

            const { targetStaffId, updatedByStaffId } = data;
            const findOwnerEditData = await db.query.staffs.findFirst({
                where: eq(staffs.id, updatedByStaffId),
            });

            const targetData = await db.query.staffs.findFirst({
                where: eq(staffs.id, targetStaffId),
            });

            const isEmpty = !findOwnerEditData || !targetData;
            if (isEmpty) throw new HTTPErrorMessage("Find not found", "404");

            const isEditMyData = targetStaffId === updatedByStaffId;
            if (isEditMyData) throw new HTTPErrorMessage("Invalid edit my data", "403");

            const ownerRole = findOwnerEditData.role;
            const targetRole = targetData.role;

            // user can be edit other user by condition here
            const isCanEdit = Boolean(
                ownerRole === "SUPER_ADMIN" && ["ADMIN", "VIEWER", "EDITOR"].includes(targetRole) ||
                ownerRole === "ADMIN" && ["VIEWER", "EDITOR"].includes(targetRole) ||
                ownerRole === "EDITOR" && ["VIEWER"].includes(targetRole) || false
            );
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
            // find owner data need to remove other user data
            const findOwnerRemoveData = await db.query.staffs.findFirst({
                where: eq(staffs.id, removeByStaffId),
                with: {
                    sessions: true
                }
            });
            // check owner empty data 
            if (!findOwnerRemoveData) throw new HTTPErrorMessage("Find not found", "404");

            // find target data need to remove
            const targetStaffInfo = await db.query.staffs.findFirst({
                where: eq(staffs.id, targetStaffId)
            });
            // check target data is empty or not
            if (!targetStaffInfo) throw new HTTPErrorMessage("Find target user not found", "404");

            // check can't remove my account
            const isMe = findOwnerRemoveData.id === targetStaffInfo.id;
            if (isMe) return false;

            const ownerRole = findOwnerRemoveData.role;
            const targetRole = targetStaffInfo.role;

            // admin can be remove user by condition here
            const isCanRemove = Boolean(
                ownerRole === "SUPER_ADMIN" && ["ADMIN", "VIEWER", "EDITOR"].includes(targetRole) ||
                ownerRole === "ADMIN" && ["VIEWER", "EDITOR"].includes(targetRole) || false
            )
            // if isCanRemove is true can be remove but isCanRemove is false can't be to remove
            return isCanRemove;
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editMyData({
        targetStaffId,
        updatedByStaffId
    }: {
        targetStaffId: string;
        updatedByStaffId: string;
    }) {
        try {
            const isMe = targetStaffId === updatedByStaffId;
            if (!isMe) throw new HTTPErrorMessage("Invalid my id", "403");
            const findEditMyData = await db.query.staffs.findFirst({
                where: eq(staffs.id, updatedByStaffId),
            });
            if (!findEditMyData) throw new HTTPErrorMessage("Find not found", "404");
            return true;
        } catch (error) {
            throw getHTTPError(error);
        }
    }
}