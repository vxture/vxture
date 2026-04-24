import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthTokenPair, JwtAccessPayload, JwtRefreshPayload } from '@vxture/core-auth';
import { OAuthProviderType } from '@vxture/core-auth';
import { VxConfigService } from '@vxture/core-config';
import { AccountAuthService } from '@vxture/service-iam';
import type { AuthUserDto } from '../types/auth.types';

@Injectable()
export class WebsiteAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: VxConfigService,
    private readonly accountAuthService: AccountAuthService,
  ) {}

  async loginWithPassword(identifier: string, password: string): Promise<{
    tokens: AuthTokenPair;
    user: AuthUserDto;
  }> {
    const account = await this.accountAuthService.authenticate(identifier, password);

    const accessPayload: Omit<JwtAccessPayload, 'iat' | 'exp'> = {
      sub: account.id,
      tenantId: '',
      email: account.email ?? `${account.username}@local.vxture`,
      role: 'member',
      permissions: [],
      provider: OAuthProviderType.PASSWORD,
    };

    const refreshPayload: Omit<JwtRefreshPayload, 'iat' | 'exp'> = {
      sub: account.id,
      tenantId: '',
      jti: `${account.id}:${Date.now()}`,
    };

    const tokens = {
      accessToken: this.jwtService.sign(accessPayload, {
        secret: this.configService.auth.JWT_SECRET,
        expiresIn: this.configService.auth.JWT_ACCESS_EXPIRES_IN as never,
      }),
      refreshToken: this.jwtService.sign(refreshPayload, {
        secret: this.configService.auth.JWT_SECRET,
        expiresIn: this.configService.auth.JWT_REFRESH_EXPIRES_IN as never,
      }),
      expiresIn: parseExpiresToSeconds(this.configService.auth.JWT_ACCESS_EXPIRES_IN),
      refreshExpiresIn: parseExpiresToSeconds(this.configService.auth.JWT_REFRESH_EXPIRES_IN),
    };

    return {
      tokens,
      user: {
        id: account.id,
        name: account.username,
        email: account.email ?? `${account.username}@local.vxture`,
        role: 'member',
      },
    };
  }

  async getCurrentUser(accountId: string): Promise<AuthUserDto | null> {
    const account = await this.accountAuthService.getAccountById(accountId);
    if (!account) {
      return null;
    }

    return {
      id: account.id,
      name: account.username,
      email: account.email ?? `${account.username}@local.vxture`,
      role: 'member',
    };
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verify<JwtAccessPayload>(token, {
      secret: this.configService.auth.JWT_SECRET,
    });
  }
}

function parseExpiresToSeconds(value: string): number {
  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 900;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 60 * 60 * 24;
    default:
      return 900;
  }
}
