/**
 * roles.guard.ts - 角色权限守卫
 * @package @vxture/core-auth
 * @description
 *   配合 @Roles() 装饰器使用，验证用户角色是否满足要求
 */

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY }  from '../decorators/roles.decorator';
import { hasRole }    from '../utils/permission.utils';
import type { AuthUser } from '../types/auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 未设置 @Roles() 装饰器，放行
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user    = request.user;

    if (!user) {
      throw new ForbiddenException('User context not found');
    }

    const allowed = hasRole(user, requiredRoles, { mode: 'any' });

    if (!allowed) {
      throw new ForbiddenException(
        `Requires role: [${requiredRoles.join(', ')}], current role: ${user.role}`,
      );
    }

    return true;
  }
}
