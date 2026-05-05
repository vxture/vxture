/**
 * index.ts - Ruyin BFF bootstrap
 * @package @vxture/bff-ruyin
 *
 * Description: Bootstraps the NestJS application that fronts agent-studio/ruyin
 * and proxies authenticated requests to agent-server/ruyin.
 *
 * @author AI-Generated
 * @date 2026-04-22
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Ruyin BFF
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { VxConfigService } from '@vxture/core-config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const configService = app.get(VxConfigService);
  await app.listen(configService.app.PORT);
}

void bootstrap();
