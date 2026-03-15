/**
 * current-user.decorator.ts - Extract current user from request context
 * @package @vxture/core-auth
 * @description
 *   Extracts current user information from request context
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
