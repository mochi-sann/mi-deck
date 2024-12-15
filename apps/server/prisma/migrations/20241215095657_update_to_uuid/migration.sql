/*
  Warnings:

  - The primary key for the `panels` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `server_session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `oringin` on the `server_session` table. All the data in the column will be lost.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_setting` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `origin` to the `server_session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ServerType" ADD VALUE 'OtherServer';

-- DropForeignKey
ALTER TABLE "panels" DROP CONSTRAINT "panels_server_session_id_fkey";

-- DropForeignKey
ALTER TABLE "server_session" DROP CONSTRAINT "server_session_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_setting" DROP CONSTRAINT "user_setting_user_id_fkey";

-- AlterTable
ALTER TABLE "panels" DROP CONSTRAINT "panels_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "server_session_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "panels_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "panels_id_seq";

-- AlterTable
ALTER TABLE "server_session" DROP CONSTRAINT "server_session_pkey",
DROP COLUMN "oringin",
ADD COLUMN     "origin" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "server_session_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "server_session_id_seq";

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_id_seq";

-- AlterTable
ALTER TABLE "user_setting" DROP CONSTRAINT "user_setting_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_setting_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_setting_id_seq";

-- CreateIndex
CREATE INDEX "panels_server_session_id_idx" ON "panels"("server_session_id");

-- CreateIndex
CREATE INDEX "server_session_user_id_idx" ON "server_session"("user_id");

-- CreateIndex
CREATE INDEX "user_setting_user_id_idx" ON "user_setting"("user_id");

-- AddForeignKey
ALTER TABLE "user_setting" ADD CONSTRAINT "user_setting_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_session" ADD CONSTRAINT "server_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panels" ADD CONSTRAINT "panels_server_session_id_fkey" FOREIGN KEY ("server_session_id") REFERENCES "server_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
