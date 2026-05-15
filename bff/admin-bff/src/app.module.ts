import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenRevocationService } from '@vxture/core-auth';
import { VxConfigModule } from '@vxture/core-config';
import { MailModule } from '@vxture/core-mail';
import { SmsModule } from '@vxture/service-sms';
import { AdminBffPoolsModule } from './providers/pools.module';
import { PlatformAuthService } from './auth/auth.service';
import { LoginRateLimiterService } from './auth/login-rate-limiter.service';
import { CaptchaService } from './auth/captcha.service';
import { SessionAggregator } from './aggregators/session.aggregator';
import { AuthMiddleware } from './middleware/auth.middleware';
import { PermissionMiddleware } from './middleware/permission.middleware';
import { AccountsRouter } from './routers/accounts.router';
import { AdminPermissionsRouter } from './routers/admin-permissions.router';
import { AdminRolesRouter } from './routers/admin-roles.router';
import { AiGatewayRouter } from './routers/ai-gateway.router';
import { AnnouncementsRouter } from './routers/announcements.router';
import { AuditLogsRouter } from './routers/audit-logs.router';
import { AuthRouter } from './routers/auth.router';
import { BillingRouter } from './routers/billing.router';
import { CapabilitiesRouter } from './routers/capabilities.router';
import { CommercialRouter } from './routers/commercial.router';
import { HealthRouter } from './routers/health.router';
import { InvoicesRouter } from './routers/invoices.router';
import { MeRouter } from './routers/me.router';
import { OrdersRouter } from './routers/orders.router';
import { PaymentsRouter } from './routers/payments.router';
import { PlatformAdminsRouter } from './routers/platform-admins.router';
import { PlatformGovernanceRouter } from './routers/platform-governance.router';
import { ProductsRouter } from './routers/products.router';
import { SkillsRouter } from './routers/skills.router';
import { SubscriptionRouter } from './routers/subscription.router';
import { TenantsRouter } from './routers/tenants.router';
import { TicketsRouter } from './routers/tickets.router';

@Module({
  imports: [
    VxConfigModule.register({
      domains: ['app', 'auth', 'database', 'redis'],
    }),
    JwtModule.register({}),
    MailModule,
    SmsModule,
    AdminBffPoolsModule,
  ],
  controllers: [
    HealthRouter,
    AuthRouter,
    MeRouter,
    CapabilitiesRouter,
    AiGatewayRouter,
    AccountsRouter,
    AdminPermissionsRouter,
    AdminRolesRouter,
    AnnouncementsRouter,
    AuditLogsRouter,
    OrdersRouter,
    ProductsRouter,
    SkillsRouter,
    SubscriptionRouter,
    BillingRouter,
    CommercialRouter,
    InvoicesRouter,
    PaymentsRouter,
    TenantsRouter,
    TicketsRouter,
    PlatformAdminsRouter,
    PlatformGovernanceRouter,
  ],
  providers: [
    PlatformAuthService,
    LoginRateLimiterService,
    CaptchaService,
    SessionAggregator,
    AccessTokenRevocationService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, PermissionMiddleware)
      .forRoutes({ path: 'api/*path', method: RequestMethod.ALL });
  }
}
