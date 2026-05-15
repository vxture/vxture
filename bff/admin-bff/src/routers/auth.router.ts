/**
 * auth.router.ts - 运营认证路由（重构 v1.4）
 * @package @vxture/bff-admin
 *
 * 【重构说明】
 * JWT 签发迁移至 auth-bff，admin-bff 保留：
 *   - IP+账号双维度限速（Part C）
 *   - 服务端滑块验证码校验（Part A）
 *   - 运营账号 DB 密码验证
 * 验证通过后，调用 auth-bff internal/sign 委托签发 Cookie。
 *
 * 本路由负责 HTTP 透传，并转发 set-cookie 头以确保 Cookie 正确写入。
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.4
 */

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { resolveInternalAuthToken } from '@vxture/core-auth';
import { PhoneCodeService } from '@vxture/service-sms';
import { PlatformAuthService } from '../auth/auth.service';
import { LoginRateLimiterService } from '../auth/login-rate-limiter.service';
import { CaptchaService } from '../auth/captcha.service';
import { AuthResultDto, CaptchaChallengeDto, LoginDto, PhoneLoginDto, SendPhoneCodeDto } from '../dto/auth.dto';
import type { RequestContext } from '../types/console.types';

// ─── 工具 ─────────────────────────────────────────────────────────────────────

function resolveAuthBffUrl(): string {
  const configured = process.env['AUTH_BFF_URL']?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  return 'http://localhost:3090';
}

const AUTH_BFF = resolveAuthBffUrl();
const logger = new Logger('AdminAuthRouter');
const ADMIN_PHONE_CODE_SCOPE = 'admin-auth';
const PHONE_PATTERN = /^1[3-9]\d{9}$/;
const PHONE_CODE_PATTERN = /^\d{6}$/;

interface AuthHttpRequest {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
}

function resolveClientIp(req: AuthHttpRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) {
    return forwarded.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
  }
  return req.ip ?? 'unknown';
}

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

function normalizePhone(phone: string): string {
  return phone.trim().replace(/\s+/g, '');
}

function assertPhone(phone: string): void {
  if (!PHONE_PATTERN.test(phone)) {
    throw new BadRequestException('请输入有效的中国大陆手机号');
  }
}

function assertPhoneCode(code: string): void {
  if (!PHONE_CODE_PATTERN.test(code)) {
    throw new BadRequestException('验证码为 6 位数字');
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

@Controller('api/auth')
export class AuthRouter {
  constructor(
    @Inject(PlatformAuthService) private readonly platformAuthService: PlatformAuthService,
    @Inject(LoginRateLimiterService) private readonly rateLimiter: LoginRateLimiterService,
    @Inject(CaptchaService) private readonly captchaService: CaptchaService,
    @Inject(PhoneCodeService) private readonly phoneCodeService: PhoneCodeService,
  ) {}

  /** 获取滑块验证码挑战令牌，前端在打开滑块前调用 */
  @Post('captcha/challenge')
  @HttpCode(HttpStatus.OK)
  getCaptchaChallenge(): CaptchaChallengeDto {
    return this.captchaService.generateChallenge();
  }

  @Post('send-phone-code')
  @HttpCode(HttpStatus.OK)
  async sendPhoneCode(@Body() body: SendPhoneCodeDto): Promise<{ message: string }> {
    const phone = normalizePhone(String(body.phone ?? ''));
    assertPhone(phone);

    const canUsePhoneLogin = await this.platformAuthService.canUsePhoneLogin(phone);
    if (canUsePhoneLogin) {
      await this.phoneCodeService.sendCode(phone, { scope: ADMIN_PHONE_CODE_SCOPE });
    }

    return { message: '验证码已发送，请在 10 分钟内输入' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Req() req: AuthHttpRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResultDto> {
    const ip = resolveClientIp(req);

    // Part C：限速检查（在验证码之前，避免验证码生成消耗被滥用）
    const rateLimit = this.rateLimiter.check(ip, body.identifier);
    if (!rateLimit.allowed) {
      throw new HttpException(
        `登录请求过于频繁，请 ${rateLimit.retryAfter ?? 900} 秒后重试`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Part A：服务端验证码校验
    try {
      this.captchaService.verifyChallenge(body.captchaToken, body.captchaPosition);
    } catch {
      this.rateLimiter.recordFailure(ip, body.identifier);
      throw new UnauthorizedException('人机验证未通过，请重试');
    }

    // 账号密码校验（本地 DB 验证）
    let adminUser: Awaited<ReturnType<PlatformAuthService['loginWithPassword']>>;
    try {
      adminUser = await this.platformAuthService.loginWithPassword(body.identifier, body.password);
    } catch {
      this.rateLimiter.recordFailure(ip, body.identifier);
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 登录成功：清除限速计数
    this.rateLimiter.recordSuccess(ip, body.identifier);

    await this.signAdminSession(adminUser, res);

    return {
      userId: adminUser.user.id,
      status: 'authenticated',
    };
  }

  @Post('login-with-phone')
  @HttpCode(HttpStatus.OK)
  async loginWithPhone(
    @Body() body: PhoneLoginDto,
    @Req() req: AuthHttpRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResultDto> {
    const ip = resolveClientIp(req);
    const phone = normalizePhone(String(body.phone ?? ''));
    const code = String(body.code ?? '').trim();

    assertPhone(phone);
    assertPhoneCode(code);

    const rateLimitKey = `phone:${phone}`;
    const rateLimit = this.rateLimiter.check(ip, rateLimitKey);
    if (!rateLimit.allowed) {
      throw new HttpException(
        `登录请求过于频繁，请 ${rateLimit.retryAfter ?? 900} 秒后重试`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const valid = await this.phoneCodeService.verifyCode(phone, code, { scope: ADMIN_PHONE_CODE_SCOPE });
    if (!valid) {
      this.rateLimiter.recordFailure(ip, rateLimitKey);
      throw new BadRequestException('验证码错误或已过期，请重新获取');
    }

    let adminUser: Awaited<ReturnType<PlatformAuthService['loginWithPhone']>>;
    try {
      adminUser = await this.platformAuthService.loginWithPhone(phone);
    } catch {
      this.rateLimiter.recordFailure(ip, rateLimitKey);
      throw new UnauthorizedException('当前手机号未绑定可用的运营账号');
    }

    this.rateLimiter.recordSuccess(ip, rateLimitKey);
    await this.signAdminSession(adminUser, res);

    return {
      userId: adminUser.user.id,
      status: 'authenticated',
    };
  }

  private async signAdminSession(
    adminUser: Awaited<ReturnType<PlatformAuthService['loginWithPassword']>>,
    res: Response,
  ): Promise<void> {
    // Part B：委托 auth-bff 签发 Cookie（内部接口，无需传输密码）
    const signResponse = await fetch(AUTH_BFF + '/auth/internal/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vxture-internal-auth': resolveInternalAuthToken(),
      },
      body: JSON.stringify({
        sub: adminUser.user.id,
        email: adminUser.user.email,
        username: adminUser.user.username,
        displayName: adminUser.user.displayName,
        role: adminUser.user.roleCode,
        roleLabel: adminUser.user.roleI18nKey,
        permissions: adminUser.permissions,
        source: 'admin',
      }),
    });

    if (!signResponse.ok) {
      const upstreamBody = await signResponse.text().catch(() => '');
      logger.error(`auth-bff internal sign failed status=${signResponse.status} body=${upstreamBody}`);
      throw new HttpException('签发会话失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    forwardSetCookie(res, signResponse);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: AuthHttpRequest, @Res({ passthrough: true }) res: Response) {
    // 将 cookie 转发给 auth-bff 完成登出
    const cookieHeader = req.headers['cookie'];
    const response = await fetch(AUTH_BFF + '/auth/logout?source=admin', {
      method: 'POST',
      headers: cookieHeader ? { Cookie: String(cookieHeader) } : {},
    });

    const data = await response.json();
    forwardSetCookie(res, response);
    return data;
  }

  @Get('session')
  getSessionState(@Req() req: Request & RequestContext) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }
    return { status: 'active', userId: req.user.id };
  }
}
