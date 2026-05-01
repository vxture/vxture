/**
 * main.ts - Vela Server 入口
 * @package vela-server
 * @layer Application
 * @category Module
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env['VELA_SERVER_PORT'] ?? 3011);
  await app.listen(port);
}

void bootstrap();
