import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../lib/prisma.service";
import { UserService } from "../user/user.service";
import { LoginEntity } from "./entities/login.entity";
import { MeEntity } from "./entities/me.entity";
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(email: string, pass: string): Promise<LoginEntity> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }
    const isPasswordValid = await bcrypt.compare(pass, user.password);
    const { password, ...result } = user;
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }
    // TODO: Generate a JWT and return it here
    // instead of the user object
    const payload = { id: user.id, name: user.name, email: user.email };
    return new LoginEntity({
      accessToken: await this.jwtService.signAsync(payload),
    });
  }

  async register(
    email: string,
    pass: string,
    username: string,
  ): Promise<LoginEntity> {
    const salt = bcrypt.genSaltSync(10);

    const hashedPassword = bcrypt.hashSync(pass, salt);
    // 同じメールアドレスが登録されていないか確認
    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });
    if (userExists) {
      throw new ConflictException();
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: username,
      },
    });
    const payload = { id: user.id, name: user.name, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        id: true,
      },
    });
    return new MeEntity(user);
  }
  async logout(userId: string) {
    // ログアウト処理
    return { message: "ログアウトしました" };
  }
}
