/**
 * public.decorator.ts - 标记路由为公开
 * @package @vxture/core-auth
 * @description
 *   标记路由为公开，跳过 JWT 验证
 */

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'vx:isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
