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
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "./auth.gurd";
import type { AuthService } from "./auth.service";
import type { LoginDto } from "./dto/login.dto";
import type { SignUpDto } from "./dto/sign-up.dto";
import { LoginEntity } from "./entities/login.entity";
import { MeEntity } from "./entities/me.entity";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    type: LoginEntity,
  })
  @ApiResponse({
    status: 401,
  })
  @Post("login")
  login(@Body() signInDto: LoginDto) {
    return this.authService.login(signInDto.email, signInDto.password);
  }
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 201,
    type: LoginEntity,
  })
  @ApiResponse({
    status: 401,
  })
  @ApiResponse({
    status: 409,
    description: "メールアドレスがコンフリクト",
  })
  @Post("signUp")
  signUp(@Body() signUpDto: SignUpDto) {
    console.log(
      ...[signUpDto, "👀 [auth.controller.ts:50]: signUpDto"].reverse(),
    );
    return this.authService.register(
      signUpDto.email,
      signUpDto.password,
      signUpDto.username,
    );
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    type: MeEntity,
  })
  @ApiResponse({
    status: 401,
  })
  @Get("me")
  getProfile(@Request() req) {
    return this.authService.me(req.user.id);
  }

  @Post("logout")
  logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }
}
