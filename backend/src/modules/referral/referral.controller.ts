import { Controller, Get } from '@nestjs/common';
import { ReferralService } from './referral.service';
const CID = 'cust_001';
@Controller('referral')
export class ReferralController {
  constructor(private svc: ReferralService) {}
  @Get('stats') getStats() { return this.svc.getStats(CID); }
  @Get('link')  getLink()  { return this.svc.getReferralLink(CID); }
}
