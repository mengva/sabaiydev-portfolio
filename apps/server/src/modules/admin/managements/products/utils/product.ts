import { productImages, products, translationProducts } from "../entities";
import type { ProductCategoryDto, ProductStatusDto, TranslationProductDto } from "@/api/packages/types/product";
import type { Tx } from "@/api/types/constants";
import { SecureFileUploadServices } from "@/api/utils/secureFileUpload";
import type { FileDto } from "@/api/packages/types/constants";
import db from "@/api/config/db";
import type { ZodValidationEditOneProductData } from "@/api/packages/validations/product";
import { eq } from "drizzle-orm";
import { getHTTPError, HTTPErrorMessage } from "@/api/packages/utils/HttpJsError";

interface AddOneProductUtilsDto {
    translations: TranslationProductDto[];
    data: {
        addByStaffId: string;
        technologies: string[];
        category: ProductCategoryDto;
        status: ProductStatusDto;
    };
    tx: Tx
}

interface InsertTranslationProductDto {
    productId: string;
    tx: Tx;
    translations: TranslationProductDto[];
}

interface ProductUploadFileDto {
    files: FileDto[];
    productId: string;
    tx: Tx;
}

export class ManageProductUtils {
    public static async addOneProduct({ tx, data, translations }: AddOneProductUtilsDto): Promise<string> {
        try {
            const newProduct = await tx.insert(products).values(data).returning({
                id: products.id
            });
            const productId = newProduct[0]?.id;
            if (!productId || productId === undefined) throw new HTTPErrorMessage("ProductId is required", "403");
            await this.insertTranslationProduct({ tx, translations, productId });
            return productId;
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async productUploadFiles({ files, productId, tx }: ProductUploadFileDto) {
        try {
            const resultFiles = await SecureFileUploadServices.uploadFileToCloudinary({ files });
            if (resultFiles && Array.isArray(resultFiles) && resultFiles.length > 0) {
                await tx.insert(productImages).values(
                    resultFiles.map(file => ({
                        ...file,
                        productId
                    }))
                );
            } else throw new HTTPErrorMessage("Falied to uploaded image file to cloud", "415")
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editProductDataById(input: ZodValidationEditOneProductData) {
        try {
            const { targetProductId, updatedByStaffId, translations, ...data } = input;
            const findProduct = await db.query.products.findFirst({
                where: eq(products.id, targetProductId)
            });
            if (!findProduct || findProduct === undefined) {
                throw new HTTPErrorMessage("Find product not found", "404");
            }
            await db.transaction(async tx => {
                await tx.update(products).set({
                    ...data,
                    updatedByStaffId
                }).where(eq(products.id, targetProductId));
                await tx.delete(translationProducts).where(eq(translationProducts.productId, targetProductId));
                await this.insertTranslationProduct({ tx, translations, productId: targetProductId });
            });
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async insertTranslationProduct({ tx, translations, productId }: InsertTranslationProductDto) {
        try {
            await tx.insert(translationProducts).values(
                translations.map(tr => ({
                    name: tr.name,
                    description: tr.description,
                    longDescription: tr.longDescription,
                    features: tr.features,
                    productId,
                    local: tr.local
                }))
            );
        } catch (error) {
            throw getHTTPError(error);
        }
    }
}