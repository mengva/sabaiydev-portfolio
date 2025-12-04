import { relations } from "drizzle-orm";
import { bulletinBoards, translationBulletinBoards } from "./bulletinBoard";
import { staffs } from "@/server/db";

export const bulletinBoardRelations = relations(bulletinBoards, ({ one, many }) => ({
    addByStaff: one(staffs, {
        fields: [bulletinBoards.addByStaffId],
        references: [staffs.id],
    }),
    updatedByStaff: one(staffs, {
        fields: [bulletinBoards.updatedByStaffId],
        references: [staffs.id],
    }),
    translationBulletinBoards: many(translationBulletinBoards)
}));

export const translationBulletinBoardRelations = relations(translationBulletinBoards, ({ one }) => ({
    career: one(bulletinBoards, {
        fields: [translationBulletinBoards.bulletinBoardId],
        references: [bulletinBoards.id],
    }),
}));