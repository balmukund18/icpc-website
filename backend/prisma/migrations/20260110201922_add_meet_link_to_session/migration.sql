/*
  Warnings:

  - Added the required column `meetLink` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "meetLink" TEXT NOT NULL;
