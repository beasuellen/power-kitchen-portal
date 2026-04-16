import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

export type ChangeType = 'add' | 'remove' | 'quantity' | 'swap';

export interface OrderChange {
  type: ChangeType;
  mealId?: string;
  from?: string;
  to?: string;
  newQty?: number;
}

export interface BatchChangesDto {
  orderId: string;
  changes: OrderChange[];
}

@Injectable()
export class OrdersService {
  // In production these come from Appstle + Shopify APIs
  async getOrders(customerId: string) {
    return { customerId, orders: [] };
  }

  async getOrder(customerId: string, orderId: string) {
    return { customerId, orderId };
  }

  /**
   * Core batch changes processor — the single most important endpoint.
   * Receives all draft changes at once, validates, then executes sequentially
   * against Appstle API. If any change fails, all previous changes are rolled back.
   */
  async applyBatchChanges(customerId: string, { orderId, changes }: BatchChangesDto) {
    if (!changes || changes.length === 0) {
      throw new BadRequestException('No changes provided');
    }

    const results: { change: OrderChange; status: 'applied' | 'failed'; error?: string }[] = [];
    const applied: OrderChange[] = [];

    for (const change of changes) {
      try {
        await this.applyChange(customerId, orderId, change);
        results.push({ change, status: 'applied' });
        applied.push(change);
      } catch (err: any) {
        // Rollback all previously applied changes
        await this.rollback(customerId, orderId, applied);
        return {
          success: false,
          appliedCount: 0,
          failedChange: change,
          error: err.message,
          results,
        };
      }
    }

    return {
      success: true,
      appliedCount: applied.length,
      results,
    };
  }

  private async applyChange(customerId: string, orderId: string, change: OrderChange) {
    // In production: call Appstle API for each change type
    switch (change.type) {
      case 'add':
        // POST /appstle/subscriptions/:id/add-item  { mealId, qty: 1 }
        break;
      case 'remove':
        // DELETE /appstle/subscriptions/:id/items/:mealId
        break;
      case 'quantity':
        // PATCH /appstle/subscriptions/:id/items/:mealId  { qty: newQty }
        break;
      case 'swap':
        // POST /appstle/subscriptions/:id/swap  { from: mealId, to: mealId }
        break;
      default:
        throw new BadRequestException(`Unknown change type: ${(change as any).type}`);
    }
    // Simulate API latency
    await new Promise((r) => setTimeout(r, 200));
  }

  private async rollback(customerId: string, orderId: string, applied: OrderChange[]) {
    // Reverse each applied change in reverse order
    for (const change of [...applied].reverse()) {
      try {
        const inverse: OrderChange = this.invertChange(change);
        await this.applyChange(customerId, orderId, inverse);
      } catch {
        // Log rollback failure but don't throw — best-effort rollback
      }
    }
  }

  private invertChange(change: OrderChange): OrderChange {
    switch (change.type) {
      case 'add':    return { type: 'remove', mealId: change.mealId };
      case 'remove': return { type: 'add',    mealId: change.mealId };
      case 'swap':   return { type: 'swap',   from: change.to, to: change.from };
      case 'quantity': return { type: 'quantity', mealId: change.mealId, newQty: change.newQty };
      default:       return change;
    }
  }

  async skipOrder(customerId: string, orderId: string) {
    // POST /appstle/subscriptions/:id/skip
    return { orderId, status: 'skipped' };
  }

  async unskipOrder(customerId: string, orderId: string) {
    // POST /appstle/subscriptions/:id/unskip
    return { orderId, status: 'active' };
  }
}
