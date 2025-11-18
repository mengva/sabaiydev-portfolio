import z from "zod";
import { zodValidateEmail, zodValidateFullName, zodValidateOTPCode, zodValidatePassword, zodValidatePermissions, zodValidatePhoneNumber, zodValidateRole, zodValidateSearchQuery, zodValidateSearchQueryPermissions, zodValidateSearchQueryRole, zodValidateSearchQueryStatus, zodValidateStatus, zodValidateStrDate, zodValidateTRPCFilter } from "./constants";

export const zodValidateSignIn = z.object({
    email: zodValidateEmail,
    password: zodValidatePassword,
});

export const zodValidateSignInWithOTPAndEmail = z.object({
    email: zodValidateEmail,
    code: zodValidateOTPCode
});

export const zodValidateSignUp = z.object({
    fullName: zodValidateFullName,
    email: zodValidateEmail,
    password: zodValidatePassword,
    role: zodValidateRole,
    status: zodValidateStatus,
    permissions: zodValidatePermissions
});

export const zodValidateVerifiedEmail = z.object({
    email: zodValidateEmail,
});

export const zodValidateVerifiedPhoneNumber = z.object({
    phomeNumber: zodValidatePhoneNumber,
});

export const zodValidateVerifiedOTPCode = z.object({
    email: zodValidateEmail,
    code: zodValidateOTPCode
});

export const zodValidateResetPassword = z.object({
    email: zodValidateEmail,
    newPassword: zodValidatePassword
});

export const zodValidateListAndQueryStaff = zodValidateTRPCFilter.extend({
    search: zodValidateSearchQuery,
    role: zodValidateSearchQueryRole,
    status: zodValidateSearchQueryStatus,
    permissions: zodValidateSearchQueryPermissions,
    startDate: zodValidateStrDate,
    endDate: zodValidateStrDate,
})

export type ZodValidateSignIn = z.infer<typeof zodValidateSignIn>;
export type ZodValidateSignInWithOTPAndEmail = z.infer<typeof zodValidateSignInWithOTPAndEmail>;
export type ZodValidateSignUp = z.infer<typeof zodValidateSignUp>;
export type ZodValidateVerifiedEmail = z.infer<typeof zodValidateVerifiedEmail>;
export type ZodValidateVerifiedPhoneNumber = z.infer<typeof zodValidateVerifiedPhoneNumber>;
export type ZodValidateVerifiedOTPCode = z.infer<typeof zodValidateVerifiedOTPCode>;
export type ZodValidateResetPassword = z.infer<typeof zodValidateResetPassword>;
export type ZodValidateListAndQueryStaff = z.infer<typeof zodValidateListAndQueryStaff>;