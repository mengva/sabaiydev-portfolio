import { pgEnum } from "drizzle-orm/pg-core";

export const faqStatusEnum = pgEnum("faq_status_enum", [
    "PUBLISHED",
    "DRAFT"
]);

export const faqCategoryEnum = pgEnum("faq_category_enum", [
    "GENERAL",
    "SERVICES",
    "SUPPORT",
    "PRICING",
    "TECHNICAL"
]);