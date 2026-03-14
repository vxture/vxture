/**
 * public.decorator.ts - 标记路由为公开（跳过 JWT 验证）
 * @package @vxture/core-auth
 *
 * @example
 * @Public()
 * @Post('login')
 * login(@Body() dto: LoginDto) { ... }
 */

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'vx:isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
