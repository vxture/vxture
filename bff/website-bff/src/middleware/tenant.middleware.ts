/**
 * tenant.middleware.ts - Tenant Context Middleware
 * @package @vxture/bff-website
 * @description 从 JWT 中解析 tenantId，挂载到请求上下文供后续路由使用
 * @author AI-Generated
 * @date 2026-05-02
 * @version 1.0
 * @copyright Vxture Team
 * @license MIT
 * @layer Application
 * @category Middleware
 */

import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { AUTH_CONSTANTS } from '@vxture/shared';
import { WebsiteAuthService } from '../auth/auth.service';
import type { RequestContext } from '../types/auth.types';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(@Inject(WebsiteAuthService) private readonly websiteAuthService: WebsiteAuthService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const accessToken = req.cookies?.[AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN];
    if (!accessToken) {
      next();
      return;
    }

    try {
      const payload = this.websiteAuthService.verifyAccessToken(accessToken);
      if (payload.tenantId) {
        (req as Request & RequestContext).tenantId = payload.tenantId;
      }
    } catch {
      // Token 无效时忽略，由下游路由决定如何响应
    }

    next();
  }
}
