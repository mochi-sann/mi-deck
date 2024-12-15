import { Module } from "@nestjs/common";
import { PrismaService } from "src/lib/prisma.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
