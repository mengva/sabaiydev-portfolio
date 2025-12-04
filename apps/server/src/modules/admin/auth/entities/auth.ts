import { staffs } from "@/server/db";
import { boolean, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const verifications = pgTable("staff_verifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    staffId: uuid("staff_id").notNull().references(() => staffs.id, { onDelete: "cascade" }),
    isVerifiedCode: boolean("is_verified_code").default(false),
    code: varchar("code").notNull(),
    codeExpired: timestamp("code_expired").notNull(),
    resetPasswordExpired: timestamp("reset_password_expired"),
    userAgent: varchar("user_agent", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 50 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
    staffIdIdx: index("tbl_staff_verification_staff_id_idx").on(table.staffId),
    codeIdx: index("tbl_staff_verification_code_idx").on(table.code),
    userAgentIdx: index("tbl_staff_verification_user_agent_idx").on(table.userAgent),
    ipAddressIdx: index("tbl_staff_verification_ip_address_idx").on(table.ipAddress),
    createdAtIdx: index("tbl_staff_verification_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_staff_verification_updated_at_idx").on(table.updatedAt),
}));

export const sessions = pgTable("staff_sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    staffId: uuid("staff_id").notNull().references(() => staffs.id, { onDelete: "cascade" }),
    sessionToken: text("session_token").notNull().unique(),
    userAgent: varchar("user_agent", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 50 }),
    expired: timestamp("expired").notNull(),
    valid: text("valid").$type<boolean>().notNull().default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
    staffIdIdx: index("tbl_session_staff_id_idx").on(table.staffId),
    createdAtIdx: index("tbl_session_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_session_updated_at_idx").on(table.updatedAt),
    sessionTokenIdx: index("tbl_session_token_idx").on(table.sessionToken),
}));

export const passwordResetTokens = pgTable("staff_password_reset_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
    staffId: uuid("staff_id").notNull().references(() => staffs.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    used: text("used").$type<boolean>().notNull().default(false),
}, (table) => ({
    staffIdIdx: index("tbl_staff_prt_staff_id_idx").on(table.staffId),
    tokenIdx: index("tbl_staff_prt_token_idx").on(table.token),
    expiresAtIdx: index("tbl_staff_prt_expires_at_idx").on(table.expiresAt),
    usedIdx: index("tbl_staff_prt_used_idx").on(table.used),
}));

export const resetAdminPasswordTokens = pgTable("staff_reset_admin_password_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    used: text("used").$type<boolean>().notNull().default(false),
}, (table) => ({
    tokenIdx: index("tbl_reset_admin_prt_token_idx").on(table.token),
    expiresAtIdx: index("tbl_reset_admin_prt_expires_at_idx").on(table.expiresAt),
    usedIdx: index("tbl_reset_admin_prt_used_idx").on(table.used),
}));