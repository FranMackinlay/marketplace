import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from './schemas/order.schema';
import { OrderDto } from './orders.dto';


@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject('ORDERS_SERVICE') private readonly client: ClientProxy
) { }

  async createOrder(orderData: OrderDto, userId: string): Promise<Order> {
    const order = new this.orderModel({ ...orderData, status: OrderStatus.CREATED, customerId: userId });
    return await order.save();
  }

  async listOrders(userId: string): Promise<Order[]> {
    return this.orderModel.find({customerId: userId}).exec();
  }

  async getOrderDetails(orderId: string): Promise<Order | null> {
    return this.orderModel.findOne({ orderId }).exec();
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const updatedOrder = await this.orderModel.findOneAndUpdate(
      { orderId },
      { status },
      { new: true },
    ).exec();

    if (updatedOrder && status === OrderStatus.SHIPPED) {
      this.client.emit('ORDER_SHIPPED', { orderId });
    }

    return updatedOrder;
  }
}
