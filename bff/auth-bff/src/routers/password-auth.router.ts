/**
 * password-auth.router.ts - 密码登录路由
 * @package @vxture/bff-auth
 *
 * 职责：
 * - 邮箱+密码登录（支持 source 参数区分来源 domain）
 * - 注册
 * - 登出（清除 cookie + 吊销 refresh token + jti 黑名单）
 * - Token 刷新（access token 续期）
 *
 * Cookie 策略（核心）：
 * - source=website  → 写统一租户 cookie `vx_tenant_*`
 * - source=console  → 写统一租户 cookie `vx_tenant_*`
 * - source=admin    → 写 `vx_admin_*`
 * - source=ruyin    → 写 `ry_*`（ruyin.ai 本域承载同一租户会话）
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.0
 */

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import {
  InternalAuthGuard,
  JwtAuthScope,
  JwtUserType,
  TurnstileVerifier,
} from "@vxture/core-auth";
import { AUTH_CONSTANTS } from "@vxture/shared";
import { VxConfigService } from "@vxture/core-config";
import type { PlatformConfig } from "@vxture/core-config";
import { AccountAuthService } from "@vxture/service-iam";
import { MailService } from "@vxture/service-mail";
import { AuthService, type LoginSource } from "../auth/auth.service";
import {
  RedisService,
  type TenantRefreshSurface,
} from "../redis/redis.service";
import type { AuthUserDto } from "../types/auth.types";

// ============================================================================
// DTO
// ============================================================================

class LoginDto {
  identifier!: string;
  password!: string;
  source?: LoginSource;
  turnstileToken?: string;
}

class SignupDto {
  email!: string;
  name!: string;
  password!: string;
  turnstileToken?: string;
}

class SwitchTenantDto {
  tenantId!: string;
  source?: LoginSource;
}

class ForgotPasswordDto {
  email!: string;
  source?: "website" | "console";
}

class ResetPasswordDto {
  token!: string;
  newPassword!: string;
}

class InitTenantDto {
  type!: "individual" | "organization";
}

// ============================================================================
// Cookie 工具
// ============================================================================

const TENANT_COOKIES = {
  access: AUTH_CONSTANTS.TENANT_COOKIE_KEYS.ACCESS_TOKEN,
  refresh: AUTH_CONSTANTS.TENANT_COOKIE_KEYS.REFRESH_TOKEN,
};

const ADMIN_COOKIES = {
  access: "vx_admin_access_token",
  refresh: "vx_admin_refresh_token",
};

const RUYIN_COOKIES = {
  access: AUTH_CONSTANTS.RUYIN_COOKIE_KEYS.ACCESS_TOKEN,
  refresh: AUTH_CONSTANTS.RUYIN_COOKIE_KEYS.REFRESH_TOKEN,
};

const DEFAULT_SUBJECT_REVOCATION_TTL_SECONDS = 30 * 24 * 60 * 60;
const TENANT_TURNSTILE_ACTION = "tenant_auth";

// 不同 source 映射到不同的 cookie key 组
const COOKIE_MAP: Record<
  LoginSource,
  { access: string; refresh: string; domain?: string }
> = {
  website: TENANT_COOKIES,
  console: TENANT_COOKIES,
  admin: ADMIN_COOKIES,
  ruyin: {
    ...RUYIN_COOKIES,
    // ruyin.ai 是独立 domain，cookie domain 按 source 使用 COOKIE_DOMAIN_RUYIN
  },
};

/**
 * 根据 source 决定写入的 cookie 键组。
 * website / console / ruyin 属于同一租户用户安全域，但 ruyin 必须写入 ruyin.ai 本域 cookie。
 */
function resolveCookies(
  source: LoginSource,
): Array<{ access: string; refresh: string }> {
  return [COOKIE_MAP[source]];
}

function normalizeCookieDomain(domain: string | undefined): string | undefined {
  if (!domain || domain === "localhost") return undefined;
  return domain;
}

function resolvePlatformCookieDomain(cfg: PlatformConfig): string | undefined {
  return normalizeCookieDomain(cfg.COOKIE_DOMAIN_PLATFORM?.trim());
}

function resolveRuyinCookieDomain(cfg: PlatformConfig): string | undefined {
  return normalizeCookieDomain(cfg.COOKIE_DOMAIN_RUYIN?.trim());
}

function resolveCookieDomain(
  source: LoginSource,
  cfg: PlatformConfig,
): string | undefined {
  return source === "ruyin"
    ? resolveRuyinCookieDomain(cfg)
    : resolvePlatformCookieDomain(cfg);
}

function clearCookieGroup(
  res: Response,
  cookies: Array<{ access: string; refresh: string }>,
  domain: string | undefined,
) {
  for (const { access, refresh } of cookies) {
    res.clearCookie(access, { path: "/", domain });
    res.clearCookie(refresh, { path: "/", domain });
  }
}

function clearCookiesForSource(
  res: Response,
  source: LoginSource,
  cfg: PlatformConfig,
) {
  if (source === "admin") {
    clearCookieGroup(res, [ADMIN_COOKIES], resolvePlatformCookieDomain(cfg));
    return;
  }
  if (source === "ruyin") {
    clearCookieGroup(res, [RUYIN_COOKIES], resolveRuyinCookieDomain(cfg));
    clearCookieGroup(res, [TENANT_COOKIES], resolvePlatformCookieDomain(cfg));
    return;
  }

  clearCookieGroup(res, [TENANT_COOKIES], resolvePlatformCookieDomain(cfg));
}

function readTenantCookie(
  req: Request,
  type: "access" | "refresh",
): string | undefined {
  return req.cookies?.[TENANT_COOKIES[type]];
}

function readAccessToken(
  req: Request,
  source: LoginSource,
): string | undefined {
  if (source === "admin") return req.cookies?.[ADMIN_COOKIES.access];
  if (source === "ruyin") return req.cookies?.[RUYIN_COOKIES.access];
  return readTenantCookie(req, "access");
}

function readRefreshToken(
  req: Request,
  source: LoginSource,
): string | undefined {
  if (source === "admin") return req.cookies?.[ADMIN_COOKIES.refresh];
  if (source === "ruyin") return req.cookies?.[RUYIN_COOKIES.refresh];
  return readTenantCookie(req, "refresh");
}

function resolveRequestSource(value: unknown): LoginSource {
  return value === "admin" || value === "console" || value === "ruyin"
    ? value
    : "website";
}

function resolveTenantRefreshSurface(
  source: LoginSource,
): TenantRefreshSurface {
  return source === "ruyin" ? "ruyin" : "platform";
}

function assertPasswordLoginSource(source: LoginSource): void {
  if (source === "admin") {
    throw new BadRequestException(
      "Admin login must be completed through admin-bff",
    );
  }
}

function assertRefreshTokenScope(
  payload: ReturnType<AuthService["verifyRefreshToken"]>,
  source: LoginSource,
): void {
  const expectedScope =
    source === "admin"
      ? JwtAuthScope.PLATFORM_ADMIN
      : JwtAuthScope.TENANT_CONSOLE;

  if (payload.authScope !== expectedScope) {
    throw new UnauthorizedException(
      "Refresh token scope does not match login source",
    );
  }
}

function isOperatorRefresh(
  payload: ReturnType<AuthService["verifyRefreshToken"]>,
): boolean {
  return payload.authScope === JwtAuthScope.PLATFORM_ADMIN;
}

function isOperatorAccess(
  payload: ReturnType<AuthService["verifyAccessToken"]>,
): boolean {
  return (
    payload.userType === JwtUserType.OPERATOR ||
    payload.authScope === JwtAuthScope.PLATFORM_ADMIN
  );
}

function remainingTtlSeconds(
  exp: number | undefined,
  fallbackSeconds: number,
): number {
  if (!exp) return fallbackSeconds;
  return Math.max(1, exp - Math.floor(Date.now() / 1000));
}

function resolveClientIp(req: Request): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  return req.ip ?? req.socket.remoteAddress ?? null;
}

// ============================================================================
// Router
// ============================================================================

@Controller("auth")
export class PasswordAuthRouter {
  private readonly turnstile = TurnstileVerifier.fromEnv("tenant");

  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(AccountAuthService)
    private readonly accountAuthService: AccountAuthService,
    @Inject(MailService) private readonly mailService: MailService,
    private readonly configService: VxConfigService,
  ) {}

  /**
   * 密码登录
   * 支持 source 参数区分来源 portal，自动同步写入多组 cookie
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUserDto> {
    const source = resolveRequestSource(body.source);
    assertPasswordLoginSource(source);
    await this.verifyTenantTurnstile(body.turnstileToken, req);
    const result = await this.authService.loginWithPassword(
      body.identifier,
      body.password,
      source,
    );

    const secure = process.env.NODE_ENV === "production";
    const domain = resolveCookieDomain(source, this.configService.platform);
    const cookieBase = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure,
      path: "/",
      domain,
    };
    const cookies = resolveCookies(source);

    // store refresh token before writing cookies; a session without Redis state must not reach the browser.
    const isOperator = source === "admin";
    await this.redis.storeRefreshToken(
      result.user.id,
      result.tokens.refreshToken,
      result.tokens.refreshExpiresIn,
      isOperator,
      resolveTenantRefreshSurface(source),
    );

    for (const { access, refresh } of cookies) {
      res.cookie(access, result.tokens.accessToken, {
        ...cookieBase,
        maxAge: result.tokens.expiresIn * 1000,
      });
      res.cookie(refresh, result.tokens.refreshToken, {
        ...cookieBase,
        maxAge: result.tokens.refreshExpiresIn * 1000,
      });
    }

    return result.user;
  }

  /**
   * 注册（仅 tenant_user）
   */
  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() body: SignupDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUserDto> {
    await this.verifyTenantTurnstile(body.turnstileToken, req);
    const result = await this.authService.registerWithPassword(
      body.email,
      body.name,
      body.password,
    );
    const secure = process.env.NODE_ENV === "production";
    const domain = resolvePlatformCookieDomain(this.configService.platform);
    const cookieBase = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure,
      path: "/",
      domain,
    };

    await this.redis.storeRefreshToken(
      result.user.id,
      result.tokens.refreshToken,
      result.tokens.refreshExpiresIn,
      false,
      "platform",
    );

    // 注册默认进入统一租户登录态，website / console 共用同一组 cookie。
    for (const { access, refresh } of [TENANT_COOKIES]) {
      res.cookie(access, result.tokens.accessToken, {
        ...cookieBase,
        maxAge: result.tokens.expiresIn * 1000,
      });
      res.cookie(refresh, result.tokens.refreshToken, {
        ...cookieBase,
        maxAge: result.tokens.refreshExpiresIn * 1000,
      });
    }

    return result.user;
  }

  /**
   * 登出
   * 清除所有已知 cookie + 吊销 refresh token + jti 黑名单
   */
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const source = resolveRequestSource(req.query.source);

    let subject: string | null = null;
    let isOperator = source === "admin";
    let subjectRevocationTtl = DEFAULT_SUBJECT_REVOCATION_TTL_SECONDS;

    // 如果请求中有有效的 access token，将其 jti 加入黑名单。
    // access token 过期时继续尝试 refresh token，确保登出仍能吊销会话。
    const accessToken = readAccessToken(req, source);
    if (accessToken) {
      let payload: ReturnType<AuthService["verifyAccessToken"]> | null = null;
      try {
        payload = this.authService.verifyAccessToken(accessToken);
      } catch {
        // access token 已过期或无效时，不做 blacklist，但仍继续通过 refresh token 吊销会话。
      }

      if (payload) {
        subject = payload.sub;
        isOperator = isOperatorAccess(payload);
        subjectRevocationTtl = Math.max(
          subjectRevocationTtl,
          remainingTtlSeconds(payload.exp, 900),
        );
        if (payload.jti) {
          const ttl = remainingTtlSeconds(payload.exp, 900);
          if (ttl > 0) {
            await this.redis.addToBlacklist(payload.jti, ttl);
          }
        }
      }
    }

    const refreshToken = readRefreshToken(req, source);
    if (refreshToken) {
      try {
        const payload = this.authService.verifyRefreshToken(refreshToken);
        assertRefreshTokenScope(payload, source);
        subject ??= payload.sub;
        isOperator = isOperatorRefresh(payload);
        subjectRevocationTtl = Math.max(
          subjectRevocationTtl,
          remainingTtlSeconds(
            payload.exp,
            DEFAULT_SUBJECT_REVOCATION_TTL_SECONDS,
          ),
        );
      } catch {
        // refresh token 无效时，只能完成本地 cookie 清理。
      }
    }

    if (subject) {
      await this.redis.deleteRefreshToken(subject, isOperator);
      await this.redis.revokeSubjectAccessTokens(
        subject,
        isOperator,
        subjectRevocationTtl,
      );
    }

    clearCookiesForSource(res, source, this.configService.platform);
    return { status: "logged_out" };
  }

  /**
   * 刷新 access token
   */
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const source = resolveRequestSource(req.query.source);

    // 从 refresh token cookie 读取
    const refreshToken = readRefreshToken(req, source);
    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token");
    }

    // 验证 refresh token
    let payload: ReturnType<typeof this.authService.verifyRefreshToken>;
    try {
      payload = this.authService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    assertRefreshTokenScope(payload, source);

    // 校验 Redis 中存储的 refresh token 是否匹配
    const isOperator = source === "admin";
    const storedToken = await this.redis.getRefreshToken(
      payload.sub,
      isOperator,
      resolveTenantRefreshSurface(source),
    );
    if (storedToken !== refreshToken) {
      throw new UnauthorizedException("Refresh token has been revoked");
    }

    // 签发新 token 对（tenant 通过 account 体系重签；operator 不进入 tenant account 表）
    const result =
      source === "admin"
        ? this.authService.issueOperatorTokens({
            sub: payload.sub,
            email: `${payload.sub}@operator.local.vxture`,
            role: "admin",
          })
        : await this.authService.reissueTokensForUser(
            payload.sub,
            source,
            payload.tenantId,
          );

    const secure = process.env.NODE_ENV === "production";
    const domain = resolveCookieDomain(source, this.configService.platform);
    const cookieBase = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure,
      path: "/",
      domain,
    };
    const cookies = resolveCookies(source);

    // 更新 Redis
    await this.redis.storeRefreshToken(
      payload.sub,
      result.tokens.refreshToken,
      result.tokens.refreshExpiresIn,
      isOperator,
      resolveTenantRefreshSurface(source),
    );

    for (const { access, refresh } of cookies) {
      res.cookie(access, result.tokens.accessToken, {
        ...cookieBase,
        maxAge: result.tokens.expiresIn * 1000,
      });
      res.cookie(refresh, result.tokens.refreshToken, {
        ...cookieBase,
        maxAge: result.tokens.refreshExpiresIn * 1000,
      });
    }

    return { status: "refreshed" };
  }

  /**
   * 切换当前租户。
   *
   * tenantId 只能在这里作为“重新签发 JWT 的输入”出现；切换完成后，
   * 后续所有 console-bff 业务路由只读取 JWT 中的 tenantId。
   */
  @Post("tenant/switch")
  @HttpCode(HttpStatus.OK)
  async switchTenant(
    @Body() body: SwitchTenantDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tenantId = body.tenantId?.trim();
    if (!tenantId) {
      throw new BadRequestException("tenantId is required");
    }

    const accessToken = readAccessToken(req, "console");
    if (!accessToken) {
      throw new UnauthorizedException("No active session");
    }

    let payload: ReturnType<typeof this.authService.verifyAccessToken>;
    try {
      payload = this.authService.verifyAccessToken(accessToken);
    } catch {
      throw new UnauthorizedException("Invalid or expired session");
    }

    if (payload.userType !== "tenant_user") {
      throw new UnauthorizedException(
        "Tenant switch is only available for tenant users",
      );
    }

    const source: LoginSource =
      body.source === "website" ||
      body.source === "console" ||
      body.source === "ruyin"
        ? body.source
        : "console";
    const result = await this.authService.reissueTokensForUser(
      payload.sub,
      source,
      tenantId,
    );

    const secure = process.env.NODE_ENV === "production";
    const domain = resolveCookieDomain(source, this.configService.platform);
    const cookieBase = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure,
      path: "/",
      domain,
    };
    const cookies = resolveCookies(source);

    await this.redis.storeRefreshToken(
      payload.sub,
      result.tokens.refreshToken,
      result.tokens.refreshExpiresIn,
      false,
      resolveTenantRefreshSurface(source),
    );

    for (const { access, refresh } of cookies) {
      res.cookie(access, result.tokens.accessToken, {
        ...cookieBase,
        maxAge: result.tokens.expiresIn * 1000,
      });
      res.cookie(refresh, result.tokens.refreshToken, {
        ...cookieBase,
        maxAge: result.tokens.refreshExpiresIn * 1000,
      });
    }

    return { status: "switched", tenantId: result.tenantId };
  }

  /**
   * 验证当前 session（供 gateway 健康检查使用）
   */
  @Get("session")
  async getSessionState(@Req() req: Request) {
    const accessToken = readAccessToken(req, "website");
    if (!accessToken) {
      throw new UnauthorizedException("No active session");
    }
    try {
      const payload = this.authService.verifyAccessToken(
        accessToken,
        JwtAuthScope.TENANT_CONSOLE,
      );
      if (
        !payload.jti ||
        (await this.redis.isBlacklisted(payload.jti)) ||
        (await this.redis.isSubjectAccessRevoked(
          payload.sub,
          false,
          payload.iat,
        ))
      ) {
        throw new UnauthorizedException("Session has been revoked");
      }
      return {
        status: "active",
        userId: payload.sub,
        userType: payload.userType,
        tenantId: payload.tenantId,
      };
    } catch {
      throw new UnauthorizedException("Invalid session");
    }
  }

  private async verifyTenantTurnstile(
    token: string | undefined,
    req: Request,
  ): Promise<void> {
    try {
      await this.turnstile.verify({
        token: token ?? null,
        remoteIp: resolveClientIp(req),
        expectedAction: TENANT_TURNSTILE_ACTION,
      });
    } catch {
      throw new UnauthorizedException("人机验证未通过，请重试");
    }
  }

  /**
   * 忘记密码 — 发送重置邮件
   * 无论邮箱是否存在均返回 200，防止用户枚举。
   * POST /auth/forgot-password
   */
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
  ): Promise<{ status: string }> {
    try {
      const result = await this.accountAuthService.requestPasswordReset(
        body.email,
      );
      if (result) {
        const isConsole = body.source === "console";
        const platformCfg = this.configService.platform;
        const baseUrl = isConsole
          ? platformCfg.CONSOLE_BASE_URL.replace(/\/$/, "")
          : platformCfg.WEBSITE_BASE_URL.replace(/\/$/, "");
        const resetUrl = `${baseUrl}/reset-password?token=${result.rawToken}`;
        await this.mailService.sendPasswordReset(body.email, resetUrl);
      }
    } catch {
      // always 200 to prevent email enumeration
    }
    return { status: "ok" };
  }

  /**
   * 重置密码
   * POST /auth/reset-password
   */
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() body: ResetPasswordDto,
  ): Promise<{ status: string }> {
    const ok = await this.accountAuthService.resetPasswordWithToken(
      body.token,
      body.newPassword,
    );
    if (!ok) {
      throw new BadRequestException("Invalid or expired reset token");
    }
    return { status: "ok" };
  }

  /**
   * 初始化租户（注册后首次选择账号类型）
   * 需要有效的 access token cookie；完成后更新 cookie 中的 tenantId。
   * POST /auth/tenant/init
   */
  @Post("tenant/init")
  @HttpCode(HttpStatus.OK)
  async initTenant(
    @Body() body: InitTenantDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ tenantId: string }> {
    const accessToken = readTenantCookie(req, "access");
    if (!accessToken) {
      throw new UnauthorizedException("No active session");
    }

    let payload: ReturnType<typeof this.authService.verifyAccessToken>;
    try {
      payload = this.authService.verifyAccessToken(accessToken);
    } catch {
      throw new UnauthorizedException("Invalid or expired session");
    }

    const type: "individual" | "organization" =
      body.type === "organization" ? "organization" : "individual";
    const result = await this.authService.initTenant(
      payload.sub,
      payload.email,
      type,
    );

    await this.redis.storeRefreshToken(
      payload.sub,
      result.tokens.refreshToken,
      result.tokens.refreshExpiresIn,
      false,
      "platform",
    );

    const secure = process.env.NODE_ENV === "production";
    const domain = resolvePlatformCookieDomain(this.configService.platform);
    const cookieBase = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure,
      path: "/",
      domain,
    };

    res.cookie(TENANT_COOKIES.access, result.tokens.accessToken, {
      ...cookieBase,
      maxAge: result.tokens.expiresIn * 1000,
    });
    res.cookie(TENANT_COOKIES.refresh, result.tokens.refreshToken, {
      ...cookieBase,
      maxAge: result.tokens.refreshExpiresIn * 1000,
    });

    return { tenantId: result.tenantId };
  }

  /**
   * 内部签发接口：供 admin-bff 等已验证身份的 BFF 调用。
   * 调用方需确保请求来源为可信内部服务（网关层或网络策略保证）。
   *
   * POST /auth/internal/sign
   */
  @Post("internal/sign")
  @HttpCode(HttpStatus.OK)
  @UseGuards(InternalAuthGuard)
  async internalSign(
    @Body()
    body: {
      sub: string;
      email: string;
      username?: string | null;
      displayName?: string | null;
      role: string;
      roleLabel?: string | null;
      permissions?: string[];
      source?: string;
      tenantId?: string | null;
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const source: LoginSource =
      body.source === "admin" ||
      body.source === "console" ||
      body.source === "ruyin"
        ? body.source
        : "website";
    const result =
      source === "admin"
        ? this.authService.issueOperatorTokens({
            sub: body.sub,
            email: body.email,
            ...(body.username !== undefined ? { username: body.username } : {}),
            ...(body.displayName !== undefined
              ? { displayName: body.displayName }
              : {}),
            role: body.role,
            ...(body.roleLabel !== undefined
              ? { roleLabel: body.roleLabel }
              : {}),
            ...(body.permissions !== undefined
              ? { permissions: body.permissions }
              : {}),
          })
        : await this.authService.reissueTokensForUser(
            body.sub,
            source,
            body.tenantId,
          );

    const secure = process.env.NODE_ENV === "production";
    const domain = resolveCookieDomain(source, this.configService.platform);
    const cookieBase = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure,
      path: "/",
      domain,
    };
    const cookies = resolveCookies(source);

    // store refresh token in Redis before forwarding cookies.
    const isOperator = source === "admin";
    await this.redis.storeRefreshToken(
      result.user.id,
      result.tokens.refreshToken,
      result.tokens.refreshExpiresIn,
      isOperator,
      resolveTenantRefreshSurface(source),
    );

    for (const { access, refresh } of cookies) {
      res.cookie(access, result.tokens.accessToken, {
        ...cookieBase,
        maxAge: result.tokens.expiresIn * 1000,
      });
      res.cookie(refresh, result.tokens.refreshToken, {
        ...cookieBase,
        maxAge: result.tokens.refreshExpiresIn * 1000,
      });
    }

    return { status: "signed", userId: result.user.id };
  }
}
