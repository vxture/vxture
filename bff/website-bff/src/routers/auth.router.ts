/**
 * auth.router.ts - 认证路由代理（重构 v1.3）
 * @package @vxture/bff-website
 *
 * 【重构说明】所有认证操作（login/signup/logout/refresh）委托给 auth-bff 处理。
 * website-bff 不再做密码校验、JWT 签发、refresh token 管理。
 * 本路由负责 HTTP 透传，并转发 set-cookie 头以确保 Cookie 正确写入。
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.3
 */

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { VxConfigService } from "@vxture/core-config";

// ─── DTO ──────────────────────────────────────────────────────────────────────

class LoginDto {
  identifier!: string;
  password!: string;
  turnstileToken?: string;
}

class SignupDto {
  email!: string;
  name!: string;
  password!: string;
  turnstileToken?: string;
}

class ForgotPasswordDto {
  email!: string;
}

class ResetPasswordDto {
  token!: string;
  newPassword!: string;
}

class InitTenantDto {
  type!: "individual" | "organization";
}

// ─── 工具 ─────────────────────────────────────────────────────────────────────

/** 将 auth-bff 的 set-cookie 头完整透传到客户端 */
function forwardSetCookie(
  response: Response,
  upstream: globalThis.Response,
): void {
  const setCookie = readSetCookie(upstream);
  if (setCookie.length) response.setHeader("set-cookie", setCookie);
}

function readSetCookie(upstream: globalThis.Response): string[] {
  const headers = upstream.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookie = headers.getSetCookie?.();
  if (setCookie?.length) return setCookie;
  const single = upstream.headers.get("set-cookie");
  return single ? [single] : [];
}

/** 将客户端请求中的 cookie 转发到 auth-bff */
function forwardCookie(req: Request): string {
  return req.headers.cookie ?? "";
}

function forwardJsonHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Cookie: forwardCookie(req),
  };
  const forwardedFor = req.headers["x-forwarded-for"];
  const remoteIp = req.ip ?? req.socket.remoteAddress;
  headers["X-Forwarded-For"] = [
    typeof forwardedFor === "string" ? forwardedFor : "",
    remoteIp,
  ]
    .filter(Boolean)
    .join(", ");
  if (req.headers["user-agent"]) {
    headers["User-Agent"] = req.headers["user-agent"];
  }
  return headers;
}

// ─── Router ───────────────────────────────────────────────────────────────────

@Controller("api/auth")
export class AuthRouter {
  private readonly authBffUrl: string;

  constructor(@Inject(VxConfigService) configService: VxConfigService) {
    this.authBffUrl = configService.platform.AUTH_BFF_URL.trim().replace(
      /\/+$/,
      "",
    );
  }

  /**
   * 密码登录 → 代理到 auth-bff
   * POST /api/auth/login
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const response = await fetch(this.authBffUrl + "/auth/login", {
      method: "POST",
      headers: forwardJsonHeaders(req),
      body: JSON.stringify({
        identifier: body.identifier,
        password: body.password,
        source: "website",
        turnstileToken: body.turnstileToken,
      }),
    });

    const data = await response.json();
    forwardSetCookie(res, response);
    res.status(response.status).json(data);
  }

  /**
   * 注册 → 代理到 auth-bff
   * POST /api/auth/signup
   */
  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() body: SignupDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const response = await fetch(this.authBffUrl + "/auth/signup", {
      method: "POST",
      headers: forwardJsonHeaders(req),
      body: JSON.stringify({
        email: body.email,
        name: body.name,
        password: body.password,
        turnstileToken: body.turnstileToken,
      }),
    });

    const data = await response.json();
    forwardSetCookie(res, response);
    res.status(response.status).json(data);
  }

  /**
   * 登出 → 代理到 auth-bff
   * POST /api/auth/logout
   */
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const response = await fetch(
      this.authBffUrl + "/auth/logout?source=website",
      {
        method: "POST",
        headers: {
          Cookie: forwardCookie(req),
        },
      },
    );

    const data = await response.json();
    forwardSetCookie(res, response);
    res.status(response.status).json(data);
  }

  /**
   * 刷新 access token → 代理到 auth-bff
   * POST /api/auth/refresh
   */
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    const response = await fetch(
      this.authBffUrl + "/auth/refresh?source=website",
      {
        method: "POST",
        headers: {
          Cookie: forwardCookie(req),
        },
      },
    );

    const data = await response.json();
    forwardSetCookie(res, response);
    res.status(response.status).json(data);
  }

  /**
   * 忘记密码 → 代理到 auth-bff（发送重置邮件）
   * POST /api/auth/forgot-password
   */
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const response = await fetch(this.authBffUrl + "/auth/forgot-password", {
      method: "POST",
      headers: forwardJsonHeaders(req),
      body: JSON.stringify({ email: body.email, source: "website" }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  }

  /**
   * 重置密码 → 代理到 auth-bff
   * POST /api/auth/reset-password
   */
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const response = await fetch(this.authBffUrl + "/auth/reset-password", {
      method: "POST",
      headers: forwardJsonHeaders(req),
      body: JSON.stringify({
        token: body.token,
        newPassword: body.newPassword,
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  }

  /**
   * 初始化租户（注册后首次选择类型）→ 代理到 auth-bff，转发 Set-Cookie
   * POST /api/auth/tenant/init
   */
  @Post("tenant/init")
  @HttpCode(HttpStatus.OK)
  async initTenant(
    @Body() body: InitTenantDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const response = await fetch(this.authBffUrl + "/auth/tenant/init", {
      method: "POST",
      headers: forwardJsonHeaders(req),
      body: JSON.stringify({ type: body.type }),
    });

    const data = await response.json();
    forwardSetCookie(res, response);
    res.status(response.status).json(data);
  }
}
