import { staffPermissionEnum, staffRoleEnum, staffStatusEnum } from "../../../apps/server/src/modules/admin/managements/staff/entities/enum";
import { StaffPermissionDto, StaffRoleDto, StaffStatusDto } from "../types/constants";

export interface StaffSchema {
    id: string;
    fullName: string;
    email: string;
    password: string;
    role: StaffRoleDto;
    status: StaffStatusDto;
    permissions: StaffPermissionDto[],
    createdAt: Date | null;
    updatedAt: Date | null;
    sessions: StaffSessionSchema[];
    verifications: StaffVerificationSchema[];
}

export interface StaffVerificationSchema {
    id: string;
    staffId: string;
    isVerifiedCode: boolean | null;
    code: string;
    codeExpired: Date;
    resetPasswordExpired: Date;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export interface StaffSessionSchema {
    id: string;
    staffId: string;
    sessionToken: string;
    userAgent: string | null;
    ipAddress: string | null;
    expired: Date;
    valid: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export interface StaffPasswordResetTokenSchema {
    id: string;
    staffId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date | null;
    used: boolean;
}

export interface ResetAdminPasswordTokenSchema {
    id: string;
    token: string;
    expiresAt: Date;
    createdAt: Date | null;
    used: boolean;
}
