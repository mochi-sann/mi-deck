import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../lib/prisma.service";
import { SignUpDto } from "./dto/sign-up.dto"; // Assuming SignUpDto defines the structure needed

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(userId: string): Promise<Omit<User, "password"> | null> {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true, // Include other non-sensitive fields as needed
        updatedAt: true,
        userRole: true,
      },
    });
  }

  async createUser(signUpDto: SignUpDto): Promise<User> {
    const { email, password, username } = signUpDto;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: username,
      },
    });
  }
}
