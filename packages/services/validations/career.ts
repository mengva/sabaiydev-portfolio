import z from "zod";
import { zodValidationFilter, zodValidationSearchQuery, zodValidationStrDate, zodValidationUuid } from "./constants";
import { zodValidationDepartmentCareer, zodValidationSaralyRangeCareer, zodValidationSearchQueryCareerDepartment, zodValidationSearchQueryCareerStatus, zodValidationSearchQueryCareerType, zodValidationStatusCareer, zodValidationTranslationCareer, zodValidationTypeCareer } from "./variables/career";

export const zodValidationGetOneCareerById = z.object({
    careerId: zodValidationUuid
});

export const zodValidationAddOneCareerData = z.object({
    addByStaffId: zodValidationUuid,
    saralyRange: zodValidationSaralyRangeCareer,
    department: zodValidationDepartmentCareer,
    status: zodValidationStatusCareer,
    jobType: zodValidationTypeCareer,
    translations: zodValidationTranslationCareer,
});

export const zodValidationEditOneCareerData = z.object({
    careerId: zodValidationUuid,
    updatedByStaffId: zodValidationUuid,
    saralyRange: zodValidationSaralyRangeCareer,
    department: zodValidationDepartmentCareer,
    status: zodValidationStatusCareer,
    jobType: zodValidationTypeCareer,
    translations: zodValidationTranslationCareer,
});

export const zodValidationDeleteOneCareerById = z.object({
    careerId: zodValidationUuid,
    removeByStaffId: zodValidationUuid,
});

export const zodValidationSearchQueryCareer = zodValidationFilter.extend({
    query: zodValidationSearchQuery,
    department: zodValidationSearchQueryCareerDepartment,
    status: zodValidationSearchQueryCareerStatus,
    jobType: zodValidationSearchQueryCareerType,
    startDate: zodValidationStrDate,
    endDate: zodValidationStrDate,
});

export type ZodValidationAddOneCareerData = z.infer<typeof zodValidationAddOneCareerData>;
export type ZodValidationEditOneCareerData = z.infer<typeof zodValidationEditOneCareerData>;
export type ZodValidationDeleteOneCareerById = z.infer<typeof zodValidationDeleteOneCareerById>;

export type ZodValidationGetOneCareerById = z.infer<typeof zodValidationGetOneCareerById>;
export type ZodValidationSearchQueryCareer = z.infer<typeof zodValidationSearchQueryCareer>;