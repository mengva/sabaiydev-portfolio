import type { LocalDto, StaffPermissionDto, StaffRoleDto } from "../../types/constants";

// vairables
export const validateEmailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
export const validateMaxFileSize = 10 * 1024 * 1024; //10MB

export const RolePermissions = {
    SUPER_ADMIN: ["READ", "WRITE", "CREATE", "DELETE", "UPDATE", "MANAGE"] as StaffPermissionDto[],
    ADMIN: ["READ", "WRITE", "CREATE", "DELETE", "UPDATE"] as StaffPermissionDto[],
    EDITOR: ["READ", "WRITE", "CREATE", "UPDATE"] as StaffPermissionDto[],
    VIEWER: ["READ"] as StaffPermissionDto[],
    PERMISSIONS: ['SUPER_ADMIN', "ADMIN", "VIEWER", "EDITOR"] as StaffRoleDto[],
} as const;

export const LocalArray = ["en", "lo", "th"] as LocalDto[];


