import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify')
  verify(@Body('token') token: string) {
    return this.authService.verifyShopifyToken(token);
  }

  @Post('refresh')
  refresh(@Body('token') token: string) {
    return this.authService.refresh(token);
  }
}
