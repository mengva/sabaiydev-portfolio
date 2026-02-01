import db from "@/server/config/db";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import type { ZodValidationAddOneCareerData, ZodValidationEditOneCareerData, ZodValidationSearchQueryCareer } from "@/server/packages/validations/career";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { count, countDistinct, desc, eq } from "drizzle-orm";
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

            const careerResults = await db
                .select({ careers, translationCareers })
                .from(careers)
                .leftJoin(
                    translationCareers,
                    eq(translationCareers.careerId, careers.id)
                )
                .where(whereConditions)
                .orderBy(desc(careers.createdAt))
                .limit(limit)
                .offset(offset);

            const totalPage = Math.ceil(total / limit) || 1;

            const careerResultsMap = careerResults.length > 0 ? careerResults.map((item, _, self) => {

                const filterTranslationCareers = self.map(tr => {
                    if (tr?.translationCareers?.careerId === item.careers.id) {
                        return tr.translationCareers;
                    }
                    return null;
                }).filter(Boolean);

                return {
                    ...item.careers,
                    translationCareers: filterTranslationCareers
                };

            }).filter((item, index, self) =>
                index === self.findIndex((t) => (
                    t.id === item.id
                ))
            ) : [];

            return HandlerSuccess.success("Queries career successfully", {
                data: careerResultsMap,
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