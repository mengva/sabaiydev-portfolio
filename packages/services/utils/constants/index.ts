import type { StaffPermissionDto, StaffRoleDto } from "../../types/constants";


export const UserValidRolePermissions = {
    SUPER_ADMIN: ["READ", "WRITE", "CREATE", "DELETE", "UPDATE", "MANAGE"] as StaffPermissionDto[],
    ADMIN: ["READ", "WRITE", "CREATE", "DELETE", "UPDATE"] as StaffPermissionDto[],
    EDITOR: ["READ", "WRITE", "CREATE", "UPDATE"] as StaffPermissionDto[],
    VIEWER: ["READ"] as StaffPermissionDto[],
    PERMISSIONS: ['SUPER_ADMIN', "ADMIN", "EDITOR", "VIEWER"] as StaffRoleDto[],
} as const;

// Cleaner permission mapping
export const CheckedRolePermissions: Record<StaffRoleDto, ReadonlyArray<StaffRoleDto>> = {
    SUPER_ADMIN: ["ADMIN", "VIEWER", "EDITOR"],
    ADMIN: ["VIEWER", "EDITOR"],
    EDITOR: ["VIEWER"],
    VIEWER: []
};




