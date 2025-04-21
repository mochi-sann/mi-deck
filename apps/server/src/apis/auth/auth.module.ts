import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JWT_SECRET } from "../../lib/env";
import { PrismaService } from "../../lib/prisma.service";
// UserService might still be needed if AuthController uses it, or for other potential future uses.
// If UserService is ONLY used for DB access now moved to AuthRepository, it could be removed here.
// Keep it for now unless certain it's unused within this module scope.
import { UserService } from "../user/user.service";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository"; // Import the repository
import { AuthService } from "./auth.service";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: "60d" },
    }),
  ],
  controllers: [AuthController],
  // Add AuthRepository to providers. PrismaService is needed by AuthRepository.
  providers: [AuthService, AuthRepository, UserService, PrismaService],
})
export class AuthModule {}
