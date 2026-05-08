import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenRevocationService, JwtAuthScope, JwtUserType, type JwtAccessPayload } from '@vxture/core-auth';
import { VxConfigService } from '@vxture/core-config';
import type { NextFunction, Request, Response } from 'express';
import { ADMIN_AUTH_COOKIES } from '../auth/cookie.constants';
import { PlatformAuthService } from '../auth/auth.service';
import type { RequestContext } from '../types/console.types';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(PlatformAuthService) private readonly platformAuthService: PlatformAuthService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(VxConfigService) private readonly configService: VxConfigService,
    @Inject(AccessTokenRevocationService)
    private readonly tokenRevocationService: AccessTokenRevocationService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    if (req.path === '/api/auth/login') {
      next();
      return;
    }

    const accessToken = req.cookies?.[ADMIN_AUTH_COOKIES.ACCESS_TOKEN];
    if (!accessToken) {
      next();
      return;
    }

    try {
      const payload = this.jwtService.verify<JwtAccessPayload>(accessToken, {
        secret: this.configService.auth.JWT_SECRET,
      });
      if (payload.userType !== JwtUserType.OPERATOR || payload.authScope !== JwtAuthScope.PLATFORM_ADMIN) {
        next();
        return;
      }
      await this.tokenRevocationService.assertAccessTokenActive(payload, 'operator');
      const user = await this.platformAuthService.getCurrentUser(payload.sub);

      if (user) {
        const capabilities = await this.platformAuthService.getCapabilities(payload.sub);
        (req as Request & RequestContext).user = user;
        (req as Request & RequestContext).capabilities = (
          capabilities.length ? capabilities : payload.permissions ?? []
        ) as RequestContext['capabilities'];
      }
    } catch {
      // Ignore invalid token and let downstream route decide how to respond.
    }

    next();
  }
}
