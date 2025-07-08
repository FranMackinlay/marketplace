import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret: { [key: string]: any }) => {
      delete ret._id;
      return ret;
    },
  },
})
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;
  @Prop({ required: true, enum: ['seller', 'customer'] })
  role: 'seller' | 'customer';
}

export const UserSchema = SchemaFactory.createForClass(User);
