import z from "zod";
import { zodValidationFiles, zodValidationUuid } from "./constants";

export const zodValidationTranslationProduct = z.array(z.object({
    name: z.string()
        .min(3, "Name must be at least 3 characters")
        .max(100, "Name must not exceed 100 characters"),
    description: z.string()
        .min(10, "Description must be at least 10 characters")
        .max(500, "Description must not exceed 500 characters"),
    longDescription: z.string()
        .min(10, "Long description must be at least 10 characters")
        .max(1000, "Long description must not exceed 1000 characters"),
    local: z.enum(["en", "lo", "th"], {
        errorMap: () => ({ message: "Language must be one of: en, lo, th" })
    }),
    features: z.array(z.string()
        .max(500, "Each feature must not exceed 500 characters"),
        { errorMap: () => ({ message: "Features must be an array of strings" }) }
    ),
}));

export const zodValidationGetOneProductById = z.object({
    productId: zodValidationUuid
});

export const zodValidationAddOneProductData = z.object({
    addByStaffId: zodValidationUuid,
    translations: zodValidationTranslationProduct,
    technologies: z.array(z.string().max(500)).nonempty("Technologies is required"),
    category: z.enum(["COLLABORATION", "MEDIA", "ANALYTICS", "SECURITY", "DEVELOPMENT"] as const),
    status: z.enum(["ACTIVE", "INACTIVE", "DEVELOPMENT", "DEPRECATED"] as const),
});

export const zodValidationAddOneProduct = zodValidationAddOneProductData.extend({
    imageFiles: zodValidationFiles
});

export const zodValidationEditOneProductData = z.object({
    updatedByStaffId: zodValidationUuid,
    targetProductId: zodValidationUuid,
    translations: zodValidationTranslationProduct,
    technologies: z.array(z.string().max(500)),
    category: z.enum(["COLLABORATION", "MEDIA", "ANALYTICS", "SECURITY", "DEVELOPMENT"] as const),
    status: z.enum(["ACTIVE", "INACTIVE", "DEVELOPMENT", "DEPRECATED"] as const)
});

export const zodValidationRemoveOneProductById = z.object({
    targetProductId: zodValidationUuid,
    removeByStaffId: zodValidationUuid
});

export const zodValidationEditOneProduct = zodValidationEditOneProductData.extend({
    imageFiles: zodValidationFiles
});

export type ZodValidationGetOneProductById = z.infer<typeof zodValidationGetOneProductById>;
export type ZodValidationTranslationProduct = z.infer<typeof zodValidationTranslationProduct>;
export type ZodValidationAddOneProduct = z.infer<typeof zodValidationAddOneProduct>;
export type ZodValidationAddOneProductData = z.infer<typeof zodValidationAddOneProductData>;
export type ZodValidationEditOneProductData = z.infer<typeof zodValidationEditOneProductData>;
export type ZodValidationEditOneProduct = z.infer<typeof zodValidationEditOneProduct>;
export type ZodValidationRemoveOneProductById = z.infer<typeof zodValidationRemoveOneProductById>;
