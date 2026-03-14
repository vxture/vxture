/**
 * current-user.decorator.ts - 从请求上下文提取当前用户
 * @package @vxture/core-auth
 * @description
 *   从请求上下文提取当前用户信息
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../types/auth.types';

export const CurrentUser = createParamDecorator(
  (field: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user    = request.user;
    return field ? user?.[field] : user;
  },
);
