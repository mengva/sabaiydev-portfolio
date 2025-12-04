import db from "@/server/config/db";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import type { ZodValidationAddOneFaqData, ZodValidationEditOneFaqData, ZodValidationSearchQueryFaq } from "@/server/packages/validations/faq";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { count, desc, eq } from "drizzle-orm";
import { FaqManageServices } from "../../utils/faq";
import { faq, translationFaq } from "../../entities";

export class FaqManageMutationServices {
    public static async addOne(input: ZodValidationAddOneFaqData) {
        try {
            const { translations, ...data } = input;
            await db.transaction(async tx => {
                await FaqManageServices.addOneFaq({ tx, data, translations });
            });
            return HandlerSuccess.success("Add one faq successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editById(input: ZodValidationEditOneFaqData) {
        try {
            await FaqManageServices.editFaqById(input);
            return HandlerSuccess.success("Edit faq by id successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async removeOneById(faqId: string) {
        try {
            const faqData = await db.query.faq.findFirst({
                where: eq(faq.id, faqId),
            });

            if (!faqData) throw new HTTPErrorMessage("Find faq not found", "404");

            await db.delete(faq).where(eq(faq.id, faqId));
            return HandlerSuccess.success("Removed faq by id successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async searchQuery(input: ZodValidationSearchQueryFaq) {
        try {
            const { page, limit } = input;
            const offset = (page - 1) * limit;
            const where = await FaqManageServices.searchQuery(input);
            // count total
            const totalResult = await db
                .select({ total: count() })
                .from(faq)
                .where(where)
                .execute();
            const total = totalResult[0]?.total ?? 1;
            const resultFaq = await db.query.faq.findMany({
                where,
                limit,
                offset,
                orderBy: desc(faq.updatedAt),
                with: {
                    translationFaq: {
                        where: eq(faq.id, translationFaq.faqId)
                    }
                }
            });
            const totalPage = Math.ceil(Number(total) / limit) || 1;
            return HandlerSuccess.success("Queries faq successfully", {
                data: resultFaq,
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
    }
}