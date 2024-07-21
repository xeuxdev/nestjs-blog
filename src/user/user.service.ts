import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';
import { APIResponse } from 'src/lib/response';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly db: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, name, password } = createUserDto;

    const user = await this.db.user.findUnique({
      where: {
        email: email.trim(),
      },
    });

    if (user) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      const newUser = await this.db.user.create({
        data: {
          email: email,
          password: hashedPassword,
          name: name,
        },
      });

      if (!newUser) {
        throw Error('something went wrong');
      }

      return APIResponse('Successfully Registered User', 201);
    } catch (error: any) {
      return APIResponse(error.message, 500);
    }
  }

  async login(loginDto: LoginUserDto) {
    const { email, password } = loginDto;

    try {
      const user = await this.db.user.findUnique({
        where: {
          email: email.trim(),
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
      }

      const token = await this.jwtService.signAsync({
        email: user.email,
        id: user.id,
      });

      const userInfo = {
        token,
        name: user.name,
        email: user.email,
        id: user.id,
      };

      return APIResponse('Login Successful', 200, userInfo);
    } catch (error: any) {
      console.log(error);
      return APIResponse(error.message, error.status);
    }
  }
}
