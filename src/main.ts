import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// 1. Eliminamos la función bootstrap() y usamos await directamente en el nivel superior
const app = await NestFactory.create(AppModule);

// 2. Configuración de Pipes Globales para validación (Fundamental para tus DTOs)
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));

// 3. Habilitación de CORS para que el Front-end pueda conectarse
app.enableCors();

// 4. Inicio del servidor
await app.listen(process.env.PORT ?? 3000);