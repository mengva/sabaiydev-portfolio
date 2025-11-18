import type { RoleStatusPermissionDto } from "./constants";

export interface AddNewStaffDto extends RoleStatusPermissionDto {
    addByStaffId: string;
    fullName: string;
    email: string;
    password: string;
}

export interface UpdatedStaffDto extends RoleStatusPermissionDto {
    targetStaffId: string;
    updatedByStaffId: string;
}

export interface UpdateMyDataDto {
    updatedByStaffId: string;
    targetByStaffId: string;
    fullName: string;
    email: string;
}

export interface UpdateMyAdminDataDto extends RoleStatusPermissionDto {
    updatedByStaffId: string;
    targetByStaffId: string;
    fullName: string;
    email: string;
}