import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { VxConfigModule } from '@vxture/core-config';
import { PlatformAuthService } from './auth/auth.service';
import { SessionAggregator } from './aggregators/session.aggregator';
import { AuthMiddleware } from './middleware/auth.middleware';
import { PermissionMiddleware } from './middleware/permission.middleware';
import { AuthRouter } from './routers/auth.router';
import { AiGatewayRouter } from './routers/ai-gateway.router';
import { AccountsRouter } from './routers/accounts.router';
import { AdminRolesRouter } from './routers/admin-roles.router';
import { AssistantRouter } from './routers/assistant.router';
import { CapabilitiesRouter } from './routers/capabilities.router';
import { HealthRouter } from './routers/health.router';
import { MeRouter } from './routers/me.router';
import { ProductsRouter } from './routers/products.router';
import { TenantsRouter } from './routers/tenants.router';

@Module({
  imports: [
    VxConfigModule.register({
      domains: ['app', 'auth', 'database'],
    }),
    JwtModule.register({}),
  ],
  controllers: [HealthRouter, AuthRouter, MeRouter, CapabilitiesRouter, AiGatewayRouter, AccountsRouter, AdminRolesRouter, ProductsRouter, AssistantRouter, TenantsRouter],
  providers: [PlatformAuthService, SessionAggregator],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, PermissionMiddleware)
      .forRoutes({ path: 'api/*path', method: RequestMethod.ALL });
  }
}
