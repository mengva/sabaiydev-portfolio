import type { AuthSignInDto, AuthSignInWithOTPAndEmailDto } from "@/server/packages/types/auth";
import type { MyContext } from "@/server/server/trpc/context";

export interface AuthTRPCSignInDto {
    input: AuthSignInDto;
    ctx: MyContext;
}

export interface AuthTRPCSignInWithOTPAndEmailDto {
    input: AuthSignInWithOTPAndEmailDto;
    ctx: MyContext;
}

export interface AuthVerifiedOTPCodeDto { 
    email: string, 
    code: string 
}

export interface AuthResetPasswordDto { 
    email: string, 
    newPassword: string 
}