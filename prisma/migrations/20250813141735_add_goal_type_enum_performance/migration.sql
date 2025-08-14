/*
  Warnings:

  - The values [Rendimento] on the enum `GoalType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."GoalType_new" AS ENUM ('Performance', 'Sports', 'FOBL');
ALTER TABLE "public"."Goal" ALTER COLUMN "type" TYPE "public"."GoalType_new" USING ("type"::text::"public"."GoalType_new");
ALTER TYPE "public"."GoalType" RENAME TO "GoalType_old";
ALTER TYPE "public"."GoalType_new" RENAME TO "GoalType";
DROP TYPE "public"."GoalType_old";
COMMIT;
