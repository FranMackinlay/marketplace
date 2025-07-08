import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice } from './schemas/invoice.schema';
import { OrderStatus } from '../orders/schemas/order.schema';
import { OrderService } from '../orders/orders.service';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
    private readonly orderService: OrderService,
  ) { }

  async uploadInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    const { orderId } = invoiceData;

    if (!orderId)
      throw new NotFoundException(`No orderId found for orderId: ${orderId}`)

    const order = await this.orderService.getOrderDetails(orderId);

    if (!order)
      throw new BadRequestException(`Order with ID ${orderId} does not exist`);

    const invoice = new this.invoiceModel(invoiceData);
    const savedInvoice = await invoice.save();

    if (order.status === OrderStatus.SHIPPED) {
      savedInvoice.sentAt = new Date();
      await savedInvoice.save();
    }

    return savedInvoice;
  }

  async getInvoiceDetails(invoiceId: string): Promise<Invoice | null> {
    return this.invoiceModel.findOne({ invoiceId }).exec();
  }

  async listInvoices(): Promise<Invoice[]> {
    return this.invoiceModel.find().exec();
  }

  async processOrderShippedEvent(orderId: string) {
    const invoice = await this.invoiceModel.findOne({ orderId }).exec();

    if (!invoice)
      throw new NotFoundException(`No invoice found for order ID ${orderId}.`)

    invoice.sentAt = new Date();
    await invoice.save();
  }
}
