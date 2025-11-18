import { pgEnum } from "drizzle-orm/pg-core";

export const careerDepartmentEnum = pgEnum("career_department_enum", [
    "ENGINEERING",
    "DESIGN",
    "MARKETING",
    "SALES",
    "HR",
    "OPERATIONS"
]);

export const careerTypeEnum = pgEnum("career_type_enum", [
    "FULL_TIME",
    "PART_TIME",
    "INTERNSHIP",
    "CONTRACT"
]);

export const careerStatusEnum = pgEnum("career_status_enum", [
    "OPEN",
    "CLOSED",
    "DRAFT"
]);

export const customerStatusEnum = pgEnum("customer_status_enum", [
    "DONE",
    "REJECT",
    "APPLY"
]);
