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
import { LoginDto, type AuthUserDto, type RequestContext } from '../types/auth.types';

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
