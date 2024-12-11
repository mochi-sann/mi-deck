-- CreateEnum
CREATE TYPE "ServerType" AS ENUM ('Misskey');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Login" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Login_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerSession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "oringin" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "serverType" "ServerType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Panels" (
    "id" SERIAL NOT NULL,
    "ServerSessionId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Panels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Login" ADD CONSTRAINT "Login_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerSession" ADD CONSTRAINT "ServerSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panels" ADD CONSTRAINT "Panels_ServerSessionId_fkey" FOREIGN KEY ("ServerSessionId") REFERENCES "ServerSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
