import { pgEnum } from "drizzle-orm/pg-core";

export const careerDepartmentEnum = pgEnum("career_department_enum", [
    "ENGINEERING",
    "MARKETING",
    "SALES",
    "DESIGN",
    "HR",
    "FINANCE",
    "OPERATIONS",
    "CUSTOMER_SUPPORT",
    "PRODUCT_MANAGEMENT",
    "LEGAL"
]);

export const careerTypeEnum = pgEnum("career_type_enum", [
    "FULL_TIME",
    "PART_TIME",
    "INTERNSHIP",
    "CONTRACT",
    "TEMPORARY",
    "VOLUNTEER"
]);

export const careerStatusEnum = pgEnum("career_status_enum", [
    "OPEN",
    "CLOSED",
    "PAUSED"
]);

export const customerStatusEnum = pgEnum("customer_status_enum", [
    "APPLY",
    "REVIEW",
    "INTERVIEW",
    "OFFER",
    "HIRED",
    "REJECTED"
]);

