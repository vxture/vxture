/**
 * session.router.ts - Ruyin Agent session router
 * @package @vxture/bff-ruyinagent
 *
 * Description: Authenticated frontend-facing routes for session lifecycle and messaging.
 *
 * @author AI-Generated
 * @date 2026-04-22
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Router
 */

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { RuyinAgentAggregator, RuyinAgentBffError } from '../aggregators/ruyinagent.aggregator';
import type { RequestContext } from '../types/auth.types';
import type { CreateSessionDto, SendMessageDto } from '../types/ruyinagent.types';

@Controller('api/session')
export class SessionRouter {
  constructor(private readonly ruyinAgentAggregator: RuyinAgentAggregator) {}

  @Post()
  async createSession(
    @Req() req: Request & RequestContext,
    @Body() body: CreateSessionDto,
  ) {
    const accessToken = requireAccessToken(req);

    try {
      return await this.ruyinAgentAggregator.createSession(accessToken, body);
    } catch (error: unknown) {
      throw mapBffError(error);
    }
  }

  @Get(':sessionId/history')
  async getSessionHistory(
    @Req() req: Request & RequestContext,
    @Param('sessionId') sessionId: string,
  ) {
    const accessToken = requireAccessToken(req);

    try {
      return await this.ruyinAgentAggregator.getSessionHistory(accessToken, sessionId);
    } catch (error: unknown) {
      throw mapBffError(error);
    }
  }

  @Post(':sessionId/message')
  async sendMessage(
    @Req() req: Request & RequestContext,
    @Param('sessionId') sessionId: string,
    @Body() body: SendMessageDto,
  ) {
    const accessToken = requireAccessToken(req);

    try {
      return await this.ruyinAgentAggregator.sendMessage(accessToken, sessionId, body);
    } catch (error: unknown) {
      throw mapBffError(error);
    }
  }

  @Get(':sessionId/task')
  async getTaskStatus(
    @Req() req: Request & RequestContext,
    @Param('sessionId') sessionId: string,
    @Query('taskId') taskId?: string,
  ) {
    if (!taskId) {
      throw new BadRequestException('Missing taskId parameter');
    }

    const accessToken = requireAccessToken(req);

    try {
      return await this.ruyinAgentAggregator.getTaskStatus(accessToken, sessionId, taskId);
    } catch (error: unknown) {
      throw mapBffError(error);
    }
  }
}

function requireAccessToken(req: RequestContext): string {
  if (!req.user || !req.accessToken) {
    throw new UnauthorizedException('No active session');
  }

  return req.accessToken;
}

function mapBffError(error: unknown): HttpException {
  if (error instanceof RuyinAgentBffError) {
    return new HttpException(error.message, error.statusCode);
  }

  if (error instanceof HttpException) {
    return error;
  }

  return new HttpException(
    error instanceof Error ? error.message : 'Unexpected Ruyin Agent BFF error',
    500,
  );
}
