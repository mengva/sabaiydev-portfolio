import type { Tx } from "@/server/types/constants";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import db from "@/server/config/db";
import { and, between, eq, ilike, or, sql } from "drizzle-orm";
import type { FaqCategoryDto, FaqStatusDto, TranslationFaqDto } from "@/server/packages/types/faq";
import { faq, translationFaq } from "../entities";
import type { ZodValidationEditOneFaqData, ZodValidationSearchQueryFaq } from "@/server/packages/validations/faq";

interface AddOneFaqDto {
    translations: TranslationFaqDto[];
    data: {
        addByStaffId: string;
        category: FaqCategoryDto;
        status: FaqStatusDto;
    };
    tx: Tx
}

interface InsertTranslationFaqDto {
    faqId: string;
    tx: Tx;
    translations: TranslationFaqDto[];
}

export class FaqManageServices {
    public static async addOneFaq({ tx, data, translations }: AddOneFaqDto): Promise<string> {
        try {
            const newFaq = await tx.insert(faq).values(data).returning({
                id: faq.id
            });
            const faqId = newFaq[0]?.id;
            if (!faqId || faqId === undefined) throw new HTTPErrorMessage("FaqId is required", "403");
            await this.insertTranslationFaq({ tx, translations, faqId });
            return faqId;
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editFaqById(input: ZodValidationEditOneFaqData) {
        try {
            const { faqId, updatedByStaffId, translations, ...data } = input;
            const faqData = await db.query.faq.findFirst({
                where: eq(faq.id, faqId)
            });
            if (!faqData || faqData === undefined) {
                throw new HTTPErrorMessage("Find faq not found", "404");
            }
            await db.transaction(async tx => {
                await tx.update(faq).set({
                    ...data,
                    updatedByStaffId
                }).where(eq(faq.id, faqId));
                await tx.delete(translationFaq).where(eq(translationFaq.faqId, faqId));
                await this.insertTranslationFaq({ tx, translations, faqId });
            });
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async insertTranslationFaq({ tx, translations, faqId }: InsertTranslationFaqDto) {
        try {
            await tx.insert(translationFaq).values(
                translations.map(tr => ({
                    answer: tr.answer,
                    question: tr.question,
                    faqId,
                    local: tr.local
                }))
            );
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async searchQuery(input: ZodValidationSearchQueryFaq) {
        const { query, category, startDate, endDate, status } = input;
        const conditions: any[] = [];
        if (query) {
            conditions.push(sql`
            EXISTS (
                SELECT 1 FROM ${translationFaq}
                WHERE ${translationFaq.faqId} = ${faq.id}
                  AND (${translationFaq.question} ILIKE ${`%${query}%`} 
                       OR ${translationFaq.answer} ILIKE ${`%${query}%`})
            )
        `);
        }
        if (category && category !== "DEFAULT") {
            conditions.push(eq(faq.category, category));
        }
        if (status && status !== "DEFAULT") {
            conditions.push(eq(faq.status, status));
        }
        if (startDate && endDate) {
            conditions.push(between(faq.createdAt, new Date(startDate), new Date(endDate)));
        }
        return and(...conditions);
    }
}