/*
  Warnings:

  - Added the required column `organizerId` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "isOrganizer" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "organizerId" INTEGER NOT NULL,
ADD COLUMN     "quizId" INTEGER NOT NULL;
