import z from "zod";
import { SearchQueryStaffPermissionDto, SearchQueryStaffRoleDto, SearchQueryStaffStatusDto } from "../../types/constants";

export const zodValidationStaffRole = z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"]);
export const zodValidationStaffStatus = z.enum(["ACTIVE", "INACTIVE"]);
export const zodValidationStaffPermissions = z.array(z.enum(["READ", "WRITE", "CREATE", "DELETE", "UPDATE", "MANAGE"]));

export const zodValidationSearchQueryStaffRole = z.enum(["DEFAULT", "SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"]).default("DEFAULT" as SearchQueryStaffRoleDto);
export const zodValidationSearchQueryStaffStatus = z.enum(["DEFAULT", "ACTIVE", "INACTIVE"]).default("DEFAULT" as SearchQueryStaffStatusDto);
export const zodValidationSearchQueryStaffPermissions = z.array(z.enum(["DEFAULT", "READ", "WRITE", "CREATE", "DELETE", "UPDATE", "MANAGE"])).default(["DEFAULT"] as SearchQueryStaffPermissionDto[]);

export type ZodValidationStaffRole = z.infer<typeof zodValidationStaffRole>;
export type ZodValidationStaffStatus = z.infer<typeof zodValidationStaffStatus>;
export type ZodValidationStaffPermissions = z.infer<typeof zodValidationStaffPermissions>;

export type ZodValidationSearchQueryStaffRole = z.infer<typeof zodValidationSearchQueryStaffRole>;
export type ZodValidationSearchQueryStaffStatus = z.infer<typeof zodValidationSearchQueryStaffStatus>;
export type ZodValidationSearchQueryStaffPermissions = z.infer<typeof zodValidationSearchQueryStaffPermissions>;