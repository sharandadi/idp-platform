import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable Global Validation (Activates your DTOs)
  app.useGlobalPipes(new ValidationPipe());

  // 2. Enable CORS (Allows Frontend to talk to Backend)
  app.enableCors({
    origin: true, // In production, replace 'true' with your specific frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. Start the server
  await app.listen(3001);
  console.log(`Backend is running on: http://localhost:3001`);
}
bootstrap();