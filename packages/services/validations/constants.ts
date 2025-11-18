import z from "zod"
import { SearchQueryStaffPermissionDto, SearchQueryStaffRoleDto, SearchQueryStaffStatusDto } from "../types/constants";

// variable const
export const zodValidateStr = z.string().min(2, "String should be 2 characters").nonempty("String is required");
export const zodValidateUuid = z.string().uuid("Invalid uuid formatter").nonempty("UUID is required");
export const zodValidateEmail = z.string().email("Invalid email formatter").nonempty("Email is required");
export const zodValidatePassword = z.string()
    .min(6, "password must be at least 6 characters")
    .max(128, "password too long")
    .regex(/^(?=.*[a-z])/, "must contain lowercase letter")
    .regex(/^(?=.*[A-Z])/, "must contain uppercase letter")
    .regex(/^(?=.*\d)/, "must contain number")
    .regex(/^(?=.*[@$!%*?&])/, "must contain special character")
    .nonempty("Password is required");
export const zodValidateOTPCode = z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers').nonempty('OTP is required');
export const zodValidatePhoneNumber = z.string()
    .min(8, "Phone number must be at least 8 digits")
    .max(14, "Phone number must be at most 14 digits")
    .regex(/^\+?\d+$/, "Phone number must contain only numbers and optional leading +").nonempty("Phone number is required");
export const zodValidateSearchQuery = z.string().default("");
export const zodValidateStrDate = z.string().default("");
export const zodValidateDate = z.string().date("Invalid date formatter").nonempty("Date is required");
export const zodValidateFullName = z.string().nonempty("FullName is required");
export const zodValidateOrderBy = z.enum(['desc', 'asc']).default("desc");
export const zodValidateRole = z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"]);
export const zodValidateStatus = z.enum(["ACTIVE", "INACTIVE"]);
export const zodValidatePermissions = z.array(z.enum(["READ", "WRITE", "CREATE", "DELETE", "UPDATE", "MANAGE"]));

export const zodValidateSearchQueryRole = z.enum(["DEFAULT", "SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"]).default("DEFAULT" as SearchQueryStaffRoleDto);
export const zodValidateSearchQueryStatus = z.enum(["DEFAULT", "ACTIVE", "INACTIVE"]).default("DEFAULT" as SearchQueryStaffStatusDto);
export const zodValidateSearchQueryPermissions = z.array(z.enum(["DEFAULT", "READ", "WRITE", "CREATE", "DELETE", "UPDATE", "MANAGE"])).default(["DEFAULT"] as SearchQueryStaffPermissionDto[]);


// file zod
export const zodValidateFile = z.object({
    // fieldname: z.string(),
    // originalname: z.string(),
    // encoding: z.string(),
    // mimetype: z.string(),
    // buffer: z.instanceof(Buffer),
    // size: z.number().max(validateMaxFileSize, "max size is 10MB"),
    fileData: z.string(), // base64 string
    fileName: z.string(),
    fileType: z.string(),
    size: z.number() // in bytes
});
export const zodValidateFiles = z.array(zodValidateFile);

// filter query
export const zodValidateTRPCFilter = z.object({
    page: z.number().default(1),
    limit: z.number().max(100).default(20)
});

// zod typeof validate....
export type ZodValidateStr = z.infer<typeof zodValidateStr>;
export type ZodValidateUuid = z.infer<typeof zodValidateUuid>;
export type ZodValidateFullName = z.infer<typeof zodValidateFullName>;

export type ZodValidateRole = z.infer<typeof zodValidateRole>;
export type ZodValidateStatus = z.infer<typeof zodValidateStatus>;
export type ZodValidatePermissions = z.infer<typeof zodValidatePermissions>;

export type ZodValidateSearchQueryRole = z.infer<typeof zodValidateSearchQueryRole>;
export type ZodValidateSearchQueryStatus = z.infer<typeof zodValidateSearchQueryStatus>;
export type ZodValidateSearchQueryPermissions = z.infer<typeof zodValidateSearchQueryPermissions>;

export type ZodValidateEmail = z.infer<typeof zodValidateEmail>;
export type ZodValidateOTPCode = z.infer<typeof zodValidateOTPCode>;
export type ZodValidatePhoneNumber = z.infer<typeof zodValidatePhoneNumber>;

export type ZodValidatePassword = z.infer<typeof zodValidatePassword>;
export type ZodValidateTRPCFilter = z.infer<typeof zodValidateTRPCFilter>;
export type ZodValidateSearchQuery = z.infer<typeof zodValidateSearchQuery>;
export type ZodValidateStrDate = z.infer<typeof zodValidateStrDate>;
export type ZodValidateDate = z.infer<typeof zodValidateDate>;

export type ZodValidateFile = z.infer<typeof zodValidateFile>;
export type ZodValidateFiles = z.infer<typeof zodValidateFiles>;