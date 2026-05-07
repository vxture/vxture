import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtAccessPayload } from '@vxture/core-auth';
import { JwtAuthScope, JwtUserType } from '@vxture/core-auth';
import { VxConfigService } from '@vxture/core-config';
import { AccountAuthService } from '@vxture/service-iam';
import type { ConsoleUser } from '../types/console.types';

/**
 * 【重构 v1.4】Console Auth Service
 *
 * JWT 签发已统一迁移至 auth-bff。
 * 本服务保留 JWT 验证（auth middleware 使用）和用户查询功能。
 */
@Injectable()
export class ConsoleAuthService {
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(VxConfigService)
    private readonly configService: VxConfigService,
    @Inject(AccountAuthService)
    private readonly accountAuthService: AccountAuthService,
  ) {}

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
