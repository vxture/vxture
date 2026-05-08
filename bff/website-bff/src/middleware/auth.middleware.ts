/**
 * auth.middleware.ts - Authentication Middleware（重构 v1.3）
 * @package @vxture/bff-website
 *
 * 【重构说明】website-bff 不再签发 JWT。
 * middleware 仍然本地验证 JWT（无状态，共享 JWT_SECRET），无需每次请求调 auth-bff。
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.3
 */

import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { AccessTokenRevocationService } from '@vxture/core-auth';
import { AUTH_CONSTANTS } from '@vxture/shared';
import { WebsiteAuthService } from '../auth/auth.service';
import type { RequestContext } from '../types/auth.types';

const PUBLIC_PATH_PREFIXES = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/refresh',
  '/api/auth/send-phone-code',
  '/api/auth/login-with-phone',
  '/api/auth/oauth/',
  '/api/send-code',
  '/api/verify-code',
  '/healthz',
];

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(WebsiteAuthService) private readonly websiteAuthService: WebsiteAuthService,
    @Inject(AccessTokenRevocationService)
    private readonly tokenRevocationService: AccessTokenRevocationService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    if (PUBLIC_PATH_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
      next();
      return;
    }

    const accessToken = req.cookies?.[AUTH_CONSTANTS.TENANT_COOKIE_KEYS.ACCESS_TOKEN]
      ?? req.cookies?.[AUTH_CONSTANTS.LEGACY_COOKIE_KEYS.WEBSITE.ACCESS_TOKEN]
      ?? req.cookies?.[AUTH_CONSTANTS.LEGACY_COOKIE_KEYS.CONSOLE.ACCESS_TOKEN];
    if (!accessToken) {
      next();
      return;
    }

    try {
      const payload = this.websiteAuthService.verifyAccessToken(accessToken);
      await this.tokenRevocationService.assertAccessTokenActive(payload, 'tenant');
      const user = await this.websiteAuthService.getCurrentUser(payload.sub);
      if (user) {
        (req as Request & RequestContext).user = user;
      }
    } catch {
      // Invalid token - let downstream decide
    }

    next();
  }
}
