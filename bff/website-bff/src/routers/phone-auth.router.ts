/**
 * phone-auth.router.ts - 手机认证路由（重构 v1.3）
 * @package @vxture/bff-website
 *
 * 【重构说明】所有认证操作委托给 auth-bff 处理。
 * website-bff 不再做短信验证码校验和 JWT 签发。
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.3
 */

import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { IsString, Length, Matches } from 'class-validator';
import type { Request, Response } from 'express';

class SendSmsCodeDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的中国大陆手机号' })
  phone!: string;

  turnstileToken?: string;
}

class SmsLoginDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的中国大陆手机号' })
  phone!: string;

  @IsString()
  @Length(6, 6, { message: '验证码为 6 位数字' })
  code!: string;

  turnstileToken?: string;
}

function resolveAuthBffUrl(): string {
  const configured = process.env['AUTH_BFF_URL']?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  return 'http://localhost:3090';
}

const AUTH_BFF = resolveAuthBffUrl();

function forwardJsonHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
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

@Controller('api/auth')
export class PhoneAuthRouter {
  @Post('send-phone-code')
  @HttpCode(HttpStatus.OK)
  async sendPhoneCode(@Body() dto: SendSmsCodeDto, @Req() req: Request, @Res() res: Response) {
    const response = await fetch(AUTH_BFF + '/auth/send-phone-code', {
      method: 'POST',
      headers: forwardJsonHeaders(req),
      body: JSON.stringify({ phone: dto.phone, turnstileToken: dto.turnstileToken }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  }

  @Post('login-with-phone')
  @HttpCode(HttpStatus.OK)
  async loginWithPhone(@Body() dto: SmsLoginDto, @Req() req: Request, @Res() res: Response) {
    const response = await fetch(AUTH_BFF + '/auth/login-with-phone', {
      method: 'POST',
      headers: forwardJsonHeaders(req),
      body: JSON.stringify({
        phone: dto.phone,
        code: dto.code,
        source: 'website',
        turnstileToken: dto.turnstileToken,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json(data);
      return;
    }

    const setCookie = readSetCookie(response);
    if (setCookie.length) res.setHeader('set-cookie', setCookie);
    res.status(200).json(data);
  }
}

function readSetCookie(upstream: globalThis.Response): string[] {
  const headers = upstream.headers as Headers & { getSetCookie?: () => string[] };
  const setCookie = headers.getSetCookie?.();
  if (setCookie?.length) return setCookie;
  const single = upstream.headers.get('set-cookie');
  return single ? [single] : [];
}
