import z from "zod"

// variable const
export const zodValidationStr = z.string().min(2, "String should be 2 characters").nonempty("String is required");
export const zodValidationUuid = z.string().uuid("Invalid uuid formatter").nonempty("UUID is required");
export const zodValidationEmail = z.string().email("Invalid email formatter").nonempty("Email is required");
export const zodValidationPassword = z.string()
    .min(6, "password must be at least 6 characters")
    .max(128, "password too long")
    .regex(/^(?=.*[a-z])/, "must contain lowercase letter")
    .regex(/^(?=.*[A-Z])/, "must contain uppercase letter")
    .regex(/^(?=.*\d)/, "must contain number")
    .regex(/^(?=.*[@$!%*?&])/, "must contain special character")
    .nonempty("Password is required");
export const zodValidationOTPCode = z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers').nonempty('OTP is required');
export const zodValidationPhoneNumber = z.string()
    .min(8, "Phone number must be at least 8 digits")
    .max(14, "Phone number must be at most 14 digits")
    .regex(/^\+?\d+$/, "Phone number must contain only numbers and optional leading +").nonempty("Phone number is required");
export const zodValidationSearchQuery = z.string().default("");
export const zodValidationStrDate = z.string().default("");
export const zodValidationDate = z.string().date("Invalid date formatter").nonempty("Date is required");
export const zodValidationFullName = z.string().nonempty("FullName is required");
export const zodValidationOrderBy = z.enum(['desc', 'asc']).default("desc");

// file zod
export const zodValidationFile = z.object({
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
export const zodValidationFiles = z.array(zodValidationFile);

// filter query
export const zodValidationFilter = z.object({
    page: z.number().default(1),
    limit: z.number().max(100).default(20)
});

// zod typeof validate....
export type ZodValidationStr = z.infer<typeof zodValidationStr>;
export type ZodValidationUuid = z.infer<typeof zodValidationUuid>;
export type ZodValidationFullName = z.infer<typeof zodValidationFullName>;

export type ZodValidationEmail = z.infer<typeof zodValidationEmail>;
export type ZodValidationOTPCode = z.infer<typeof zodValidationOTPCode>;
export type ZodValidationPhoneNumber = z.infer<typeof zodValidationPhoneNumber>;

export type ZodValidationPassword = z.infer<typeof zodValidationPassword>;
export type ZodValidationFilter = z.infer<typeof zodValidationFilter>;
export type ZodValidationSearchQuery = z.infer<typeof zodValidationSearchQuery>;
export type ZodValidationStrDate = z.infer<typeof zodValidationStrDate>;
export type ZodValidationDate = z.infer<typeof zodValidationDate>;

export type ZodValidationFile = z.infer<typeof zodValidationFile>;
export type ZodValidationFiles = z.infer<typeof zodValidationFiles>;
