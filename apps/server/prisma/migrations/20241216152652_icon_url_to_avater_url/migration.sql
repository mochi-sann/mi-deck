/*
  Warnings:

  - You are about to drop the column `icon_url` on the `user_info` table. All the data in the column will be lost.
  - Added the required column `avater_url` to the `user_info` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_info" DROP COLUMN "icon_url",
ADD COLUMN     "avater_url" TEXT NOT NULL;
