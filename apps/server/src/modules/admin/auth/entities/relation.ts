import { relations } from "drizzle-orm";
import { sessions, verifications } from "./auth";
import { staffs } from "@/server/db";

export const sessionRelations = relations(sessions, ({ one }) => ({
    staff: one(staffs, {
        fields: [sessions.staffId],
        references: [staffs.id],
    }),
}));

export const verificationRelations = relations(verifications, ({ one }) => ({
    staff: one(staffs, {
        fields: [verifications.staffId],
        references: [staffs.id],
    }),
}));