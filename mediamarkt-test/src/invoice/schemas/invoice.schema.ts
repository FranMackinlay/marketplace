import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret: { [key: string]: any }) => {
      delete ret._id;
      delete ret.id;
      return ret;
    },
  },
})
export class Invoice extends Document {
  @Prop({ required: true, default: () => uuidv4() })
  invoiceId: string;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  pdfUrl: string;

  @Prop()
  sentAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);


