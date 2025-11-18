import { pgEnum } from "drizzle-orm/pg-core";

export const newsCategoryEnum = pgEnum("news_category_enum", [
    "TECHNOLOGY",
    "CLOUD",
    "COMPANY",
    "PRODUCT",
    "INDUSTRY"
]);

export const newsStatusEnum = pgEnum("news_status_enum", [
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED"
]);