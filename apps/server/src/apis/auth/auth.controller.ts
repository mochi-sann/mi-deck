import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "./auth.gurd";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { SignUpDto } from "./dto/sign-up.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post("login")
  login(@Body() signInDto: LoginDto) {
    return this.authService.login(signInDto.email, signInDto.password);
  }
  @HttpCode(HttpStatus.OK)
  @Post("signUp")
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.register(
      signUpDto.email,
      signUpDto.password,
      signUpDto.username,
    );
  }

  @UseGuards(AuthGuard)
  @Get("me")
  getProfile(@Request() req) {
    return req.user;
  }
}
