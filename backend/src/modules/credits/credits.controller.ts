import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreditsService } from './credits.service';
const CID = 'cust_001';
@Controller('credits')
export class CreditsController {
  constructor(private svc: CreditsService) {}
  @Get('balance')          getBalance()                          { return this.svc.getBalance(CID); }
  @Post('apply-gift-card') applyGift(@Body('code') code: string) { return this.svc.applyGiftCard(CID, code); }
  @Get('history')          getHistory()                          { return this.svc.getHistory(CID); }
}
