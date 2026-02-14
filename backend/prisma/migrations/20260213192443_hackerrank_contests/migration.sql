/*
  Warnings:

  - You are about to drop the column `token` on the `ContestSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `tokens` on the `ContestSubmission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "hackerRankUrl" TEXT;

-- AlterTable
ALTER TABLE "ContestSubmission" DROP COLUMN "token",
DROP COLUMN "tokens";
