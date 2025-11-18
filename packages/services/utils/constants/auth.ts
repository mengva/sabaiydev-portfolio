import type { StaffPermissionDto, StaffRoleDto, StaffStatusDto } from "../../types/constants";

export const adminSessionTokenName = "adminSessionToken";

export enum StaffRoleEnum {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    EDITOR = "EDITOR",
    VIEWER = "VIEWER"
}

export enum StaffPermissionEnum {
    READ = "READ",
    WRITE = "WRITE",
    CREATE = "CREATE",
    DELETE = "DELETE",
    UPDATE = "UPDATE",
    MANAGE = "MANAGE",
}

export enum StaffStatusEnum {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}

export const StaffPermissionArray = ["READ", "WRITE", "CREATE", "DELETE", "UPDATE", "MANAGE"] as StaffPermissionDto[];
export const StaffRoleArray = ["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"] as StaffRoleDto[];
export const StaffStatusArray = ["ACTIVE", "INACTIVE"] as StaffStatusDto[];
