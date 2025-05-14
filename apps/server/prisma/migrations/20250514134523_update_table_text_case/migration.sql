/*
  Warnings:

  - You are about to drop the `panel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `server_info` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `server_session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `timeline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_info` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_setting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "panel" DROP CONSTRAINT "panel_server_session_id_fkey";

-- DropForeignKey
ALTER TABLE "server_info" DROP CONSTRAINT "server_info_server_session_id_fkey";

-- DropForeignKey
ALTER TABLE "server_session" DROP CONSTRAINT "server_session_user_id_fkey";

-- DropForeignKey
ALTER TABLE "timeline" DROP CONSTRAINT "timeline_server_session_id_fkey";

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
DROP TABLE "timeline";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "user_info";

-- DropTable
DROP TABLE "user_setting";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userRole" "UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "serverToken" TEXT NOT NULL,
    "serverType" "ServerType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerInfo" (
    "id" TEXT NOT NULL,
    "serverSessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "faviconUrl" TEXT NOT NULL,
    "themeColor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServerInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInfo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "serverSEssionId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "UserInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Panel" (
    "id" TEXT NOT NULL,
    "serverSessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Panel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timeline" (
    "id" TEXT NOT NULL,
    "serverSessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TimelineType" NOT NULL,
    "listId" TEXT,
    "channelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserSetting_userId_idx" ON "UserSetting"("userId");

-- CreateIndex
CREATE INDEX "ServerSession_userId_idx" ON "ServerSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ServerSession_origin_userId_key" ON "ServerSession"("origin", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ServerInfo_serverSessionId_key" ON "ServerInfo"("serverSessionId");

-- CreateIndex
CREATE INDEX "ServerInfo_serverSessionId_idx" ON "ServerInfo"("serverSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInfo_serverSEssionId_key" ON "UserInfo"("serverSEssionId");

-- CreateIndex
CREATE INDEX "UserInfo_serverSEssionId_idx" ON "UserInfo"("serverSEssionId");

-- CreateIndex
CREATE INDEX "Panel_serverSessionId_idx" ON "Panel"("serverSessionId");

-- CreateIndex
CREATE INDEX "Timeline_serverSessionId_idx" ON "Timeline"("serverSessionId");

-- AddForeignKey
ALTER TABLE "UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerSession" ADD CONSTRAINT "ServerSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerInfo" ADD CONSTRAINT "ServerInfo_serverSessionId_fkey" FOREIGN KEY ("serverSessionId") REFERENCES "ServerSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_serverSEssionId_fkey" FOREIGN KEY ("serverSEssionId") REFERENCES "ServerSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panel" ADD CONSTRAINT "Panel_serverSessionId_fkey" FOREIGN KEY ("serverSessionId") REFERENCES "ServerSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_serverSessionId_fkey" FOREIGN KEY ("serverSessionId") REFERENCES "ServerSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
