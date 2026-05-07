/**
 * auth.service.ts - Website BFF Authentication Service
 * @package @vxture/bff-website
 *
 * 【重构 v1.3】不再签发 JWT，只负责：
 *   - 本地验证 JWT（auth middleware 使用，无状态，共享 JWT_SECRET）
 *   - 查询当前用户信息（委托 service-iam）
 *   - 密码重置流程（不涉及签发）
 *
 * JWT 签发已统一迁移至 @vxture/bff-auth。
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.3
 */

import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtAccessPayload } from '@vxture/core-auth';
import { VxConfigService } from '@vxture/core-config';
import { AccountAuthService } from '@vxture/service-iam';
import { MailService } from '@vxture/service-mail';
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
    @Inject(MailService)
    private readonly mailService: MailService,
  ) {}

  verifyAccessToken(token: string) {
    return this.jwtService.verify<JwtAccessPayload>(token, {
      secret: this.configService.auth.JWT_SECRET,
    });
  }

  async getCurrentUser(accountId: string): Promise<AuthUserDto | null> {
    const account = await this.accountAuthService.getAccountById(accountId);
    if (!account) return null;

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

  async requestPasswordReset(email: string): Promise<string | null> {
    const result = await this.accountAuthService.requestPasswordReset(email);
    if (!result) return null;

    const baseUrl = process.env['WEBSITE_BASE_URL']?.replace(/\/$/, '') ?? 'http://localhost:3010';
    const resetUrl = `${baseUrl}/reset-password?token=${result}`;

    await this.mailService.sendPasswordReset(email, resetUrl);

    return null;
  }

  async resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
    return this.accountAuthService.resetPasswordWithToken(token, newPassword);
  }
}
