import { Controller, Get, Inject, Query, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { SessionAggregator } from '../aggregators/session.aggregator';
import type { RequestContext } from '../types/console.types';

@Controller('api/tenant-context')
export class TenantContextRouter {
  constructor(@Inject(SessionAggregator) private readonly sessionAggregator: SessionAggregator) {}

  @Get()
  async getTenantContext(@Req() req: Request & RequestContext, @Query('tenantId') tenantId?: string) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    return this.sessionAggregator.getTenantContext(req.user.id, tenantId);
  }

  @Get('options')
  async getTenantOptions(@Req() req: Request & RequestContext) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    return this.sessionAggregator.getTenantContexts(req.user.id);
  }
}
