import { boolean, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { staffPermissionEnum, staffRoleEnum, staffStatusEnum } from "./enum";

export const staffs = pgTable("staffs", {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 50 }).notNull().unique(),
    password: text("password").notNull(),
    role: staffRoleEnum("role").notNull(),
    status: staffStatusEnum("status").notNull(),
    permissions: text("permissions").$type<(typeof staffPermissionEnum)>().array().notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
    fullNameIdx: index("tbl_staff_full_name_idx").on(table.fullName),
    statusIdx: index("tbl_staff_status_idx").on(table.status),
    roleIdx: index("tbl_staff_role_idx").on(table.role),
    createdIdx: index("tbl_staff_created_at_idx").on(table.createdAt),
    updatedIdx: index("tbl_staff_updated_at_idx").on(table.updatedAt),
}));

export const addAndEditStaffs = pgTable("add_and_edit_staffs", {
    id: uuid("id").defaultRandom().primaryKey(),
    addByStaffId: uuid("add_by_staff_id").notNull().references(() => staffs.id, { onDelete: "cascade" }),
    updatedByStaffId: uuid("updated_by_staff_id").references(() => staffs.id, { onDelete: "cascade" }),
    targetStaffId: uuid("target_staff_id").notNull().references(() => staffs.id, { onDelete: "cascade" }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    addByStaffIdIdx: index("tbl_add_and_edit_staff_add_by_staff_id_idx").on(table.addByStaffId),
    updatedByStaffIdIdx: index("tbl_add_and_edit_staff_updated_by_staff_id_idx").on(table.updatedByStaffId),
    targetStaffIdIdx: index("tbl_add_and_edit_staff_target_staff_id_idx").on(table.targetStaffId),
    createdIdx: index("tbl_add_and_edit_staff_created_at_idx").on(table.createdAt),
    updatedIdx: index("tbl_add_and_edit_staff_updated_at_idx").on(table.updatedAt),
}));