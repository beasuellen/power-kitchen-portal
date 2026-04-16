import { Controller, Get, Put, Post, Body } from '@nestjs/common';
import { CustomerService } from './customer.service';
const CID = 'cust_001';
@Controller('customer')
export class CustomerController {
  constructor(private svc: CustomerService) {}
  @Get('address')         getAddress()              { return this.svc.getAddress(CID); }
  @Put('address')         updateAddress(@Body() dto: any) { return this.svc.updateAddress(CID, dto); }
  @Post('payment-update') triggerPayment()           { return this.svc.triggerPaymentUpdate(CID); }
}
