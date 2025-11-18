import { pgEnum } from "drizzle-orm/pg-core";

export const localEnum = pgEnum("local_enum", [
    "lo",
    "en",
    "th",
]);