/**
 * phone-auth.router.ts - 手机验证码认证路由
 * @package @vxture/bff-console
 * @description 发送手机验证码、验证码登录（控制台）
 * @author AI-Generated
 * @date 2026-05-05
 * @layer Application
 * @category Router
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
import { PhoneCodeService } from '@vxture/service-sms';
import { CONSOLE_AUTH_COOKIES } from '../auth/cookie.constants';
import { ConsoleAuthService } from '../auth/auth.service';
import type { AuthResultDto } from '../dto/auth.dto';

// ─── DTO ──────────────────────────────────────────────────────────────────────

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
}

// ─── 工具 ─────────────────────────────────────────────────────────────────────

function resolveCookieDomain(): string | undefined {
  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  if (!cookieDomain || cookieDomain === 'localhost') return undefined;
  return cookieDomain;
}

// ─── Router ───────────────────────────────────────────────────────────────────

@Controller('api/auth')
export class PhoneAuthRouter {
  constructor(
    @Inject(PhoneCodeService) private readonly phoneCodeService: PhoneCodeService,
    @Inject(ConsoleAuthService) private readonly consoleAuthService: ConsoleAuthService,
  ) {}

  /** 发送手机验证码（含限流） */
  @Post('send-phone-code')
  @HttpCode(HttpStatus.OK)
  async sendPhoneCode(@Body() dto: SendPhoneCodeDto): Promise<{ message: string }> {
    await this.phoneCodeService.sendCode(dto.phone);
    return { message: '验证码已发送，请在 10 分钟内输入' };
  }

  /** 验证码登录：校验验证码后签发 JWT，写入 HttpOnly cookie */
  @Post('login-with-phone')
  @HttpCode(HttpStatus.OK)
  async loginWithPhone(
    @Body() dto: PhoneLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResultDto> {
    const valid = await this.phoneCodeService.verifyCode(dto.phone, dto.code);
    if (!valid) {
      throw new BadRequestException('验证码错误或已过期，请重新获取');
    }

    const result = await this.consoleAuthService.loginWithPhoneCode(dto.phone);
    if (!result) {
      throw new UnauthorizedException('该手机号尚未注册，请先注册账号');
    }

    const secure = process.env.NODE_ENV === 'production';
    const domain = resolveCookieDomain();

    res.cookie(CONSOLE_AUTH_COOKIES.ACCESS_TOKEN, result.tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      domain,
      maxAge: result.tokens.expiresIn * 1000,
    });

    res.cookie(CONSOLE_AUTH_COOKIES.REFRESH_TOKEN, result.tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      domain,
      maxAge: result.tokens.refreshExpiresIn * 1000,
    });

    return {
      userId: result.user.id,
      status: 'authenticated',
      tenantId: result.tenantId ?? undefined,
    };
  }
}
