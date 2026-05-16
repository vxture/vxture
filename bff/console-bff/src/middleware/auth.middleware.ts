import { ForbiddenException, Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import { AccessTokenRevocationService } from '@vxture/core-auth';
import type { NextFunction, Request, Response } from 'express';
import { CONSOLE_AUTH_COOKIES } from '../auth/cookie.constants';
import { ConsoleAuthService } from '../auth/auth.service';
import type { RequestContext } from '../types/console.types';

const PUBLIC_AUTH_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/api/auth/send-phone-code',
  '/api/auth/login-with-phone',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
]);

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(ConsoleAuthService) private readonly consoleAuthService: ConsoleAuthService,
    @Inject(AccessTokenRevocationService)
    private readonly tokenRevocationService: AccessTokenRevocationService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (PUBLIC_AUTH_PATHS.has(req.path)) {
      next();
      return;
    }

    const accessToken = req.cookies?.[CONSOLE_AUTH_COOKIES.ACCESS_TOKEN];
    if (!accessToken) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'No active session' });
      return;
    }

    try {
      const payload = this.consoleAuthService.verifyAccessToken(accessToken);
      await this.tokenRevocationService.assertAccessTokenActive(payload, 'tenant');
      const user = await this.consoleAuthService.getCurrentUser(payload.sub);

      if (!user) {
        res.status(401).json({ code: 'UNAUTHORIZED', message: 'No active session' });
        return;
      }

      const context = req as Request & RequestContext;
      context.auth = payload;
      context.user = user;
    } catch (error) {
      const forbidden = error instanceof ForbiddenException;
      res.status(forbidden ? 403 : 401).json({
        code: forbidden ? 'FORBIDDEN' : 'UNAUTHORIZED',
        message: forbidden ? 'Invalid console session scope' : 'No active session',
      });
      return;
    }

    next();
  }
}
