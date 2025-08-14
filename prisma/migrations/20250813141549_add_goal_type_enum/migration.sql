/*
  Warnings:

  - Changed the type of `type` on the `Goal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."GoalType" AS ENUM ('Rendimento', 'Sports', 'FOBL');

-- AlterTable
ALTER TABLE "public"."Goal" DROP COLUMN "type",
ADD COLUMN     "type" "public"."GoalType" NOT NULL;
