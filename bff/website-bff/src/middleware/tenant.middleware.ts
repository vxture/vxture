/**
 * tenant.middleware.ts - Tenant Context Middleware（重构 v1.3）
 * @package @vxture/bff-website
 *
 * 从 JWT 中解析 tenantId，挂载到请求上下文供后续路由使用。
 * 支持统一 vx_tenant_* cookie，并兼容旧 vx_* / vx_console_* key。
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.3
 */

import { Inject, Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import { AUTH_CONSTANTS } from "@vxture/shared";
import { WebsiteAuthService } from "../auth/auth.service";
import type { RequestContext } from "../types/auth.types";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @Inject(WebsiteAuthService)
    private readonly websiteAuthService: WebsiteAuthService,
  ) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const accessToken =
      req.cookies?.[AUTH_CONSTANTS.TENANT_COOKIE_KEYS.ACCESS_TOKEN] ??
      req.cookies?.[AUTH_CONSTANTS.LEGACY_COOKIE_KEYS.WEBSITE.ACCESS_TOKEN] ??
      req.cookies?.[AUTH_CONSTANTS.LEGACY_COOKIE_KEYS.CONSOLE.ACCESS_TOKEN];
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
