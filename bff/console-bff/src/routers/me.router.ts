import { Body, Controller, Get, Inject, NotFoundException, Put, Query, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { SessionAggregator } from '../aggregators/session.aggregator';
import { ChangePasswordDto, UpdateProfileDto } from '../dto/profile.dto';
import type { RequestContext } from '../types/console.types';

@Controller('api/me')
export class MeRouter {
  constructor(@Inject(SessionAggregator) private readonly sessionAggregator: SessionAggregator) {}

  @Get()
  async getCurrentUser(@Req() req: Request & RequestContext) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    return this.sessionAggregator.getCurrentUser(req.user.id);
  }

  @Get('profile')
  async getCurrentUserProfile(@Req() req: Request & RequestContext) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    const profile = await this.sessionAggregator.getCurrentUserProfile(req.user.id);
    if (!profile) {
      throw new NotFoundException('Account profile not found');
    }

    return profile;
  }

  @Get('organization')
  async getCurrentOrganizationProfile(
    @Req() req: Request & RequestContext,
    @Query('tenantId') tenantId?: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    const profile = await this.sessionAggregator.getCurrentOrganizationProfile(req.user.id, tenantId ?? req.tenant?.id);
    if (!profile) {
      throw new NotFoundException('Organization profile not found');
    }

    return profile;
  }

  @Put('profile')
  async updateCurrentUserProfile(@Req() req: Request & RequestContext, @Body() body: UpdateProfileDto) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    const profile = await this.sessionAggregator.updateCurrentUserProfile(req.user.id, body);
    if (!profile) {
      throw new NotFoundException('Account profile not found');
    }

    return profile;
  }

  @Put('password')
  async updatePassword(@Req() req: Request & RequestContext, @Body() body: ChangePasswordDto) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    await this.sessionAggregator.changeCurrentUserPassword(req.user.id, body.currentPassword, body.nextPassword);

    return { status: 'ok' as const };
  }
}
