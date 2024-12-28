/*
  Warnings:

  - You are about to drop the column `software_name` on the `server_info` table. All the data in the column will be lost.
  - You are about to drop the column `software_version` on the `server_info` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "server_info" DROP COLUMN "software_name",
DROP COLUMN "software_version";
