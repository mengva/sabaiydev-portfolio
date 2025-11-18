import { relations } from "drizzle-orm";
import { news, newsImages, translationNews } from "./news";
import { staffs } from "@/api/db";

export const newsRelations = relations(news, ({ one, many }) => ({
    staff: one(staffs, {
        fields: [news.staffId],
        references: [staffs.id],
    }),
    updatedByStaff: one(staffs, {
        fields: [news.updatedByStaffId],
        references: [staffs.id],
    }),
    images: many(newsImages),
    translationNews: many(translationNews)
}));

export const newsImageRelations = relations(newsImages, ({ one }) => ({
    news: one(news, {
        fields: [newsImages.newsId],
        references: [news.id],
    }),
}));

export const translationNewsRelations = relations(translationNews, ({ one }) => ({
    news: one(news, {
        fields: [translationNews.newsId],
        references: [news.id],
    }),
}));