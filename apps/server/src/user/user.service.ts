import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SignUpUserDto } from "./dto/sign-up-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

const prisma = new PrismaClient();
export const JWT_SECRET = process.env.JWT_SECRET || ("DEV_SERCRET" as const);
@Injectable()
export class UserService {
  private readonly jwtSecret = JWT_SECRET; // 必ず環境変数で管理すること
  private readonly saltRounds = 10;
  generateToken(payload: object): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: "1h" });
  }

  async create(signUpUserDto: SignUpUserDto) {
    const { email, password } = signUpUserDto;

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // ユーザーを作成
    const user = prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    return user;
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
  async getUserInfo(UserId: number) {
    const User = await prisma.user.findUnique({
      where: {
        id: UserId,
      },
      select: {
        email: true,
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return User;
  }

  findAll() {
    return "This action returns all user";
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
