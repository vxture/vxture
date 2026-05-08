/**
 * phone-auth.router.ts - 手机验证码路由代理（重构 v1.4）
 * @package @vxture/bff-console
 *
 * 【重构说明】所有手机认证操作委托给 auth-bff 处理。
 * console-bff 不再做短信验证码校验和 JWT 签发。
 * 本路由负责 HTTP 透传，并转发 set-cookie 头以确保 Cookie 正确写入。
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.4
 */

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';

// ─── DTO ──────────────────────────────────────────────────────────────────────

class SendPhoneCodeDto {
  phone!: string;
  turnstileToken?: string;
}

class PhoneLoginDto {
  phone!: string;
  code!: string;
  turnstileToken?: string;
}

// ─── 工具 ─────────────────────────────────────────────────────────────────────

function resolveAuthBffUrl(): string {
  const configured = process.env['AUTH_BFF_URL']?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  return 'http://localhost:3090';
}

const AUTH_BFF = resolveAuthBffUrl();

function forwardSetCookie(res: Response, upstream: globalThis.Response): void {
  const setCookie = readSetCookie(upstream);
  if (setCookie.length) res.setHeader('set-cookie', setCookie);
}

function readSetCookie(upstream: globalThis.Response): string[] {
  const headers = upstream.headers as Headers & { getSetCookie?: () => string[] };
  const setCookie = headers.getSetCookie?.();
  if (setCookie?.length) return setCookie;
  const single = upstream.headers.get('set-cookie');
  return single ? [single] : [];
}

function forwardCookie(req: Request): string {
  return req.headers.cookie ?? '';
}

function forwardJsonHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Cookie: forwardCookie(req),
  };
  const forwardedFor = req.headers['x-forwarded-for'];
  const remoteIp = req.ip ?? req.socket.remoteAddress;
  headers['X-Forwarded-For'] = [typeof forwardedFor === 'string' ? forwardedFor : '', remoteIp]
    .filter(Boolean)
    .join(', ');
  if (req.headers['user-agent']) {
    headers['User-Agent'] = req.headers['user-agent'];
  }
  return headers;
}

// ─── Router ───────────────────────────────────────────────────────────────────

@Controller('api/auth')
export class PhoneAuthRouter {
  /** 发送手机验证码 → 代理到 auth-bff */
  @Post('send-phone-code')
  @HttpCode(HttpStatus.OK)
  async sendPhoneCode(@Body() dto: SendPhoneCodeDto, @Req() req: Request, @Res() res: Response) {
    const response = await fetch(AUTH_BFF + '/auth/send-phone-code', {
      method: 'POST',
      headers: forwardJsonHeaders(req),
      body: JSON.stringify({ phone: dto.phone, turnstileToken: dto.turnstileToken }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  }

  /** 验证码登录 → 代理到 auth-bff */
  @Post('login-with-phone')
  @HttpCode(HttpStatus.OK)
  async loginWithPhone(@Body() dto: PhoneLoginDto, @Req() req: Request, @Res() res: Response) {
    const response = await fetch(AUTH_BFF + '/auth/login-with-phone', {
      method: 'POST',
      headers: forwardJsonHeaders(req),
      body: JSON.stringify({
        phone: dto.phone,
        code: dto.code,
        source: 'console',
        turnstileToken: dto.turnstileToken,
      }),
    });

    const data = await response.json();
    forwardSetCookie(res, response);
    res.status(response.status).json(data);
  }
}
