import { Injectable, BadRequestException } from '@nestjs/common';
@Injectable()
export class CreditsService {
  private balances = new Map<string, number>([['cust_001', 12.50]]);
  async getBalance(cid: string) { return { balance: this.balances.get(cid) ?? 0, totalEarned: 60 }; }
  async applyGiftCard(cid: string, code: string) {
    // 1. Validate against Shopify API
    // 2. Store credit internally
    // 3. Apply on next billing
    if (!code?.trim()) throw new BadRequestException('Invalid gift card code');
    const credit = 25; // In production: Shopify validates and returns balance
    this.balances.set(cid, (this.balances.get(cid) ?? 0) + credit);
    return { success: true, creditAdded: credit, newBalance: this.balances.get(cid) };
  }
  async getHistory(cid: string) { return { history: [] }; }
}
