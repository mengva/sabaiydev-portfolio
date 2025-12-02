import z from "zod";
import { zodValidationSearchQuery, zodValidationStrDate, zodValidationFilter, zodValidationUuid, zodValidationFiles } from "./constants";
import { zodValidationNewsCategory, zodValidationNewsStatus, zodValidationSearchQueryNewsCategory, zodValidationSearchQueryNewsStatus, zodValidationTranslationNews } from "./variables/news";

export const zodValidationSearchQueryNews = zodValidationFilter.extend({
    query: zodValidationSearchQuery,
    category: zodValidationSearchQueryNewsCategory,
    status: zodValidationSearchQueryNewsStatus,
    startDate: zodValidationStrDate,
    endDate: zodValidationStrDate,
});

export const zodValidationGetOneNewsById = z.object({
    newsId: zodValidationUuid
});

export const zodValidationAddOneNews = z.object({
    staffId: zodValidationUuid,
    category: zodValidationNewsCategory,
    status: zodValidationNewsStatus,
    translations: zodValidationTranslationNews,
    imageFiles: zodValidationFiles
});

export const zodValidationAddOneNewsData = z.object({
    staffId: zodValidationUuid,
    category: zodValidationNewsCategory,
    status: zodValidationNewsStatus,
    translations: zodValidationTranslationNews,
});

export const zodValidationEditOneNewsById = z.object({
    updatedByStaffId: zodValidationUuid,
    newsId: zodValidationUuid,
    category: zodValidationNewsCategory,
    status: zodValidationNewsStatus,
    translations: zodValidationTranslationNews,
    imageFiles: zodValidationFiles
});

export const zodValidationEditOneNewsDataById = z.object({
    updatedByStaffId: zodValidationUuid,
    newsId: zodValidationUuid,
    category: zodValidationNewsCategory,
    status: zodValidationNewsStatus,
    translations: zodValidationTranslationNews,
});

export const zodValidationRemoveOneNewsById = z.object({
    removeByStaffId: zodValidationUuid,
    newsId: zodValidationUuid
});

export const zodValidationRemoveOneNewsImageById = z.object({
    removeByStaffId: zodValidationUuid,
    imageId: zodValidationUuid
});

export type ZodValidationGetOneNewsById = z.infer<typeof zodValidationGetOneNewsById>;
export type ZodValidationSearchQueryNews = z.infer<typeof zodValidationSearchQueryNews>;

export type ZodValidationAddOneNews = z.infer<typeof zodValidationAddOneNews>;
export type ZodValidationAddOneNewsData = z.infer<typeof zodValidationAddOneNewsData>;

export type ZodValidationEditOneNewsById = z.infer<typeof zodValidationEditOneNewsById>;
export type ZodValidationEditOneNewsDataById = z.infer<typeof zodValidationEditOneNewsDataById>;

export type ZodValidationRemoveOneNewsById = z.infer<typeof zodValidationRemoveOneNewsById>;
export type ZodValidationRemoveOneNewsImageById = z.infer<typeof zodValidationRemoveOneNewsImageById>;