import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthTokenPair, JwtAccessPayload, JwtRefreshPayload } from '@vxture/core-auth';
import { JwtAuthScope, JwtUserType, OAuthProviderType } from '@vxture/core-auth';
import { VxConfigService } from '@vxture/core-config';
import { AccountAuthService } from '@vxture/service-iam';
import { MailService } from '@vxture/service-mail';
import { OrganizationReadService } from '@vxture/service-organization';
import type { AuthUserDto } from '../types/auth.types';

@Injectable()
export class WebsiteAuthService {
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(VxConfigService)
    private readonly configService: VxConfigService,
    @Inject(AccountAuthService)
    private readonly accountAuthService: AccountAuthService,
    @Inject(OrganizationReadService)
    private readonly organizationReadService: OrganizationReadService,
    @Inject(MailService)
    private readonly mailService: MailService,
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
      userType: JwtUserType.TENANT_USER,
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

    const profile = await this.accountAuthService.getAccountProfile(account.id);

    return {
      tokens,
      user: {
        id: account.id,
        name: account.username,
        displayName: profile?.displayName ?? null,
        username: account.username,
        email: account.email ?? `${account.username}@local.vxture`,
        phone: account.phone,
        role: 'member',
        roleLabel: 'Member',
        personalVerified: true,
        organizationVerified: false,
      },
    };
  }

  async getCurrentUser(accountId: string): Promise<AuthUserDto | null> {
    const account = await this.accountAuthService.getAccountById(accountId);
    if (!account) {
      return null;
    }

    const profile = await this.accountAuthService.getAccountProfile(account.id);

    return {
      id: account.id,
      name: account.username,
      displayName: profile?.displayName ?? null,
      username: account.username,
      email: account.email ?? `${account.username}@local.vxture`,
      phone: account.phone,
      role: 'member',
      roleLabel: 'Member',
      personalVerified: true,
      organizationVerified: false,
    };
  }

  /**
   * 发起密码重置：生成 token，构建重置链接。
   * 无论邮箱是否存在，调用方都应返回相同的 200 响应（防止邮箱枚举）。
   * 返回 resetUrl 用于日志或邮件发送；若账号不存在返回 null。
   */
  async requestPasswordReset(email: string): Promise<string | null> {
    const result = await this.accountAuthService.requestPasswordReset(email);
    if (!result) {
      return null;
    }

    const baseUrl = process.env['WEBSITE_BASE_URL']?.replace(/\/$/, '') ?? 'http://localhost:3010';
    const resetUrl = `${baseUrl}/reset-password?token=${result.rawToken}`;

    await this.mailService.sendPasswordReset(email, resetUrl);

    return null;
  }

  /** 凭 token 重置密码，token 无效/过期返回 false。 */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
    return this.accountAuthService.resetPasswordWithToken(token, newPassword);
  }

  async registerWithPassword(email: string, name: string, password: string): Promise<{
    tokens: AuthTokenPair;
    user: AuthUserDto;
  }> {
    const account = await this.accountAuthService.registerWithPassword(email, name, password);

    const accessPayload: Omit<JwtAccessPayload, 'iat' | 'exp'> = {
      sub: account.id,
      tenantId: '',
      email: account.email ?? email,
      role: 'member',
      userType: JwtUserType.TENANT_USER,
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
        displayName: name,
        username: account.username,
        email: account.email ?? email,
        phone: null,
        role: 'member',
        roleLabel: 'Member',
        personalVerified: false,
        organizationVerified: false,
      },
    };
  }

  /**
   * 租户初始化：创建租户并重签 JWT（含 tenantId + authScope）。
   * 幂等：账号已有租户时直接复用，不重复创建。
   */
  async initTenant(
    accountId: string,
    email: string,
    type: 'individual' | 'organization',
  ): Promise<{ tokens: AuthTokenPair; tenantId: string }> {
    // 幂等检查：已有租户则直接复用
    let tenantId: string;
    const existing = await this.organizationReadService.resolveTenantContextForAccount(accountId);

    if (existing) {
      tenantId = existing.tenantId;
    } else {
      const profile = await this.accountAuthService.getAccountProfile(accountId);
      const displayName = profile?.displayName ?? email.split('@')[0] ?? 'user';
      // VerifyForm 用 'organization'，DB 存 'company'
      const dbType = type === 'organization' ? 'company' : 'individual';

      const context = await this.organizationReadService.createTenantForAccount({
        accountId,
        email,
        displayName,
        type: dbType as 'individual' | 'company',
      });
      tenantId = context.tenantId;
    }

    const accessPayload: Omit<JwtAccessPayload, 'iat' | 'exp'> = {
      sub: accountId,
      tenantId,
      email,
      role: 'member',
      userType: JwtUserType.TENANT_USER,
      authScope: JwtAuthScope.TENANT_CONSOLE,
      permissions: [],
      provider: OAuthProviderType.PASSWORD,
    };

    const refreshPayload: Omit<JwtRefreshPayload, 'iat' | 'exp'> = {
      sub: accountId,
      tenantId,
      jti: `${accountId}:${Date.now()}`,
      authScope: JwtAuthScope.TENANT_CONSOLE,
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

    return { tokens, tenantId };
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
