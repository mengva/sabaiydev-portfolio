import type { RoleStatusPermissionDto } from "./constants";

export interface AuthSignInDto {
    email: string;
    password: string;
}

export interface AuthSignUpDto extends AuthSignInDto {
    fullName: string;
}

export interface AuthSignUpDto extends RoleStatusPermissionDto {}

export interface AuthSignInWithOTPAndEmailDto {
    email: string;
    code: string;
}