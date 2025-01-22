import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET, SOLT_ROUNDS } from "../../lib/env";
import { PrismaService } from "../../lib/prisma.service";
import { SignUpUserDto } from "./dto/sign-up-user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  private readonly jwtSecret = JWT_SECRET; // 必ず環境変数で管理すること
  private readonly saltRounds = SOLT_ROUNDS;
  generateToken(payload: object): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: "1h" });
  }

  async create(signUpUserDto: SignUpUserDto) {
    const { email, password } = signUpUserDto;

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // ユーザーを作成
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    return user;
  }
  async findUserByEmail(username: string) {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }
  async login(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // パスワードを検証
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // JWT を発行
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      this.jwtSecret,
      {
        expiresIn: "1h",
      },
    );

    return { token };
  }
  async getUserInfo(userId: string): Promise<{
    id: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }
}
