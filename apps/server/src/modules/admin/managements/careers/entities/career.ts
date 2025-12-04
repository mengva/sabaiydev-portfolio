import { staffs } from "@/server/db";
import { boolean, index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { careerDepartmentEnum, careerStatusEnum, careerTypeEnum, customerStatusEnum } from "./enum";
import { localEnum } from "@/server/entities/enum";

export const careers = pgTable("careers", {
    id: uuid("id").defaultRandom().primaryKey(),
    addByStaffId: uuid("add_by_staff_id").references(() => staffs.id, { onDelete: "cascade" }).notNull(),
    updatedByStaffId: uuid("updated_by_staff_id").references(() => staffs.id, { onDelete: "cascade" }),
    department: careerDepartmentEnum("department").notNull(),
    jobType: careerTypeEnum("job_type").notNull(),
    isApplyCareer: boolean("is_apply_career").default(false),
    isFeatured: boolean("is_featured").default(false),
    status: careerStatusEnum("status").notNull(),
    salaryRange: text("salary_range").notNull().array(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
    addByStaffIdIdx: index("tbl_career_add_by_staff_id_idx").on(table.addByStaffId),
    updatedByStaffIdIdx: index("tbl_career_updated_by_staff_id_idx").on(table.updatedByStaffId),
    departmentIdx: index("tbl_career_department_idx").on(table.department),
    statusIdx: index("tbl_career_status_idx").on(table.status),
    jobTypeIdx: index("tbl_career_job_type_idx").on(table.jobType),
    createdAtIdx: index("tbl_career_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_career_updated_at_idx").on(table.updatedAt),
}));

export const translationCareers = pgTable("translation_careers", {
    id: uuid("id").defaultRandom().primaryKey(),
    local: localEnum("local").notNull(),
    careerId: uuid("career_id").notNull().references(() => careers.id, { onDelete: "cascade" }),
    location: text("location").notNull(),
    jobTitle: text("job_title").notNull(),
    description: text("description").notNull(),
    requirements: text("requirements").array().notNull(),
    benefits: text("benefits").array().notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    careerIdIdx: index("tbl_translation_career_career_id_idx").on(table.careerId),
    jobTitleIdx: index("tbl_translation_career_job_title_idx").on(table.jobTitle),
    locationIdx: index("tbl_translation_career_location_idx").on(table.location),
    createdAtIdx: index("tbl_translation_career_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_translation_career_updated_at_idx").on(table.updatedAt),
}));

export const applyCareers = pgTable("apply_careers", {
    id: uuid("id").defaultRandom().primaryKey(),
    local: localEnum("local").notNull(),
    careerId: uuid("career_id").notNull().references(() => careers.id, { onDelete: "cascade" }),
    coverLetter: text("cover_letter"),
    reference: text("reference"),
    isView: boolean("is_view").default(false),
    benefits: text("benefits").notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    careerIdIdx: index("tbl_apply_career_career_id_idx").on(table.careerId),
    isViewIdx: index("tbl_apply_career_job_title_idx").on(table.isView),
    createdAtIdx: index("tbl_apply_career_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_apply_career_updated_at_idx").on(table.updatedAt),
}));

export const customerInformations = pgTable("customer_informations", {
    id: uuid("id").defaultRandom().primaryKey(),
    applyCareerId: uuid("apply_career_id").notNull().references(() => applyCareers.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 50 }).notNull().unique(),
    phoneNumber: text("phone_number").notNull(),
    address: text("address"),
    status: customerStatusEnum("status").default("APPLY"),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    applyCareerIdIdx: index("tbl_customer_information_career_id_idx").on(table.applyCareerId),
    emailIdx: index("tbl_customer_information_email_idx").on(table.email),
    phoneNumberIdx: index("tbl_customer_information_phone_number_idx").on(table.phoneNumber),
    createdAtIdx: index("tbl_customer_information_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_customer_information_updated_at_idx").on(table.updatedAt),
}));

export const experiences = pgTable("experiences", {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").notNull().references(() => customerInformations.id, { onDelete: "cascade" }),
    companyName: text("company_name"),
    position: text("position"),
    startDate: timestamp("start_date").defaultNow(),
    endDate: timestamp("end_date").defaultNow(),
    description: text("description"),
    companyLinks: text("company_links").array().default([]),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    customerIdIdx: index("tbl_experience_customer_id_idx").on(table.customerId),
    createdAtIdx: index("tbl_experience_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_experience_updated_at_idx").on(table.updatedAt),
}));

export const educations = pgTable("educations", {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").notNull().references(() => customerInformations.id, { onDelete: "cascade" }),
    school: text("school"),
    graduationYear: text("graduation_year"),
    degreeOrCertificate: text("degree_or_certificate"),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    customerIdIdx: index("tbl_education_customer_id_idx").on(table.customerId),
    createdAtIdx: index("tbl_education_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_education_updated_at_idx").on(table.updatedAt),
}));

export const skills = pgTable("skills", {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").notNull().references(() => customerInformations.id, { onDelete: "cascade" }),
    technicalSkills: text("technical_skills").array(),
    softSkills: text("soft_skills").array().default([]),
    certifications: text("certifications").array().default([]),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    customerIdIdx: index("tbl_skill_customer_id_idx").on(table.customerId),
    createdAtIdx: index("tbl_skill_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_skill_updated_at_idx").on(table.updatedAt),
}));

export const cvCustomers = pgTable("cv_customers", {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").notNull().references(() => customerInformations.id, { onDelete: "cascade" }),
    cvUrl: text("cv_url").notNull(),
    cloudinaryId: varchar("cloudinary_id", { length: 100 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    size: integer("size").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    customerIdIdx: index("tbl_cv_customer_customer_id_idx").on(table.customerId),
    createdAtIdx: index("tbl_cv_customer_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_cv_customer_updated_at_idx").on(table.updatedAt),
}));

export const customerImages = pgTable("customer_images", {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").notNull().references(() => customerInformations.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    cloudinaryId: varchar("cloudinary_id", { length: 100 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    size: integer("size").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, table => ({
    customerIdIdx: index("tbl_customer_image_customer_id_idx").on(table.customerId),
    createdAtIdx: index("tbl_customer_image_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("tbl_customer_image_updated_at_idx").on(table.updatedAt),
}));