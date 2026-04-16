import { Controller, Get, Put, Body } from '@nestjs/common';
import { DietaryService } from './dietary.service';
const CID = 'cust_001';
@Controller('dietary')
export class DietaryController {
  constructor(private svc: DietaryService) {}
  @Get('restrictions') getRestrictions() { return this.svc.getRestrictions(CID); }
  @Put('restrictions') updateRestrictions(@Body() body: { restrictions: string[] }) { return this.svc.updateRestrictions(CID, body.restrictions); }
  @Get('avoid-list')   getAvoidList()    { return this.svc.getAvoidList(CID); }
  @Put('avoid-list')   updateAvoidList(@Body() body: { avoidList: string[] }) { return this.svc.updateAvoidList(CID, body.avoidList); }
}
