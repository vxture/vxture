import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtAccessPayload, JwtRefreshPayload } from '@vxture/core-auth';
import { JwtAuthScope, JwtUserType, OAuthProviderType } from '@vxture/core-auth';
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
      userType: JwtUserType.TENANT_USER,
      authScope: JwtAuthScope.TENANT_CONSOLE,
      permissions: [],
      provider: OAuthProviderType.PASSWORD,
    };

    const refreshPayload: Omit<JwtRefreshPayload, 'iat' | 'exp'> = {
      sub: account.id,
      tenantId,
      authScope: JwtAuthScope.TENANT_CONSOLE,
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

  /**
   * 手机验证码登录：验证码已在路由层核验，此处仅负责账号查找与 JWT 签发。
   * 手机号未注册时返回 null，路由层应抛出 401。
   */
  async loginWithPhoneCode(phone: string): Promise<{
    tokens: AuthTokenPair;
    user: ConsoleUser;
    tenantId: string | null;
  } | null> {
    const account = await this.accountAuthService.getAccountByPhone(phone);
    if (!account) {
      return null;
    }

    const tenantContext = await this.organizationReadService.resolveTenantContextForAccount(account.id);
    const tenantId = tenantContext?.tenantId ?? '';

    const accessPayload: Omit<JwtAccessPayload, 'iat' | 'exp'> = {
      sub: account.id,
      tenantId,
      email: account.email ?? `${account.username}@local.vxture`,
      role: tenantContext ? 'tenant_admin' : 'member',
      userType: JwtUserType.TENANT_USER,
      authScope: JwtAuthScope.TENANT_CONSOLE,
      permissions: [],
      provider: OAuthProviderType.PASSWORD,
    };

    const refreshPayload: Omit<JwtRefreshPayload, 'iat' | 'exp'> = {
      sub: account.id,
      tenantId,
      authScope: JwtAuthScope.TENANT_CONSOLE,
      jti: `${account.id}:${Date.now()}`,
    };

    const tokens: AuthTokenPair = {
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

  verifyAccessToken(token: string): JwtAccessPayload {
    const payload = this.jwtService.verify<JwtAccessPayload>(token, {
      secret: this.configService.auth.JWT_SECRET,
    });

    if (payload.authScope !== JwtAuthScope.TENANT_CONSOLE) {
      throw new Error('Invalid console token scope');
    }
    if (payload.userType !== JwtUserType.TENANT_USER) {
      throw new Error('Invalid console token user type');
    }
    if (!payload.tenantId?.trim()) {
      throw new Error('Console token requires tenantId');
    }

    return payload;
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
