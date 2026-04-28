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
import { BillingRouter } from './routers/billing.router';
import { CapabilitiesRouter } from './routers/capabilities.router';
import { CommercialRouter } from './routers/commercial.router';
import { HealthRouter } from './routers/health.router';
import { InvoicesRouter } from './routers/invoices.router';
import { MeRouter } from './routers/me.router';
import { OrdersRouter } from './routers/orders.router';
import { PaymentsRouter } from './routers/payments.router';
import { ProductsRouter } from './routers/products.router';
import { SubscriptionRouter } from './routers/subscription.router';
import { TenantsRouter } from './routers/tenants.router';

@Module({
  imports: [
    VxConfigModule.register({
      domains: ['app', 'auth', 'database'],
    }),
    JwtModule.register({}),
  ],
  controllers: [
    HealthRouter,
    AuthRouter,
    MeRouter,
    CapabilitiesRouter,
    AiGatewayRouter,
    AccountsRouter,
    AdminRolesRouter,
    OrdersRouter,
    ProductsRouter,
    SubscriptionRouter,
    AssistantRouter,
    BillingRouter,
    CommercialRouter,
    InvoicesRouter,
    PaymentsRouter,
    TenantsRouter,
  ],
  providers: [PlatformAuthService, SessionAggregator],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, PermissionMiddleware)
      .forRoutes({ path: 'api/*path', method: RequestMethod.ALL });
  }
}
