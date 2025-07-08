import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { OrderModule } from '../orders/orders.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    OrderModule
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule { }
