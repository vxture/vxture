/**
 * middleware.ts - Next.js Middleware
 * @package @vxture/website
 * @description Middleware for authentication redirect and next-intl locale routing
 * @author AI-Generated
 * @date 2026-03-15
 * @version 1.0
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const isProtectedRoute = request.nextUrl.pathname.includes('/dashboard');
  const hasSession = request.cookies.has('vx_refresh_token');

  // 认证重定向（在 intl 处理之前）
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 交给 next-intl 处理语言前缀路由
  // 写入 pathname 供 getRequestConfig 按需加载翻译
  const response = intlMiddleware(request);
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    // 匹配所有路由，但排除 API 路由和静态资源
    '/((?!api|_next|.*\\..*).*)',
    // 匹配没有语言前缀的路由，以便重定向到默认语言
    '/',
    '/login',
    '/signup',
    '/products',
    '/about',
    '/dashboard'
  ],
};
