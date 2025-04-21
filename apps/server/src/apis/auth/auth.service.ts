import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthRepository } from "./auth.repository"; // Import the repository
import { LoginEntity } from "./entities/login.entity";
import { MeEntity } from "./entities/me.entity";

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository, // Inject the repository
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string): Promise<LoginEntity> {
    const user = await this.authRepository.findUserByEmail(email); // Use repository
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(pass, user.password);
    // const { password, ...result } = user; // This line is removed as 'result' is not used and password should not be exposed
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }
    // Generate JWT
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
    // Check if user already exists
    const userExists = await this.authRepository.findUserByEmail(email); // Use repository
    if (userExists) {
      throw new ConflictException("Email already registered");
    }

    // Create user using repository (repository handles hashing)
    const user = await this.authRepository.createUser({
      email,
      password: pass, // Pass plain password to repository
      username,
    });

    // Generate JWT
    const payload = { id: user.id, name: user.name, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async me(userId: string): Promise<MeEntity> {
    const user = await this.authRepository.findUserById(userId); // Use repository
    if (!user) {
      // This case should ideally not happen if JWT validation is correct
      throw new NotFoundException("User not found");
    }
    // Ensure MeEntity constructor can handle the selected fields
    // If MeEntity expects fields not selected in findUserById, adjust the repository method or MeEntity
    return new MeEntity(user);
  }

  async logout(userId: string) {
    // ログアウト処理
    return { message: "ログアウトしました" };
  }
}
