/**
 * app.module.ts - Website BFF Root Module（重构 v1.3）
 * @package @vxture/bff-website
 *
 * 【重构说明】
 * 移除 JwtModule 的注册（JWT 签发迁移至 auth-bff）
 * JwtService 仍然作为依赖保留在 WebsiteAuthService 中用于验证
 * 移除 OAuth provider 相关路由
 * 保留 IamModule + OrganizationModule + MailModule
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.3
 */

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AccessTokenRevocationService } from "@vxture/core-auth";
import { VxConfigModule } from "@vxture/core-config";
import { IamModule } from "@vxture/service-iam";
import { OrganizationModule } from "@vxture/service-organization";
import { MailModule } from "@vxture/service-mail";
import { WebsiteAuthService } from "./auth/auth.service";
import { SessionAggregator } from "./aggregators/session.aggregator";
import { AuthMiddleware } from "./middleware/auth.middleware";
import { TenantMiddleware } from "./middleware/tenant.middleware";
import { AuthRouter } from "./routers/auth.router";
import { HealthRouter } from "./routers/health.router";
import { MeRouter } from "./routers/me.router";
import { VerifyCodeRouter } from "./routers/verifycode.router";
import { PhoneAuthRouter } from "./routers/phone-auth.router";

@Module({
  imports: [
    VxConfigModule.register({
      domains: ["app", "auth", "database", "redis"],
    }),
    JwtModule.register({}),
    IamModule,
    OrganizationModule,
    MailModule,
  ],
  controllers: [
    HealthRouter,
    AuthRouter,
    VerifyCodeRouter,
    PhoneAuthRouter,
    MeRouter,
  ],
  providers: [
    WebsiteAuthService,
    SessionAggregator,
    AccessTokenRevocationService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, TenantMiddleware)
      .forRoutes({ path: "api/(.*)", method: RequestMethod.ALL });
  }
}
