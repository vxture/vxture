/**
 * main.ts - Vela BFF 入口
 * @package @vxture/bff-vela
 * @layer Application
 * @category Module
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });
  const port = Number(process.env['VELA_BFF_PORT'] ?? 3121);
  await app.listen(port);
}

void bootstrap();
