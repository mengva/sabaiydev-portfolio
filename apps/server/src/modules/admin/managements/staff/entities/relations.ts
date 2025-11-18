import { relations } from "drizzle-orm";
import { products } from "../../products/entities/product";
import { addAndEditStaffs, staffs } from "./staff";
import { passwordResetTokens, sessions, verifications } from "@/api/modules/admin/auth/entities";
import { bulletinBoards, careers, faq, news } from "@/api/db";

export const staffRelations = relations(staffs, ({ one, many }) => ({
    sessions: many(sessions),
    passwordResetTokens: many(passwordResetTokens),
    addProducts: many(products),
    updatedProducts: many(products),
    verifications: many(verifications),
    addByStaffs: many(addAndEditStaffs),
    updateByStaffs: many(addAndEditStaffs),
    targetStaffs: many(addAndEditStaffs),
    addNews: many(news),
    updatedNews: many(news),
    addCareers: many(careers),
    updatedCareers: many(careers),
    addFaq: many(faq),
    updatedFaq: many(faq),
    addBulletinBoards: many(bulletinBoards),
    updatedBulletinBoards: many(bulletinBoards),
}));

export const addAndEditStaffRelations = relations(addAndEditStaffs, ({ one }) => ({
    targetStaff: one(staffs, {
        fields: [addAndEditStaffs.targetStaffId],
        references: [staffs.id],
    }),
    updatedByStaff: one(staffs, {
        fields: [addAndEditStaffs.updatedByStaffId],
        references: [staffs.id],
    }),
    addByStaff: one(staffs, {
        fields: [addAndEditStaffs.addByStaffId],
        references: [staffs.id],
    }),
}))