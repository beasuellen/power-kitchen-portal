import { Controller, Get, Param } from '@nestjs/common';
import { BillingService } from './billing.service';
const CID = 'cust_001';
@Controller('billing')
export class BillingController {
  constructor(private svc: BillingService) {}
  @Get('history')        getHistory()                     { return this.svc.getHistory(CID); }
  @Get(':id/receipt')    getReceipt(@Param('id') id: string) { return this.svc.getReceipt(CID, id); }
}
