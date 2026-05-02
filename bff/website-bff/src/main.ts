/**
 * main.ts - Website BFF Entry Point
 * @package @vxture/bff-website
 * @description Application bootstrap for the website BFF server
 * @author AI-Generated
 * @date 2026-03-15
 * @version 1.0
 * @copyright Vxture Team
 * @license MIT
 * @layer Application
 * @category Infrastructure
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // 开启全局参数校验：自动剥离多余字段，校验不通过直接 400
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: true,
    credentials: true,
  });
  await app.listen(Number(process.env.WEBSITE_BFF_PORT ?? 3011));
}

void bootstrap();
