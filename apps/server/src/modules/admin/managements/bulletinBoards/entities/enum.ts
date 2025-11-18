import { pgEnum } from "drizzle-orm/pg-core";

export const bulletinBoardPriorityEnum = pgEnum("bulletin_board_priority_enum", [
    "LOW",
    "MEDIUM",
    "HIGH"
]);

export const bulletinBoardStatusEnum = pgEnum("bulletin_board_status_enum", [
    "ACTIVE",
    "INACTIVE",
    "SCHEDULED"
]);