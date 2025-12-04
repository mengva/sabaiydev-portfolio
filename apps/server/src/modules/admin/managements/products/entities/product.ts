import { index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { staffs } from "../../staff/entities/staff";
import { productCategoryEnum, productStatusEnum } from "./enum";
import { localEnum } from "@/server/entities/enum";

export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey(),
    addByStaffId: uuid("add_by_staff_id").references(() => staffs.id, { onDelete: "cascade" }).notNull(),
    updatedByStaffId: uuid("updated_by_staff_id").references(() => staffs.id, { onDelete: "cascade" }),
    category: productCategoryEnum("category").notNull(),
    status: productStatusEnum("status").notNull().default("ACTIVE"),
    technologies: text("technologies").array().notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
    statusIdx: index("tbl_product_status_idx").on(table.status),
    categoryIdx: index("tbl_product_category_idx").on(table.category),
    createdAtIdx: index("tbl_product_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_product_updated_at_idx").on(table.updatedAt),
}));

export const translationProducts = pgTable("translation_products", {
    id: uuid("id").defaultRandom().primaryKey(),
    local: localEnum("local").notNull(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    name: varchar("name").notNull(),
    description: text("description").notNull(),
    longDescription: text("long_description").notNull(),
    features: text("features").notNull().array(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    productIdIdx: index("tbl_translation_product_product_id_idx").on(table.productId),
    nameIdx: index("tbl_translation_product_name_idx").on(table.name),
    createdAtIdx: index("tbl_translation_product_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_translation_product_updated_at_idx").on(table.updatedAt),
}));

export const productImages = pgTable("product_images", {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    cloudinaryId: varchar("cloudinary_id", { length: 100 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    size: integer("size").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    productIdIdx: index("tbl_product_image_product_id_idx").on(table.productId),
    createdAtIdx: index("tbl_product_image_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_product_image_updated_at_idx").on(table.updatedAt),
}));