/*
  Warnings:

  - You are about to drop the `Login` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Panels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServerSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Login" DROP CONSTRAINT "Login_userId_fkey";

-- DropForeignKey
ALTER TABLE "Panels" DROP CONSTRAINT "Panels_ServerSessionId_fkey";

-- DropForeignKey
ALTER TABLE "ServerSession" DROP CONSTRAINT "ServerSession_userId_fkey";

-- DropTable
DROP TABLE "Login";

-- DropTable
DROP TABLE "Panels";

-- DropTable
DROP TABLE "ServerSession";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER,

    CONSTRAINT "login_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "server_session" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "oringin" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "server_type" "ServerType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "server_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panels" (
    "id" SERIAL NOT NULL,
    "server_session_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "panels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "login" ADD CONSTRAINT "login_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_session" ADD CONSTRAINT "server_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panels" ADD CONSTRAINT "panels_server_session_id_fkey" FOREIGN KEY ("server_session_id") REFERENCES "server_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
