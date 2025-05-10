import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { users } from "~/db/schema";
import { DrizzleService } from "../../lib/drizzle.service";
import { JWT_SECRET, SOLT_ROUNDS } from "../../lib/env";
import { SignUpUserDto } from "./dto/sign-up-user.dto";

@Injectable()
export class UserService {
  constructor(private drizzle: DrizzleService) {} // PrismaService を DrizzleService に変更
  private readonly jwtSecret = JWT_SECRET; // 必ず環境変数で管理すること
  private readonly saltRounds = SOLT_ROUNDS;

  generateToken(payload: object): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: "1h" });
  }

  async create(signUpUserDto: SignUpUserDto) {
    const { email, password } = signUpUserDto;

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // ユーザーを作成
    const result = await this.drizzle.db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        // name: は SignUpUserDto に存在しないためコメントアウトまたは削除
        // id は自動生成される想定
      })
      .returning();
    return result[0];
  }

  async findUserByEmail(email: string) {
    // return await this.drizzle.db.select().from(users).where(eq(users.email, email)).limit(1).then(res => res[0]);
    return await this.drizzle.db.query.users.findFirst({
      where: eq(users.email, email),
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
  async getUserInfo(userId: string) {
    // Drizzleでは select() で明示的にカラムを指定するか、リレーションを使わない場合は全カラムが返る
    // query API を使うとより Prisma に近い形で書ける
    const user = await this.drizzle.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        // Prismaのselectに相当
        email: true,
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }
}
