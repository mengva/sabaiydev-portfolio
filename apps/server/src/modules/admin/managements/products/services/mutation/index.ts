import db from "@/server/config/db";
import type { ZodValidationAddOneProduct, ZodValidationAddOneProductData, ZodValidationEditOneProduct, ZodValidationEditOneProductData, ZodValidationSearchQueryProduct } from "@/server/packages/validations/product";
import { productImages, products, translationProducts } from "../../entities";
import { SecureFileUploadServices } from "@/server/utils/secureFileUpload";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { ProductManageServices } from "../../utils/product";
import { and, count, countDistinct, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import type { ProductSchema } from "@/server/packages/schema/product";

export class ProductManageMutationServices {
    public static async addOne(input: ZodValidationAddOneProduct) {
        try {
            const { imageFiles, translations, ...data } = input;
            await db.transaction(async tx => {
                const productId = await ProductManageServices.addOneProduct({ tx, data, translations });
                if (!productId || productId === undefined) throw new HTTPErrorMessage("ProductId is required", "403");
                await ProductManageServices.productUploadFiles({ files: imageFiles, productId, tx });
            });
            return HandlerSuccess.success("Add one product successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async addOneData(input: ZodValidationAddOneProductData) {
        try {
            const { translations, ...data } = input;
            await db.transaction(async tx => {
                await ProductManageServices.addOneProduct({
                    tx, data, translations
                });
            });
            return HandlerSuccess.success("Add one product data successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editById(input: ZodValidationEditOneProduct) {
        try {
            const { imageFiles, targetProductId } = input;
            await db.transaction(async tx => {
                await ProductManageServices.editProductDataById(input);
                await ProductManageServices.productUploadFiles({ files: imageFiles, productId: targetProductId, tx });
            });
            return HandlerSuccess.success("Edit product by id successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editDataById(input: ZodValidationEditOneProductData) {
        try {
            await ProductManageServices.editProductDataById(input);
            return HandlerSuccess.success("Edit product data by id successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editImageById() {
        try {

        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async removeImageById(imageId: string) {
        try {
            // implement later if needed
            const imageData = await db.query.productImages.findFirst({
                where: eq(productImages.id, imageId)
            });

            if (!imageData) throw new HTTPErrorMessage("Find product image not found", "404");

            await db.transaction(async tx => {
                await tx.delete(productImages).where(eq(productImages.id, imageId));
                await SecureFileUploadServices.destoryCloudinaryFunc(imageData.cloudinaryId);
            });

            return HandlerSuccess.success("Removed product image by id successfully");

        } catch (error) {
            throw getHTTPError(error);
        }
    }


    public static async removeOneById(productId: string) {
        try {
            const product = await db.query.products.findFirst({
                where: eq(products.id, productId),
                with: {
                    images: true
                }
            });

            if (!product) throw new HTTPErrorMessage("Find product not found", "404");

            await db.transaction(async tx => {

                if (product?.images?.length > 0) {
                    await Promise.all(
                        product.images.map(async image => {
                            // const resourceType = image.type.includes("")
                            await SecureFileUploadServices.destoryCloudinaryFunc(image.cloudinaryId);
                        })
                    )
                }

                await tx.delete(products).where(eq(products.id, productId));
            });
            return HandlerSuccess.success("Removed product by id successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async searchQuery(input: ZodValidationSearchQueryProduct) {
        try {
            const { page, limit } = input;
            const offset = (page - 1) * limit;
            const whereConditions = await ProductManageServices.whereConditionQueryProduct(input);

            /* ---------- COUNT ---------- */
            const [totalRes] = await db
                .select({ total: countDistinct(products.id) })
                .from(products)
                .leftJoin(
                    translationProducts,
                    eq(translationProducts.productId, products.id)
                )
                .where(whereConditions);

            const total = totalRes?.total ?? 0;

            const totalPage = Math.ceil(total / limit) || 1;

            // 1. Get paginated news IDs + main data
            const productList = await db
                .select()
                .from(products)
                .where(whereConditions)
                .orderBy(desc(products.createdAt))
                .limit(limit)
                .offset(offset);

            const productIds = productList.map(n => n.id);

            // 2. Get all translations for these news items
            const translations = await db
                .select()
                .from(translationProducts)
                .where(inArray(translationProducts.productId, productIds));

            // 3. Group in JS (fast – usually < 100 items)
            const translationsByProduct = new Map<string, typeof translationProducts.$inferSelect[]>();

            for (const t of translations) {
                const arr = translationsByProduct.get(t.productId) ?? [];
                arr.push(t);
                translationsByProduct.set(t.productId, arr);
            }

            // 4. Combine
            const result = productList.map(productItem => ({
                ...productItem,
                translationProducts: translationsByProduct.get(productItem.id) ?? [],
            }));

            return HandlerSuccess.success("Queries Product successfully", {
                data: result,
                pagination: {
                    total,
                    page,
                    totalPage,
                    limit
                },
            });
        } catch (error) {
            throw getHTTPError(error);
        }
    }

}