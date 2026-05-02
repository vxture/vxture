/**
 * auth.router.ts - Authentication Router
 * @package @vxture/bff-website
 * @description Router for authentication endpoints: login, logout, refresh, me
 * @author AI-Generated
 * @date 2026-03-15
 * @version 1.0
 * @copyright Vxture Team
 * @license MIT
 * @layer Application
 * @category Router
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
import { WebsiteAuthService } from '../auth/auth.service';
import { ForgotPasswordDto, InitTenantDto, LoginDto, ResetPasswordDto, SignupDto, type AuthUserDto, type RequestContext } from '../types/auth.types';

function resolveCookieDomain(): string | undefined {
  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN?.trim();

  if (!cookieDomain || cookieDomain === 'localhost') {
    return undefined;
  }

  return cookieDomain;
}

@Controller('api/auth')
export class AuthRouter {
  constructor(@Inject(WebsiteAuthService) private readonly websiteAuthService: WebsiteAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<AuthUserDto> {
    const result = await this.websiteAuthService.loginWithPassword(
      loginDto.identifier ?? loginDto.email ?? '',
      loginDto.password,
    );
    const secure = process.env.NODE_ENV === 'production';
    const domain = resolveCookieDomain();

    res.cookie(AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN, result.tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      domain,
      maxAge: result.tokens.expiresIn * 1000,
    });

    res.cookie(AUTH_CONSTANTS.COOKIE_KEYS.REFRESH_TOKEN, result.tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      domain,
      maxAge: result.tokens.refreshExpiresIn * 1000,
    });

    return result.user;
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto, @Res({ passthrough: true }) res: Response): Promise<AuthUserDto> {
    const result = await this.websiteAuthService.registerWithPassword(
      signupDto.email,
      signupDto.name,
      signupDto.password,
    );
    const secure = process.env.NODE_ENV === 'production';
    const domain = resolveCookieDomain();

    res.cookie(AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN, result.tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      domain,
      maxAge: result.tokens.expiresIn * 1000,
    });

    res.cookie(AUTH_CONSTANTS.COOKIE_KEYS.REFRESH_TOKEN, result.tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      domain,
      maxAge: result.tokens.refreshExpiresIn * 1000,
    });

    return result.user;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.websiteAuthService.requestPasswordReset(dto.email);
    // 无论邮箱是否存在，始终返回相同响应（防止邮箱枚举攻击）
    return { message: '如果该邮箱已注册，重置链接将在 15 分钟内发送到您的邮箱' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    const success = await this.websiteAuthService.resetPasswordWithToken(dto.token, dto.newPassword);
    if (!success) {
      throw new BadRequestException('重置链接已失效或已使用，请重新申请');
    }

    return { message: '密码已重置，请使用新密码登录' };
  }

  @Post('tenant/init')
  @HttpCode(HttpStatus.OK)
  async initTenant(
    @Body() dto: InitTenantDto,
    @Req() req: Request & RequestContext,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ tenantId: string }> {
    if (!req.user) {
      throw new UnauthorizedException('请先登录后再初始化租户');
    }

    const result = await this.websiteAuthService.initTenant(req.user.id, req.user.email, dto.type);
    const secure = process.env.NODE_ENV === 'production';
    const domain = resolveCookieDomain();

    res.cookie(AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN, result.tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      domain,
      maxAge: result.tokens.expiresIn * 1000,
    });

    res.cookie(AUTH_CONSTANTS.COOKIE_KEYS.REFRESH_TOKEN, result.tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      domain,
      maxAge: result.tokens.refreshExpiresIn * 1000,
    });

    // 同步写入 console 专用 cookie，确保跳转后 console-bff 能读取会话
    res.cookie(AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.ACCESS_TOKEN, result.tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      domain,
      maxAge: result.tokens.expiresIn * 1000,
    });

    res.cookie(AUTH_CONSTANTS.CONSOLE_COOKIE_KEYS.REFRESH_TOKEN, result.tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      domain,
      maxAge: result.tokens.refreshExpiresIn * 1000,
    });

    return { tenantId: result.tenantId };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    const domain = resolveCookieDomain();
    res.clearCookie(AUTH_CONSTANTS.COOKIE_KEYS.ACCESS_TOKEN, { path: '/', domain });
    res.clearCookie(AUTH_CONSTANTS.COOKIE_KEYS.REFRESH_TOKEN, { path: '/', domain });
    return { status: 'logged_out' };
  }

  @Get('me')
  async getProfile(@Req() req: Request & RequestContext): Promise<AuthUserDto> {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    return req.user;
  }
}
