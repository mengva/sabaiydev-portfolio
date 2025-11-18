import { staffs } from "@/api/db";
import { index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { newsStatusEnum, newsCategoryEnum } from "./enum";
import { localEnum } from "@/api/entities/enum";

export const news = pgTable("news", {
    id: uuid("id").defaultRandom().primaryKey(),
    staffId: uuid("staff_id").references(() => staffs.id, { onDelete: "cascade" }).notNull(),
    updatedByStaffId: uuid("updated_by_staff_id").references(() => staffs.id, { onDelete: "cascade" }),
    category: newsCategoryEnum("category").notNull().default("TECHNOLOGY"),
    status: newsStatusEnum("status").notNull().default("PUBLISHED"),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
    staffIdIdx: index("tbl_news_staff_id_idx").on(table.staffId),
    updatedByStaffIdIdx: index("tbl_news_updated_by_staff_id_idx").on(table.updatedByStaffId),
    statusIdx: index("tbl_news_status_idx").on(table.status),
    categoryIdx: index("tbl_news_category_idx").on(table.category),
    createdIdx: index("tbl_news_created_at_idx").on(table.createdAt),
    updatedIdx: index("tbl_news_updated_at_idx").on(table.updatedAt),
}));

export const translationNews = pgTable("translation_news", {
    id: uuid("id").defaultRandom().primaryKey(),
    local: localEnum("local").notNull(),
    newsId: uuid("news_id").notNull().references(() => news.id, { onDelete: "cascade" }),
    title: varchar("title").notNull(),
    description: text("description").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    newsIdIdx: index("tbl_translation_news_news_id_idx").on(table.newsId),
    titleIdx: index("tbl_translation_news_title_idx").on(table.title),
    descriptionIdx: index("tbl_translation_news_description_idx").on(table.description),
    createdAtIdx: index("tbl_translation_news_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_translation_news_updated_at_idx").on(table.updatedAt),
}));

export const newsImages = pgTable("news_images", {
    id: uuid("id").defaultRandom().primaryKey(),
    newsId: uuid("news_id").notNull().references(() => news.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    cloudinaryId: varchar("cloudinary_id", { length: 100 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    size: integer("size").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    newsIdIdx: index("tbl_news_image_news_id_idx").on(table.newsId),
    createdAtIdx: index("tbl_news_image_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_news_image_updated_at_idx").on(table.updatedAt),
}));