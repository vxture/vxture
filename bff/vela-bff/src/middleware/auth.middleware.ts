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
 *   jti 黑名单通过 RedisService.isBlacklisted() 检查，Redis 不可用时 fail-open。
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import { Inject, Injectable, Logger, UnauthorizedException, type NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { NextFunction, Request, Response } from 'express';
import type { JwtAccessPayload } from '@vxture/core-auth';
import { JwtAuthScope, JwtUserType } from '@vxture/core-auth';
import { VxConfigService } from '@vxture/core-config';
import { RedisService } from '../redis/redis.service';
import type { VelaAuthUser, VelaRequest } from '../types/chat.types';

const HOST_ACCESS_COOKIE_KEYS = {
  admin:   'vx_admin_access_token',
  console: 'vx_console_access_token',
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

/** JwtAccessPayload 扩展：标准 JWT jti claim，由签发方写入但未在类型定义中声明 */
type JwtAccessPayloadWithJti = JwtAccessPayload & { jti?: string };

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(VxConfigService) private readonly configService: VxConfigService,
    @Inject(RedisService) private readonly redisService: RedisService,
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

    let payload: JwtAccessPayloadWithJti;
    try {
      payload = this.jwtService.verify<JwtAccessPayloadWithJti>(accessToken, {
        secret: this.configService.auth.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired access token',
      });
    }

    // jti 黑名单检查：token 被主动吊销（登出/强制失效）时拒绝访问
    if (payload.jti) {
      const blacklisted = await this.redisService.isBlacklisted(payload.jti);
      if (blacklisted) {
        throw new UnauthorizedException({
          statusCode: 401,
          code: 'TOKEN_REVOKED',
          message: 'Access token has been revoked',
        });
      }
    } else {
      // jti 缺失时黑名单功能无法生效，提示运维检查 JWT 签发配置是否写入 jti
      this.logger.warn(
        `Access token for user ${payload.sub} has no jti claim — blacklist check skipped. ` +
        `Ensure the JWT issuer includes jti in access tokens.`,
      );
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
