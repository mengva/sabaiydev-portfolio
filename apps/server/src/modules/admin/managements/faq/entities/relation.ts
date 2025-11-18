import { relations } from "drizzle-orm";
import { faq, translationFaq } from "./faq";
import { staffs } from "@/api/db";

export const faqRelations = relations(faq, ({ one, many }) => ({
    addByStaff: one(staffs, {
        fields: [faq.addByStaffId],
        references: [staffs.id],
    }),
    updatedByStaff: one(staffs, {
        fields: [faq.updatedByStaffId],
        references: [staffs.id],
    }),
    translationFaq: many(translationFaq)
}));

export const translationFaqRelations = relations(translationFaq, ({ one }) => ({
    product: one(faq, {
        fields: [translationFaq.faqId],
        references: [faq.id],
    }),
}));