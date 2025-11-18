CREATE TYPE "public"."product_category_enum" AS ENUM('COLLABORATION', 'MEDIA', 'ANALYTICS', 'SECURITY', 'DEVELOPMENT');--> statement-breakpoint
CREATE TYPE "public"."product_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'DEVELOPMENT', 'DEPRECATED');--> statement-breakpoint
CREATE TYPE "public"."session_valid_enum" AS ENUM('true', 'false');--> statement-breakpoint
CREATE TYPE "public"."staff_permission_enum" AS ENUM('READ', 'WRITE', 'CREATE', 'DELETE', 'UPDATE', 'MANAGE');--> statement-breakpoint
CREATE TYPE "public"."staff_role_enum" AS ENUM('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER');--> statement-breakpoint
CREATE TYPE "public"."staff_status_enum" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."news_category_enum" AS ENUM('TECHNOLOGY', 'CLOUD', 'COMPANY', 'PRODUCT', 'INDUSTRY');--> statement-breakpoint
CREATE TYPE "public"."news_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."faq_category_enum" AS ENUM('GENERAL', 'SERVICES', 'SUPPORT', 'PRICING', 'TECHNICAL');--> statement-breakpoint
CREATE TYPE "public"."faq_status_enum" AS ENUM('PUBLISHED', 'DRAFT');--> statement-breakpoint
CREATE TYPE "public"."career_department_enum" AS ENUM('ENGINEERING', 'DESIGN', 'MARKETING', 'SALES', 'HR', 'OPERATIONS');--> statement-breakpoint
CREATE TYPE "public"."career_status_enum" AS ENUM('OPEN', 'CLOSED', 'DRAFT');--> statement-breakpoint
CREATE TYPE "public"."career_type_enum" AS ENUM('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT');--> statement-breakpoint
CREATE TYPE "public"."customer_status_enum" AS ENUM('DONE', 'REJECT', 'APPLY');--> statement-breakpoint
CREATE TYPE "public"."bulletin_board_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."bulletin_board_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SCHEDULED');--> statement-breakpoint
CREATE TYPE "public"."local_enum" AS ENUM('lo', 'en', 'th');--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"cloudinary_id" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"size" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"add_by_staff_id" uuid NOT NULL,
	"updated_by_staff_id" uuid,
	"category" "product_category_enum" NOT NULL,
	"status" "product_status_enum" DEFAULT 'ACTIVE' NOT NULL,
	"technologies" text[] NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "translation_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"local" "local_enum" NOT NULL,
	"product_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"long_description" text NOT NULL,
	"features" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "add_and_edit_staffs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"add_by_staff_id" uuid NOT NULL,
	"updated_by_staff_id" uuid,
	"target_staff_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "staffs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"email" varchar(50) NOT NULL,
	"password" text NOT NULL,
	"role" "staff_role_enum" NOT NULL,
	"status" "staff_status_enum" NOT NULL,
	"permissions" text[] NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "staffs_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "staff_password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"used" text DEFAULT false NOT NULL,
	CONSTRAINT "staff_password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "staff_reset_admin_password_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"used" text DEFAULT false NOT NULL,
	CONSTRAINT "staff_reset_admin_password_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "staff_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"session_token" text NOT NULL,
	"user_agent" varchar(255),
	"ip_address" varchar(50),
	"expired" timestamp NOT NULL,
	"valid" text DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "staff_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "staff_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"is_verified_code" boolean DEFAULT false,
	"code" varchar NOT NULL,
	"code_expired" timestamp NOT NULL,
	"reset_password_expired" timestamp,
	"user_agent" varchar(255),
	"ip_address" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"updated_by_staff_id" uuid,
	"category" "news_category_enum" DEFAULT 'TECHNOLOGY' NOT NULL,
	"status" "news_status_enum" DEFAULT 'PUBLISHED' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"news_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"cloudinary_id" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"size" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "translation_news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"local" "local_enum" NOT NULL,
	"news_id" uuid NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "faq" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"add_by_staff_id" uuid NOT NULL,
	"updated_by_staff_id" uuid,
	"category" "faq_category_enum" DEFAULT 'GENERAL' NOT NULL,
	"status" "faq_status_enum" DEFAULT 'PUBLISHED' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "translation_faq" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"local" "local_enum" NOT NULL,
	"faq_id" uuid NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "apply_careers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"local" "local_enum" NOT NULL,
	"career_id" uuid NOT NULL,
	"cover_letter" text,
	"reference" text,
	"is_view" boolean DEFAULT false,
	"benefits" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "careers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"add_by_staff_id" uuid NOT NULL,
	"updated_by_staff_id" uuid,
	"department" "career_department_enum" NOT NULL,
	"job_type" "career_type_enum" NOT NULL,
	"is_apply_career" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"status" "career_status_enum" NOT NULL,
	"salary_range" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"cloudinary_id" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"size" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_informations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"apply_career_id" uuid NOT NULL,
	"email" varchar(50) NOT NULL,
	"phone_number" text NOT NULL,
	"address" text,
	"status" "customer_status_enum" DEFAULT 'APPLY',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customer_informations_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cv_customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"cv_url" text NOT NULL,
	"cloudinary_id" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"size" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "educations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"school" text,
	"graduation_year" text,
	"degree_or_certificate" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"company_name" text,
	"position" text,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp DEFAULT now(),
	"description" text,
	"company_links" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"technical_skills" text[],
	"soft_skills" text[] DEFAULT '{}',
	"certifications" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "translation_careers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"local" "local_enum" NOT NULL,
	"career_id" uuid NOT NULL,
	"location" text NOT NULL,
	"job_title" text NOT NULL,
	"description" text NOT NULL,
	"requirements" text NOT NULL,
	"benefits" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulletin_board_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bulletin_board_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"cloudinary_id" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"size" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulletin_boards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"add_by_staff_id" uuid NOT NULL,
	"updated_by_staff_id" uuid,
	"priority" "bulletin_board_priority_enum" DEFAULT 'MEDIUM' NOT NULL,
	"status" "bulletin_board_status_enum" DEFAULT 'ACTIVE' NOT NULL,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "translation_bulletin_boards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"local" "local_enum" NOT NULL,
	"bulletin_board_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_add_by_staff_id_staffs_id_fk" FOREIGN KEY ("add_by_staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_updated_by_staff_id_staffs_id_fk" FOREIGN KEY ("updated_by_staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translation_products" ADD CONSTRAINT "translation_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "add_and_edit_staffs" ADD CONSTRAINT "add_and_edit_staffs_add_by_staff_id_staffs_id_fk" FOREIGN KEY ("add_by_staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "add_and_edit_staffs" ADD CONSTRAINT "add_and_edit_staffs_updated_by_staff_id_staffs_id_fk" FOREIGN KEY ("updated_by_staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "add_and_edit_staffs" ADD CONSTRAINT "add_and_edit_staffs_target_staff_id_staffs_id_fk" FOREIGN KEY ("target_staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_password_reset_tokens" ADD CONSTRAINT "staff_password_reset_tokens_staff_id_staffs_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_sessions" ADD CONSTRAINT "staff_sessions_staff_id_staffs_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_verifications" ADD CONSTRAINT "staff_verifications_staff_id_staffs_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_staff_id_staffs_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_updated_by_staff_id_staffs_id_fk" FOREIGN KEY ("updated_by_staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_images" ADD CONSTRAINT "news_images_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translation_news" ADD CONSTRAINT "translation_news_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faq" ADD CONSTRAINT "faq_add_by_staff_id_staffs_id_fk" FOREIGN KEY ("add_by_staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faq" ADD CONSTRAINT "faq_updated_by_staff_id_staffs_id_fk" FOREIGN KEY ("updated_by_staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translation_faq" ADD CONSTRAINT "translation_faq_faq_id_faq_id_fk" FOREIGN KEY ("faq_id") REFERENCES "public"."faq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apply_careers" ADD CONSTRAINT "apply_careers_career_id_careers_id_fk" FOREIGN KEY ("career_id") REFERENCES "public"."careers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "careers" ADD CONSTRAINT "careers_add_by_staff_id_staffs_id_fk" FOREIGN KEY ("add_by_staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "careers" ADD CONSTRAINT "careers_updated_by_staff_id_staffs_id_fk" FOREIGN KEY ("updated_by_staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_images" ADD CONSTRAINT "customer_images_customer_id_customer_informations_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_informations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_informations" ADD CONSTRAINT "customer_informations_apply_career_id_apply_careers_id_fk" FOREIGN KEY ("apply_career_id") REFERENCES "public"."apply_careers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_customers" ADD CONSTRAINT "cv_customers_customer_id_customer_informations_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_informations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "educations" ADD CONSTRAINT "educations_customer_id_customer_informations_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_informations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_customer_id_customer_informations_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_informations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_customer_id_customer_informations_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_informations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translation_careers" ADD CONSTRAINT "translation_careers_career_id_careers_id_fk" FOREIGN KEY ("career_id") REFERENCES "public"."careers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulletin_board_images" ADD CONSTRAINT "bulletin_board_images_bulletin_board_id_bulletin_boards_id_fk" FOREIGN KEY ("bulletin_board_id") REFERENCES "public"."bulletin_boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulletin_boards" ADD CONSTRAINT "bulletin_boards_add_by_staff_id_staffs_id_fk" FOREIGN KEY ("add_by_staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulletin_boards" ADD CONSTRAINT "bulletin_boards_updated_by_staff_id_staffs_id_fk" FOREIGN KEY ("updated_by_staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translation_bulletin_boards" ADD CONSTRAINT "translation_bulletin_boards_bulletin_board_id_bulletin_boards_id_fk" FOREIGN KEY ("bulletin_board_id") REFERENCES "public"."bulletin_boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tbl_product_image_product_id_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "tbl_product_image_created_at_idx" ON "product_images" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_product_image_updated_at_idx" ON "product_images" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_product_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tbl_product_category_idx" ON "products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "tbl_product_created_at_idx" ON "products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_product_updated_at_idx" ON "products" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_translation_product_product_id_idx" ON "translation_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "tbl_translation_product_name_idx" ON "translation_products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "tbl_translation_product_created_at_idx" ON "translation_products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_translation_product_updated_at_idx" ON "translation_products" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_add_and_edit_staff_add_by_staff_id_idx" ON "add_and_edit_staffs" USING btree ("add_by_staff_id");--> statement-breakpoint
CREATE INDEX "tbl_add_and_edit_staff_updated_by_staff_id_idx" ON "add_and_edit_staffs" USING btree ("updated_by_staff_id");--> statement-breakpoint
CREATE INDEX "tbl_add_and_edit_staff_target_staff_id_idx" ON "add_and_edit_staffs" USING btree ("target_staff_id");--> statement-breakpoint
CREATE INDEX "tbl_add_and_edit_staff_created_at_idx" ON "add_and_edit_staffs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_add_and_edit_staff_updated_at_idx" ON "add_and_edit_staffs" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_staff_full_name_idx" ON "staffs" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "tbl_staff_status_idx" ON "staffs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tbl_staff_role_idx" ON "staffs" USING btree ("role");--> statement-breakpoint
CREATE INDEX "tbl_staff_created_at_idx" ON "staffs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_staff_updated_at_idx" ON "staffs" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_staff_prt_staff_id_idx" ON "staff_password_reset_tokens" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "tbl_staff_prt_token_idx" ON "staff_password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "tbl_staff_prt_expires_at_idx" ON "staff_password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "tbl_staff_prt_used_idx" ON "staff_password_reset_tokens" USING btree ("used");--> statement-breakpoint
CREATE INDEX "tbl_reset_admin_prt_token_idx" ON "staff_reset_admin_password_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "tbl_reset_admin_prt_expires_at_idx" ON "staff_reset_admin_password_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "tbl_reset_admin_prt_used_idx" ON "staff_reset_admin_password_tokens" USING btree ("used");--> statement-breakpoint
CREATE INDEX "tbl_session_staff_id_idx" ON "staff_sessions" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "tbl_session_created_at_idx" ON "staff_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_session_updated_at_idx" ON "staff_sessions" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_session_token_idx" ON "staff_sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "tbl_staff_verification_staff_id_idx" ON "staff_verifications" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "tbl_staff_verification_code_idx" ON "staff_verifications" USING btree ("code");--> statement-breakpoint
CREATE INDEX "tbl_staff_verification_user_agent_idx" ON "staff_verifications" USING btree ("user_agent");--> statement-breakpoint
CREATE INDEX "tbl_staff_verification_ip_address_idx" ON "staff_verifications" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "tbl_staff_verification_created_at_idx" ON "staff_verifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_staff_verification_updated_at_idx" ON "staff_verifications" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_news_staff_id_idx" ON "news" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "tbl_news_updated_by_staff_id_idx" ON "news" USING btree ("updated_by_staff_id");--> statement-breakpoint
CREATE INDEX "tbl_news_status_idx" ON "news" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tbl_news_category_idx" ON "news" USING btree ("category");--> statement-breakpoint
CREATE INDEX "tbl_news_created_at_idx" ON "news" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_news_updated_at_idx" ON "news" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_news_image_news_id_idx" ON "news_images" USING btree ("news_id");--> statement-breakpoint
CREATE INDEX "tbl_news_image_created_at_idx" ON "news_images" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_news_image_updated_at_idx" ON "news_images" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_translation_news_news_id_idx" ON "translation_news" USING btree ("news_id");--> statement-breakpoint
CREATE INDEX "tbl_translation_news_title_idx" ON "translation_news" USING btree ("title");--> statement-breakpoint
CREATE INDEX "tbl_translation_news_description_idx" ON "translation_news" USING btree ("description");--> statement-breakpoint
CREATE INDEX "tbl_translation_news_created_at_idx" ON "translation_news" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_translation_news_updated_at_idx" ON "translation_news" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_faq_add_by_staff_id_idx" ON "faq" USING btree ("add_by_staff_id");--> statement-breakpoint
CREATE INDEX "tbl_faq_updated_by_staff_id_idx" ON "faq" USING btree ("updated_by_staff_id");--> statement-breakpoint
CREATE INDEX "tbl_faq_status_idx" ON "faq" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tbl_faq_category_idx" ON "faq" USING btree ("category");--> statement-breakpoint
CREATE INDEX "tbl_faq_created_at_idx" ON "faq" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_faq_updated_at_idx" ON "faq" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_translation_faq_faq_id_idx" ON "translation_faq" USING btree ("faq_id");--> statement-breakpoint
CREATE INDEX "tbl_translation_faq_created_at_idx" ON "translation_faq" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_translation_faq_updated_at_idx" ON "translation_faq" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_apply_career_career_id_idx" ON "apply_careers" USING btree ("career_id");--> statement-breakpoint
CREATE INDEX "tbl_apply_career_job_title_idx" ON "apply_careers" USING btree ("is_view");--> statement-breakpoint
CREATE INDEX "tbl_apply_career_created_at_idx" ON "apply_careers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_apply_career_updated_at_idx" ON "apply_careers" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_career_add_by_staff_id_idx" ON "careers" USING btree ("add_by_staff_id");--> statement-breakpoint
CREATE INDEX "tbl_career_updated_by_staff_id_idx" ON "careers" USING btree ("updated_by_staff_id");--> statement-breakpoint
CREATE INDEX "tbl_career_department_idx" ON "careers" USING btree ("department");--> statement-breakpoint
CREATE INDEX "tbl_career_status_idx" ON "careers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tbl_career_job_type_idx" ON "careers" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "tbl_career_created_at_idx" ON "careers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_career_updated_at_idx" ON "careers" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_customer_image_customer_id_idx" ON "customer_images" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "tbl_customer_image_created_at_idx" ON "customer_images" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_customer_image_updated_at_idx" ON "customer_images" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_customer_information_career_id_idx" ON "customer_informations" USING btree ("apply_career_id");--> statement-breakpoint
CREATE INDEX "tbl_customer_information_email_idx" ON "customer_informations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "tbl_customer_information_phone_number_idx" ON "customer_informations" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "tbl_customer_information_created_at_idx" ON "customer_informations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_customer_information_updated_at_idx" ON "customer_informations" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_cv_customer_customer_id_idx" ON "cv_customers" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "tbl_cv_customer_created_at_idx" ON "cv_customers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_cv_customer_updated_at_idx" ON "cv_customers" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_education_customer_id_idx" ON "educations" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "tbl_education_created_at_idx" ON "educations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_education_updated_at_idx" ON "educations" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_experience_customer_id_idx" ON "experiences" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "tbl_experience_created_at_idx" ON "experiences" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_experience_updated_at_idx" ON "experiences" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_skill_customer_id_idx" ON "skills" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "tbl_skill_created_at_idx" ON "skills" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_skill_updated_at_idx" ON "skills" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_translation_career_career_id_idx" ON "translation_careers" USING btree ("career_id");--> statement-breakpoint
CREATE INDEX "tbl_translation_career_job_title_idx" ON "translation_careers" USING btree ("job_title");--> statement-breakpoint
CREATE INDEX "tbl_translation_career_location_idx" ON "translation_careers" USING btree ("location");--> statement-breakpoint
CREATE INDEX "tbl_translation_career_created_at_idx" ON "translation_careers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_translation_career_updated_at_idx" ON "translation_careers" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_bulletin_board_image_bulletin_board_id_idx" ON "bulletin_board_images" USING btree ("bulletin_board_id");--> statement-breakpoint
CREATE INDEX "tbl_bulletin_board_image_created_at_idx" ON "bulletin_board_images" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_bulletin_board_image_updated_at_idx" ON "bulletin_board_images" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_bulletin_board_add_by_staff_id_idx" ON "bulletin_boards" USING btree ("add_by_staff_id");--> statement-breakpoint
CREATE INDEX "tbl_bulletin_board_updated_by_staff_id_idx" ON "bulletin_boards" USING btree ("updated_by_staff_id");--> statement-breakpoint
CREATE INDEX "tbl_bulletin_board_priority_idx" ON "bulletin_boards" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "tbl_bulletin_board_status_idx" ON "bulletin_boards" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tbl_bulletin_board_created_at_idx" ON "bulletin_boards" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_bulletin_board_updated_at_idx" ON "bulletin_boards" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tbl_translation_bulletin_board_bulletin_board_id_idx" ON "translation_bulletin_boards" USING btree ("bulletin_board_id");--> statement-breakpoint
CREATE INDEX "tbl_translation_bulletin_board_name_idx" ON "translation_bulletin_boards" USING btree ("title");--> statement-breakpoint
CREATE INDEX "tbl_translation_bulletin_board_created_at_idx" ON "translation_bulletin_boards" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tbl_translation_bulletin_board_updated_at_idx" ON "translation_bulletin_boards" USING btree ("updated_at");