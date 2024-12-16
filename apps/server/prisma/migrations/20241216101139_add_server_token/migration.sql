/*
  Warnings:

  - You are about to drop the column `token` on the `server_session` table. All the data in the column will be lost.
  - Added the required column `server_token` to the `server_session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "server_session" DROP COLUMN "token",
ADD COLUMN     "server_token" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "server_info" (
    "id" TEXT NOT NULL,
    "server_session_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "server_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "server_info_server_session_id_idx" ON "server_info"("server_session_id");

-- AddForeignKey
ALTER TABLE "server_info" ADD CONSTRAINT "server_info_server_session_id_fkey" FOREIGN KEY ("server_session_id") REFERENCES "server_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
