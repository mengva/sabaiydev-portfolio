import db from "@/api/config/db";
import { getHTTPError } from "@/api/packages/utils/httpJsError";
import type { ZodValidationFilter } from "@/api/packages/validations/constants";
import { HandlerSuccess } from "@/api/utils/handleSuccess";
import { HandlerTRPCError } from "@/api/utils/handleTRPCError";
import { count, desc, eq } from "drizzle-orm";
import { faq } from "../../entities";

export class FaqManageQueriesServices {
    public static list = async (input: ZodValidationFilter) => {
        try {
            const { limit, page } = input;
            const offset = (page - 1) * limit;

            // Status filter
            const queryFaq = await db.query.faq.findMany({
                limit,
                offset,
                orderBy: desc(faq.updatedAt),
                with: {
                    translationFaq: true,
                }
            });

            // 2️⃣ Count total products (NO JOIN)
            const resultTotal = await db
                .select({ total: count() })
                .from(faq)

            const total = Number(resultTotal[0]?.total ?? 0);

            // 3️⃣ Pagination calculation
            const totalPage = Math.ceil(total / limit);

            return HandlerSuccess.success("Faq list retrieved successfully", {
                data: queryFaq,
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

    public static getOne = async (faqId: string) => {
        try {
            const resultFaq = await db.query.faq.findFirst({
                where: eq(faq.id, faqId),
                with: {
                    translationFaq: true,
                }
            });
            if (!resultFaq) {
                throw HandlerTRPCError.TRPCErrorMessage("Find not found", "NOT_FOUND");
            }
            return HandlerSuccess.success("Faq retrieved successfully", resultFaq);
        } catch (error) {
            throw getHTTPError(error);
        }
    }
}