import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { SessionAggregator } from '../aggregators/session.aggregator';
import { ResetMemberPasswordDto, UpdateMemberDto, UpsertMemberDto } from '../dto/member.dto';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
import type { RequestContext } from '../types/console.types';

@Controller('api/iam')
export class IamRouter {
  constructor(@Inject(SessionAggregator) private readonly sessionAggregator: SessionAggregator) {}

  @Get('summary')
  async getSummary(@Req() req: Request & RequestContext, @Query('tenantId') tenantId?: string) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    const summary = await this.sessionAggregator.getIamSummary(req.user.id, tenantId);

    return {
      members: summary.totalMembers,
      activeMembers: summary.activeMembers,
      primaryOwners: summary.primaryOwners,
      roles: summary.activeRoles,
    };
  }

  @Get('members')
  async getMembers(@Req() req: Request & RequestContext, @Query('tenantId') tenantId?: string) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    return this.sessionAggregator.listMembers(req.user.id, tenantId);
  }

  @Get('members/:memberId')
  async getMember(
    @Req() req: Request & RequestContext,
    @Param('memberId') memberId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    const member = await this.sessionAggregator.getMember(req.user.id, tenantId, memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  @Get('roles')
  async getRoles(@Req() req: Request & RequestContext, @Query('tenantId') tenantId?: string) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    return this.sessionAggregator.listTenantRoles(req.user.id, tenantId);
  }

  @Get('permissions')
  async getPermissions(@Req() req: Request & RequestContext, @Query('tenantId') tenantId?: string) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    return this.sessionAggregator.listTenantPermissions(req.user.id, tenantId);
  }

  @Post('roles')
  async createRole(
    @Req() req: Request & RequestContext,
    @Body() body: CreateRoleDto,
    @Query('tenantId') tenantId?: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    const role = await this.sessionAggregator.createRole(req.user.id, tenantId, body);
    if (!role) {
      throw new NotFoundException('Role could not be created');
    }

    return role;
  }

  @Put('roles/:roleId')
  async updateRole(
    @Req() req: Request & RequestContext,
    @Param('roleId') roleId: string,
    @Body() body: UpdateRoleDto,
    @Query('tenantId') tenantId?: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    const role = await this.sessionAggregator.updateRole(req.user.id, tenantId, roleId, body);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  @Delete('roles/:roleId')
  async deleteRole(
    @Req() req: Request & RequestContext,
    @Param('roleId') roleId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    const removed = await this.sessionAggregator.deleteRole(req.user.id, tenantId, roleId);
    if (!removed) {
      throw new NotFoundException('Role not found');
    }

    return { status: 'ok' as const };
  }

  @Post('members')
  async createMember(
    @Req() req: Request & RequestContext,
    @Body() body: UpsertMemberDto,
    @Query('tenantId') tenantId?: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    const member = await this.sessionAggregator.createMember(req.user.id, tenantId, body);
    if (!member) {
      throw new NotFoundException('Tenant member could not be created');
    }

    return member;
  }

  @Post('members/invite')
  async inviteMember(
    @Req() req: Request & RequestContext,
    @Body() body: UpsertMemberDto,
    @Query('tenantId') tenantId?: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    const member = await this.sessionAggregator.inviteMember(req.user.id, tenantId, body);
    if (!member) {
      throw new NotFoundException('Tenant member could not be invited');
    }

    return member;
  }

  @Put('members/:memberId')
  async updateMember(
    @Req() req: Request & RequestContext,
    @Param('memberId') memberId: string,
    @Body() body: UpdateMemberDto,
    @Query('tenantId') tenantId?: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    const member = await this.sessionAggregator.updateMember(req.user.id, tenantId, memberId, body);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  @Post('members/:memberId/disable')
  async disableMember(
    @Req() req: Request & RequestContext,
    @Param('memberId') memberId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    const member = await this.sessionAggregator.disableMember(req.user.id, tenantId, memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  @Post('members/:memberId/reset-password')
  async resetMemberPassword(
    @Req() req: Request & RequestContext,
    @Param('memberId') memberId: string,
    @Body() body: ResetMemberPasswordDto,
    @Query('tenantId') tenantId?: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    const reset = await this.sessionAggregator.resetMemberPassword(req.user.id, tenantId, memberId, body.nextPassword);
    if (!reset) {
      throw new NotFoundException('Member not found');
    }

    return { status: 'ok' as const };
  }

  @Delete('members/:memberId')
  async removeMember(
    @Req() req: Request & RequestContext,
    @Param('memberId') memberId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    const removed = await this.sessionAggregator.removeMember(req.user.id, tenantId, memberId);
    if (!removed) {
      throw new NotFoundException('Member not found');
    }

    return { status: 'ok' as const };
  }
}
