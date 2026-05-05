/**
 * feishu-oauth.router.ts - 飞书 OAuth 登录路由
 * @package @vxture/bff-website
 *
 * 实现飞书 OAuth 2.0 登录流程：
 *   GET /api/auth/oauth/feishu/start    — 重定向到飞书授权页
 *   GET /api/auth/oauth/feishu/callback — 接收飞书回调，换取用户信息，签发 JWT
 *
 * 安全约束：
 * - state 参数使用 HMAC 签名防止 CSRF（与钉钉相同机制）
 * - returnTo 只允许跳转到 website 或 console，防止开放重定向
 * - 仅签发 tenant_user token，禁止签发 operator/admin token
 *
 * @author AI-Generated
 * @date 2026-05-04
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Router
 */

import {
  BadGatewayException,
  BadRequestException,
  Controller,
  Get,
  Inject,
  Query,
  Redirect,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHmac, randomBytes } from 'node:crypto';
import type { Response } from 'express';
import { AUTH_CONSTANTS } from '@vxture/shared';
import { WebsiteAuthService } from '../auth/auth.service';
import { FeishuProvider } from '../auth/feishu.provider';

// ============================================================================
// 安全工具（与 dingtalk-oauth.router.ts 相同实现）
// ============================================================================

function buildState(returnTo: string, secret: string): string {
  const nonce = randomBytes(16).toString('hex');
  const payload = Buffer.from(JSON.stringify({ nonce, returnTo })).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 16);
  return `${payload}.${sig}`;
}

function parseState(state: string, secret: string): { nonce: string; returnTo: string } | null {
  const dotIndex = state.lastIndexOf('.');
  if (dotIndex === -1) {
    return null;
  }

  const payload = state.slice(0, dotIndex);
  const sig = state.slice(dotIndex + 1);
  const expected = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 16);

  if (sig.length !== expected.length || !timingSafeCompare(sig, expected)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      nonce: string;
      returnTo: string;
    };
  } catch {
    return null;
  }
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * returnTo 白名单校验，与 dingtalk-oauth.router.ts 逻辑一致。
 * 相对路径直接允许；绝对 URL 须匹配 WEBSITE_BASE_URL 或 CONSOLE_BASE_URL 前缀。
 */
function sanitizeReturnTo(returnTo: string | undefined): string {
  const websiteBase = (process.env['WEBSITE_BASE_URL'] ?? '').replace(/\/$/, '');
  const consoleBase = (process.env['CONSOLE_BASE_URL'] ?? '').replace(/\/$/, '');
  const fallback = websiteBase || '/';

  if (!returnTo) {
    return fallback;
  }

  if (returnTo.startsWith('/') && !returnTo.startsWith('//')) {
    return returnTo;
  }

  for (const base of [websiteBase, consoleBase].filter(Boolean)) {
    if (returnTo === base || returnTo.startsWith(base + '/')) {
      return returnTo;
    }
  }

  return fallback;
}

function resolveCookieDomain(): string | undefined {
  const cookieDomain = process.env['AUTH_COOKIE_DOMAIN']?.trim();

  if (!cookieDomain || cookieDomain === 'localhost') {
    return undefined;
  }

  return cookieDomain;
}

// ============================================================================
// Router
// ============================================================================

@Controller('api/auth/oauth/feishu')
export class FeishuOAuthRouter {
  private readonly provider = new FeishuProvider();

  constructor(
    @Inject(WebsiteAuthService)
    private readonly authService: WebsiteAuthService,
  ) {}

  /**
   * 发起飞书 OAuth 授权，重定向到飞书登录页。
   * 若未配置 FEISHU_APP_ID 则返回 503。
   */
  @Get('start')
  @Redirect()
  startOAuth(@Query('returnTo') returnTo?: string) {
    const clientId = process.env['FEISHU_APP_ID'];

    if (!clientId) {
      throw new ServiceUnavailableException('飞书登录未启用，请联系管理员配置');
    }

    const secret = process.env['JWT_SECRET'] ?? 'fallback';
    const safeReturnTo = sanitizeReturnTo(returnTo);
    const state = buildState(safeReturnTo, secret);

    const redirectUri = this.resolveRedirectUri();
    const authUrl = this.provider.buildAuthorizationUrl(redirectUri, state);

    return { url: authUrl, statusCode: 302 };
  }

  /**
   * 飞书 OAuth 回调，换取用户信息并签发 JWT Cookie。
   * 签发完成后重定向到 returnTo（来自 state 参数）。
   */
  @Get('callback')
  async handleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Res() res: Response,
  ) {
    if (!code) {
      throw new BadRequestException('缺少授权码 code');
    }

    if (!state) {
      throw new BadRequestException('缺少 state 参数');
    }

    const secret = process.env['JWT_SECRET'] ?? 'fallback';
    const parsed = parseState(state, secret);

    if (!parsed) {
      throw new BadRequestException('state 参数无效或已过期');
    }

    const redirectUri = this.resolveRedirectUri();

    let tokens: Awaited<ReturnType<typeof this.provider.exchangeCode>>;
    try {
      tokens = await this.provider.exchangeCode(code, redirectUri);
    } catch {
      throw new BadGatewayException('飞书授权码换取 token 失败');
    }

    let profile: Awaited<ReturnType<typeof this.provider.getUserInfo>>;
    try {
      profile = await this.provider.getUserInfo(tokens.accessToken);
    } catch {
      throw new BadGatewayException('获取飞书用户信息失败');
    }

    const result = await this.authService.loginWithOAuth(profile);

    const secure = process.env['NODE_ENV'] === 'production';
    const domain = resolveCookieDomain();
    const cookieBase = { httpOnly: true, sameSite: 'lax' as const, secure, path: '/', domain };

    // website 登录态 cookie
    res.cookie(AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN, result.tokens.accessToken, {
      ...cookieBase,
      maxAge: result.tokens.expiresIn * 1000,
    });
    res.cookie(AUTH_CONSTANTS.COOKIE_KEYS.REFRESH_TOKEN, result.tokens.refreshToken, {
      ...cookieBase,
      maxAge: result.tokens.refreshExpiresIn * 1000,
    });

    // 同步写入 console 登录态 cookie（同一套账号体系）
    res.cookie(AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.ACCESS_TOKEN, result.tokens.accessToken, {
      ...cookieBase,
      maxAge: result.tokens.expiresIn * 1000,
    });
    res.cookie(AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.REFRESH_TOKEN, result.tokens.refreshToken, {
      ...cookieBase,
      maxAge: result.tokens.refreshExpiresIn * 1000,
    });

    const returnTo = sanitizeReturnTo(parsed.returnTo);
    res.redirect(returnTo || '/');
  }

  private resolveRedirectUri(): string {
    const configured = process.env['FEISHU_REDIRECT_URI']?.trim();
    if (configured) {
      return configured;
    }

    return 'http://localhost:8000/website-api/api/auth/oauth/feishu/callback';
  }
}
