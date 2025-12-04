import db from "@/server/config/db";
import { getHTTPError, HTTPErrorMessage } from "@/server/packages/utils/httpJsError";
import { HandlerSuccess } from "@/server/utils/handleSuccess";
import { count, desc, eq } from "drizzle-orm";
import { news, newsImages } from "../../entities";
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
            const where = await NewsManageServices.searchQuery(input);
            // count total
            const totalResult = await db
                .select({ total: count() })
                .from(news)
                .where(where);
            const total = totalResult[0]?.total ?? 1;
            const resultNews = await db.query.news.findMany({
                where,
                limit,
                offset,
                orderBy: desc(news.updatedAt),
                with: {
                    translationNews: true
                }
            })
            const totalPage = Math.ceil(Number(total) / limit) || 1;
            return HandlerSuccess.success("Queries news successfully", {
                data: resultNews,
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