import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'orders-queue',
      queueOptions: { durable: true },
    },
  });

  await app.listen(3000);
  await microservice.listen();

  console.log('Invoice service is running...');
  console.log('HTTP server is listening on http://localhost:3000');
  console.log('Microservice is listening for RabbitMQ messages...');
}
bootstrap();
