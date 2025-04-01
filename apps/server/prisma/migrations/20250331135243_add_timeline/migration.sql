-- CreateEnum
CREATE TYPE "TimelineType" AS ENUM ('HOME', 'LOCAL', 'GLOBAL', 'LIST', 'USER', 'CHANNEL');

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
CREATE INDEX "timeline_server_session_id_idx" ON "timeline"("server_session_id");

-- AddForeignKey
ALTER TABLE "timeline" ADD CONSTRAINT "timeline_server_session_id_fkey" FOREIGN KEY ("server_session_id") REFERENCES "server_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
