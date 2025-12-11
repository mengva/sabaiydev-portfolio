import type { Tx } from "@/server/types/constants";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import db from "@/server/config/db";
import { and, between, eq, sql } from "drizzle-orm";
import type { TranslationCareerDto } from "@/server/packages/types/career";
import { careers, translationCareers } from "../entities";
import type { ZodValidationEditOneCareerData, ZodValidationSearchQueryCareer } from "@/server/packages/validations/career";

interface InsertTranslationCareerDto {
    careerId: string;
    tx: Tx;
    translations: TranslationCareerDto[];
}

export class CareerManageServices {

    public static async editCareerById(input: ZodValidationEditOneCareerData) {
        try {
            const { careerId, updatedByStaffId, translations, ...data } = input;
            const careerData = await db.query.careers.findFirst({
                where: eq(careers.id, careerId)
            });
            if (!careerData || careerData === undefined) {
                throw new HTTPErrorMessage("Find faq not found", "404");
            }
            await db.transaction(async tx => {
                await tx.update(careers).set({
                    ...data,
                    updatedByStaffId
                }).where(eq(careers.id, careerId));
                await tx.delete(translationCareers).where(eq(translationCareers.careerId, careerId));
                await this.insertTranslationCareer({ tx, translations, careerId });
            });
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async insertTranslationCareer({ tx, translations, careerId }: InsertTranslationCareerDto) {
        try {
            await tx.insert(translationCareers).values(
                translations.map(tr => ({
                    local: tr.local,
                    location: tr.location,
                    jobTitle: tr.jobTitle,
                    description: tr.description,
                    requirements: tr.requirements,
                    benefits: tr.benefits,
                    careerId
                }))
            );
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async searchQuery(input: ZodValidationSearchQueryCareer) {
        const { query, department, jobType, startDate, endDate, status } = input;
        const conditions: any[] = [];
        if (query) {
            conditions.push(sql`
            EXISTS (
                SELECT 1 FROM ${translationCareers}
                WHERE ${translationCareers.careerId} = ${careers.id}
                  AND (${translationCareers.location} ILIKE ${`%${query}%`} 
            )
        `);
        }
        if (department && department !== "DEFAULT") {
            conditions.push(eq(careers.department, department));
        }
        if (status && status !== "DEFAULT") {
            conditions.push(eq(careers.status, status));
        }
        if (jobType && jobType !== "DEFAULT") {
            conditions.push(eq(careers.jobType, jobType));
        }
        if (startDate && endDate) {
            conditions.push(between(careers.createdAt, new Date(startDate), new Date(endDate)));
        }
        return and(...conditions);
    }
}