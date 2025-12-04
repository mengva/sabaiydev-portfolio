ALTER TABLE "translation_careers" ALTER COLUMN "requirements" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "translation_careers" ALTER COLUMN "requirements" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "translation_careers" ALTER COLUMN "benefits" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "translation_careers" ALTER COLUMN "benefits" DROP NOT NULL;