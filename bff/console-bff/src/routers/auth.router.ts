/**
 * auth.router.ts - 认证路由代理（重构 v1.4）
 * @package @vxture/bff-console
 *
 * 【重构说明】所有认证操作（login/logout）委托给 auth-bff 处理。
 * console-bff 不再做密码校验、JWT 签发、refresh token 管理。
 * 本路由负责 HTTP 透传，并转发 set-cookie 头以确保 Cookie 正确写入。
 *
 * session 端点保留本地，依赖 auth middleware 挂载的用户上下文。
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.4
 */

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { RequestContext } from '../types/console.types';

// ─── DTO ──────────────────────────────────────────────────────────────────────

class LoginDto {
  identifier!: string;
  password!: string;
  turnstileToken?: string;
}

class SwitchTenantDto {
  tenantId!: string;
}

class ForgotPasswordDto {
  email!: string;
}

class ResetPasswordDto {
  token!: string;
  newPassword!: string;
}

// ─── 工具 ─────────────────────────────────────────────────────────────────────

function resolveAuthBffUrl(): string {
  const configured = process.env['AUTH_BFF_URL']?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  return 'http://localhost:3090';
}

const AUTH_BFF = resolveAuthBffUrl();

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

function forwardCookie(req: Request): string {
  return req.headers.cookie ?? '';
}

function forwardJsonHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Cookie: forwardCookie(req),
  };
  const forwardedFor = req.headers['x-forwarded-for'];
  const remoteIp = req.ip ?? req.socket.remoteAddress;
  headers['X-Forwarded-For'] = [typeof forwardedFor === 'string' ? forwardedFor : '', remoteIp]
    .filter(Boolean)
    .join(', ');
  if (req.headers['user-agent']) {
    headers['User-Agent'] = req.headers['user-agent'];
  }
  return headers;
}

// ─── Router ───────────────────────────────────────────────────────────────────

@Controller('api/auth')
export class AuthRouter {
  /**
   * 密码登录 → 代理到 auth-bff
   * POST /api/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto, @Req() req: Request, @Res() res: Response): Promise<void> {
    const response = await fetch(AUTH_BFF + '/auth/login', {
      method: 'POST',
      headers: forwardJsonHeaders(req),
      body: JSON.stringify({
        identifier: body.identifier,
        password: body.password,
        source: 'console',
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
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const response = await fetch(AUTH_BFF + '/auth/logout?source=console', {
      method: 'POST',
      headers: {
        Cookie: forwardCookie(req),
      },
    });

    const data = await response.json();
    forwardSetCookie(res, response);
    res.status(response.status).json(data);
  }

  /**
   * 刷新 access token → 代理到 auth-bff
   * POST /api/auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    const response = await fetch(
      AUTH_BFF + '/auth/refresh?source=console',
      {
        method: 'POST',
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
   * 切换当前租户 → 代理到 auth-bff 重新签发 console token
   * POST /api/auth/tenant/switch
   */
  @Post('tenant/switch')
  @HttpCode(HttpStatus.OK)
  async switchTenant(@Body() body: SwitchTenantDto, @Req() req: Request, @Res() res: Response): Promise<void> {
    const response = await fetch(AUTH_BFF + '/auth/tenant/switch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: forwardCookie(req),
      },
      body: JSON.stringify({
        tenantId: body.tenantId,
        source: 'console',
      }),
    });

    const data = await response.json();
    forwardSetCookie(res, response);
    res.status(response.status).json(data);
  }

  /**
   * 忘记密码 → 代理到 auth-bff（发送重置邮件）
   * POST /api/auth/forgot-password
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordDto, @Req() req: Request, @Res() res: Response): Promise<void> {
    const response = await fetch(AUTH_BFF + '/auth/forgot-password', {
      method: 'POST',
      headers: forwardJsonHeaders(req),
      body: JSON.stringify({ email: body.email, source: 'console' }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  }

  /**
   * 重置密码 → 代理到 auth-bff
   * POST /api/auth/reset-password
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordDto, @Req() req: Request, @Res() res: Response): Promise<void> {
    const response = await fetch(AUTH_BFF + '/auth/reset-password', {
      method: 'POST',
      headers: forwardJsonHeaders(req),
      body: JSON.stringify({ token: body.token, newPassword: body.newPassword }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  }

  /**
   * 会话状态查询（本地，依赖 auth middleware）
   * GET /api/auth/session
   */
  @Get('session')
  getSessionState(@Req() req: Request & RequestContext) {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }
    return { status: 'active', userId: req.user.id };
  }
}
