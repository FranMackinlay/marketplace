import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  console.log('Orders service is running...');
  console.log('HTTP server is listening on http://localhost:3000');
}
bootstrap();
