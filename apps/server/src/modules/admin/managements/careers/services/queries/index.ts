import db from "@/server/config/db";
import { getHTTPError } from "@/server/packages/utils/httpJsError";
import type { ZodValidationFilter } from "@/server/packages/validations/constants";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { HandlerTRPCError } from "@/server/utils/handleTRPCError";
import { count, desc, eq } from "drizzle-orm";
import { careers } from "../../entities";

export class CareerManageQueriesServices {
    public static list = async (input: ZodValidationFilter) => {
        try {
            const { limit, page } = input;
            const offset = (page - 1) * limit;

            // Status filter
            const queryCareers = await db.query.careers.findMany({
                limit,
                offset,
                orderBy: desc(careers.updatedAt),
                with: {
                    translationCareers: true,
                }
            });

            // 2️⃣ Count total products (NO JOIN)
            const resultTotal = await db
                .select({ total: count() })
                .from(careers);

            const total = Number(resultTotal[0]?.total ?? 0);

            // 3️⃣ Pagination calculation
            const totalPage = Math.ceil(total / limit);

            return HandlerSuccess.success("Career list retrieved successfully", {
                data: queryCareers,
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

    public static getOne = async (careerId: string) => {
        try {
            const resultCareer = await db.query.careers.findFirst({
                where: eq(careers.id, careerId),
                with: {
                    translationCareers: true,
                }
            });
            if (!resultCareer) {
                throw HandlerTRPCError.TRPCErrorMessage("Find not found", "NOT_FOUND");
            }
            return HandlerSuccess.success("Career retrieved successfully", resultCareer);
        } catch (error) {
            throw getHTTPError(error);
        }
    }
}