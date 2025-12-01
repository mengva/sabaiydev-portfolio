import type { NewsCategoryDto, NewsStatusDto, TranslationNewsDto } from "@/api/packages/types/news";
import { news, newsImages, translationNews } from "../entities";
import type { Tx } from "@/api/types/constants";
import type { FileDto } from "@/api/packages/types/constants";
import { getHTTPError, HTTPErrorMessage } from "@/api/packages/utils/HttpJsError";
import db from "@/api/config/db";
import { SecureFileUploadServices } from "@/api/utils/secureFileUpload";
import type { ZodValidationEditOneNewsDataById, ZodValidationSearchQueryNews } from "@/api/packages/validations/news";
import { and, between, eq, ilike, or } from "drizzle-orm";

interface AddOneNewsDto {
    translations: TranslationNewsDto[];
    data: {
        staffId: string;
        category: NewsCategoryDto;
        status: NewsStatusDto;
    };
    tx: Tx
}

interface InsertTranslationNewsDto {
    newsId: string;
    tx: Tx;
    translations: TranslationNewsDto[];
}

interface NewsUploadFileDto {
    files: FileDto[];
    newsId: string;
    tx: Tx;
}

export class NewsManageServices {
    public static async addOneNews({ tx, data, translations }: AddOneNewsDto): Promise<string> {
        try {
            const newNews = await tx.insert(news).values(data).returning({
                id: news.id
            });
            const newsId = newNews[0]?.id;
            if (!newsId || newsId === undefined) throw new HTTPErrorMessage("NewsId is required", "403");
            await this.insertTranslationNews({ tx, translations, newsId });
            return newsId;
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async newsUploadFiles({ files, newsId, tx }: NewsUploadFileDto) {
        try {
            const resultFiles = await SecureFileUploadServices.uploadCloudinaryImageFiles(files);
            await tx.insert(newsImages).values(
                resultFiles.map(file => ({
                    ...file,
                    newsId
                }))
            );
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editNewsDataById(input: ZodValidationEditOneNewsDataById) {
        try {
            const { newsId, updatedByStaffId, translations, ...data } = input;
            const newsData = await db.query.news.findFirst({
                where: eq(news.id, newsId)
            });
            if (!newsData || newsData === undefined) {
                throw new HTTPErrorMessage("Find news not found", "404");
            }
            await db.transaction(async tx => {
                await tx.update(news).set({
                    ...data,
                    updatedByStaffId
                }).where(eq(news.id, newsId));
                await tx.delete(translationNews).where(eq(translationNews.newsId, newsId));
                await this.insertTranslationNews({ tx, translations, newsId });
            });
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async insertTranslationNews({ tx, translations, newsId }: InsertTranslationNewsDto) {
        try {
            await tx.insert(translationNews).values(
                translations.map(tr => ({
                    title: tr.title,
                    description: tr.description,
                    content: tr.content,
                    newsId,
                    local: tr.local
                }))
            );
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async searchQuery(input: ZodValidationSearchQueryNews) {
        const { query, category, startDate, endDate, status } = input;
        const conditions: any[] = [];
        if (query) {
            conditions.push(
                or(
                    ilike(translationNews.title, `%${query}%`),
                    ilike(translationNews.description, `%${query}%`),
                    ilike(translationNews.content, `%${query}%`)
                )
            );
        }
        if (category && category !== "DEFAULT") {
            conditions.push(eq(news.category, category));
        }
        if (status && status !== "DEFAULT") {
            conditions.push(eq(news.status, status));
        }
        // Date range
        if (startDate && endDate) {
            conditions.push(between(news.createdAt, new Date(startDate), new Date(endDate)));
        }
        return and(...conditions);
    }
}