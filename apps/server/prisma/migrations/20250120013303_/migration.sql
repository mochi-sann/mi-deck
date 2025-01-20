/*
  Warnings:

  - You are about to drop the `panel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `server_info` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `server_session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_info` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_setting` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ColumnType" AS ENUM ('HOME', 'LOCAL_TIMELINE', 'SOCIAL_TIMELINE', 'GLOBAL_TIMELINE', 'NOTIFICATIONS', 'DIRECT_MESSAGES', 'LIST', 'SEARCH', 'HASHTAG', 'USER', 'ANTENNA', 'CHANNEL', 'CLIP', 'GALLERY', 'PAGE');

-- DropForeignKey
ALTER TABLE "panel" DROP CONSTRAINT "panel_server_session_id_fkey";

-- DropForeignKey
ALTER TABLE "server_info" DROP CONSTRAINT "server_info_server_session_id_fkey";

-- DropForeignKey
ALTER TABLE "server_session" DROP CONSTRAINT "server_session_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_info" DROP CONSTRAINT "user_info_server_s_ession_id_fkey";

-- DropForeignKey
ALTER TABLE "user_info" DROP CONSTRAINT "user_info_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_setting" DROP CONSTRAINT "user_setting_user_id_fkey";

-- DropTable
DROP TABLE "panel";

-- DropTable
DROP TABLE "server_info";

-- DropTable
DROP TABLE "server_session";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "user_info";

-- DropTable
DROP TABLE "user_setting";

-- DropEnum
DROP TYPE "ServerType";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instance" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Column" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ColumnType" NOT NULL,
    "params" JSONB,
    "order" INTEGER NOT NULL,
    "width" INTEGER DEFAULT 300,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Column_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeckColumn" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,

    CONSTRAINT "DeckColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT,
    "cw" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "replyId" TEXT,
    "renoteId" TEXT,
    "visibility" TEXT,
    "emojis" JSONB,
    "fileIds" JSONB,
    "files" JSONB,
    "tags" JSONB,
    "poll" JSONB,
    "user" JSONB,
    "instance" TEXT,

    CONSTRAINT "CachedNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_instanceId_key" ON "Account"("userId", "instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Instance_host_key" ON "Instance"("host");

-- CreateIndex
CREATE UNIQUE INDEX "DeckColumn_deckId_columnId_key" ON "DeckColumn"("deckId", "columnId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckColumn" ADD CONSTRAINT "DeckColumn_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckColumn" ADD CONSTRAINT "DeckColumn_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE CASCADE ON UPDATE CASCADE;
