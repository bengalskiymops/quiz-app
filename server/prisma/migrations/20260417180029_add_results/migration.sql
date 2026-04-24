/*
  Warnings:

  - You are about to drop the column `name` on the `Result` table. All the data in the column will be lost.
  - Added the required column `place` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Result" DROP COLUMN "name",
ADD COLUMN     "place" INTEGER NOT NULL,
ADD COLUMN     "room" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;
