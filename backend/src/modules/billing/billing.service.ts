import { Injectable } from '@nestjs/common';
@Injectable()
export class BillingService {
  async getHistory(cid: string) { return { history: [] }; }
  async getReceipt(cid: string, id: string) { return { id, downloadUrl: `/api/billing/${id}/receipt.pdf` }; }
}
