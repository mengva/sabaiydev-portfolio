-- Fix requirements and benefits columns to be simple text instead of arrays
ALTER TABLE "translation_careers" ALTER COLUMN "requirements" DROP NOT NULL;
ALTER TABLE "translation_careers" ALTER COLUMN "requirements" TYPE text USING array_to_string(requirements, ',');
ALTER TABLE "translation_careers" ALTER COLUMN "requirements" SET NOT NULL;

ALTER TABLE "translation_careers" ALTER COLUMN "benefits" DROP NOT NULL;
ALTER TABLE "translation_careers" ALTER COLUMN "benefits" TYPE text USING array_to_string(benefits, ',');
ALTER TABLE "translation_careers" ALTER COLUMN "benefits" SET NOT NULL;
