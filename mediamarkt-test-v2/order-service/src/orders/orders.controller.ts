import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { OrderStatus } from './schemas/order.schema';
import { Request } from 'express';
import { OrderService } from './orders.service';
import { OrderDto } from './orders.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { UserRoles } from 'src/common/roles.enum';
import { Roles } from 'src/auth/roles.decorator';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService
  ) { }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRoles.CUSTOMER)
  @Post()
  async createOrder(@Body() orderData: OrderDto, @Req() req: Request & { user: any }) {
    const userId = req.user.userId;
    return this.orderService.createOrder(orderData, userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRoles.CUSTOMER)
  @Get()
  async listOrders(@Req() req: Request & { user: any }) {
    const userId = req.user.userId;
    return this.orderService.listOrders(userId);
  }

  @Get(':orderId')
  async getOrderDetails(@Param('orderId') orderId: string) {
    return this.orderService.getOrderDetails(orderId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRoles.SELLER)
  @Put(':orderId/status')
  async updateOrderStatus(@Param('orderId') orderId: string, @Body('status') status: OrderStatus) {
    return this.orderService.updateOrderStatus(orderId, status);
  }
}
