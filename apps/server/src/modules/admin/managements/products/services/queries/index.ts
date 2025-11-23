import db from "@/api/config/db";
import { products } from "@/api/db";
import { count, desc, eq } from "drizzle-orm";
import type { ZodValidationTRPCFilter } from "@/api/packages/validations/constants";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import { HandlerSuccess } from "@/api/utils/handleSuccess";
import { getHTTPError } from "@/api/packages/utils/HttpJsError";

export class ProductManageQueriesServices {

    public static list = async (input: ZodValidationTRPCFilter) => {
        try {
            const { limit, page } = input;
            const offset = (page - 1) * limit;
            const productActive = eq(products.status, "ACTIVE");
            // 1️⃣ Get paginated data
            const resultProducts = await db
                .select()
                .from(products)
                .where(productActive)
                .orderBy(desc(products.createdAt))
                .limit(limit)
                .offset(offset);
            // 2️⃣ Count total
            const resultTotal = await db.select({ total: count() }).from(products).where(productActive);
            const total = resultTotal[0]?.total || 0;
            // 3️⃣ Calculate pagination
            const totalPage = Math.ceil(Number(total) / limit);
            // 4️⃣ Return formatted response
            return HandlerSuccess.success("Product list retrieved successfully", {
                data: resultProducts,
                pagination: {
                    total,
                    page,
                    totalPage,
                    limit,
                },
            });
        } catch (error) {
            throw getHTTPError(error);
        }
    };

    public static getOne = async (productId: string) => {
        try {
            const result = await db.select().from(products).where(eq(products.id, productId)).limit(1);
            const product = result[0];
            if (!product) {
                throw HandlerTRPCError.TRPCErrorMessage("Find not found", "NOT_FOUND");
            }
            if (product.status === "INACTIVE") {
                throw HandlerTRPCError.TRPCErrorMessage("This product have been disabled", "FORBIDDEN");
            }
            return HandlerSuccess.success("product retrieved successfully", product);
        } catch (error) {
            throw getHTTPError(error);
        }
    }

}