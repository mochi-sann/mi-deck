import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { SignUpUserDto } from "./dto/sign-up-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("signup")
  create(@Body() signUpUserDto: SignUpUserDto) {
    return this.userService.create(signUpUserDto);
  }
}
