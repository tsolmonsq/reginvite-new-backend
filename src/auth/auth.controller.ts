import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const validatedUser = await this.authService.validateUser(email, password);
    if (!validatedUser) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(validatedUser);
  }
}
