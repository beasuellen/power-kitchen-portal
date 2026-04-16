import { Controller, Get, Patch, Post, Body } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
const CID = 'cust_001';
@Controller('subscription')
export class SubscriptionController {
  constructor(private svc: SubscriptionService) {}
  @Get()          get()                     { return this.svc.getSubscription(CID); }
  @Get('orders')  getOrders()               { return this.svc.getOrders(CID); }
  @Patch('settings') update(@Body() dto: any) { return this.svc.updateSettings(CID, dto); }
  @Post('pause')  pause(@Body() dto: any)   { return this.svc.pause(CID, dto); }
  @Post('cancel') cancel(@Body() dto: any)  { return this.svc.cancel(CID, dto); }
  @Post('reactivate') reactivate()          { return this.svc.reactivate(CID); }
}
