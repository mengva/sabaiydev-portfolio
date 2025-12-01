import z from "zod";
import { zodValidationEmail, zodValidationFilter, zodValidationFullName, zodValidationPassword, zodValidationSearchQuery, zodValidationStrDate, zodValidationUuid } from "./constants";
import { zodValidationSearchQueryStaffRole, zodValidationSearchQueryStaffStatus, zodValidationStaffPermissions, zodValidationStaffRole, zodValidationStaffStatus } from "./variables/staff";

// rest api

// add staff param
export const zodValidationRestApiAddOneStaffParam = z.object({
    addByStaffId: zodValidationUuid,
});

// add staff body data
export const zodValidationRestApiAddOneStaff = z.object({
    fullName: zodValidationFullName,
    email: zodValidationEmail,
    password: zodValidationPassword,
    role: zodValidationStaffRole,
    status: zodValidationStaffStatus,
    permissions: zodValidationStaffPermissions
});

// udpate staff param
export const zodValidationRestApiEditStaffParam = z.object({
    targetStaffId: zodValidationUuid,
    updatedByStaffId: zodValidationUuid,
});

// update staff body data
export const zodValidationRestApiEditStaff = z.object({
    role: zodValidationStaffRole,
    status: zodValidationStaffStatus,
    permissions: zodValidationStaffPermissions
});

export const zodValidationRestApiEditMyDataParam = z.object({
    updatedByStaffId: zodValidationUuid,
    targetStaffId: zodValidationUuid,
});

// update my body data
export const zodValidationRestApiEditMyData = z.object({
    email: zodValidationEmail,
    role: zodValidationStaffRole,
    status: zodValidationStaffStatus,
    permissions: zodValidationStaffPermissions
});

// trpc or rest api

// add new staff
export const zodValidationAddOneStaff = zodValidationRestApiAddOneStaff.extend({
    addByStaffId: zodValidationUuid,
});

// update staff
export const zodValidationEditStaff = zodValidationRestApiEditStaff.extend({
    targetStaffId: zodValidationUuid,
    updatedByStaffId: zodValidationUuid,
    role: zodValidationStaffRole,
    status: zodValidationStaffStatus,
    permissions: zodValidationStaffPermissions
});

// update my data
export const zodValidationEditMyData = zodValidationRestApiEditMyData.extend({
    updatedByStaffId: zodValidationUuid,
    targetStaffId: zodValidationUuid,
});

export const zodValidationGetBySessionToken = z.object({
    sessionToken: z.string().min(40, "Invalid sessionToken length").nonempty("SessionToken is required"),
    staffId: zodValidationUuid,
})

// remove staff by id
export const zodValidationRemoveOneStaffById = z.object({
    removeByStaffId: zodValidationUuid,
    targetStaffId: zodValidationUuid,
});

// query or search staff by this condition
export const zodValidationSearchQueryStaff = zodValidationFilter.extend({
    query: zodValidationSearchQuery,
    role: zodValidationSearchQueryStaffRole,
    status: zodValidationSearchQueryStaffStatus,
    startDate: zodValidationStrDate,
    endDate: zodValidationStrDate,
});

export const zodValidationGetOneStaffById = z.object({
    staffId: zodValidationUuid
});

// rest api only
export type ZodValidationRestApiAddOneStaffParam = z.infer<typeof zodValidationRestApiAddOneStaffParam>;
export type ZodValidationRestApiAddOneStaff = z.infer<typeof zodValidationRestApiAddOneStaff>;
export type ZodValidationRestApiEditStaffParam = z.infer<typeof zodValidationRestApiEditStaffParam>;
export type ZodValidationRestApiEditStaff = z.infer<typeof zodValidationRestApiEditStaff>;
export type ZodValidationRestApiEditMyData = z.infer<typeof zodValidationRestApiEditMyData>;

// trpc or rest api
export type ZodValidationGetBySessionToken = z.infer<typeof zodValidationGetBySessionToken>;
export type ZodValidationRestApiEditMyDataParam = z.infer<typeof zodValidationRestApiEditMyDataParam>;
export type ZodValidationEditMyData = z.infer<typeof zodValidationEditMyData>;
export type ZodValidationAddOneStaff = z.infer<typeof zodValidationAddOneStaff>;
export type ZodValidationEditStaff = z.infer<typeof zodValidationEditStaff>;
export type ZodValidationSearchQueryStaff = z.infer<typeof zodValidationSearchQueryStaff>;
export type ZodValidationGetOneStaffById = z.infer<typeof zodValidationGetOneStaffById>;
export type ZodValidationRemoveOneStaffById = z.infer<typeof zodValidationRemoveOneStaffById>;