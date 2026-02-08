import db from "@/server/config/db";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import type { ZodValidationAddOneFaqData, ZodValidationEditOneFaqData, ZodValidationSearchQueryFaq } from "@/server/packages/validations/faq";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { count, countDistinct, desc, eq, inArray } from "drizzle-orm";
import { FaqManageServices } from "../../utils/faq";
import { faq, translationFaq } from "../../entities";
import type { translationNews } from "../../../news/entities";

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

            const totalPage = Math.ceil(total / limit) || 1;

            // 1. Get paginated news IDs + main data
            const faqList = await db
                .select()
                .from(faq)
                .where(whereConditions)
                .orderBy(desc(faq.createdAt))
                .limit(limit)
                .offset(offset);

            const newsIds = faqList.map(n => n.id);

            // 2. Get all translations for these news items
            const translations = await db
                .select()
                .from(translationFaq)
                .where(inArray(translationFaq.faqId, newsIds));

            // 3. Group in JS (fast – usually < 100 items)
            const translationsByFaq = new Map<string, typeof translationFaq.$inferSelect[]>();
            for (const t of translations) {
                const arr = translationsByFaq.get(t.faqId) ?? [];
                arr.push(t);
                translationsByFaq.set(t.faqId, arr);
            }

            // 4. Combine
            const result = faqList.map(newsItem => ({
                ...newsItem,
                translationFaq: translationsByFaq.get(newsItem.id) ?? [],
            }));

            return HandlerSuccess.success("Queries faq successfully", {
                data: result,
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