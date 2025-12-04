import db from "@/server/config/db";
import { products, translationProducts } from "@/server/db";
import { count, desc, eq } from "drizzle-orm";
import type { ZodValidationFilter } from "@/server/packages/validations/constants";
import { HandlerTRPCError } from "@/server/utils/handleTRPCError";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { getHTTPError } from "@/server/packages/utils/httpJsError";

export class ProductManageQueriesServices {

    public static list = async (input: ZodValidationFilter) => {
        try {
            const { limit, page } = input;
            const offset = (page - 1) * limit;

            // Status filter
            const productActive = eq(products.status, "ACTIVE");

            const queryProducts = await db.query.products.findMany({
                where: productActive,
                limit,
                offset,
                orderBy: desc(products.updatedAt),
                with: {
                    translationProducts: true,
                    images: true
                }
            });

            // 2️⃣ Count total products (NO JOIN)
            const resultTotal = await db
                .select({ total: count() })
                .from(products)
                .where(productActive);

            const total = Number(resultTotal[0]?.total ?? 0);

            // 3️⃣ Pagination calculation
            const totalPage = Math.ceil(total / limit);

            return HandlerSuccess.success("Product list retrieved successfully", {
                data: queryProducts,
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
            const product = await db.query.products.findFirst({
                where: eq(products.id, productId),
                with: {
                    translationProducts: true,
                    images: true
                }
            })
            if (!product) {
                throw HandlerTRPCError.TRPCErrorMessage("Find not found", "NOT_FOUND");
            }
            return HandlerSuccess.success("Product retrieved successfully", product);
        } catch (error) {
            throw getHTTPError(error);
        }
    }

}