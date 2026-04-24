/*
  Warnings:

  - You are about to drop the column `userId` on the `Result` table. All the data in the column will be lost.
  - Added the required column `options` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizId` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "options" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "userId",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "quizId" INTEGER NOT NULL;
