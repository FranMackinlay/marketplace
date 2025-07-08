import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Create the HTTP server
  const app = await NestFactory.create(AppModule);

  // Create the microservice
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
      queue: 'orders-queue',
      queueOptions: { durable: true },
    },
  });

  // Start both the HTTP server and the microservice
  await app.listen(3001); // HTTP server listens on port 3001
  await microservice.listen(); // Microservice listens for RabbitMQ messages

  console.log('Invoice service is running...');
  console.log('HTTP server is listening on http://localhost:3001');
  console.log('Microservice is listening for RabbitMQ messages...');
}
bootstrap();
