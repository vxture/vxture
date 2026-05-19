/**
 * auth.service.ts - 统一 JWT 签发服务
 * @package @vxture/bff-auth
 *
 * 职责：
 * - 唯一有权调用 jwtService.sign 的场所
 * - 封装四类签发场景：密码登录、手机登录、OAuth 登录、tenant init
 * - 支持 source 参数区分不同 domain 的登录入口（website / console / admin / ruyin）
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.0
 */

import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { JwtService } from "@nestjs/jwt";
import type {
  AuthTokenPair,
  JwtAccessPayload,
  JwtRefreshPayload,
  OAuthUserProfile,
} from "@vxture/core-auth";
import {
  JwtAuthScope,
  JwtUserType,
  OAuthProviderType,
} from "@vxture/core-auth";
import { VxConfigService } from "@vxture/core-config";
import { AccountAuthService } from "@vxture/service-iam";
import { OrganizationReadService } from "@vxture/service-organization";
import type { AuthUserDto } from "../types/auth.types";

/**
 * 登录来源，决定写入哪组 Cookie key 以及 JWT 的 userType
 * - 'website' / 'console' → tenant_user（租户账号）
 * - 'admin'              → operator（运营账号）
 * - 'ruyin'              → tenant_user（租户账号，独立 domain）
 */
export type LoginSource = "website" | "console" | "admin" | "ruyin";

/**
 * 密码登录结果
 */
export interface LoginResult {
  tokens: AuthTokenPair;
  user: AuthUserDto;
  tenantId: string | null;
}

/**
 * OAuth 登录结果
 */
export interface OAuthLoginResult {
  tokens: AuthTokenPair;
  user: AuthUserDto;
  tenantId: string | null;
  isNewAccount: boolean;
}

export interface OperatorTokenInput {
  sub: string;
  email: string;
  username?: string | null;
  displayName?: string | null;
  role?: string | null;
  roleLabel?: string | null;
  permissions?: string[];
}

// =============================================================================
// 辅助函数
// =============================================================================

function parseExpiresToSeconds(value: string): number {
  if (/^\d+$/.test(value)) return Number(value);
  const m = value.match(/^(\d+)([smhd])$/);
  if (!m) return 900;
  const n = Number(m[1]);
  switch (m[2]) {
    case "s":
      return n;
    case "m":
      return n * 60;
    case "h":
      return n * 3600;
    case "d":
      return n * 86400;
    default:
      return 900;
  }
}

function newJti(): string {
  return randomUUID();
}

type AccessPayloadInput = Omit<JwtAccessPayload, "iat" | "exp"> & {
  jti: string;
};

// =============================================================================
// AuthService
// =============================================================================

@Injectable()
export class AuthService {
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

  // ─── 工具：签发 Token 对 ─────────────────────────────────────────────────
  // 这是整个系统中唯一调用 jwtService.sign 的地方。
  // 其他 BFF 只能 verify，不得 sign。

  private signTokenPair(
    accessPayload: AccessPayloadInput,
    refreshPayload: Omit<JwtRefreshPayload, "iat" | "exp">,
  ): AuthTokenPair {
    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.auth.JWT_SECRET,
      expiresIn: this.configService.auth.JWT_ACCESS_EXPIRES_IN as never,
    });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.auth.JWT_SECRET,
      expiresIn: this.configService.auth.JWT_REFRESH_EXPIRES_IN as never,
    });
    return {
      accessToken,
      refreshToken,
      expiresIn: parseExpiresToSeconds(
        this.configService.auth.JWT_ACCESS_EXPIRES_IN,
      ),
      refreshExpiresIn: parseExpiresToSeconds(
        this.configService.auth.JWT_REFRESH_EXPIRES_IN,
      ),
    };
  }

  // ─── 密码登录（租户账号：website / console / ruyin）──────────────────────
  // 与运营账号共用同一个 password login 入口，通过 source 区分返回值

  async loginWithPassword(
    identifier: string,
    password: string,
    source: LoginSource = "website",
  ): Promise<LoginResult> {
    if (source === "admin") {
      throw new Error("Operator password login must be completed by admin-bff");
    }

    const account = await this.accountAuthService.authenticate(
      identifier,
      password,
    );

    let tenantId = "";
    let role = "member";
    const authScope = JwtAuthScope.TENANT_CONSOLE;
    const userType = JwtUserType.TENANT_USER;
    const tenantContext =
      await this.organizationReadService.resolveTenantContextForAccount(
        account.id,
      );
    tenantId = tenantContext?.tenantId ?? "";
    role = tenantContext ? "tenant_admin" : "member";

    const accessPayload: AccessPayloadInput = {
      sub: account.id,
      tenantId,
      email: account.email ?? `${account.username}@local.vxture`,
      role,
      userType,
      authScope,
      permissions: [],
      provider: OAuthProviderType.PASSWORD,
      jti: newJti(),
    };

    const refreshPayload: Omit<JwtRefreshPayload, "iat" | "exp"> = {
      sub: account.id,
      tenantId,
      authScope,
      jti: newJti(),
    };

    const tokens = this.signTokenPair(accessPayload, refreshPayload);
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
        role,
        roleLabel: role === "tenant_admin" ? "Tenant Administrator" : "Member",
        personalVerified: true,
        organizationVerified: false,
      },
      tenantId,
    };
  }

  // ─── 手机验证码登录 ──────────────────────────────────────────────────────

  async loginWithPhoneCode(
    phone: string,
    source: LoginSource = "website",
  ): Promise<LoginResult | null> {
    if (source === "admin") {
      throw new Error("Operator phone login is not supported");
    }

    const account = await this.accountAuthService.getAccountByPhone(phone);
    if (!account) return null;

    let tenantId = "";
    let role = "member";

    const tenantContext =
      await this.organizationReadService.resolveTenantContextForAccount(
        account.id,
      );
    tenantId = tenantContext?.tenantId ?? "";
    role = tenantContext ? "tenant_admin" : "member";

    const accessPayload: AccessPayloadInput = {
      sub: account.id,
      tenantId,
      email: account.email ?? `${account.username}@local.vxture`,
      role,
      userType: JwtUserType.TENANT_USER,
      authScope: JwtAuthScope.TENANT_CONSOLE,
      permissions: [],
      provider: OAuthProviderType.PASSWORD,
      jti: newJti(),
    };

    const refreshPayload: Omit<JwtRefreshPayload, "iat" | "exp"> = {
      sub: account.id,
      tenantId,
      authScope: JwtAuthScope.TENANT_CONSOLE,
      jti: newJti(),
    };

    const tokens = this.signTokenPair(accessPayload, refreshPayload);
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
        role,
        roleLabel: role === "tenant_admin" ? "Tenant Administrator" : "Member",
        personalVerified: true,
        organizationVerified: false,
      },
      tenantId,
    };
  }

  // ─── 注册 ────────────────────────────────────────────────────────────────

  async registerWithPassword(
    email: string,
    name: string,
    password: string,
  ): Promise<LoginResult> {
    const account = await this.accountAuthService.registerWithPassword(
      email,
      name,
      password,
    );

    const tokens = this.signTokenPair(
      {
        sub: account.id,
        tenantId: "",
        email: account.email ?? email,
        role: "member",
        userType: JwtUserType.TENANT_USER,
        authScope: JwtAuthScope.TENANT_CONSOLE,
        permissions: [],
        provider: OAuthProviderType.PASSWORD,
        jti: newJti(),
      },
      {
        sub: account.id,
        tenantId: "",
        authScope: JwtAuthScope.TENANT_CONSOLE,
        jti: newJti(),
      },
    );

    return {
      tokens,
      user: {
        id: account.id,
        name: account.username,
        displayName: name,
        username: account.username,
        email: account.email ?? email,
        phone: null,
        role: "member",
        roleLabel: "Member",
        personalVerified: false,
        organizationVerified: false,
      },
      tenantId: null,
    };
  }

  // ─── OAuth 登录 ──────────────────────────────────────────────────────────

  async loginWithOAuth(profile: OAuthUserProfile): Promise<OAuthLoginResult> {
    const account = await this.accountAuthService.loginWithOAuth({
      provider: profile.provider,
      providerId: profile.providerId,
      name: profile.name,
      email: profile.email ?? null,
      avatarUrl: profile.avatar ?? null,
    });

    const tenantContext =
      await this.organizationReadService.resolveTenantContextForAccount(
        account.id,
      );
    const tenantId = tenantContext?.tenantId ?? "";
    const role = tenantContext ? "tenant_admin" : "member";

    const tokens = this.signTokenPair(
      {
        sub: account.id,
        tenantId,
        email: account.email ?? `${account.username}@local.vxture`,
        role,
        userType: JwtUserType.TENANT_USER,
        authScope: JwtAuthScope.TENANT_CONSOLE,
        permissions: [],
        provider: profile.provider,
        jti: newJti(),
      },
      {
        sub: account.id,
        tenantId,
        authScope: JwtAuthScope.TENANT_CONSOLE,
        jti: newJti(),
      },
    );

    const accountProfile = await this.accountAuthService.getAccountProfile(
      account.id,
    );

    return {
      tokens,
      user: {
        id: account.id,
        name: account.username,
        displayName: accountProfile?.displayName ?? profile.name,
        username: account.username,
        email: account.email ?? `${account.username}@local.vxture`,
        phone: account.phone,
        role,
        roleLabel: role === "tenant_admin" ? "Tenant Administrator" : "Member",
        personalVerified: true,
        organizationVerified: false,
      },
      tenantId: tenantId || null,
      isNewAccount: false,
    };
  }

  // ─── 租户初始化 ──────────────────────────────────────────────────────────

  async initTenant(
    accountId: string,
    email: string,
    type: "individual" | "organization",
  ): Promise<{ tokens: AuthTokenPair; tenantId: string }> {
    let tenantId: string;
    const existing =
      await this.organizationReadService.resolveTenantContextForAccount(
        accountId,
      );

    if (existing) {
      tenantId = existing.tenantId;
    } else {
      const profile =
        await this.accountAuthService.getAccountProfile(accountId);
      const displayName = profile?.displayName ?? email.split("@")[0] ?? "user";
      const dbType = type === "organization" ? "company" : "individual";
      const context = await this.organizationReadService.createTenantForAccount(
        {
          accountId,
          email,
          displayName,
          type: dbType as "individual" | "company",
        },
      );
      tenantId = context.tenantId;
    }

    const tokens = this.signTokenPair(
      {
        sub: accountId,
        tenantId,
        email,
        role: "member",
        userType: JwtUserType.TENANT_USER,
        authScope: JwtAuthScope.TENANT_CONSOLE,
        permissions: [],
        provider: OAuthProviderType.PASSWORD,
        jti: newJti(),
      },
      {
        sub: accountId,
        tenantId,
        authScope: JwtAuthScope.TENANT_CONSOLE,
        jti: newJti(),
      },
    );

    return { tokens, tenantId };
  }

  // ─── 运营账号 Token 签发 ────────────────────────────────────────────────
  // operator 来自 platform.platform_admin，不属于 tenant account 体系。

  issueOperatorTokens(input: OperatorTokenInput): LoginResult {
    const role = input.role?.trim() || "admin";
    const email = input.email?.trim() || `${input.sub}@operator.local.vxture`;
    const username = input.username?.trim() || email.split("@")[0] || input.sub;

    const tokens = this.signTokenPair(
      {
        sub: input.sub,
        tenantId: "",
        email,
        role,
        userType: JwtUserType.OPERATOR,
        authScope: JwtAuthScope.PLATFORM_ADMIN,
        permissions: input.permissions ?? [],
        provider: OAuthProviderType.PASSWORD,
        jti: newJti(),
      },
      {
        sub: input.sub,
        tenantId: "",
        authScope: JwtAuthScope.PLATFORM_ADMIN,
        jti: newJti(),
      },
    );

    return {
      tokens,
      user: {
        id: input.sub,
        name: username,
        username,
        displayName: input.displayName ?? null,
        email,
        phone: null,
        role,
        roleLabel: input.roleLabel ?? "Platform Operator",
        personalVerified: null,
        organizationVerified: null,
      },
      tenantId: null,
    };
  }

  // ─── 根据 userId 重新签发 Token（用于 refresh） ─────────────────────────
  // 不需要密码验证，直接用 accountId 查询并签发

  async reissueTokensForUser(
    userId: string,
    source: LoginSource = "website",
    selectedTenantId?: string | null,
  ): Promise<LoginResult> {
    if (source === "admin") {
      throw new Error(
        "Operator tokens must be issued with issueOperatorTokens",
      );
    }

    const account = await this.accountAuthService.getAccountById(userId);
    if (!account) throw new Error(`Account not found: ${userId}`);

    let tenantId = "";
    let role = "member";
    const authScope = JwtAuthScope.TENANT_CONSOLE;
    const userType = JwtUserType.TENANT_USER;
    const tenantContext = selectedTenantId?.trim()
      ? await this.organizationReadService.resolveTenantContextForAccountById(
          account.id,
          selectedTenantId,
        )
      : await this.organizationReadService.resolveTenantContextForAccount(
          account.id,
        );
    if (selectedTenantId?.trim() && !tenantContext) {
      throw new Error("Tenant is not accessible for this account");
    }
    tenantId = tenantContext?.tenantId ?? "";
    role = tenantContext ? "tenant_admin" : "member";

    const accessPayload: AccessPayloadInput = {
      sub: account.id,
      tenantId,
      email: account.email ?? `${account.username}@local.vxture`,
      role,
      userType,
      authScope,
      permissions: [],
      provider: OAuthProviderType.PASSWORD,
      jti: newJti(),
    };

    const refreshPayload: Omit<JwtRefreshPayload, "iat" | "exp"> = {
      sub: account.id,
      tenantId,
      authScope,
      jti: newJti(),
    };

    const tokens = this.signTokenPair(accessPayload, refreshPayload);
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
        role,
        roleLabel: role === "tenant_admin" ? "Tenant Administrator" : "Member",
        personalVerified: true,
        organizationVerified: false,
      },
      tenantId,
    };
  }

  // ─── JWT 验证（供内部使用） ────────────────────────────────────────────

  verifyAccessToken(
    token: string,
    expectedScope?: JwtAuthScope,
  ): JwtAccessPayload {
    const payload = this.jwtService.verify<JwtAccessPayload>(token, {
      secret: this.configService.auth.JWT_SECRET,
    });

    if (expectedScope && payload.authScope !== expectedScope) {
      throw new Error(
        `Invalid token scope: expected ${expectedScope}, got ${payload.authScope}`,
      );
    }

    return payload;
  }

  verifyRefreshToken(token: string): JwtRefreshPayload {
    return this.jwtService.verify<JwtRefreshPayload>(token, {
      secret: this.configService.auth.JWT_SECRET,
    });
  }
}
