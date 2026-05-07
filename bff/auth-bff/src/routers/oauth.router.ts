/**
 * oauth.router.ts - OAuth 统一登录路由
 * @package @vxture/bff-auth
 *
 * 职责：
 * - 统一处理钉钉 / 飞书 / 企业微信 OAuth 登录
 * - 流程：start → 第三方授权 → callback → 签发 JWT + 写 Cookie
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.0
 */

import {
  BadGatewayException,
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  Query,
  Redirect,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHmac, randomBytes } from 'node:crypto';
import type { Response } from 'express';
import { AUTH_CONSTANTS } from '@vxture/shared';
import type { OAuthProviderType } from '@vxture/core-auth';
import { AuthService } from '../auth/auth.service';
import { RedisService } from '../redis/redis.service';
import { DingtalkProvider } from '../providers/dingtalk.provider';
import { FeishuProvider } from '../providers/feishu.provider';

// ============================================================================
// 安全工具
// ============================================================================

function buildState(returnTo: string, secret: string): string {
  const nonce = randomBytes(16).toString('hex');
  const payload = Buffer.from(JSON.stringify({ nonce, returnTo })).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 16);
  return `${payload}.${sig}`;
}

function parseState(state: string, secret: string): { nonce: string; returnTo: string } | null {
  const dotIndex = state.lastIndexOf('.');
  if (dotIndex === -1) return null;
  const payload = state.slice(0, dotIndex);
  const sig = state.slice(dotIndex + 1);
  const expected = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 16);
  if (sig.length !== expected.length || !timingSafeCompare(sig, expected)) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function sanitizeReturnTo(returnTo: string | undefined): string {
  const websiteBase = (process.env.WEBSITE_BASE_URL ?? '').replace(/\/$/, '');
  const consoleBase = (process.env.CONSOLE_BASE_URL ?? '').replace(/\/$/, '');
  const adminBase = (process.env.ADMIN_BASE_URL ?? '').replace(/\/$/, '');
  const fallback = websiteBase || '/';
  if (!returnTo) return fallback;
  if (returnTo.startsWith('/') && !returnTo.startsWith('//')) return returnTo;
  for (const base of [websiteBase, consoleBase, adminBase].filter(Boolean)) {
    if (returnTo === base || returnTo.startsWith(base + '/')) return returnTo;
  }
  return fallback;
}

function resolveCookieDomain(): string | undefined {
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  if (!domain || domain === 'localhost') return undefined;
  return domain;
}

// ============================================================================
// Provider 注册表
// ============================================================================

interface OAuthProvider {
  buildAuthorizationUrl(redirectUri: string, state: string): string;
  exchangeCode(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken?: string }>;
  getUserInfo(accessToken: string): Promise<{ provider: OAuthProviderType; providerId: string; name: string; email?: string; avatar?: string; raw: Record<string, unknown> }>;
}

function createProvider(providerName: string, redirectUri: string): OAuthProvider {
  switch (providerName) {
    case 'dingtalk': return new DingtalkProvider();
    case 'feishu': return new FeishuProvider();
    default: throw new ServiceUnavailableException(`不支持的 OAuth 提供方: ${providerName}`);
  }
}

function resolveRedirectUri(providerName: string): string {
  const envVar = `${providerName.toUpperCase()}_REDIRECT_URI`;
  const configured = process.env[envVar]?.trim();
  if (configured) return configured;
  // 开发环境默认值
  return `http://localhost:3090/api/auth/oauth/${providerName}/callback`;
}

// ============================================================================
// Router
// ============================================================================

@Controller('api/auth/oauth')
export class OAuthRouter {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  /**
   * 发起 OAuth 授权，重定向到第三方平台登录页
   * GET /api/auth/oauth/:provider/start?returnTo=...
   */
  @Get(':provider/start')
  @Redirect()
  startOAuth(
    @Param('provider') providerName: string,
    @Query('returnTo') returnTo?: string,
    @Query('source') source?: string,
  ) {
    const clientId = this.resolveClientId(providerName);
    if (!clientId) {
      throw new ServiceUnavailableException(`${providerName} 登录未启用，请联系管理员配置`);
    }

    const secret = process.env.JWT_SECRET ?? 'fallback';
    const safeReturnTo = sanitizeReturnTo(returnTo);
    const state = buildState(safeReturnTo, secret);
    const redirectUri = resolveRedirectUri(providerName);
    const provider = createProvider(providerName, redirectUri);
    const authUrl = provider.buildAuthorizationUrl(redirectUri, state);

    return { url: authUrl, statusCode: 302 };
  }

  /**
   * OAuth 回调，换取用户信息并签发 JWT
   * GET /api/auth/oauth/:provider/callback?code=...&state=...
   */
  @Get(':provider/callback')
  async handleCallback(
    @Param('provider') providerName: string,
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Res() res: Response,
  ) {
    if (!code) throw new BadRequestException('缺少授权码 code');
    if (!state) throw new BadRequestException('缺少 state 参数');

    const secret = process.env.JWT_SECRET ?? 'fallback';
    const parsed = parseState(state, secret);
    if (!parsed) throw new BadRequestException('state 参数无效或已过期');

    const redirectUri = resolveRedirectUri(providerName);
    const provider = createProvider(providerName, redirectUri);

    let tokens: Awaited<ReturnType<OAuthProvider['exchangeCode']>>;
    try {
      tokens = await provider.exchangeCode(code, redirectUri);
    } catch {
      throw new BadGatewayException(`${providerName} 授权码换取 token 失败`);
    }

    let profile: Awaited<ReturnType<OAuthProvider['getUserInfo']>>;
    try {
      profile = await provider.getUserInfo(tokens.accessToken);
    } catch {
      throw new BadGatewayException(`获取 ${providerName} 用户信息失败`);
    }

    const result = await this.authService.loginWithOAuth(profile);

    const secure = process.env.NODE_ENV === 'production';
    const domain = resolveCookieDomain();
    const cookieBase = { httpOnly: true, sameSite: 'lax' as const, secure, path: '/', domain };

    // 同步写入 website + console cookie（同一套账号体系）
    res.cookie(AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN, result.tokens.accessToken, {
      ...cookieBase, maxAge: result.tokens.expiresIn * 1000,
    });
    res.cookie(AUTH_CONSTANTS.COOKIE_KEYS.REFRESH_TOKEN, result.tokens.refreshToken, {
      ...cookieBase, maxAge: result.tokens.refreshExpiresIn * 1000,
    });
    res.cookie(AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.ACCESS_TOKEN, result.tokens.accessToken, {
      ...cookieBase, maxAge: result.tokens.expiresIn * 1000,
    });
    res.cookie(AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.REFRESH_TOKEN, result.tokens.refreshToken, {
      ...cookieBase, maxAge: result.tokens.refreshExpiresIn * 1000,
    });

    // store refresh token
    void this.redis.storeRefreshToken(result.user.id, result.tokens.refreshToken, result.tokens.refreshExpiresIn);

    const returnTo = sanitizeReturnTo(parsed.returnTo);
    res.redirect(returnTo || '/');
  }

  // 为简化 keep 现有 provider 代码复用，clientId 的检测逻辑保持一致
  private resolveClientId(providerName: string): string | null {
    switch (providerName) {
      case 'dingtalk':
        return process.env.DINGTALK_APP_KEY ?? process.env.DINGTALK_SUITE_KEY ?? null;
      case 'feishu':
        return process.env.FEISHU_APP_ID ?? null;
      default:
        return null;
    }
  }
}
