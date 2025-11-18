import z from "zod";
import { zodValidateEmail, zodValidateTRPCFilter, zodValidateFullName, zodValidatePassword, zodValidatePermissions, zodValidateRole, zodValidateSearchQuery, zodValidateSearchQueryPermissions, zodValidateSearchQueryRole, zodValidateSearchQueryStatus, zodValidateStatus, zodValidateStrDate, zodValidateUuid } from "./constants";

// rest api

// add staff param
export const zodValidateRestApiAddNewStaffParam = z.object({
    addByStaffId: zodValidateUuid,
});

// add staff body data
export const zodValidateRestApiAddNewStaff = z.object({
    fullName: zodValidateFullName,
    email: zodValidateEmail,
    password: zodValidatePassword,
    role: zodValidateRole,
    status: zodValidateStatus,
    permissions: zodValidatePermissions
});

// udpate staff param
export const zodValidateRestApiUpdatedStaffParam = z.object({
    targetStaffId: zodValidateUuid,
    updatedByStaffId: zodValidateUuid,
});

// update staff body data
export const zodValidateRestApiUpdatedStaff = z.object({
    role: zodValidateRole,
    status: zodValidateStatus,
    permissions: zodValidatePermissions
});

export const zodValidateRestApiUpdatedMyDataParam = z.object({
    updatedByStaffId: zodValidateUuid,
    targetStaffId: zodValidateUuid,
});

// update my body data
export const zodValidateRestApiUpdatedMyData = z.object({
    email: zodValidateEmail,
    password: zodValidatePassword,
    role: zodValidateRole,
    status: zodValidateStatus,
    permissions: zodValidatePermissions
});

// trpc or rest api

// add new staff
export const zodValidateAddNewStaff = zodValidateRestApiAddNewStaff.extend({
    addByStaffId: zodValidateUuid,
});

// update staff
export const zodValidateUpdatedStaff = zodValidateRestApiUpdatedStaff.extend({
    targetStaffId: zodValidateUuid,
    updatedByStaffId: zodValidateUuid,
    role: zodValidateRole,
    status: zodValidateStatus,
    permissions: zodValidatePermissions
});

// update my data
export const zodValidateUpdatedMyData = zodValidateRestApiUpdatedMyData.extend({
    updatedByStaffId: zodValidateUuid,
    targetStaffId: zodValidateUuid,
});

export const zodValidateGetBySessionToken = z.object({
    sessionToken: z.string().min(40, "Invalid sessionToken length").nonempty("SessionToken is required"),
    staffId: zodValidateUuid,
})

// remove staff by id
export const zodValidateRemoveStaffById = z.object({
    removeByStaffId: zodValidateUuid,
    targetStaffId: zodValidateUuid,
});

// query or search staff by this condition
export const zodValidateSearchStaffData = zodValidateTRPCFilter.extend({
    query: zodValidateSearchQuery,
    role: zodValidateSearchQueryRole,
    status: zodValidateSearchQueryStatus,
    permissions: zodValidateSearchQueryPermissions,
    startDate: zodValidateStrDate,
    endDate: zodValidateStrDate,
});

export const zodValidateGetStaffById = z.object({
    staffId: zodValidateUuid
});

// rest api only
export type ZodValidateRestApiAddNewStaffParam = z.infer<typeof zodValidateRestApiAddNewStaffParam>;
export type ZodValidateRestApiAddNewStaff = z.infer<typeof zodValidateRestApiAddNewStaff>;
export type ZodValidateRestApiUpdatedStaffParam = z.infer<typeof zodValidateRestApiUpdatedStaffParam>;
export type ZodValidateRestApiUpdatedStaff = z.infer<typeof zodValidateRestApiUpdatedStaff>;
export type ZodValidateRestApiUpdatedMyData = z.infer<typeof zodValidateRestApiUpdatedMyData>;

// trpc or rest api
export type ZodValidateGetBySessionToken = z.infer<typeof zodValidateGetBySessionToken>;
export type ZodValidateRestApiUpdatedMyDataParam = z.infer<typeof zodValidateRestApiUpdatedMyDataParam>;
export type ZodValidateUpdatedMyData = z.infer<typeof zodValidateUpdatedMyData>;
export type ZodValidateAddNewStaff = z.infer<typeof zodValidateAddNewStaff>;
export type ZodValidateUpdatedStaff = z.infer<typeof zodValidateUpdatedStaff>;
export type ZodValidateSearchStaffData = z.infer<typeof zodValidateSearchStaffData>;
export type ZodValidateGetStaffById = z.infer<typeof zodValidateGetStaffById>;
export type ZodValidateRemoveStaffById = z.infer<typeof zodValidateRemoveStaffById>;