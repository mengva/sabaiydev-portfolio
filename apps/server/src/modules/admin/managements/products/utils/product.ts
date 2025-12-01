import { productImages, products, translationProducts } from "../entities";
import type { ProductCategoryDto, ProductStatusDto, TranslationProductDto } from "@/api/packages/types/product";
import type { Tx } from "@/api/types/constants";
import { SecureFileUploadServices } from "@/api/utils/secureFileUpload";
import type { FileDto } from "@/api/packages/types/constants";
import db from "@/api/config/db";
import type { ZodValidationEditOneProductData, ZodValidationSearchQueryProduct } from "@/api/packages/validations/product";
import { and, between, eq, ilike, or } from "drizzle-orm";
import { getHTTPError, HTTPErrorMessage } from "@/api/packages/utils/HttpJsError";

interface AddOneProductDto {
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

export class ProductManageServices {
    public static async addOneProduct({ tx, data, translations }: AddOneProductDto): Promise<string> {
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
            const resultFiles = await SecureFileUploadServices.uploadCloudinaryImageFiles(files);
            await tx.insert(productImages).values(
                resultFiles.map(file => ({
                    ...file,
                    productId
                }))
            );
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editProductDataById(input: ZodValidationEditOneProductData) {
        try {
            const { targetProductId, updatedByStaffId, translations, ...data } = input;
            const product = await db.query.products.findFirst({
                where: eq(products.id, targetProductId)
            });
            if (!product || product === undefined) {
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

    public static async searchQuery(input: ZodValidationSearchQueryProduct) {
        const { query, category, startDate, endDate, status } = input;
        const conditions: any[] = [];
        if (query) {
            conditions.push(
                or(
                    ilike(translationProducts.name, `%${query}%`),
                    ilike(translationProducts.description, `%${query}%`),
                    ilike(translationProducts.longDescription, `%${query}%`)
                )
            );
        }
        if (category && category !== "DEFAULT") {
            conditions.push(eq(products.category, category));
        }
        if (status && status !== "DEFAULT") {
            conditions.push(eq(products.status, status));
        }
        // Date range
        if (startDate && endDate) {
            conditions.push(between(products.createdAt, new Date(startDate), new Date(endDate)));
        }
        return and(...conditions);
    }
}