import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { VxConfigModule } from '@vxture/core-config';
import { IamModule } from '@vxture/service-iam';
import { OrganizationModule } from '@vxture/service-organization';
import { ConsoleAuthService } from './auth/auth.service';
import { SessionAggregator } from './aggregators/session.aggregator';
import { AuthMiddleware } from './middleware/auth.middleware';
import { PermissionMiddleware } from './middleware/permission.middleware';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { AuthRouter } from './routers/auth.router';
import { CapabilitiesRouter } from './routers/capabilities.router';
import { HealthRouter } from './routers/health.router';
import { IamRouter } from './routers/iam.router';
import { MeRouter } from './routers/me.router';
import { SubscriptionRouter } from './routers/subscription.router';
import { TenantContextRouter } from './routers/tenant-context.router';

@Module({
  imports: [
    VxConfigModule.register({
      domains: ['app', 'auth', 'database'],
    }),
    JwtModule.register({}),
    IamModule,
    OrganizationModule,
  ],
  controllers: [HealthRouter, AuthRouter, MeRouter, CapabilitiesRouter, TenantContextRouter, IamRouter, SubscriptionRouter],
  providers: [ConsoleAuthService, SessionAggregator],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, TenantMiddleware, PermissionMiddleware)
      .forRoutes({ path: 'api/*path', method: RequestMethod.ALL });
  }
}
