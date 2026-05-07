/**
 * tenant.middleware.ts - Tenant Context Middleware（重构 v1.3）
 * @package @vxture/bff-website
 *
 * 从 JWT 中解析 tenantId，挂载到请求上下文供后续路由使用。
 * 支持 vx_* 和 vx_console_* 两种 cookie key。
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.3
 */

import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { WebsiteAuthService } from '../auth/auth.service';
import type { RequestContext } from '../types/auth.types';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(@Inject(WebsiteAuthService) private readonly websiteAuthService: WebsiteAuthService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const accessToken = req.cookies?.['vx_access_token'] ?? req.cookies?.['vx_console_access_token'];
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
      // ignore
    }

    next();
  }
}
