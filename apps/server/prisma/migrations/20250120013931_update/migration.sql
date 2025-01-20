/*
  Warnings:

  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cached_note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `column` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deck` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deck_column` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `instance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_instance_id_fkey";

-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_user_id_fkey";

-- DropForeignKey
ALTER TABLE "column" DROP CONSTRAINT "column_deck_id_fkey";

-- DropForeignKey
ALTER TABLE "column" DROP CONSTRAINT "column_instance_id_fkey";

-- DropForeignKey
ALTER TABLE "column" DROP CONSTRAINT "column_user_id_fkey";

-- DropForeignKey
ALTER TABLE "deck" DROP CONSTRAINT "deck_user_id_fkey";

-- DropForeignKey
ALTER TABLE "deck_column" DROP CONSTRAINT "deck_column_column_id_fkey";

-- DropForeignKey
ALTER TABLE "deck_column" DROP CONSTRAINT "deck_column_deck_id_fkey";

-- DropTable
DROP TABLE "account";

-- DropTable
DROP TABLE "cached_note";

-- DropTable
DROP TABLE "column";

-- DropTable
DROP TABLE "deck";

-- DropTable
DROP TABLE "deck_column";

-- DropTable
DROP TABLE "instance";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "User" (
    "Id" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Account" (
    "Id" TEXT NOT NULL,
    "UserId" TEXT NOT NULL,
    "InstanceId" TEXT NOT NULL,
    "Token" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Instance" (
    "Id" TEXT NOT NULL,
    "Host" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instance_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Column" (
    "Id" TEXT NOT NULL,
    "UserId" TEXT NOT NULL,
    "DeckId" TEXT NOT NULL,
    "InstanceId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Type" "ColumnType" NOT NULL,
    "Params" JSONB,
    "Order" INTEGER NOT NULL,
    "Width" INTEGER DEFAULT 300,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Column_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Deck" (
    "Id" TEXT NOT NULL,
    "UserId" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Order" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "DeckColumn" (
    "Id" TEXT NOT NULL,
    "DeckId" TEXT NOT NULL,
    "ColumnId" TEXT NOT NULL,

    CONSTRAINT "DeckColumn_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "CachedNote" (
    "Id" TEXT NOT NULL,
    "UserId" TEXT NOT NULL,
    "Text" TEXT,
    "Cw" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3),
    "ReplyId" TEXT,
    "RenoteId" TEXT,
    "Visibility" TEXT,
    "Emojis" JSONB,
    "FileIds" JSONB,
    "Files" JSONB,
    "Tags" JSONB,
    "Poll" JSONB,
    "User" JSONB,
    "Instance" TEXT,

    CONSTRAINT "CachedNote_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Username_key" ON "User"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "Account_UserId_InstanceId_key" ON "Account"("UserId", "InstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Instance_Host_key" ON "Instance"("Host");

-- CreateIndex
CREATE UNIQUE INDEX "DeckColumn_DeckId_ColumnId_key" ON "DeckColumn"("DeckId", "ColumnId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_InstanceId_fkey" FOREIGN KEY ("InstanceId") REFERENCES "Instance"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_DeckId_fkey" FOREIGN KEY ("DeckId") REFERENCES "Deck"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_InstanceId_fkey" FOREIGN KEY ("InstanceId") REFERENCES "Instance"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckColumn" ADD CONSTRAINT "DeckColumn_DeckId_fkey" FOREIGN KEY ("DeckId") REFERENCES "Deck"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckColumn" ADD CONSTRAINT "DeckColumn_ColumnId_fkey" FOREIGN KEY ("ColumnId") REFERENCES "Column"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
