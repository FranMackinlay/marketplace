import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { OrderStatus } from './schemas/order.schema';
import { OrderService } from './orders.service';
import { OrderDto } from './orders.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  async createOrder(@Body() orderData: OrderDto) {
    return this.orderService.createOrder(orderData);
  }

  @Get()
  async listOrders() {
    return this.orderService.listOrders();
  }

  @Get(':orderId')
  async getOrderDetails(@Param('orderId') orderId: string) {
    return this.orderService.getOrderDetails(orderId);
  }

  @Put(':orderId/status')
  async updateOrderStatus(@Param('orderId') orderId: string, @Body('status') status: OrderStatus) {
    return this.orderService.updateOrderStatus(orderId, status);
  }
}
