import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CONSOLE_AUTH_COOKIES } from '../auth/cookie.constants';
import { ConsoleAuthService } from '../auth/auth.service';
import { AuthResultDto, LoginDto } from '../dto/auth.dto';
import type { RequestContext } from '../types/console.types';

const ACCESS_COOKIE_KEY = CONSOLE_AUTH_COOKIES.ACCESS_TOKEN;
const REFRESH_COOKIE_KEY = CONSOLE_AUTH_COOKIES.REFRESH_TOKEN;

function resolveCookieDomain(): string | undefined {
  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN?.trim();

  if (!cookieDomain || cookieDomain === 'localhost') {
    return undefined;
  }

  return cookieDomain;
}

@Controller('api/auth')
export class AuthRouter {
  constructor(@Inject(ConsoleAuthService) private readonly consoleAuthService: ConsoleAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response): Promise<AuthResultDto> {
    const result = await this.consoleAuthService.loginWithPassword(body.identifier, body.password);
    const secure = process.env.NODE_ENV === 'production';
    const domain = resolveCookieDomain();

    res.cookie(ACCESS_COOKIE_KEY, result.tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      domain,
      maxAge: result.tokens.expiresIn * 1000,
    });

    res.cookie(REFRESH_COOKIE_KEY, result.tokens.refreshToken, {
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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    const domain = resolveCookieDomain();
    res.clearCookie(ACCESS_COOKIE_KEY, { path: '/', domain });
    res.clearCookie(REFRESH_COOKIE_KEY, { path: '/', domain });
    return { status: 'logged_out' };
  }

  @Get('session')
  getSessionState(@Req() req: Request & RequestContext) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }

    return { status: 'active', userId: req.user.id };
  }
}
