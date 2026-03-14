/**
 * jwt.client.ts - JWT 签发与验证
 * @package @vxture/core-auth
 *
 * 封装 @nestjs/jwt，提供类型安全的 JWT 操作。
 * 依赖 VxConfigService 注入 JWT 配置，不硬编码任何密钥。
 */

import { Injectable } from '@nestjs/common';
import { JwtService }  from '@nestjs/jwt';

import type { JwtAccessPayload, JwtRefreshPayload, AuthTokenPair } from '../types/auth.types';

// ============================================================================
// VxJwtClient
// ============================================================================

@Injectable()
export class VxJwtClient {
  constructor(private readonly jwtService: JwtService) {}

  // --------------------------------------------------------------------------
  // Access Token
  // --------------------------------------------------------------------------

  /**
   * 签发 access token
   */
  signAccessToken(payload: Omit<JwtAccessPayload, 'iat' | 'exp'>): string {
    return this.jwtService.sign(payload);
    // 过期时间由 JwtModule.registerAsync options.signOptions.expiresIn 控制
    // 在各 BFF / agent-server 的 AppModule 里配置
  }

  /**
   * 验证并解码 access token
   * token 无效或过期时抛出 JsonWebTokenError / TokenExpiredError
   */
  verifyAccessToken(token: string): JwtAccessPayload {
    return this.jwtService.verify<JwtAccessPayload>(token);
  }

  /**
   * 仅解码不验证签名（用于日志、调试）
   */
  decodeAccessToken(token: string): JwtAccessPayload | null {
    return this.jwtService.decode<JwtAccessPayload>(token);
  }

  // --------------------------------------------------------------------------
  // Refresh Token
  // --------------------------------------------------------------------------

  /**
   * 签发 refresh token（使用独立 secret）
   * @param payload   refresh token 载荷
   * @param secret    refresh token 专用 secret（与 access token 不同）
   * @param expiresIn 有效期，如 '7d'
   */
  signRefreshToken(
    payload: Omit<JwtRefreshPayload, 'iat' | 'exp'>,
    secret: string,
    expiresIn: string,
  ): string {
    return this.jwtService.sign(payload, { secret, expiresIn });
  }

  /**
   * 验证 refresh token
   */
  verifyRefreshToken(token: string, secret: string): JwtRefreshPayload {
    return this.jwtService.verify<JwtRefreshPayload>(token, { secret });
  }

  // --------------------------------------------------------------------------
  // Token Pair（登录成功后一次性签发 access + refresh）
  // --------------------------------------------------------------------------

  /**
   * 同时签发 access token 和 refresh token
   *
   * @param accessPayload  access token 载荷
   * @param refreshPayload refresh token 载荷（含 jti）
   * @param refreshSecret  refresh token 专用 secret
   * @param refreshExpires refresh token 有效期（如 '7d'）
   * @param accessExpiresIn access token 有效期（秒，用于返回给前端）
   */
  signTokenPair(params: {
    accessPayload:   Omit<JwtAccessPayload,  'iat' | 'exp'>;
    refreshPayload:  Omit<JwtRefreshPayload, 'iat' | 'exp'>;
    refreshSecret:   string;
    refreshExpires:  string;
    accessExpiresIn: number;
  }): AuthTokenPair {
    const accessToken  = this.signAccessToken(params.accessPayload);
    const refreshToken = this.signRefreshToken(
      params.refreshPayload,
      params.refreshSecret,
      params.refreshExpires,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: params.accessExpiresIn,
    };
  }
}
