import db from "@/server/config/db";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import type { ZodValidationAddOneFaqData, ZodValidationEditOneFaqData, ZodValidationSearchQueryFaq } from "@/server/packages/validations/faq";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { count, countDistinct, desc, eq } from "drizzle-orm";
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
            const whereConditions = await FaqManageServices.whereConditionSearchFaq(input);
            // count total
            const [totalRes] = await db
                .select({ total: count(countDistinct(faq.id)) })
                .from(faq)
                .where(whereConditions)
                .execute();

            const total = totalRes?.total ?? 0;

            const resultNews = await db
                .select({ faq, translationFaq })
                .from(faq)
                .leftJoin(
                    translationFaq,
                    eq(translationFaq.faqId, faq.id)
                )
                .where(whereConditions)
                .orderBy(desc(faq.createdAt))
                .limit(limit)
                .offset(offset);

            const totalPage = Math.ceil(total / limit) || 1;

            const faqResultsMap = resultNews.length > 0 ? resultNews.map((item, _, self) => {

                const filterTranslationFaq = self.map(tr => {
                    if (tr?.translationFaq?.faqId === item.faq.id) {
                        return tr.translationFaq;
                    }
                    return null;
                }).filter(Boolean);

                return {
                    ...item.faq,
                    translationFaq: filterTranslationFaq
                };

            }).filter((item, index, self) =>
                index === self.findIndex((t) => (
                    t.id === item.id
                ))
            ) : [];

            return HandlerSuccess.success("Queries faq successfully", {
                data: faqResultsMap,
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