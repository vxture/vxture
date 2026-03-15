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

import { Controller, Post, Get, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { LoginDto, AuthUserDto } from '../types/auth.types';

@Controller('api/auth')
export class AuthRouter {
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<AuthUserDto> {
    // TODO: Implement login logic
    // 1. Validate LoginDto
    // 2. Call VxHttpClient to backend auth service
    // 3. Store accessToken in Redis: SET session:{userId} {accessToken} EX {expiresIn}
    // 4. Write refreshToken to HttpOnly Cookie
    // 5. Return AuthUserDto (no tokens)
    return {
      id: 'temp-id',
      name: 'Temp User',
      email: loginDto.email,
      role: 'user',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    // TODO: Implement logout logic
    // 1. Clear Cookie
    // 2. Remove from Redis
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(): Promise<void> {
    // TODO: Implement token refresh logic (BFF internal)
  }

  @Get('me')
  async getProfile(): Promise<AuthUserDto> {
    // TODO: Implement get current user logic
    return {
      id: 'temp-id',
      name: 'Temp User',
      email: 'user@example.com',
      role: 'user',
    };
  }
}
