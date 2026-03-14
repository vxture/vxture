/**
 * jwt-auth.guard.ts - JWT 认证守卫
 * @package @vxture/core-auth
 * @description
 *   验证请求携带的 access token，验证通过后将 AuthUser 挂载到 request.user
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector }  from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { extractBearerTokenFromHeaders } from '../utils/auth.utils';
import { IS_PUBLIC_KEY }                 from '../decorators/public.decorator';
import type { JwtAccessPayload, AuthUser } from '../types/auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector:  Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // 检查是否标记为 @Public()，跳过验证
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: AuthUser;
    }>();

    const token = extractBearerTokenFromHeaders(request.headers);

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const payload = this.jwtService.verify<JwtAccessPayload>(token);

      // 将标准化的 AuthUser 挂载到 request.user
      request.user = {
        userId:      payload.sub,
        tenantId:    payload.tenantId,
        email:       payload.email,
        role:        payload.role,
        permissions: payload.permissions ?? [],
        provider:    payload.provider,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
