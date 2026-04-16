import { Injectable } from '@nestjs/common';
@Injectable()
export class SubscriptionService {
  async getSubscription(customerId: string) { return { customerId, status: 'active' }; }
  async getOrders(customerId: string) { return { customerId, orders: [] }; }
  async updateSettings(customerId: string, dto: any) { return { success: true, ...dto }; }
  async pause(customerId: string, dto: { reason: string; offerAccepted?: boolean }) {
    return { status: 'paused', reason: dto.reason, offerAccepted: dto.offerAccepted ?? false };
  }
  async cancel(customerId: string, dto: { reason: string; offerAccepted?: boolean }) {
    return { status: 'cancelled', reason: dto.reason, offerAccepted: dto.offerAccepted ?? false };
  }
  async reactivate(customerId: string) { return { status: 'active' }; }
}
