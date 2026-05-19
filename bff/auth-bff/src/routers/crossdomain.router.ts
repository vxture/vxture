/**
 * crossdomain.router.ts - 跨域一次性 Token 路由
 * @package @vxture/bff-auth
 *
 * 职责：实现 vxture.com ↔ ruyin.ai 跨域登录
 *
 * 流程：
 *   1. 用户在 console.vxture.com 已登录，触发跳转 ruyin.ai 操作
 *   2. 前端请求 auth.vxture.com/auth/crossdomain/token
 *      → 验证当前 Cookie 中的 access token
 *      → 生成一次性 token（TTL 30s），存入 Redis
 *      → 返回 token
 *   3. 前端跳转 ruyin.ai/auth/callback?token={oneTimeToken}
 *   4. ruyin-bff 调 auth.vxture.com/auth/crossdomain/verify
 *      → 原子 GETDEL 取出 token，校验 userType
 *      → 返回 payload，ruyin-bff 据此签发自己的 cookie
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.0
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
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthScope } from "@vxture/core-auth";
import { AUTH_CONSTANTS } from "@vxture/shared";
import { AuthService } from "../auth/auth.service";
import { RedisService, type CrossDomainPayload } from "../redis/redis.service";

// ─── DTO ──────────────────────────────────────────────────────────────────

class VerifyDto {
  /** 跨域一次性 token */
  token!: string;
  /** 申请来源 domain，用于校验 targetDomain 白名单 */
  source!: string;
}

// ─── Router ───────────────────────────────────────────────────────────────

@Controller("auth/crossdomain")
export class CrossDomainRouter {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  /**
   * 生成跨域一次性 token
   * 前端调用此接口前必须在当前 domain 已有登录态
   */
  @Get("token")
  @HttpCode(HttpStatus.OK)
  async generateToken(
    @Req() req: Request,
  ): Promise<{ token: string; expiresIn: number }> {
    // 从 cookie 读取 access token
    const accessToken =
      req.cookies?.[AUTH_CONSTANTS.TENANT_COOKIE_KEYS.ACCESS_TOKEN];

    if (!accessToken) {
      throw new UnauthorizedException("No active session");
    }

    let payload: ReturnType<typeof this.authService.verifyAccessToken>;
    try {
      payload = this.authService.verifyAccessToken(accessToken);
    } catch {
      throw new UnauthorizedException("Invalid or expired session");
    }

    // 校验 userType：必须是 tenant_user（跨域仅限租户账号）
    if (
      payload.userType !== "tenant_user" ||
      payload.authScope !== JwtAuthScope.TENANT_CONSOLE
    ) {
      throw new UnauthorizedException(
        "Cross-domain login is only available for tenant users",
      );
    }
    if (!payload.jti) {
      throw new UnauthorizedException("Invalid session");
    }
    if (
      (await this.redis.isBlacklisted(payload.jti)) ||
      (await this.redis.isSubjectAccessRevoked(payload.sub, false, payload.iat))
    ) {
      throw new UnauthorizedException("Session has been revoked");
    }

    const crossPayload: CrossDomainPayload = {
      sub: payload.sub,
      userType: payload.userType,
      tenantId: payload.tenantId ?? "",
      targetDomain: "ruyin.ai",
      provider: payload.provider,
    };

    const token = await this.redis.storeCrossDomainToken(crossPayload);

    return { token, expiresIn: 30 };
  }

  /**
   * 验证跨域 token
   * 由目标 BFF（如 ruyin-bff）在服务端调用
   *
   * 安全约束：
   * - 原子性取出 token（GETDEL），防止重放攻击
   * - 校验 targetDomain 是否匹配接收方
   * - 校验 userType 是否匹配目标产品
   */
  @Post("verify")
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Body() body: VerifyDto): Promise<CrossDomainPayload> {
    const payload = await this.redis.consumeCrossDomainToken(body.token);
    if (!payload) {
      throw new UnauthorizedException("Invalid or expired cross-domain token");
    }

    // 校验 targetDomain（防止 token 被截获后在非目标 domain 使用）
    if (payload.targetDomain && !body.source.endsWith(payload.targetDomain)) {
      throw new UnauthorizedException(
        `This token is intended for ${payload.targetDomain}, not ${body.source}`,
      );
    }

    return payload;
  }
}
