import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "src/lib/prisma.service";
import { UserService } from "../user/user.service";
import { LoginEntity } from "./entities/login.entity";
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
    const payload = { id: user.id, name: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(
    email: string,
    pass: string,
    username: string,
  ): Promise<LoginEntity> {
    const salt = bcrypt.genSaltSync(10);

    const hashedPassword = bcrypt.hashSync(pass, salt);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: username,
      },
    });
    const payload = { id: user.id, name: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
