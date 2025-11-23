import db from "@/api/config/db";
import type { ZodValidationAddOneProduct, ZodValidationAddOneProductData, ZodValidationEditOneProduct, ZodValidationEditOneProductData } from "@/api/packages/validations/product";
import { products } from "../../entities";
import { SecureFileUploadServices } from "@/api/utils/secureFileUpload";
import { HandlerSuccess } from "@/api/utils/handleSuccess";
import { ManageProductUtils } from "../../utils/product";
import { eq } from "drizzle-orm";
import { getHTTPError, HTTPErrorMessage } from "@/api/packages/utils/HttpJsError";

export class ProductManageMutationServices {
    public static async addOne(input: ZodValidationAddOneProduct) {
        try {
            const { imageFiles, translations, ...data } = input;
            await db.transaction(async tx => {
                const productId = await ManageProductUtils.addOneProduct({ tx, data, translations });
                if (!productId || productId === undefined) throw new HTTPErrorMessage("ProductId is required", "403");
                await ManageProductUtils.productUploadFiles({ files: imageFiles, productId, tx });
            });
            return HandlerSuccess.success("Add one product successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async addDataOne(input: ZodValidationAddOneProductData) {
        try {
            const { translations, ...data } = input;
            await db.transaction(async tx => {
                await ManageProductUtils.addOneProduct({
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
                await ManageProductUtils.editProductDataById(input);
                await ManageProductUtils.productUploadFiles({ files: imageFiles, productId: targetProductId, tx });
            });
            return HandlerSuccess.success("Update product by id successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editDataById(input: ZodValidationEditOneProductData) {
        try {
            await ManageProductUtils.editProductDataById(input);
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

    public static async removeOneById(targetProductId: string, cloudId: string) {
        try {
            const findProduct = await db.query.products.findFirst({
                where: eq(products.id, targetProductId)
            });
            if (!findProduct) throw new HTTPErrorMessage("Find product not found", "404");
            await db.transaction(async tx => {
                await tx.delete(products).where(eq(products.id, targetProductId));
                await SecureFileUploadServices.destoryCloudinaryImage(cloudId);
            });
            return HandlerSuccess.success("Removed product by id successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }
}