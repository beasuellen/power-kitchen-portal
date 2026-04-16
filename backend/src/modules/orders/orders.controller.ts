import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrdersService, BatchChangesDto } from './orders.service';

// In production: use @UseGuards(JwtAuthGuard) and extract customerId from JWT
const MOCK_CUSTOMER_ID = 'cust_001';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getOrders() {
    return this.ordersService.getOrders(MOCK_CUSTOMER_ID);
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(MOCK_CUSTOMER_ID, id);
  }

  /** Draft mode: single batch call for all user changes */
  @Post(':id/changes')
  applyChanges(@Param('id') id: string, @Body() dto: BatchChangesDto) {
    return this.ordersService.applyBatchChanges(MOCK_CUSTOMER_ID, { ...dto, orderId: id });
  }

  @Post(':id/skip')
  skipOrder(@Param('id') id: string) {
    return this.ordersService.skipOrder(MOCK_CUSTOMER_ID, id);
  }

  @Post(':id/unskip')
  unskipOrder(@Param('id') id: string) {
    return this.ordersService.unskipOrder(MOCK_CUSTOMER_ID, id);
  }
}
