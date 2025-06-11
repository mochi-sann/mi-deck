import { execSync } from "node:child_process";

export default async () => {
  console.log("Global setup: Migrating database...");
  execSync("pnpm prisma migrate reset --force");
  execSync("pnpm prisma generate");
  console.log("Global setup: Seeding database...");
  execSync("pnpm prisma db seed -- --environment test");
};
