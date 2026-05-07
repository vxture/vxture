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

import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { IsString, Length, Matches } from 'class-validator';
import type { Response } from 'express';

class SendSmsCodeDto {
  @IsString()
  @Matches(/^1[3-9]\\d{9}\$/, { message: '请输入有效的中国大陆手机号' })
  phone!: string;
}

class SmsLoginDto {
  @IsString()
  @Matches(/^1[3-9]\\d{9}\$/, { message: '请输入有效的中国大陆手机号' })
  phone!: string;

  @IsString()
  @Length(6, 6, { message: '验证码为 6 位数字' })
  code!: string;
}

function resolveAuthBffUrl(): string {
  const configured = process.env['AUTH_BFF_URL']?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  return 'http://localhost:3090';
}

const AUTH_BFF = resolveAuthBffUrl();

@Controller('api/auth')
export class PhoneAuthRouter {
  @Post('send-phone-code')
  @HttpCode(HttpStatus.OK)
  async sendPhoneCode(@Body() dto: SendSmsCodeDto, @Res() res: Response) {
    const response = await fetch(AUTH_BFF + '/api/auth/send-phone-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: dto.phone }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  }

  @Post('login-with-phone')
  @HttpCode(HttpStatus.OK)
  async loginWithPhone(@Body() dto: SmsLoginDto, @Res() res: Response) {
    const response = await fetch(AUTH_BFF + '/api/auth/login-with-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: dto.phone, code: dto.code, source: 'website' }),
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json(data);
      return;
    }

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('set-cookie', setCookie);
    }
    res.status(200).json(data);
  }
}
