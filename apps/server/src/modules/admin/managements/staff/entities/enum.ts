import { pgEnum } from "drizzle-orm/pg-core";

export const staffRoleEnum = pgEnum("staff_role_enum", [
    "SUPER_ADMIN",
    "ADMIN",
    "EDITOR",
    "VIEWER"
]);

export const staffPermissionEnum = pgEnum("staff_permission_enum", [
    "READ",
    "WRITE",
    "CREATE",
    "DELETE",
    "UPDATE",
    "MANAGE",
]);

export const staffStatusEnum = pgEnum("staff_status_enum", [
    "ACTIVE",
    "INACTIVE"
]);

export const sessionValidEnum = pgEnum("session_valid_enum", [
    "true",
    "false"
]);