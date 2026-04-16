import { Controller, Get, Post, Param } from '@nestjs/common';
import { GamificationService } from './gamification.service';
const CID = 'cust_001';
@Controller('gamification')
export class GamificationController {
  constructor(private svc: GamificationService) {}
  @Get('status')      getStatus()                                    { return this.svc.getStatus(CID); }
  @Get('challenges')  getChallenges()                                 { return this.svc.getChallenges(); }
  @Post('claim/:id')  claim(@Param('id') id: string)                  { return this.svc.claimReward(CID, id); }
  @Get('history')     getHistory()                                    { return this.svc.getHistory(CID); }
}
