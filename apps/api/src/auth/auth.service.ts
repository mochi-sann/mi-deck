import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class AuthService {
  private readonly secret = "your-secret-key"; // 必ず環境変数で管理すること
  private readonly saltRounds = 10;

  generateToken(payload: object): string {
    return jwt.sign(payload, this.secret, { expiresIn: "1h" });
  }
  async register(email: string, password: string) {
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // ユーザーを作成
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
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
  verifyToken(token: string): jwt.JwtPayload | string | null {
    try {
      return jwt.verify(token, this.secret);
    } catch {
      return null;
    }
  }
}
