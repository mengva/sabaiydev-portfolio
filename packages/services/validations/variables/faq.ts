import z from "zod";

export const zodValidationFaqStatus = z.enum(["PUBLISHED", "DRAFT"]);
export const zodValidationFaqCategory = z.enum(["GENERAL", "SERVICES", "SUPPORT", "PRICING", "TECHNICAL"]);

export const zodValidationSearchQueryFaqStatus = z.enum(["DEFAULT", "PUBLISHED", "DRAFT"]);
export const zodValidationSearchQueryFaqCategory = z.enum(["DEFAULT", "GENERAL", "SERVICES", "SUPPORT", "PRICING", "TECHNICAL"]);

export const zodValidationFaqTranslation = z.array(z.object({
    local: z.enum(["en", "lo", "th"]),
    question: z.string()
        .min(5, "Question must be at least 5 characters")
        .max(200, "Question must not exceed 200 characters"),
    answer: z.string()
        .min(10, "Answer must be at least 10 characters")
        .max(2000, "Answer must not exceed 2000 characters"),
}));

export type ZodValidationFaqStatus = z.infer<typeof zodValidationFaqStatus>;
export type ZodValidationFaqCategory = z.infer<typeof zodValidationFaqCategory>;

export type ZodValidationSearchQueryFaqStatus = z.infer<typeof zodValidationSearchQueryFaqStatus>;
export type ZodValidationSearchQueryFaqCategory = z.infer<typeof zodValidationSearchQueryFaqCategory>;

export type ZodValidationFaqTranslation = z.infer<typeof zodValidationFaqTranslation>;