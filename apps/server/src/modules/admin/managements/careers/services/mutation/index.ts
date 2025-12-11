import db from "@/server/config/db";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import type { ZodValidationAddOneCareerData, ZodValidationEditOneCareerData, ZodValidationSearchQueryCareer } from "@/server/packages/validations/career";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { count, desc, eq } from "drizzle-orm";
import { careers } from "../../entities";
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
            const where = await CareerManageServices.searchQuery(input);
            // count total
            const totalResult = await db
                .select({ total: count() })
                .from(careers)
                .where(where)
                .execute();
            const total = totalResult[0]?.total ?? 1;
            const resultCareers = await db.query.careers.findMany({
                where,
                limit,
                offset,
                orderBy: desc(careers.updatedAt),
                with: {
                    translationCareers: true,
                }
            });
            const totalPage = Math.ceil(Number(total) / limit) || 1;
            return HandlerSuccess.success("Queries career successfully", {
                data: resultCareers,
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