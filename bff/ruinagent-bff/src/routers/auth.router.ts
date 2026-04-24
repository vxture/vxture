/**
 * auth.router.ts - Ruin Agent auth router
 * @package @vxture/bff-ruinagent
 *
 * Description: Exposes lightweight session inspection endpoints for the agent frontend.
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

import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { RequestContext } from '../types/auth.types';

@Controller('api/auth')
export class AuthRouter {
  @Get('session')
  getSession(@Req() req: Request & RequestContext) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    return {
      status: 'active',
      user: req.user,
    };
  }

  @Get('me')
  getCurrentUser(@Req() req: Request & RequestContext) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    return req.user;
  }
}
