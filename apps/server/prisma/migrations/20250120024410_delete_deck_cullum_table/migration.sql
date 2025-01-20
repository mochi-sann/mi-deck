/*
  Warnings:

  - You are about to drop the `DeckColumn` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeckColumn" DROP CONSTRAINT "DeckColumn_ColumnId_fkey";

-- DropForeignKey
ALTER TABLE "DeckColumn" DROP CONSTRAINT "DeckColumn_DeckId_fkey";

-- DropTable
DROP TABLE "DeckColumn";
