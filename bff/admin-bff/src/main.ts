import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const allowedOrigins = process.env['ALLOWED_ORIGIN']?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  });
  await app.listen(Number(process.env.ADMIN_BFF_PORT ?? 3031));
}

void bootstrap();
