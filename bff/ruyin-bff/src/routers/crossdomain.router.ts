/**
 * crossdomain.router.ts - 跨域 SSO 回调路由（重构 v1.4）
 * @package @vxture/bff-ruyin
 *
 * 【重构说明】
 * ruya.ai 作为独立 domain，通过 auth-bff 跨域一次性 token 实现 SSO。
 * 本路由接收前端跳转携带的 one-time token，转发到 auth-bff verify 接口，
 * 验证通过后在 ruyin.ai domain 下签发自己的 Cookie。
 *
 * 流程：
 *   1. 前端跳转 ruyin.ai/auth/callback?token={oneTimeToken}
 *   2. ruyin-bff 调 auth-bff POST /api/auth/crossdomain/verify
 *   3. ruyin-bff 调 auth-bff POST /api/auth/internal/sign 签发 Cookie
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.4
 */

import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';

// ─── 工具 ─────────────────────────────────────────────────────────────────────

type RedirectResponse = Response & {
  setHeader(name: string, value: string | string[]): void;
  redirect(status: number, url: string): void;
};

function resolveAuthBffUrl(): string {
  const configured = process.env['AUTH_BFF_URL']?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  return 'http://localhost:3090';
}

const AUTH_BFF = resolveAuthBffUrl();

function forwardSetCookie(res: RedirectResponse, upstream: globalThis.Response): void {
  const setCookie = upstream.headers.get('set-cookie');
  if (setCookie) {
    res.setHeader('set-cookie', setCookie);
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

@Controller('api/auth')
export class CrossDomainRouter {
  /**
   * 跨域 SSO 回调
   * GET /api/auth/callback?token=...
   *
   * 前端从 vxture.com 跳转到 ruyin.ai 时携带 one-time token，
   * ruyin-bff 调用 auth-bff 验证 token 后，委托 auth-bff 签发 ruyin Cookie。
   */
  @Get('callback')
  @HttpCode(HttpStatus.OK)
  async callback(@Query('token') token: string, @Res() res: RedirectResponse): Promise<void> {
    if (!token) {
      throw new BadRequestException('Missing crossdomain token');
    }

    // Step 1: 调用 auth-bff verify 接口，校验一次性 token
    const verifyResponse = await fetch(`${AUTH_BFF}/api/auth/crossdomain/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, source: 'ruyin.ai' }),
    });

    if (!verifyResponse.ok) {
      const err = await verifyResponse.json().catch(() => ({ message: 'Token verification failed' }));
      throw new UnauthorizedException(err.message || 'Invalid crossdomain token');
    }

    const payload = await verifyResponse.json();

    // Step 2: 委托 auth-bff 签发 ruyin domain Cookie
    const signResponse = await fetch(`${AUTH_BFF}/api/auth/internal/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sub: payload.sub,
        email: '',
        role: 'member',
        source: 'ruyin',
      }),
    });

    if (!signResponse.ok) {
      throw new UnauthorizedException('Failed to establish session');
    }

    forwardSetCookie(res, signResponse);

    // Step 3: 重定向到 ruyin 首页
    const ruyinBase = (process.env['RUYIN_BASE_URL'] ?? '').replace(/\/$/, '') || '/';
    res.redirect(302, ruyinBase);
  }
}
