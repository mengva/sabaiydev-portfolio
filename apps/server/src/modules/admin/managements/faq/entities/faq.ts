import { staffs } from "@/server/db";
import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { faqCategoryEnum, faqStatusEnum } from "./enum";
import { localEnum } from "@/server/entities/enum";

export const faq = pgTable("faq", {
    id: uuid("id").defaultRandom().primaryKey(),
    addByStaffId: uuid("add_by_staff_id").references(() => staffs.id, { onDelete: "cascade" }).notNull(),
    updatedByStaffId: uuid("updated_by_staff_id").references(() => staffs.id, { onDelete: "cascade" }),
    category: faqCategoryEnum("category").notNull().default("GENERAL"),
    status: faqStatusEnum("status").notNull().default("PUBLISHED"),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
    addByStaffIdIdx: index("tbl_faq_add_by_staff_id_idx").on(table.addByStaffId),
    updatedByStaffIdIdx: index("tbl_faq_updated_by_staff_id_idx").on(table.updatedByStaffId),
    statusIdx: index("tbl_faq_status_idx").on(table.status),
    categoryIdx: index("tbl_faq_category_idx").on(table.category),
    createdAtIdx: index("tbl_faq_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_faq_updated_at_idx").on(table.updatedAt),
}));

export const translationFaq = pgTable("translation_faq", {
    id: uuid("id").defaultRandom().primaryKey(),
    local: localEnum("local").notNull(),
    faqId: uuid("faq_id").notNull().references(() => faq.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    faqIdIdx: index("tbl_translation_faq_faq_id_idx").on(table.faqId),
    createdAtIdx: index("tbl_translation_faq_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_translation_faq_updated_at_idx").on(table.updatedAt),
}));