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
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { SignUpDto } from "./dto/sign-up.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
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
    return this.authService.register(
      signUpDto.email,
      signUpDto.password,
      signUpDto.username,
    );
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get("me")
  getProfile(@Request() req) {
    return this.authService.me(req.user.id);
  }
}
