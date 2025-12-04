import db from "@/server/config/db";
import { getHTTPError } from "@/server/packages/utils/httpJsError";
import type { ZodValidationFilter } from "@/server/packages/validations/constants";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { HandlerTRPCError } from "@/server/utils/handleTRPCError";
import { count, desc, eq } from "drizzle-orm";
import { news } from "../../entities";

export class NewsManageQueriesServices {
    public static list = async (input: ZodValidationFilter) => {
        try {
            const { limit, page } = input;
            const offset = (page - 1) * limit;

            // Status filter
            const queryNews = await db.query.news.findMany({
                limit,
                offset,
                orderBy: desc(news.updatedAt),
                with: {
                    translationNews: true,
                    images: true
                }
            });

            // 2️⃣ Count total products (NO JOIN)
            const resultTotal = await db
                .select({ total: count() })
                .from(news)

            const total = Number(resultTotal[0]?.total ?? 0);

            // 3️⃣ Pagination calculation
            const totalPage = Math.ceil(total / limit);

            return HandlerSuccess.success("News list retrieved successfully", {
                data: queryNews,
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

    public static getOne = async (newsId: string) => {
        try {
            const resultNews = await db.query.news.findFirst({
                where: eq(news.id, newsId),
                with: {
                    translationNews: true,
                    images: true
                }
            })
            if (!resultNews) {
                throw HandlerTRPCError.TRPCErrorMessage("Find not found", "NOT_FOUND");
            }
            return HandlerSuccess.success("News retrieved successfully", resultNews);
        } catch (error) {
            throw getHTTPError(error);
        }
    }
}