import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AUTH_CONSTANTS } from '@vxture/shared';
import { ConsoleAuthService } from '../auth/auth.service';
import type { RequestContext } from '../types/console.types';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(@Inject(ConsoleAuthService) private readonly consoleAuthService: ConsoleAuthService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    if (req.path === '/api/auth/login') {
      next();
      return;
    }

    const accessToken =
      req.cookies?.[AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN] ??
      req.cookies?.vx_console_access_token;
    if (!accessToken) {
      next();
      return;
    }

    try {
      const payload = this.consoleAuthService.verifyAccessToken(accessToken);
      const user = await this.consoleAuthService.getCurrentUser(payload.sub);

      if (user) {
        (req as Request & RequestContext).user = user;
      }
    } catch {
      // Ignore invalid token and let downstream route decide how to respond.
    }

    next();
  }
}
