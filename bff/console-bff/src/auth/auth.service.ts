import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtAccessPayload, JwtRefreshPayload } from '@vxture/core-auth';
import { OAuthProviderType } from '@vxture/core-auth';
import { VxConfigService } from '@vxture/core-config';
import { AccountAuthService } from '@vxture/service-iam';
import { OrganizationReadService } from '@vxture/service-organization';
import type { AuthTokenPair } from '@vxture/core-auth';
import type { ConsoleUser } from '../types/console.types';

@Injectable()
export class ConsoleAuthService {
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(VxConfigService)
    private readonly configService: VxConfigService,
    @Inject(AccountAuthService)
    private readonly accountAuthService: AccountAuthService,
    @Inject(OrganizationReadService)
    private readonly organizationReadService: OrganizationReadService,
  ) {}

  async loginWithPassword(identifier: string, password: string): Promise<{
    tokens: AuthTokenPair;
    user: ConsoleUser;
    tenantId: string | null;
  }> {
    const account = await this.accountAuthService.authenticate(identifier, password);
    const tenantContext = await this.organizationReadService.resolveTenantContextForAccount(account.id);
    const tenantId = tenantContext?.tenantId ?? '';

    const accessPayload: Omit<JwtAccessPayload, 'iat' | 'exp'> = {
      sub: account.id,
      tenantId,
      email: account.email ?? `${account.username}@local.vxture`,
      role: tenantContext ? 'tenant_admin' : 'member',
      permissions: [],
      provider: OAuthProviderType.PASSWORD,
    };

    const refreshPayload: Omit<JwtRefreshPayload, 'iat' | 'exp'> = {
      sub: account.id,
      tenantId,
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
        roleLabel: tenantContext ? 'Tenant Administrator' : 'Member',
        username: account.username,
        phone: account.phone,
      },
      tenantId: tenantContext?.tenantId ?? null,
    };
  }

  async getCurrentUser(accountId: string): Promise<ConsoleUser | null> {
    const account = await this.accountAuthService.getAccountById(accountId);
    if (!account) {
      return null;
    }

    return {
      id: account.id,
      name: account.username,
      email: account.email ?? `${account.username}@local.vxture`,
      roleLabel: 'Authenticated User',
      username: account.username,
      phone: account.phone,
    };
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verify<{
      sub: string;
      tenantId: string;
      email: string;
      role: string;
      permissions?: string[];
    }>(token, {
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
