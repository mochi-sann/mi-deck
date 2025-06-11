/*
  Warnings:

  - A unique constraint covering the columns `[user_id,origin,misskey_user_id]` on the table `server_session` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "server_session_origin_user_id_misskey_user_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "server_session_user_id_origin_misskey_user_id_key" ON "server_session"("user_id", "origin", "misskey_user_id");
