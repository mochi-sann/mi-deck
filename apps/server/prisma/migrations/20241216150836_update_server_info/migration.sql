/*
  Warnings:

  - You are about to drop the column `key` on the `server_info` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `server_info` table. All the data in the column will be lost.
  - You are about to drop the `panels` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `favicon_url` to the `server_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon_url` to the `server_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `server_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `software_name` to the `server_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `software_version` to the `server_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `theme_color` to the `server_info` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "panels" DROP CONSTRAINT "panels_server_session_id_fkey";

-- AlterTable
ALTER TABLE "server_info" DROP COLUMN "key",
DROP COLUMN "value",
ADD COLUMN     "favicon_url" TEXT NOT NULL,
ADD COLUMN     "icon_url" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "software_name" TEXT NOT NULL,
ADD COLUMN     "software_version" TEXT NOT NULL,
ADD COLUMN     "theme_color" TEXT NOT NULL;

-- DropTable
DROP TABLE "panels";

-- CreateTable
CREATE TABLE "panel" (
    "id" TEXT NOT NULL,
    "server_session_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "panel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "panel_server_session_id_idx" ON "panel"("server_session_id");

-- AddForeignKey
ALTER TABLE "panel" ADD CONSTRAINT "panel_server_session_id_fkey" FOREIGN KEY ("server_session_id") REFERENCES "server_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
