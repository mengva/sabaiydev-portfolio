import { SearchQueryStaffPermissionDto, SearchQueryStaffRoleDto, SearchQueryStaffStatusDto } from "../../../types/constants";

export const SearchQueryStaffPermissionArray = ["DEFAULT", "READ", "WRITE", "CREATE", "DELETE", "UPDATE", "MANAGE"] as SearchQueryStaffPermissionDto[];
export const SearchQueryStaffRoleArray = ["DEFAULT", "SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"] as SearchQueryStaffRoleDto[];
export const SearchQueryStaffStatusArray = ["DEFAULT", "ACTIVE", "INACTIVE"] as SearchQueryStaffStatusDto[];