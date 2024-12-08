/*
  Warnings:

  - You are about to drop the `login` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `password` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "login" DROP CONSTRAINT "login_user_id_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "password" TEXT NOT NULL;

-- DropTable
DROP TABLE "login";
