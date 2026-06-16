/*
  Warnings:

  - You are about to drop the column `rawText` on the `KnowledgeBase` table. All the data in the column will be lost.
  - Added the required column `chunkIndex` to the `KnowledgeBase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chunkText` to the `KnowledgeBase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KnowledgeBase" DROP COLUMN "rawText",
ADD COLUMN     "chunkIndex" INTEGER NOT NULL,
ADD COLUMN     "chunkText" TEXT NOT NULL;
