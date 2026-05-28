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
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { IsString, Length, Matches } from "class-validator";
import type { Request, Response } from "express";
import { AUTH_CONSTANTS } from "@vxture/shared";
import { TurnstileVerifier } from "@vxture/core-auth";
import { VxConfigService } from "@vxture/core-config";
import type { PlatformConfig } from "@vxture/core-config";
import { PhoneCodeService } from "@vxture/service-sms";
import { AuthService, type LoginSource } from "../auth/auth.service";
import {
  RedisService,
  type TenantRefreshSurface,
} from "../redis/redis.service";
import type { AuthUserDto } from "../types/auth.types";

// ─── DTO ──────────────────────────────────────────────────────────────────

class SendPhoneCodeDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: "请输入有效的中国大陆手机号" })
  phone!: string;

  turnstileToken?: string;
}

class PhoneLoginDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: "请输入有效的中国大陆手机号" })
  phone!: string;

  @IsString()
  @Length(6, 6, { message: "验证码为 6 位数字" })
  code!: string;

  source?: LoginSource;
  turnstileToken?: string;
}

// ─── Cookie 工具 ──────────────────────────────────────────────────────────

function resolveCookies(
  source: LoginSource,
): Array<{ access: string; refresh: string }> {
  if (source === "admin") {
    return [
      { access: "vx_admin_access_token", refresh: "vx_admin_refresh_token" },
    ];
  }

  if (source === "ruyin") {
    return [
      {
        access: AUTH_CONSTANTS.RUYIN_COOKIE_KEYS.ACCESS_TOKEN,
        refresh: AUTH_CONSTANTS.RUYIN_COOKIE_KEYS.REFRESH_TOKEN,
      },
    ];
  }

  return [
    {
      access: AUTH_CONSTANTS.TENANT_COOKIE_KEYS.ACCESS_TOKEN,
      refresh: AUTH_CONSTANTS.TENANT_COOKIE_KEYS.REFRESH_TOKEN,
    },
  ];
}

function normalizeCookieDomain(domain: string | undefined): string | undefined {
  if (!domain || domain === "localhost") return undefined;
  return domain;
}

function resolveCookieDomain(
  source: LoginSource,
  cfg: PlatformConfig,
): string | undefined {
  if (source === "ruyin") {
    return normalizeCookieDomain(cfg.COOKIE_DOMAIN_RUYIN?.trim());
  }
  return normalizeCookieDomain(cfg.COOKIE_DOMAIN_PLATFORM?.trim());
}

function resolveTenantRefreshSurface(
  source: LoginSource,
): TenantRefreshSurface {
  return source === "ruyin" ? "ruyin" : "platform";
}

function resolveRequestSource(value: unknown): LoginSource {
  return value === "admin" || value === "console" || value === "ruyin"
    ? value
    : "website";
}

function resolveClientIp(req: Request): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  return req.ip ?? req.socket.remoteAddress ?? null;
}

const TENANT_TURNSTILE_ACTION = "tenant_auth";

// ─── Router ───────────────────────────────────────────────────────────────

@Controller("auth")
export class PhoneAuthRouter {
  private readonly turnstile = TurnstileVerifier.fromEnv("tenant");

  constructor(
    @Inject(PhoneCodeService)
    private readonly phoneCodeService: PhoneCodeService,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(RedisService) private readonly redis: RedisService,
    private readonly configService: VxConfigService,
  ) {}

  /** 发送手机验证码（含限流） */
  @Post("send-phone-code")
  @HttpCode(HttpStatus.OK)
  async sendPhoneCode(
    @Body() dto: SendPhoneCodeDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    await this.verifyTenantTurnstile(dto.turnstileToken, req);
    await this.phoneCodeService.sendCode(dto.phone);
    return { message: "验证码已发送，请在 10 分钟内输入" };
  }

  /** 验证码登录 */
  @Post("login-with-phone")
  @HttpCode(HttpStatus.OK)
  async loginWithPhone(
    @Body() dto: PhoneLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUserDto> {
    await this.verifyTenantTurnstile(dto.turnstileToken, req);
    const valid = await this.phoneCodeService.verifyCode(dto.phone, dto.code);
    if (!valid) {
      throw new BadRequestException("验证码错误或已过期，请重新获取");
    }

    const source = resolveRequestSource(dto.source);
    if (source === "admin") {
      throw new BadRequestException(
        "Admin login must be completed through admin-bff",
      );
    }
    const result = await this.authService.loginWithPhoneCode(dto.phone, source);
    if (!result) {
      throw new UnauthorizedException("该手机号尚未注册，请先注册账号");
    }

    const secure = process.env.NODE_ENV === "production";
    const domain = resolveCookieDomain(source, this.configService.platform);
    const cookieBase = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure,
      path: "/",
      domain,
    };
    const cookies = resolveCookies(source);

    await this.redis.storeRefreshToken(
      result.user.id,
      result.tokens.refreshToken,
      result.tokens.refreshExpiresIn,
      false,
      resolveTenantRefreshSurface(source),
    );

    for (const { access, refresh } of cookies) {
      res.cookie(access, result.tokens.accessToken, {
        ...cookieBase,
        maxAge: result.tokens.expiresIn * 1000,
      });
      res.cookie(refresh, result.tokens.refreshToken, {
        ...cookieBase,
        maxAge: result.tokens.refreshExpiresIn * 1000,
      });
    }

    return result.user;
  }

  private async verifyTenantTurnstile(
    token: string | undefined,
    req: Request,
  ): Promise<void> {
    try {
      await this.turnstile.verify({
        token: token ?? null,
        remoteIp: resolveClientIp(req),
        expectedAction: TENANT_TURNSTILE_ACTION,
      });
    } catch {
      throw new UnauthorizedException("人机验证未通过，请重试");
    }
  }
}
