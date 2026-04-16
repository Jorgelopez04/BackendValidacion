import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Esto es opcional pero recomendado para que funcionen tus DTOs
  app.useGlobalPipes(new ValidationPipe());

  // El puerto que configuraste en el Dockerfile
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();