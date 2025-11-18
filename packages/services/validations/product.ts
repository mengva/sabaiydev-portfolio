import z from "zod";
import { zodValidateFiles, zodValidateUuid } from "./constants";
import { ProductCategoryArray, ProductStatusArray } from "../utils/constants/product";
import { LocalArray } from "../utils/constants";

export const zodValidateTranslationProduct = z.array(z.object({
    name: z.string().max(100),
    description: z.string().max(500),
    longDescription: z.string().max(1000),
    local: z.enum(LocalArray),
    features: z.array(z.string().max(500)),
}));

export const zodValidateAddNewProductData = z.object({
    addByStaffId: zodValidateUuid,
    translations: zodValidateTranslationProduct,
    technologies: z.array(z.string().max(500)),
    category: z.enum(ProductCategoryArray),
    status: z.enum(ProductStatusArray),
});

export const zodValidateAddNewProduct = zodValidateAddNewProductData.extend({
    imageFiles: zodValidateFiles
});


export const zodValidateUpdatedProductData = z.object({
    updatedByStaffId: zodValidateUuid,
    targetProductId: zodValidateUuid,
    translations: zodValidateTranslationProduct,
    technologies: z.array(z.string().max(500)),
    category: z.enum(ProductCategoryArray),
    status: z.enum(ProductStatusArray)
});

export const zodValidateRemoveProductById = z.object({
    targetProductId: zodValidateUuid,
    cloudId: z.string().nonempty("Invalid cloudId")
});

export const zodValidateUpdatedProduct = zodValidateUpdatedProductData.extend({
    imageFiles: zodValidateFiles
});

export type ZodValidateTranslationProduct = z.infer<typeof zodValidateTranslationProduct>;
export type ZodValidateAddNewProduct = z.infer<typeof zodValidateAddNewProduct>;
export type ZodValidateAddNewProductData = z.infer<typeof zodValidateAddNewProductData>;
export type ZodValidateUpdatedProductData = z.infer<typeof zodValidateUpdatedProductData>;
export type ZodValidateUpdatedProduct = z.infer<typeof zodValidateUpdatedProduct>;
export type ZodValidateRemoveProductById = z.infer<typeof zodValidateRemoveProductById>;
