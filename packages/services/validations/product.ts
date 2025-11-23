import z from "zod";
import { zodValidateFiles, zodValidateUuid } from "./constants";
import { ProductCategoryArray, ProductStatusArray } from "../utils/constants/product";

export const zodValidateTranslationProduct = z.array(z.object({
    name: z.string().max(100),
    description: z.string().max(500),
    longDescription: z.string().max(1000),
    local: z.enum(["en", "lo", "th"]),
    features: z.array(z.string().max(500)),
}));

export const zodValidateGetProductById = z.object({
    productId: zodValidateUuid
});

export const zodValidateAddNewProductData = z.object({
    addByStaffId: zodValidateUuid,
    translations: zodValidateTranslationProduct,
    technologies: z.array(z.string().max(500)),
    category: z.enum(["COLLABORATION", "MEDIA", "ANALYTICS", "SECURITY", "DEVELOPMENT"] as const),
    status: z.enum(["ACTIVE", "INACTIVE", "DEVELOPMENT", "DEPRECATED"] as const),
});

export const zodValidateAddNewProduct = zodValidateAddNewProductData.extend({
    imageFiles: zodValidateFiles
});

export const zodValidateUpdatedProductData = z.object({
    updatedByStaffId: zodValidateUuid,
    targetProductId: zodValidateUuid,
    translations: zodValidateTranslationProduct,
    technologies: z.array(z.string().max(500)),
    category: z.enum(["COLLABORATION", "MEDIA", "ANALYTICS", "SECURITY", "DEVELOPMENT"] as const),
    status: z.enum(["ACTIVE", "INACTIVE", "DEVELOPMENT", "DEPRECATED"] as const)
});

export const zodValidateRemoveProductById = z.object({
    targetProductId: zodValidateUuid,
    cloudId: z.string().nonempty("Invalid cloudId")
});

export const zodValidateUpdatedProduct = zodValidateUpdatedProductData.extend({
    imageFiles: zodValidateFiles
});

export type ZodValidateGetProductById = z.infer<typeof zodValidateGetProductById>;
export type ZodValidateTranslationProduct = z.infer<typeof zodValidateTranslationProduct>;
export type ZodValidateAddNewProduct = z.infer<typeof zodValidateAddNewProduct>;
export type ZodValidateAddNewProductData = z.infer<typeof zodValidateAddNewProductData>;
export type ZodValidateUpdatedProductData = z.infer<typeof zodValidateUpdatedProductData>;
export type ZodValidateUpdatedProduct = z.infer<typeof zodValidateUpdatedProduct>;
export type ZodValidateRemoveProductById = z.infer<typeof zodValidateRemoveProductById>;
