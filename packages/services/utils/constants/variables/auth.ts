import type { StaffPermissionDto, StaffRoleDto, StaffStatusDto } from "../../../types/constants";

export const adminSessionTokenName = "adminSessionToken";

export const StaffPermissionArray = ["READ", "WRITE", "CREATE", "DELETE", "UPDATE", "MANAGE"] as StaffPermissionDto[];
export const StaffRoleArray = ["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"] as StaffRoleDto[];
export const StaffStatusArray = ["ACTIVE", "INACTIVE"] as StaffStatusDto[];
