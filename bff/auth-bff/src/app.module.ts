/**
 * app.module.ts - Auth BFF Root Module
 * @package @vxture/bff-auth
 * @description 统一认证服务根模块
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.0
 */

import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { VxConfigModule } from '@vxture/core-config';
import { IamModule } from '@vxture/service-iam';
import { OrganizationModule } from '@vxture/service-organization';
import { MailModule } from '@vxture/service-mail';
import { SmsModule } from '@vxture/service-sms';
import { AuthService } from './auth/auth.service';
import { RedisModule } from './redis/redis.module';
import { PasswordAuthRouter } from './routers/password-auth.router';
import { PhoneAuthRouter } from './routers/phone-auth.router';
import { OAuthRouter } from './routers/oauth.router';
import { CrossDomainRouter } from './routers/crossdomain.router';
import { HealthRouter } from './routers/health.router';

@Module({
  imports: [
    VxConfigModule.register({
      domains: ['app', 'auth', 'database', 'redis'],
    }),
    JwtModule.register({}),
    RedisModule,
    IamModule,
    OrganizationModule,
    MailModule,
    SmsModule,
  ],
  controllers: [
    HealthRouter,
    PasswordAuthRouter,
    PhoneAuthRouter,
    OAuthRouter,
    CrossDomainRouter,
  ],
  providers: [AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // auth-bff 所有路由都是公开的（auth middleware 不需要，因为这里是签发端）
    // login / logout / refresh / oauth / crossdomain 都不需要认证
  }
}
