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
}

// ─── 工具 ─────────────────────────────────────────────────────────────────────

function resolveAuthBffUrl(): string {
  const configured = process.env['AUTH_BFF_URL']?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  return 'http://localhost:3090';
}

const AUTH_BFF = resolveAuthBffUrl();

function forwardSetCookie(res: Response, upstream: globalThis.Response): void {
  const setCookie = upstream.headers.get('set-cookie');
  if (setCookie) {
    res.setHeader('set-cookie', setCookie);
  }
}

function forwardCookie(req: Request): string {
  return req.headers.cookie ?? '';
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
    const response = await fetch(AUTH_BFF + '/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: forwardCookie(req),
      },
      body: JSON.stringify({
        identifier: body.identifier,
        password: body.password,
        source: 'console',
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
    const response = await fetch(AUTH_BFF + '/api/auth/logout', {
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
      AUTH_BFF + '/api/auth/refresh?source=console',
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
