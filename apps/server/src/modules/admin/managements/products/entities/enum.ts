import { pgEnum } from "drizzle-orm/pg-core";

export const productCategoryEnum = pgEnum("product_category_enum", [
    "COLLABORATION",
    "MEDIA",
    "ANALYTICS",
    "SECURITY",
    "DEVELOPMENT"
]);

export const productStatusEnum = pgEnum("product_status_enum", [
    "ACTIVE",
    "INACTIVE",
    "DEVELOPMENT",
    "DEPRECATED"
]);