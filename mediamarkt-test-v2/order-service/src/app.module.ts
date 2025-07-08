import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db.module';
import { OrderModule } from './orders/orders.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, OrderModule]
})
export class AppModule { }
