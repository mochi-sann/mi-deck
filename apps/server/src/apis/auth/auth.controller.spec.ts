import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vitest } from "vitest";
import { PrismaService } from "../../lib/prisma.service";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.gurd";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockJwtService = {
    sign: vitest.fn(),
    verify: vitest.fn(),
  };

  const mockAuthGuard = {
    canActivate: vitest.fn(() => true),
  };

  const mockPrismaService = {
    user: {
      findUnique: vitest.fn(),
      create: vitest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuthGuard, useValue: mockAuthGuard },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(authService).toBeDefined();
  });
});
