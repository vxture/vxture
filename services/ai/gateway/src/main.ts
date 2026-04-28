import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { GatewayModule } from './gateway.module';
import { prisma } from './prisma';

async function bootstrap(): Promise<void> {
  await prisma.$connect();

  const app = await NestFactory.create(GatewayModule);
  app.enableCors();

  const port = Number(process.env.AI_GATEWAY_PORT ?? 3100);
  await app.listen(port);
}

void bootstrap();
