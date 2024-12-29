/*
  Warnings:

  - A unique constraint covering the columns `[origin,user_id]` on the table `server_session` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "server_session_origin_user_id_key" ON "server_session"("origin", "user_id");
