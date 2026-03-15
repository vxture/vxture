/**
 * app.module.ts - Website BFF Root Module
 * @package @vxture/bff-website
 * @description Root NestJS module for website BFF, registering all core infrastructure
 * @author AI-Generated
 * @date 2026-03-15
 * @version 1.0
 * @copyright Vxture Team
 * @license MIT
 * @layer Application
 * @category Infrastructure
 */

import { Module } from '@nestjs/common';
import { VxConfigModule } from '@vxture/core-config';

@Module({
  imports: [
    VxConfigModule.register({
      domains: ['app', 'redis', 'auth'],
    }),
  ],
})
export class AppModule {}
