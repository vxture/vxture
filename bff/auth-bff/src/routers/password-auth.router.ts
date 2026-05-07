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
 * - source=website  → 写 `vx_*` + `vx_console_*`（同一 domain 共享）
 * - source=console  → 写 `vx_console_*` + `vx_*`（同上，双向同步）
 * - source=admin    → 写 `vx_admin_*`
 * - source=ruyin    → 写 `ry_*`（独立 domain ruyin.ai）
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
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AUTH_CONSTANTS } from '@vxture/shared';
import { AuthService, type LoginSource } from '../auth/auth.service';
import { RedisService } from '../redis/redis.service';
import type { AuthUserDto } from '../types/auth.types';

// ============================================================================
// DTO
// ============================================================================

class LoginDto {
  identifier!: string;
  password!: string;
  source?: LoginSource;
}

class SignupDto {
  email!: string;
  name!: string;
  password!: string;
}

class RefreshDto {
  source?: LoginSource;
}

// ============================================================================
// Cookie 工具
// ============================================================================

// 不同 source 映射到不同的 cookie key 组
const COOKIE_MAP: Record<LoginSource, { access: string; refresh: string; domain?: string }> = {
  website: {
    access: AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN,
    refresh: AUTH_CONSTANTS.COOKIE_KEYS.REFRESH_TOKEN,
  },
  console: {
    access: AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.ACCESS_TOKEN,
    refresh: AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.REFRESH_TOKEN,
  },
  admin: {
    access: 'vx_admin_access_token',
    refresh: 'vx_admin_refresh_token',
  },
  ruyin: {
    access: 'ry_access_token',
    refresh: 'ry_refresh_token',
    // ruyin.ai 是独立 domain，cookie domain 由目标 BFF 调用跨域接口时设置
  },
};

/**
 * 根据 source 决定写入的 cookie 键组。
 * 对 .vxture.com 系列的 portal 做双向同步：
 *   - source=website 时，同时写入 vx_* 和 vx_console_*
 *   - source=console 时，同样双向同步
 */
function resolveCookies(source: LoginSource): Array<{ access: string; refresh: string }> {
  const base = COOKIE_MAP[source];
  if (source === 'ruyin') {
    return [base];
  }

  // .vxture.com 系列双向同步
  const syncGroup: Array<{ access: string; refresh: string }> = [base];

  if (source === 'website') {
    syncGroup.push({
      access: AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.ACCESS_TOKEN,
      refresh: AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.REFRESH_TOKEN,
    });
  } else if (source === 'console') {
    syncGroup.push({
      access: AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN,
      refresh: AUTH_CONSTANTS.COOKIE_KEYS.REFRESH_TOKEN,
    });
  }

  return syncGroup;
}

function resolveCookieDomain(): string | undefined {
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  if (!domain || domain === 'localhost') return undefined;
  return domain;
}

/** 清除所有已知 cookie 键 */
const ALL_KNOWN_COOKIES = [
  { access: AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN, refresh: AUTH_CONSTANTS.COOKIE_KEYS.REFRESH_TOKEN },
  { access: AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.ACCESS_TOKEN, refresh: AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.REFRESH_TOKEN },
  { access: 'vx_admin_access_token', refresh: 'vx_admin_refresh_token' },
];

function clearAllCookies(res: Response) {
  const domain = resolveCookieDomain();
  for (const { access, refresh } of ALL_KNOWN_COOKIES) {
    res.clearCookie(access, { path: '/', domain });
    res.clearCookie(refresh, { path: '/', domain });
  }
}

// ============================================================================
// Router
// ============================================================================

@Controller('api/auth')
export class PasswordAuthRouter {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  /**
   * 密码登录
   * 支持 source 参数区分来源 portal，自动同步写入多组 cookie
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response): Promise<AuthUserDto> {
    const source: LoginSource = (body.source as LoginSource) ?? 'website';
    const result = await this.authService.loginWithPassword(body.identifier, body.password, source);

    const secure = process.env.NODE_ENV === 'production';
    const domain = resolveCookieDomain();
    const cookieBase = { httpOnly: true, sameSite: 'lax' as const, secure, path: '/', domain };
    const cookies = resolveCookies(source);

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

    // store refresh token in Redis
    const isOperator = source === 'admin';
    void this.redis.storeRefreshToken(result.user.id, result.tokens.refreshToken, result.tokens.refreshExpiresIn, isOperator);

    return result.user;
  }

  /**
   * 注册（仅 tenant_user）
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() body: SignupDto, @Res({ passthrough: true }) res: Response): Promise<AuthUserDto> {
    const result = await this.authService.registerWithPassword(body.email, body.name, body.password);
    const secure = process.env.NODE_ENV === 'production';
    const domain = resolveCookieDomain();
    const cookieBase = { httpOnly: true, sameSite: 'lax' as const, secure, path: '/', domain };

    // 注册默认同时登录，同步写入 website + console cookie
    const syncCookies = [
      { access: AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN, refresh: AUTH_CONSTANTS.COOKIE_KEYS.REFRESH_TOKEN },
      { access: AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.ACCESS_TOKEN, refresh: AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.REFRESH_TOKEN },
    ];
    for (const { access, refresh } of syncCookies) {
      res.cookie(access, result.tokens.accessToken, { ...cookieBase, maxAge: result.tokens.expiresIn * 1000 });
      res.cookie(refresh, result.tokens.refreshToken, { ...cookieBase, maxAge: result.tokens.refreshExpiresIn * 1000 });
    }

    return result.user;
  }

  /**
   * 登出
   * 清除所有已知 cookie + 吊销 refresh token + jti 黑名单
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    clearAllCookies(res);

    // 如果请求中有有效的 access token，将其 jti 加入黑名单
    const accessToken = req.cookies?.[AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN]
      ?? req.cookies?.[AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.ACCESS_TOKEN]
      ?? req.cookies?.vx_admin_access_token;
    if (accessToken) {
      try {
        const payload = this.authService.verifyAccessToken(accessToken);
        const jti = (payload as unknown as Record<string, unknown>).jti as string | undefined;
        if (jti) {
          const ttl = payload.exp ? payload.exp - Math.floor(Date.now() / 1000) : 900;
          if (ttl > 0) {
            void this.redis.addToBlacklist(jti, ttl);
          }
        }
        // 删除 refresh token
        void this.redis.deleteRefreshToken(payload.sub, payload.userType === 'operator');
      } catch {
        // token 已过期，不需要 blacklist
      }
    }

    return { status: 'logged_out' };
  }

  /**
   * 刷新 access token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const source: LoginSource = (req.query.source as LoginSource) ?? 'website';

    // 从 refresh token cookie 读取
    const cookieEntry = COOKIE_MAP[source];
    const refreshToken = req.cookies?.[cookieEntry.refresh];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    // 验证 refresh token
    let payload: ReturnType<typeof this.authService.verifyRefreshToken>;
    try {
      payload = this.authService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // 校验 Redis 中存储的 refresh token 是否匹配
    const isOperator = source === 'admin';
    const storedToken = await this.redis.getRefreshToken(payload.sub, isOperator);
    if (storedToken && storedToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // 签发新 token 对（不需要密码，通过 userId 重新签发）
    const result = await this.authService.reissueTokensForUser(payload.sub, source);

    const secure = process.env.NODE_ENV === 'production';
    const domain = resolveCookieDomain();
    const cookieBase = { httpOnly: true, sameSite: 'lax' as const, secure, path: '/', domain };
    const cookies = resolveCookies(source);

    for (const { access, refresh } of cookies) {
      res.cookie(access, result.tokens.accessToken, { ...cookieBase, maxAge: result.tokens.expiresIn * 1000 });
      res.cookie(refresh, result.tokens.refreshToken, { ...cookieBase, maxAge: result.tokens.refreshExpiresIn * 1000 });
    }

    // 更新 Redis
    await this.redis.storeRefreshToken(payload.sub, result.tokens.refreshToken, result.tokens.refreshExpiresIn, isOperator);

    return { status: 'refreshed' };
  }

  /**
   * 验证当前 session（供 gateway 健康检查使用）
   */
  @Get('session')
  getSessionState(@Req() req: Request) {
    const accessToken = req.cookies?.[AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN];
    if (!accessToken) {
      throw new UnauthorizedException('No active session');
    }
    try {
      const payload = this.authService.verifyAccessToken(accessToken);
      return {
        status: 'active',
        userId: payload.sub,
        userType: payload.userType,
        tenantId: payload.tenantId,
      };
    } catch {
      throw new UnauthorizedException('Invalid session');
    }
  }

  /**
   * 内部签发接口：供 admin-bff 等已验证身份的 BFF 调用。
   * 调用方需确保请求来源为可信内部服务（网关层或网络策略保证）。
   *
   * POST /api/auth/internal/sign
   */
  @Post('internal/sign')
  @HttpCode(HttpStatus.OK)
  async internalSign(
    @Body() body: { sub: string; email: string; role: string; source?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const source: LoginSource = (body.source === 'admin' ? 'admin' : 'website') as LoginSource;
    const result = await this.authService.reissueTokensForUser(body.sub, source);

    const secure = process.env.NODE_ENV === 'production';
    const domain = resolveCookieDomain();
    const cookieBase = { httpOnly: true, sameSite: 'lax' as const, secure, path: '/', domain };
    const cookies = resolveCookies(source);

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

    // store refresh token in Redis
    const isOperator = source === 'admin';
    void this.redis.storeRefreshToken(result.user.id, result.tokens.refreshToken, result.tokens.refreshExpiresIn, isOperator);

    return { status: 'signed', userId: result.user.id };
  }
}
