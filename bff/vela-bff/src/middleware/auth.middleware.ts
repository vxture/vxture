/**
 * auth.middleware.ts - JWT 验证中间件
 * @package @vxture/bff-vela
 * @layer Application
 * @category Middleware
 *
 * @description
 *   从 Cookie 提取 access token，验证签名，挂载 req.user。
 *   与其他 BFF 的 auth.middleware 不同：本中间件对 /vela/* 路由严格要求认证，
 *   token 缺失或无效一律返回 401（不 passthrough）。
 *   jti 黑名单与用户级撤销标记通过 AccessTokenRevocationService 检查，Redis 不可用时 fail-closed。
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import { Inject, Injectable, UnauthorizedException, type NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { NextFunction, Request, Response } from 'express';
import { AccessTokenRevocationService, JwtAuthScope, JwtUserType, type JwtAccessPayload } from '@vxture/core-auth';
import { VxConfigService } from '@vxture/core-config';
import { AUTH_CONSTANTS } from '@vxture/shared';
import type { VelaAuthUser, VelaRequest } from '../types/chat.types';

const HOST_ACCESS_COOKIE_KEYS = {
  admin:   'vx_admin_access_token',
  console: AUTH_CONSTANTS.TENANT_COOKIE_KEYS.ACCESS_TOKEN,
} as const;

const EXPECTED_AUTH_SCOPE = {
  admin:   JwtAuthScope.PLATFORM_ADMIN,
  console: JwtAuthScope.TENANT_CONSOLE,
} as const;

const EXPECTED_USER_TYPE = {
  admin:   JwtUserType.OPERATOR,
  console: JwtUserType.TENANT_USER,
} as const;

type VelaAuthSurface = keyof typeof HOST_ACCESS_COOKIE_KEYS;

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(VxConfigService) private readonly configService: VxConfigService,
    @Inject(AccessTokenRevocationService)
    private readonly tokenRevocationService: AccessTokenRevocationService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const surface = normalizeSurface(req.headers['x-vela-surface']);
    if (!surface) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Vela surface',
      });
    }

    const accessToken = req.cookies?.[HOST_ACCESS_COOKIE_KEYS[surface]];

    if (!accessToken) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: `Missing ${surface} access token`,
      });
    }

    let payload: JwtAccessPayload;
    try {
      payload = this.jwtService.verify<JwtAccessPayload>(accessToken, {
        secret: this.configService.auth.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired access token',
      });
    }

    if (payload.authScope !== EXPECTED_AUTH_SCOPE[surface]) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Token scope does not match Vela surface',
      });
    }

    if (payload.userType !== EXPECTED_USER_TYPE[surface]) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Token user type does not match Vela surface',
      });
    }

    if (surface === 'console' && !payload.tenantId?.trim()) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Console Vela token requires tenantId',
      });
    }

    await this.tokenRevocationService.assertAccessTokenActive(
      payload,
      surface === 'admin' ? 'operator' : 'tenant',
    );

    const user: VelaAuthUser = {
      userId: payload.sub,
      userType: payload.userType,
      role: payload.role,
      tenantId: payload.tenantId || null,
      email: payload.email,
    };

    (req as VelaRequest).user = user;
    next();
  }
}

function normalizeSurface(value: unknown): VelaAuthSurface | null {
  if (value === 'admin' || value === 'console') return value;
  return null;
}
