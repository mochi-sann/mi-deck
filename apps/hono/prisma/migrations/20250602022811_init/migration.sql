-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "ServerType" AS ENUM ('Misskey', 'OtherServer');

-- CreateEnum
CREATE TYPE "TimelineType" AS ENUM ('HOME', 'LOCAL', 'GLOBAL', 'LIST', 'USER', 'CHANNEL');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_role" "UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_setting" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "server_session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "server_token" TEXT NOT NULL,
    "server_type" "ServerType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "server_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "server_info" (
    "id" TEXT NOT NULL,
    "server_session_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon_url" TEXT NOT NULL,
    "favicon_url" TEXT NOT NULL,
    "theme_color" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "server_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_info" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avater_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "server_s_ession_id" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "user_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panel" (
    "id" TEXT NOT NULL,
    "server_session_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "panel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline" (
    "id" TEXT NOT NULL,
    "server_session_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TimelineType" NOT NULL,
    "list_id" TEXT,
    "channel_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_setting_user_id_idx" ON "user_setting"("user_id");

-- CreateIndex
CREATE INDEX "server_session_user_id_idx" ON "server_session"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "server_session_origin_user_id_key" ON "server_session"("origin", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "server_info_server_session_id_key" ON "server_info"("server_session_id");

-- CreateIndex
CREATE INDEX "server_info_server_session_id_idx" ON "server_info"("server_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_info_server_s_ession_id_key" ON "user_info"("server_s_ession_id");

-- CreateIndex
CREATE INDEX "user_info_server_s_ession_id_idx" ON "user_info"("server_s_ession_id");

-- CreateIndex
CREATE INDEX "panel_server_session_id_idx" ON "panel"("server_session_id");

-- CreateIndex
CREATE INDEX "timeline_server_session_id_idx" ON "timeline"("server_session_id");

-- AddForeignKey
ALTER TABLE "user_setting" ADD CONSTRAINT "user_setting_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_session" ADD CONSTRAINT "server_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_info" ADD CONSTRAINT "server_info_server_session_id_fkey" FOREIGN KEY ("server_session_id") REFERENCES "server_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_info" ADD CONSTRAINT "user_info_server_s_ession_id_fkey" FOREIGN KEY ("server_s_ession_id") REFERENCES "server_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_info" ADD CONSTRAINT "user_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panel" ADD CONSTRAINT "panel_server_session_id_fkey" FOREIGN KEY ("server_session_id") REFERENCES "server_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline" ADD CONSTRAINT "timeline_server_session_id_fkey" FOREIGN KEY ("server_session_id") REFERENCES "server_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
