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
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors();
  await app.listen(3001);
}

void bootstrap();
