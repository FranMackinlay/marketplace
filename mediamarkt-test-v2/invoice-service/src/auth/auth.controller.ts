import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(await this.authService.validateUser(body.email, body.password));
  }
}
