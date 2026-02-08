import db from "@/server/config/db";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { count, countDistinct, desc, eq, inArray } from "drizzle-orm";
import { news, newsImages, translationNews } from "../../entities";
import type { ZodValidationAddOneNews, ZodValidationAddOneNewsData, ZodValidationEditOneNewsById, ZodValidationEditOneNewsDataById, ZodValidationSearchQueryNews } from "@/server/packages/validations/news";
import { NewsManageServices } from "../../utils/news";
import { SecureFileUploadServices } from "@/server/utils/secureFileUpload";

export class NewsManageMutationServices {
    public static async addOne(input: ZodValidationAddOneNews) {
        try {
            const { imageFiles, translations, ...data } = input;
            await db.transaction(async tx => {
                const newsId = await NewsManageServices.addOneNews({ tx, data, translations });
                if (!newsId || newsId === undefined) throw new HTTPErrorMessage("NewsId is required", "403");
                await NewsManageServices.newsUploadFiles({ files: imageFiles, newsId, tx });
            });
            return HandlerSuccess.success("Add one news successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async addOneData(input: ZodValidationAddOneNewsData) {
        try {
            const { translations, ...data } = input;
            await db.transaction(async tx => {
                await NewsManageServices.addOneNews({
                    tx, data, translations
                });
            });
            return HandlerSuccess.success("Add one news data successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editById(input: ZodValidationEditOneNewsById) {
        try {
            const { imageFiles, newsId } = input;
            await db.transaction(async tx => {
                await NewsManageServices.editNewsDataById(input);
                await NewsManageServices.newsUploadFiles({ files: imageFiles, newsId, tx });
            });
            return HandlerSuccess.success("Edit news by id successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async editDataById(input: ZodValidationEditOneNewsDataById) {
        try {
            await NewsManageServices.editNewsDataById(input);
            return HandlerSuccess.success("Edit news data by id successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async removeImageById(imageId: string) {
        try {
            // implement later if needed
            const imageData = await db.query.newsImages.findFirst({
                where: eq(news.id, imageId)
            });

            if (!imageData) throw new HTTPErrorMessage("Find news image not found", "404");

            await db.transaction(async tx => {
                await tx.delete(newsImages).where(eq(newsImages.id, imageId));
                await SecureFileUploadServices.destoryCloudinaryFunc(imageData.cloudinaryId);
            });

            return HandlerSuccess.success("Removed news image by id successfully");

        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async removeOneById(newsId: string) {
        try {
            const newsData = await db.query.news.findFirst({
                where: eq(news.id, newsId),
                with: {
                    images: true
                }
            });

            if (!newsData) throw new HTTPErrorMessage("Find news not found", "404");

            await db.transaction(async tx => {

                if (newsData?.images?.length > 0) {
                    await Promise.all(
                        newsData.images.map(async image => {
                            // const resourceType = image.type.includes("")
                            await SecureFileUploadServices.destoryCloudinaryFunc(image.cloudinaryId);
                        })
                    )
                }

                await tx.delete(news).where(eq(news.id, newsId));
            });
            return HandlerSuccess.success("Removed news by id successfully");
        } catch (error) {
            throw getHTTPError(error);
        }
    }

    public static async searchQuery(input: ZodValidationSearchQueryNews) {
        try {
            const { page, limit } = input;
            const offset = (page - 1) * limit;
            const whereConditions = await NewsManageServices.whereConditionSearchNews(input);
            // count total
            const [totalRes] = await db
                .select({ total: countDistinct(news.id) })
                .from(news)
                .leftJoin(
                    translationNews,
                    eq(translationNews.newsId, news.id)
                )
                .where(whereConditions);

            const total = totalRes?.total ?? 1;

            const totalPage = Math.ceil(total / limit) || 1;

            // 1. Get paginated news IDs + main data
            const newsList = await db
                .select()
                .from(news)
                .where(whereConditions)
                .orderBy(desc(news.createdAt))
                .limit(limit)
                .offset(offset);

            const newsIds = newsList.map(n => n.id);

            // 2. Get all translations for these news items
            const translations = await db
                .select()
                .from(translationNews)
                .where(inArray(translationNews.newsId, newsIds));

            // 3. Group in JS (fast – usually < 100 items)
            const translationsByNews = new Map<string, typeof translationNews.$inferSelect[]>();

            for (const t of translations) {
                const arr = translationsByNews.get(t.newsId) ?? [];
                arr.push(t);
                translationsByNews.set(t.newsId, arr);
            }

            // 4. Combine
            const result = newsList.map(newsItem => ({
                ...newsItem,
                translationNews: translationsByNews.get(newsItem.id) ?? [],
            }));

            return HandlerSuccess.success("Queries news successfully", {
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