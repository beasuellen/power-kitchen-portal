import { Injectable } from '@nestjs/common';
@Injectable()
export class ReferralService {
  async getStats(cid: string) { return { totalSent: 8, successful: 2, pending: 1, totalEarned: 40 }; }
  async getReferralLink(cid: string) { return { link: `https://powerkitchen.ca/ref/${cid}` }; }
}
