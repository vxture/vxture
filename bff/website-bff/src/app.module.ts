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

import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { VxConfigModule } from '@vxture/core-config';
import { IamModule } from '@vxture/service-iam';
import { MailModule } from '@vxture/service-mail';
import { OrganizationModule } from '@vxture/service-organization';
import { WebsiteAuthService } from './auth/auth.service';
import { AuthMiddleware } from './middleware/auth.middleware';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { AuthRouter } from './routers/auth.router';
import { HealthRouter } from './routers/health.router';
import { VerifyCodeRouter } from './routers/verifycode.router';

@Module({
  imports: [
    VxConfigModule.register({
      domains: ['app', 'auth', 'database'],
    }),
    JwtModule.register({}),
    IamModule,
    OrganizationModule,
    MailModule,
  ],
  controllers: [HealthRouter, AuthRouter, VerifyCodeRouter],
  providers: [WebsiteAuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, TenantMiddleware)
      .forRoutes({ path: 'api/(.*)', method: RequestMethod.ALL });
  }
}
