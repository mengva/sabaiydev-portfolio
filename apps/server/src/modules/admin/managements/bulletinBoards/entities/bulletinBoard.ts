import { staffs } from "@/api/db";
import { index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { bulletinBoardPriorityEnum, bulletinBoardStatusEnum } from "./enum";
import { localEnum } from "@/api/entities/enum";

export const bulletinBoards = pgTable("bulletin_boards", {
    id: uuid("id").defaultRandom().primaryKey(),
    addByStaffId: uuid("add_by_staff_id").references(() => staffs.id, { onDelete: "cascade" }).notNull(),
    updatedByStaffId: uuid("updated_by_staff_id").references(() => staffs.id, { onDelete: "cascade" }),
    priority: bulletinBoardPriorityEnum("priority").notNull().default("MEDIUM"),
    status: bulletinBoardStatusEnum("status").default("ACTIVE").notNull(),
    startDate: timestamp('start_date').defaultNow(),
    endDate: timestamp('end_date').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
    addByStaffIdIdx: index("tbl_bulletin_board_add_by_staff_id_idx").on(table.addByStaffId),
    updatedByStaffIdIdx: index("tbl_bulletin_board_updated_by_staff_id_idx").on(table.updatedByStaffId),
    priorityIdx: index("tbl_bulletin_board_priority_idx").on(table.priority),
    statusIdx: index("tbl_bulletin_board_status_idx").on(table.status),
    createdAtIdx: index("tbl_bulletin_board_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_bulletin_board_updated_at_idx").on(table.updatedAt),
}));

export const translationBulletinBoards = pgTable("translation_bulletin_boards", {
    id: uuid("id").defaultRandom().primaryKey(),
    local: localEnum("local").notNull(),
    bulletinBoardId: uuid("bulletin_board_id").notNull().references(() => bulletinBoards.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    bulletinBoardIdIdx: index("tbl_translation_bulletin_board_bulletin_board_id_idx").on(table.bulletinBoardId),
    titleIdx: index("tbl_translation_bulletin_board_name_idx").on(table.title),
    createdAtIdx: index("tbl_translation_bulletin_board_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_translation_bulletin_board_updated_at_idx").on(table.updatedAt),
}));

export const BulletinBoardImages = pgTable("bulletin_board_images", {
    id: uuid("id").defaultRandom().primaryKey(),
    bulletinBoardId: uuid("bulletin_board_id").notNull().references(() => bulletinBoards.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    cloudinaryId: varchar("cloudinary_id", { length: 100 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    size: integer("size").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    bulletinBoardIdIdx: index("tbl_bulletin_board_image_bulletin_board_id_idx").on(table.bulletinBoardId),
    createdAtIdx: index("tbl_bulletin_board_image_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_bulletin_board_image_updated_at_idx").on(table.updatedAt),
}));