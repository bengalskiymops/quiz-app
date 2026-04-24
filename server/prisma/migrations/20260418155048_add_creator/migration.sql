/*
  Warnings:

  - Added the required column `creatorId` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "creatorId" INTEGER NOT NULL;
