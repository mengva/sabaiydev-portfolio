import z from "zod";

export const zodValidationNewsCategory = z.enum(["TECHNOLOGY", "CLOUD", "COMPANY", "PRODUCT", "INDUSTRY"]);
export const zodValidationNewsStatus = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const zodValidationSearchQueryNewsCategory = z.enum(["DEFAULT", "TECHNOLOGY", "CLOUD", "COMPANY", "PRODUCT", "INDUSTRY"]);
export const zodValidationSearchQueryNewsStatus = z.enum(["DEFAULT", "DRAFT", "PUBLISHED", "ARCHIVED"]);

export const zodValidationTranslationNews = z.array(z.object({
    local: z.enum(["en", "lo", "th"]),
    title: z.string()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title must not exceed 100 characters"),
    description: z.string()
        .min(10, "Description must be at least 10 characters")
        .max(500, "Description must not exceed 500 characters"),
    content: z.string()
        .min(10, "Content must be at least 10 characters")
        .max(5000, "Content must not exceed 500 characters"),
}))

export type ZodValidationNewsCategory = z.infer<typeof zodValidationNewsCategory>;
export type ZodValidationNewsStatus = z.infer<typeof zodValidationNewsStatus>;

export type ZodValidationTranslationNews = z.infer<typeof zodValidationTranslationNews>;

export type ZodValidationSearchQueryNewsCategory = z.infer<typeof zodValidationSearchQueryNewsCategory>;
export type ZodValidationSearchQueryNewsStatus = z.infer<typeof zodValidationSearchQueryNewsStatus>;