/**
 * jwt.client.ts - JWT signing and verification
 * @package @vxture/core-auth
 * @description
 *   Encapsulates @nestjs/jwt to provide type-safe JWT operations.
 *   Depends on VxConfigService for JWT configuration, no hardcoded keys.
 * 
 * @author AI-Generated
 * @date 2026-03-15
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
   * Signs access token
   */
  signAccessToken(payload: Omit<JwtAccessPayload, 'iat' | 'exp'>): string {
    return this.jwtService.sign(payload);
    // Expiry time is controlled by JwtModule.registerAsync options.signOptions.expiresIn
    // Configure in each BFF / agent-server's AppModule
  }

  /**
   * Verifies and decodes access token
   * Throws JsonWebTokenError / TokenExpiredError if token is invalid or expired
   */
  verifyAccessToken(token: string): JwtAccessPayload {
    return this.jwtService.verify<JwtAccessPayload>(token);
  }

  /**
   * Decodes without verifying signature (for logging, debugging)
   */
  decodeAccessToken(token: string): JwtAccessPayload | null {
    return this.jwtService.decode<JwtAccessPayload>(token);
  }

  // --------------------------------------------------------------------------
  // Refresh Token
  // --------------------------------------------------------------------------

  /**
   * Signs refresh token (using separate secret)
   * @param payload   refresh token payload
   * @param secret    refresh token specific secret (different from access token)
   * @param expiresIn expiry duration, e.g. '7d'
   */
  signRefreshToken(
    payload: Omit<JwtRefreshPayload, 'iat' | 'exp'>,
    secret: string,
    expiresIn: string,
  ): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = { secret, expiresIn };
    return this.jwtService.sign(payload as unknown as object, options);
  }

  /**
   * Verifies refresh token
   */
  verifyRefreshToken(token: string, secret: string): JwtRefreshPayload {
    return this.jwtService.verify<JwtRefreshPayload>(token, { secret });
  }

  // --------------------------------------------------------------------------
  // Token Pair (sign access + refresh together after login)
  // --------------------------------------------------------------------------

  /**
   * Signs both access token and refresh token at once
   *
   * @param accessPayload  access token payload
   * @param refreshPayload refresh token payload (with jti)
   * @param refreshSecret  refresh token specific secret
   * @param refreshExpires refresh token expiry (e.g. '7d')
   * @param accessExpiresIn access token expiry (seconds, for frontend)
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
