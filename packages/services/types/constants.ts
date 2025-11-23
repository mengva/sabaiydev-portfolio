import type { ZodError } from "zod";
import type { TRPCError } from "@trpc/server";

// enum
export enum DefaultEnum {
    DEFAULT = "DEFAULT",
}

// handle error

export type ServerErrorDto = Error | ZodError | TRPCError | unknown;

export type StaffPermissionDto = "READ" | "WRITE" | "CREATE" | "DELETE" | "UPDATE" | "MANAGE";
export type StaffRoleDto = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";
export type StaffStatusDto = "ACTIVE" | "INACTIVE";

export type SearchQueryStaffPermissionDto = "DEFAULT" | StaffPermissionDto;
export type SearchQueryStaffRoleDto = "DEFAULT" | StaffRoleDto;
export type SearchQueryStaffStatusDto = "DEFAULT" | StaffStatusDto;

export interface FilterDto {
    page: number;
    limit: number
}

export interface PaginationFilterDto {
    total: number;
    page: number;
    totalPage: number;
    limit: number;
}

export interface ServerResponseDto {
    success: boolean;
    message: string;
    data: any;
}

export interface FileDto {
    fileData: string; // base64 string
    fileName: string;
    fileType: string;
    size: number; // in bytes
}

export interface RoleStatusPermissionDto {
    role: StaffRoleDto;
    status: StaffStatusDto;
    permissions: StaffPermissionDto[];
}

export interface MyDataDto {
    id: string;
    fullName: string;
    email: string;
    role: StaffRoleDto;
    status: StaffStatusDto;
    permissions: StaffPermissionDto[];
    createdAt: Date;
    updatedAt: Date;
}

// export interface FileDto {
//     fieldname: string;
//     originalname: string;
//     encoding: string;
//     mimetype: string;
//     buffer: Buffer;
//     size: number;
// }

export type LocalDto = "en" | "lo" | "th"; 