import type { RoleStatusPermissionDto } from "./constants";

export interface AddOneStaffDto extends RoleStatusPermissionDto {
    addByStaffId: string;
    fullName: string;
    email: string;
    password: string;
}

export interface EditOneStaffDto extends RoleStatusPermissionDto {
    targetStaffId: string;
    updatedByStaffId: string;
}

export interface EditOneMyDataDto {
    updatedByStaffId: string;
    targetByStaffId: string;
    fullName: string;
    email: string;
}

export interface EditOneMyAdminDataDto extends RoleStatusPermissionDto {
    updatedByStaffId: string;
    targetByStaffId: string;
    fullName: string;
    email: string;
}