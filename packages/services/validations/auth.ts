import z from "zod";
import { zodValidationEmail, zodValidationFullName, zodValidationOTPCode, zodValidationPassword, zodValidationPhoneNumber, zodValidationSearchQuery, zodValidationStrDate, zodValidationFilter, zodValidationOTPCodeSignIn } from "./constants";
import { zodValidationSearchQueryStaffPermissions, zodValidationSearchQueryStaffRole, zodValidationSearchQueryStaffStatus, zodValidationStaffPermissions, zodValidationStaffRole, zodValidationStaffStatus } from "./variables/staff";

export const zodValidationSignIn = z.object({
    email: zodValidationEmail,
    password: zodValidationPassword,
});

export const zodValidationSignInOTP = z.object({
    email: zodValidationEmail,
    code: zodValidationOTPCodeSignIn
});

export const zodValidationSignUp = z.object({
    fullName: zodValidationFullName,
    email: zodValidationEmail,
    password: zodValidationPassword,
    role: zodValidationStaffRole,
    status: zodValidationStaffStatus,
    permissions: zodValidationStaffPermissions
});

export const zodValidationVerifiedEmail = z.object({
    email: zodValidationEmail,
});

export const zodValidationVerifiedPhoneNumber = z.object({
    phomeNumber: zodValidationPhoneNumber,
});

export const zodValidationVerifiedOTPCode = z.object({
    email: zodValidationEmail,
    code: zodValidationOTPCode
});

export const zodValidationResetPassword = z.object({
    email: zodValidationEmail,
    newPassword: zodValidationPassword
});

export const zodValidationQueryStaff = zodValidationFilter.extend({
    search: zodValidationSearchQuery,
    role: zodValidationSearchQueryStaffRole,
    status: zodValidationSearchQueryStaffStatus,
    permissions: zodValidationSearchQueryStaffPermissions,
    startDate: zodValidationStrDate,
    endDate: zodValidationStrDate,
})

export type ZodValidationSignIn = z.infer<typeof zodValidationSignIn>;
export type ZodValidationSignInOTP = z.infer<typeof zodValidationSignInOTP>;
export type ZodValidationSignUp = z.infer<typeof zodValidationSignUp>;
export type ZodValidationVerifiedEmail = z.infer<typeof zodValidationVerifiedEmail>;
export type ZodValidationVerifiedPhoneNumber = z.infer<typeof zodValidationVerifiedPhoneNumber>;
export type ZodValidationVerifiedOTPCode = z.infer<typeof zodValidationVerifiedOTPCode>;
export type ZodValidationResetPassword = z.infer<typeof zodValidationResetPassword>;
export type ZodValidationQueryStaff = z.infer<typeof zodValidationQueryStaff>;