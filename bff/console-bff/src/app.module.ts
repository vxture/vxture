import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AccessTokenRevocationService } from "@vxture/core-auth";
import { VxConfigModule } from "@vxture/core-config";
import { MailModule } from "@vxture/core-mail";
import { IamModule } from "@vxture/service-iam";
import { OrganizationModule } from "@vxture/service-organization";
import { BillingModule } from "@vxture/service-billing";
import { SubscriptionModule } from "@vxture/service-subscription";
import { ConsoleAuthService } from "./auth/auth.service";
import { SessionAggregator } from "./aggregators/session.aggregator";
import { AuthMiddleware } from "./middleware/auth.middleware";
import { PermissionMiddleware } from "./middleware/permission.middleware";
import { TenantMiddleware } from "./middleware/tenant.middleware";
import { AiGatewayRouter } from "./routers/ai-gateway.router";
import { AuthRouter } from "./routers/auth.router";
import { PhoneAuthRouter } from "./routers/phone-auth.router";
import { BillingRouter } from "./routers/billing.router";
import { CapabilitiesRouter } from "./routers/capabilities.router";
import { HealthRouter } from "./routers/health.router";
import { IamRouter } from "./routers/iam.router";
import { MeRouter } from "./routers/me.router";
import { SubscriptionRouter } from "./routers/subscription.router";
import { TenantContextRouter } from "./routers/tenant-context.router";

@Module({
  imports: [
    VxConfigModule.register({
      domains: ["app", "auth", "database", "redis"],
    }),
    JwtModule.register({}),
    MailModule,
    IamModule,
    OrganizationModule,
    BillingModule,
    SubscriptionModule,
  ],
  controllers: [
    HealthRouter,
    AuthRouter,
    PhoneAuthRouter,
    MeRouter,
    CapabilitiesRouter,
    TenantContextRouter,
    IamRouter,
    SubscriptionRouter,
    BillingRouter,
    AiGatewayRouter,
  ],
  providers: [
    ConsoleAuthService,
    SessionAggregator,
    AccessTokenRevocationService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, TenantMiddleware, PermissionMiddleware)
      .forRoutes({ path: "api/*path", method: RequestMethod.ALL });
  }
}
