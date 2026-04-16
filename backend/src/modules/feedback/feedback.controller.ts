import { Controller, Get, Post, Body } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
const CID = 'cust_001';
@Controller('feedback')
export class FeedbackController {
  constructor(private svc: FeedbackService) {}
  @Post('rate')   rate(@Body() body: { orderId: string; ratings: any[] }) { return this.svc.submitRatings(CID, body.orderId, body.ratings); }
  @Get('history') getHistory() { return this.svc.getHistory(CID); }
}
