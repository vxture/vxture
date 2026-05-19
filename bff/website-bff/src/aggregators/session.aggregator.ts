/**
 * session.aggregator.ts - 当前用户会话数据聚合器
 * @package @vxture/bff-website
 *
 * 聚合当前登录用户的账号信息与 Profile，供 /api/me 系列路由使用。
 * 只做数据读取和格式转换，不含业务逻辑。
 *
 * @author AI-Generated
 * @date 2026-05-03
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Aggregator
 */

import { Inject, Injectable } from "@nestjs/common";
import { AccountAuthService } from "@vxture/service-iam";
import type {
  AccountProfileDto,
  AuthUserDto,
  UpdateProfileDto,
} from "../types/auth.types";

// ============================================================================
// SessionAggregator
// ============================================================================

@Injectable()
export class SessionAggregator {
  constructor(
    @Inject(AccountAuthService)
    private readonly accountAuthService: AccountAuthService,
  ) {}

  /**
   * 获取当前用户的基础信息（用于 GET /api/me）。
   * 并行拉取 account + profile，合并成前端消费的 AuthUserDto。
   */
  async getCurrentUser(accountId: string): Promise<AuthUserDto | null> {
    const [account, profile] = await Promise.all([
      this.accountAuthService.getAccountById(accountId),
      this.accountAuthService.getAccountProfile(accountId),
    ]);

    if (!account) {
      return null;
    }

    return {
      id: account.id,
      name: account.username,
      displayName: profile?.displayName ?? null,
      username: account.username,
      email: account.email ?? `${account.username}@local.vxture`,
      phone: account.phone ?? null,
      role: "member",
      roleLabel: "Member",
      personalVerified: true,
      organizationVerified: false,
    };
  }

  /**
   * 获取当前用户的完整 Profile（用于 GET /api/me/profile）。
   * 包含 headline、bio、timezone、language 等扩展字段。
   */
  async getCurrentUserProfile(
    accountId: string,
  ): Promise<AccountProfileDto | null> {
    const profile = await this.accountAuthService.getAccountProfile(accountId);
    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      headline: profile.headline,
      bio: profile.bio,
      email: profile.email,
      phone: profile.phone,
      timezone: profile.timezone,
      language: profile.language,
      profileUpdatedAt: profile.profileUpdatedAt
        ? profile.profileUpdatedAt.toISOString()
        : null,
    };
  }

  /**
   * 更新当前用户 Profile（用于 PUT /api/me/profile）。
   * 返回更新后的完整 Profile；账号不存在时返回 null。
   */
  async updateCurrentUserProfile(
    accountId: string,
    input: UpdateProfileDto,
  ): Promise<AccountProfileDto | null> {
    const profile = await this.accountAuthService.updateAccountProfile(
      accountId,
      {
        ...(input.displayName !== undefined
          ? { displayName: input.displayName }
          : {}),
        ...(input.avatarUrl !== undefined
          ? { avatarUrl: input.avatarUrl }
          : {}),
        ...(input.headline !== undefined ? { headline: input.headline } : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
        ...(input.language !== undefined ? { language: input.language } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
      },
    );

    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      headline: profile.headline,
      bio: profile.bio,
      email: profile.email,
      phone: profile.phone,
      timezone: profile.timezone,
      language: profile.language,
      profileUpdatedAt: profile.profileUpdatedAt
        ? profile.profileUpdatedAt.toISOString()
        : null,
    };
  }

  /**
   * 修改当前用户密码（用于 PUT /api/me/password）。
   * 当前密码错误时 AccountAuthService 会抛出 UnauthorizedException。
   */
  async changePassword(
    accountId: string,
    currentPassword: string,
    nextPassword: string,
  ): Promise<void> {
    await this.accountAuthService.changePassword(
      accountId,
      currentPassword,
      nextPassword,
    );
  }
}
