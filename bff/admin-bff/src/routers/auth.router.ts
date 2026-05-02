/**
 * auth.router.ts - 认证路由
 * @package @vxture/bff-admin
 *
 * Description: 处理 admin portal 的登录、登出和会话查询。
 * 登录流程集成 IP+账号双维度限速（Part C）和服务端验证码校验（Part A）。
 *
 * @author AI-Generated
 * @date 2026-05-02
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
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
  TooManyRequestsException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ADMIN_AUTH_COOKIES } from '../auth/cookie.constants';
import { PlatformAuthService } from '../auth/auth.service';
import { LoginRateLimiterService } from '../auth/login-rate-limiter.service';
import { CaptchaService } from '../auth/captcha.service';
import { AuthResultDto, CaptchaChallengeDto, LoginDto } from '../dto/auth.dto';
import type { RequestContext } from '../types/console.types';

// ─── 常量 ─────────────────────────────────────────────────────────────────────

const ACCESS_COOKIE_KEY = ADMIN_AUTH_COOKIES.ACCESS_TOKEN;
const REFRESH_COOKIE_KEY = ADMIN_AUTH_COOKIES.REFRESH_TOKEN;

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

function resolveCookieDomain(): string | undefined {
  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  if (!cookieDomain || cookieDomain === 'localhost') {
    return undefined;
  }
  return cookieDomain;
}

/** 优先取 x-forwarded-for 首项，兼容反向代理场景 */
function resolveClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) {
    return forwarded.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
  }
  return req.ip ?? 'unknown';
}

// ─── 路由 ─────────────────────────────────────────────────────────────────────

@Controller('api/auth')
export class AuthRouter {
  constructor(
    @Inject(PlatformAuthService) private readonly platformAuthService: PlatformAuthService,
    @Inject(LoginRateLimiterService) private readonly rateLimiter: LoginRateLimiterService,
    @Inject(CaptchaService) private readonly captchaService: CaptchaService,
  ) {}

  /** 获取滑块验证码挑战令牌，前端在打开滑块前调用 */
  @Post('captcha/challenge')
  @HttpCode(HttpStatus.OK)
  getCaptchaChallenge(): CaptchaChallengeDto {
    return this.captchaService.generateChallenge();
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResultDto> {
    const ip = resolveClientIp(req);

    // Part C：限速检查（在验证码之前，避免验证码生成消耗被滥用）
    const rateLimit = this.rateLimiter.check(ip, body.identifier);
    if (!rateLimit.allowed) {
      throw new TooManyRequestsException(
        `登录请求过于频繁，请 ${rateLimit.retryAfter ?? 900} 秒后重试`,
      );
    }

    // Part A：服务端验证码校验
    try {
      this.captchaService.verifyChallenge(body.captchaToken, body.captchaPosition);
    } catch {
      this.rateLimiter.recordFailure(ip, body.identifier);
      throw new UnauthorizedException('人机验证未通过，请重试');
    }

    // 账号密码校验
    let result: Awaited<ReturnType<PlatformAuthService['loginWithPassword']>>;
    try {
      result = await this.platformAuthService.loginWithPassword(body.identifier, body.password);
    } catch {
      this.rateLimiter.recordFailure(ip, body.identifier);
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 登录成功：清除限速计数
    this.rateLimiter.recordSuccess(ip, body.identifier);

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
