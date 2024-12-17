/*
  Warnings:

  - A unique constraint covering the columns `[server_session_id]` on the table `server_info` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "server_info_server_session_id_key" ON "server_info"("server_session_id");
