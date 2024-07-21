import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/lib/zod';
import { CreateUserDto, createUserSchema } from './dto/create-user.dto';
import { LoginUserDto, loginUserSchema } from './dto/login.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(createUserSchema, 'Invalid Credentials'))
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginUserSchema, 'Invalid Credentials'))
  login(@Body() loginDto: LoginUserDto) {
    return this.userService.login(loginDto);
  }
}
