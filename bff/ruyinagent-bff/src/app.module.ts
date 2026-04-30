/**
 * app.module.ts - Ruyin Agent BFF Root Module
 * @package @vxture/bff-ruyinagent
 *
 * Description: Registers authentication middleware and Ruyin Agent proxy routers.
 *
 * @author AI-Generated
 * @date 2026-04-22
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Infrastructure
 */

import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { VxConfigModule } from '@vxture/core-config';
import { RuyinAgentAggregator } from './aggregators/ruyinagent.aggregator';
import { AgentAuthService } from './auth/auth.service';
import { AuthMiddleware } from './middleware/auth.middleware';
import { AuthRouter } from './routers/auth.router';
import { SessionRouter } from './routers/session.router';

@Module({
  imports: [
    VxConfigModule.register({
      domains: ['app', 'auth'],
    }),
    JwtModule.register({}),
  ],
  controllers: [AuthRouter, SessionRouter],
  providers: [AgentAuthService, RuyinAgentAggregator],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'api/(.*)', method: RequestMethod.ALL });
  }
}
