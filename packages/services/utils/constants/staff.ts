import type { SearchQueryStaffPermissionDto, SearchQueryStaffRoleDto, SearchQueryStaffStatusDto } from "../../types/constants";

export enum SearchQueryStaffRoleEnum {
    DEFAULT = "DEFAULT",
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    EDITOR = "EDITOR",
    VIEWER = "VIEWER"
}

export enum SearchQueryStaffPermissionEnum {
    DEFAULT = "DEFAULT",
    READ = "READ",
    WRITE = "WRITE",
    CREATE = "CREATE",
    DELETE = "DELETE",
    UPDATE = "UPDATE",
    MANAGE = "MANAGE",
}

export enum SearchQueryStaffStatusEnum {
    DEFAULT = "DEFAULT",
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}

export const SearchQueryStaffPermissionArray = ["DEFAULT", "READ", "WRITE", "CREATE", "DELETE", "UPDATE", "MANAGE"] as SearchQueryStaffPermissionDto[];
export const SearchQueryStaffRoleArray = ["DEFAULT", "SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"] as SearchQueryStaffRoleDto[];
export const SearchQueryStaffStatusArray = ["DEFAULT", "ACTIVE", "INACTIVE"] as SearchQueryStaffStatusDto[];