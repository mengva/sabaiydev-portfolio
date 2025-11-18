import { relations } from "drizzle-orm";
import { applyCareers, careers, customerInformations, customerImages, cvCustomers, educations, experiences, skills, translationCareers } from "./career";
import { staffs } from "@/api/db";

export const careerRelations = relations(careers, ({ one, many }) => ({
    addByStaff: one(staffs, {
        fields: [careers.addByStaffId],
        references: [staffs.id],
    }),
    updatedByStaff: one(staffs, {
        fields: [careers.updatedByStaffId],
        references: [staffs.id],
    }),
    translationCareers: many(translationCareers),
    applyCareers: many(applyCareers)
}));

export const translationCareerRelations = relations(translationCareers, ({ one }) => ({
    career: one(careers, {
        fields: [translationCareers.careerId],
        references: [careers.id],
    }),
}));

export const applyCareerRelations = relations(applyCareers, ({ one }) => ({
    career: one(careers, {
        fields: [applyCareers.careerId],
        references: [careers.id],
    }),
    customerInformation: one(customerInformations, {
        fields: [applyCareers.careerId],
        references: [customerInformations.id],
    }),
}));

export const customerInformationRelations = relations(customerInformations, ({ one, many }) => ({
    applyCareer: one(applyCareers, {
        fields: [customerInformations.applyCareerId],
        references: [applyCareers.id],
    }),
    experiences: many(experiences),
    educations: many(educations),
    skills: many(skills),
    cvCustomers: many(cvCustomers),
    customerImages: many(customerImages),
}));

export const experienceRelations = relations(experiences, ({ one }) => ({
    customerInformation: one(customerInformations, {
        fields: [experiences.customerId],
        references: [customerInformations.id],
    }),
}));

export const skillRelations = relations(skills, ({ one }) => ({
    customerInformation: one(customerInformations, {
        fields: [skills.customerId],
        references: [customerInformations.id],
    }),
}));

export const educationRelations = relations(educations, ({ one }) => ({
    customerInformation: one(customerInformations, {
        fields: [educations.customerId],
        references: [customerInformations.id],
    }),
}));

export const cvCustomerRelations = relations(cvCustomers, ({ one }) => ({
    customerInformation: one(customerInformations, {
        fields: [cvCustomers.customerId],
        references: [customerInformations.id],
    }),
}));

export const customerImageRelations = relations(customerImages, ({ one }) => ({
    customerInformation: one(customerInformations, {
        fields: [customerImages.customerId],
        references: [customerInformations.id],
    }),
}));