import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async verifyShopifyToken(shopifyToken: string) {
    // Validate against Shopify customer API
    // In production: POST to Shopify's customer identity endpoint
    if (!shopifyToken) throw new UnauthorizedException('Missing token');

    // Return signed internal JWT
    const payload = { customerId: 'cust_001', email: 'sarah@example.com' };
    return { accessToken: this.jwt.sign(payload), ...payload };
  }

  async refresh(token: string) {
    try {
      const payload = this.jwt.verify(token);
      const newToken = this.jwt.sign({ customerId: payload.customerId, email: payload.email });
      return { accessToken: newToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
