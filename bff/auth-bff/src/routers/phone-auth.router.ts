/**
 * phone-auth.router.ts - 手机验证码认证路由
 * @package @vxture/bff-auth
 * @description 发送手机验证码、验证码登录（支持 source 参数）
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.0
 */

import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { IsString, Length, Matches } from 'class-validator';
import type { Response } from 'express';
import { AUTH_CONSTANTS } from '@vxture/shared';
import { PhoneCodeService } from '@vxture/service-sms';
import { AuthService, type LoginSource } from '../auth/auth.service';
import { RedisService } from '../redis/redis.service';
import type { AuthUserDto } from '../types/auth.types';

// ─── DTO ──────────────────────────────────────────────────────────────────

class SendPhoneCodeDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的中国大陆手机号' })
  phone!: string;
}

class PhoneLoginDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的中国大陆手机号' })
  phone!: string;

  @IsString()
  @Length(6, 6, { message: '验证码为 6 位数字' })
  code!: string;

  source?: LoginSource;
}

// ─── Cookie 工具 ──────────────────────────────────────────────────────────

function resolveCookies(source: LoginSource): Array<{ access: string; refresh: string }> {
  const base = source === 'admin'
    ? { access: 'vx_admin_access_token', refresh: 'vx_admin_refresh_token' }
    : { access: AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN, refresh: AUTH_CONSTANTS.COOKIE_KEYS.REFRESH_TOKEN };

  // 对 .vxture.com 系列同步写入 console cookie
  if (source === 'website') {
    return [
      base,
      { access: AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.ACCESS_TOKEN, refresh: AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.REFRESH_TOKEN },
    ];
  }

  return [base];
}

function resolveCookieDomain(): string | undefined {
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  if (!domain || domain === 'localhost') return undefined;
  return domain;
}

// ─── Router ───────────────────────────────────────────────────────────────

@Controller('api/auth')
export class PhoneAuthRouter {
  constructor(
    @Inject(PhoneCodeService) private readonly phoneCodeService: PhoneCodeService,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  /** 发送手机验证码（含限流） */
  @Post('send-phone-code')
  @HttpCode(HttpStatus.OK)
  async sendPhoneCode(@Body() dto: SendPhoneCodeDto): Promise<{ message: string }> {
    await this.phoneCodeService.sendCode(dto.phone);
    return { message: '验证码已发送，请在 10 分钟内输入' };
  }

  /** 验证码登录 */
  @Post('login-with-phone')
  @HttpCode(HttpStatus.OK)
  async loginWithPhone(
    @Body() dto: PhoneLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUserDto> {
    const valid = await this.phoneCodeService.verifyCode(dto.phone, dto.code);
    if (!valid) {
      throw new BadRequestException('验证码错误或已过期，请重新获取');
    }

    const source: LoginSource = dto.source ?? 'website';
    const result = await this.authService.loginWithPhoneCode(dto.phone, source);
    if (!result) {
      throw new UnauthorizedException('该手机号尚未注册，请先注册账号');
    }

    const secure = process.env.NODE_ENV === 'production';
    const domain = resolveCookieDomain();
    const cookieBase = { httpOnly: true, sameSite: 'lax' as const, secure, path: '/', domain };
    const cookies = resolveCookies(source);

    for (const { access, refresh } of cookies) {
      res.cookie(access, result.tokens.accessToken, { ...cookieBase, maxAge: result.tokens.expiresIn * 1000 });
      res.cookie(refresh, result.tokens.refreshToken, { ...cookieBase, maxAge: result.tokens.refreshExpiresIn * 1000 });
    }

    // store refresh token
    void this.redis.storeRefreshToken(result.user.id, result.tokens.refreshToken, result.tokens.refreshExpiresIn);

    return result.user;
  }
}
