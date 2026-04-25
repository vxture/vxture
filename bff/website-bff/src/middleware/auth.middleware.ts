/**
 * auth.middleware.ts - Authentication Middleware
 * @package @vxture/bff-website
 * @description Middleware for authenticating requests via HttpOnly Cookie and Redis session
 * @author AI-Generated
 * @date 2026-03-15
 * @version 1.0
 * @copyright Vxture Team
 * @license MIT
 * @layer Application
 * @category Middleware
 */

import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { AUTH_CONSTANTS } from '@vxture/shared';
import { WebsiteAuthService } from '../auth/auth.service';
import type { RequestContext } from '../types/auth.types';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(@Inject(WebsiteAuthService) private readonly websiteAuthService: WebsiteAuthService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    if (req.path === AUTH_CONSTANTS.API_ENDPOINTS.LOGIN || req.path === AUTH_CONSTANTS.API_ENDPOINTS.REFRESH) {
      next();
      return;
    }

    const accessToken = req.cookies?.[AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN];
    if (!accessToken) {
      next();
      return;
    }

    try {
      const payload = this.websiteAuthService.verifyAccessToken(accessToken);
      const user = await this.websiteAuthService.getCurrentUser(payload.sub);

      if (user) {
        (req as Request & RequestContext).user = user;
      }
    } catch {
      // Ignore invalid token and let downstream route decide how to respond.
    }

    next();
  }
}
