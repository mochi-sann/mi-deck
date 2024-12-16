-- CreateTable
CREATE TABLE "user_info" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "server_s_ession_id" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "user_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_info_server_s_ession_id_key" ON "user_info"("server_s_ession_id");

-- CreateIndex
CREATE INDEX "user_info_server_s_ession_id_idx" ON "user_info"("server_s_ession_id");

-- AddForeignKey
ALTER TABLE "user_info" ADD CONSTRAINT "user_info_server_s_ession_id_fkey" FOREIGN KEY ("server_s_ession_id") REFERENCES "server_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_info" ADD CONSTRAINT "user_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
