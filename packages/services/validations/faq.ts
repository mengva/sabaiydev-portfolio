import z from "zod";
import { zodValidationFilter, zodValidationSearchQuery, zodValidationStrDate, zodValidationUuid } from "./constants";
import { zodValidationFaqCategory, zodValidationFaqStatus, zodValidationFaqTranslation } from "./variables/faq";

export const zodValidationGetOneFaqById = z.object({
    faqId: zodValidationUuid
});

export const zodValidationAddOneFaqData = z.object({
    addByStaffId: zodValidationUuid,
    translations: zodValidationFaqTranslation,
    category: zodValidationFaqCategory,
    status: zodValidationFaqStatus,
});

export const zodValidationEditOneFaqData = z.object({
    updatedByStaffId: zodValidationUuid,
    faqId: zodValidationUuid,
    translations: zodValidationFaqTranslation,
    category: zodValidationFaqCategory,
    status: zodValidationFaqStatus,
});

export const zodValidationRemoveOneFaqById = z.object({
    faqId: zodValidationUuid,
    removeByStaffId: zodValidationUuid
});

export const zodValidationSearchQueryFaq = zodValidationFilter.extend({
    query: zodValidationSearchQuery,
    category: z.enum(["DEFAULT", "GENERAL", "SERVICES", "SUPPORT", "PRICING", "TECHNICAL"]).default("DEFAULT"),
    status: z.enum(["DEFAULT", "PUBLISHED", "DRAFT"]).default("DEFAULT"),
    startDate: zodValidationStrDate,
    endDate: zodValidationStrDate,
});

export type ZodValidationFaqStatus = z.infer<typeof zodValidationFaqStatus>;

export type ZodValidationFaqCategory = z.infer<typeof zodValidationFaqCategory>;
export type ZodValidationFaqTranslation = z.infer<typeof zodValidationFaqTranslation>;
export type ZodValidationSearchQueryFaq = z.infer<typeof zodValidationSearchQueryFaq>;

export type ZodValidationGetOneFaqById = z.infer<typeof zodValidationGetOneFaqById>;

export type ZodValidationAddOneFaqData = z.infer<typeof zodValidationAddOneFaqData>;
export type ZodValidationEditOneFaqData = z.infer<typeof zodValidationEditOneFaqData>;

