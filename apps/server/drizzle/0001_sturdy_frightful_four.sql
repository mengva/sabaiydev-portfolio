ALTER TYPE "public"."career_type_enum" ADD VALUE 'TEMPORARY';--> statement-breakpoint
ALTER TYPE "public"."career_type_enum" ADD VALUE 'VOLUNTEER';--> statement-breakpoint
ALTER TABLE "careers" ALTER COLUMN "department" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."career_department_enum";--> statement-breakpoint
CREATE TYPE "public"."career_department_enum" AS ENUM('ENGINEERING', 'MARKETING', 'SALES', 'DESIGN', 'HR', 'FINANCE', 'OPERATIONS', 'CUSTOMER_SUPPORT', 'PRODUCT_MANAGEMENT', 'LEGAL');--> statement-breakpoint
ALTER TABLE "careers" ALTER COLUMN "department" SET DATA TYPE "public"."career_department_enum" USING "department"::"public"."career_department_enum";--> statement-breakpoint
ALTER TABLE "careers" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."career_status_enum";--> statement-breakpoint
CREATE TYPE "public"."career_status_enum" AS ENUM('OPEN', 'CLOSED', 'PAUSED');--> statement-breakpoint
ALTER TABLE "careers" ALTER COLUMN "status" SET DATA TYPE "public"."career_status_enum" USING "status"::"public"."career_status_enum";--> statement-breakpoint
ALTER TABLE "customer_informations" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "customer_informations" ALTER COLUMN "status" SET DEFAULT 'APPLY'::text;--> statement-breakpoint
DROP TYPE "public"."customer_status_enum";--> statement-breakpoint
CREATE TYPE "public"."customer_status_enum" AS ENUM('APPLY', 'REVIEW', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED');--> statement-breakpoint
ALTER TABLE "customer_informations" ALTER COLUMN "status" SET DEFAULT 'APPLY'::"public"."customer_status_enum";--> statement-breakpoint
ALTER TABLE "customer_informations" ALTER COLUMN "status" SET DATA TYPE "public"."customer_status_enum" USING "status"::"public"."customer_status_enum";