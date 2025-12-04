import z from "zod";

export const zodValidationDepartmentCareer = z.enum(["ENGINEERING", "MARKETING", "SALES", "DESIGN", "HR", "FINANCE", "OPERATIONS", "CUSTOMER_SUPPORT", "PRODUCT_MANAGEMENT", "LEGAL"]);
export const zodValidationTypeCareer = z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY", "VOLUNTEER"]);

export const zodValidationSearchQueryCareerType = z.enum(["DEFAULT", "FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY", "VOLUNTEER"]);
export const zodValidationSearchQueryCareerDepartment = z.enum(["DEFAULT", "ENGINEERING", "MARKETING", "SALES", "DESIGN", "HR", "FINANCE", "OPERATIONS", "CUSTOMER_SUPPORT", "PRODUCT_MANAGEMENT", "LEGAL"]);
export const zodValidationSearchQueryCareerStatus = z.enum(["DEFAULT", "OPEN", "CLOSED", "PAUSED"]);

export const zodValidationStatusCareer = z.enum(["OPEN", "CLOSED", "PAUSED"]);
export const zodValidationSaralyCurrencyCareer = z.enum(["USD", "THB", "LAK"]);
export const zodValidationSaralyTypeCareer = z.enum(["YEARLY", "MONTHLY", "DAILY", "HOURLY"]);

export const zodValidationSaralyRangeCareer = z.array(z.string().nonempty("Saraly range is required")).max(2).refine((data) => {
    if (data.length !== 2) return false;
    const from = Number(data[0]);
    const to = Number(data[1]);
    if (isNaN(from) || isNaN(to)) return false;
    return to >= from;
}, {
    message: "Salary 'to' must be greater than or equal to 'from'",
});

export const zodValidationTranslationCareer = z.array(z.object({
    local: z.enum(["en", "lo", "th"]),
    location: z.string().min(1, { message: "Position is required" }),
    jobTitle: z.string().min(1, { message: "JobTitle is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    requirements: z.array(z.string().min(1, { message: "Requirements is required" })).min(1, { message: "At least one requirement is required" }),
    benefits: z.array(z.string().min(1, { message: "Benefits is required" })).min(1, { message: "At least one benefit is required" }),
}));

export type ZodValidationTranslationCareer = z.infer<typeof zodValidationTranslationCareer>;
export type ZodValidationDepartmentCareer = z.infer<typeof zodValidationDepartmentCareer>;
export type ZodValidationTypeCareer = z.infer<typeof zodValidationTypeCareer>;
export type ZodValidationStatusCareer = z.infer<typeof zodValidationStatusCareer>;