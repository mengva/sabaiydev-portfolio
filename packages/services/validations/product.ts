import z from "zod";
import { zodValidationFiles, zodValidationUuid } from "./constants";

export const zodValidationTranslationProduct = z.array(z.object({
    name: z.string().max(100),
    description: z.string().max(500),
    longDescription: z.string().max(1000),
    local: z.enum(["en", "lo", "th"]),
    features: z.array(z.string().max(500)),
}));

export const zodValidationGetOneProductById = z.object({
    productId: zodValidationUuid
});

export const zodValidationAddOneProductData = z.object({
    addByStaffId: zodValidationUuid,
    translations: zodValidationTranslationProduct,
    technologies: z.array(z.string().max(500)),
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
    cloudId: z.string().nonempty("Invalid cloudId")
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
