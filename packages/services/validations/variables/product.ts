import z from "zod";

export const zodValidationSearchQueryProductCategory = z.enum(["DEFAULT", "COLLABORATION", "MEDIA", "ANALYTICS", "SECURITY", "DEVELOPMENT"]).default("DEFAULT");
export const zodValidationSearchQueryProductStatus = z.enum(["DEFAULT", "ACTIVE", "INACTIVE", "DEVELOPMENT", "DEPRECATED"]).default("DEFAULT");

export const zodValidationProductCategory = z.enum(["COLLABORATION", "MEDIA", "ANALYTICS", "SECURITY", "DEVELOPMENT"]);
export const zodValidationProductStatus = z.enum(["ACTIVE", "INACTIVE", "DEVELOPMENT", "DEPRECATED"]);

export type ZodValidationSearchQueryProductCategory = z.infer<typeof zodValidationSearchQueryProductCategory>;
export type ZodValidationSearchQueryProductStatus = z.infer<typeof zodValidationSearchQueryProductStatus>;
export type ZodValidationProductCategory = z.infer<typeof zodValidationProductCategory>;
export type ZodValidationProductStatus = z.infer<typeof zodValidationProductStatus>;