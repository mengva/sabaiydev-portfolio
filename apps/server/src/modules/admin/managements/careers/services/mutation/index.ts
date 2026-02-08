import db from "@/server/config/db";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import type { ZodValidationAddOneCareerData, ZodValidationEditOneCareerData, ZodValidationSearchQueryCareer } from "@/server/packages/validations/career";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { count, countDistinct, desc, eq, inArray } from "drizzle-orm";
import { careers, translationCareers } from "../../entities";
import { CareerManageServices } from "../../utils/career";

export class CareerManageMutationServices {
    public static async addOne(input: ZodValidationAddOneCareerData) {
        try {
            const { translations, ...data } = input;
            await db.transaction(async tx => {
                const newCareer = await tx.insert(careers).values(data).returning({
                    id: careers.id
                });
                const careerId = newCareer[0]?.id;
                if (!careerId || careerId === undefined) {
                    throw new HTTPErrorMessage("CareerId is required", "403");
                }
                await CareerManageServices.insertTranslationCareer({ tx, translations, careerId });
            });
            return HandlerSuccess.success("Add one career successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editById(input: ZodValidationEditOneCareerData) {
        try {
            await CareerManageServices.editCareerById(input);
            return HandlerSuccess.success("Edit career by id successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async removeOneById(careerId: string) {
        try {
            const faqData = await db.query.careers.findFirst({
                where: eq(careers.id, careerId),
            });

            if (!faqData) throw new HTTPErrorMessage("Find career not found", "404");

            await db.delete(careers).where(eq(careers.id, careerId));
            return HandlerSuccess.success("Removed career by id successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async searchQuery(input: ZodValidationSearchQueryCareer) {
        try {
            const { page, limit } = input;
            const offset = (page - 1) * limit;
            const whereConditions = await CareerManageServices.whereConditionSearchCareer(input);
            // count total
            const [totalRes] = await db
                .select({ total: count(countDistinct(careers.id)) })
                .from(careers)
                .where(whereConditions)
                .execute();

            const total = totalRes?.total ?? 1;

            const totalPage = Math.ceil(total / limit) || 1;

            // 1. Get paginated news IDs + main data
            const careerList = await db
                .select()
                .from(careers)
                .where(whereConditions)
                .orderBy(desc(careers.createdAt))
                .limit(limit)
                .offset(offset);

            const careerIds = careerList.map(n => n.id);

            // 2. Get all translations for these news items
            const translations = await db
                .select()
                .from(translationCareers)
                .where(inArray(translationCareers.careerId, careerIds));

            // 3. Group in JS (fast – usually < 100 items)
            const translationsByCareer = new Map<string, typeof translationCareers.$inferSelect[]>();
            for (const t of translations) {
                const arr = translationsByCareer.get(t.careerId) ?? [];
                arr.push(t);
                translationsByCareer.set(t.careerId, arr);
            }

            // 4. Combine
            const result = careerList.map(newsItem => ({
                ...newsItem,
                translationCareers: translationsByCareer.get(newsItem.id) ?? [],
            }));

            return HandlerSuccess.success("Queries career successfully", {
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