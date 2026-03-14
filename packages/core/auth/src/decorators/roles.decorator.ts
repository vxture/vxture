/**
 * roles.decorator.ts - 标记路由所需角色
 * @package @vxture/core-auth
 * @description
 *   标记路由所需角色，配合 RolesGuard 使用
 */

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'vx:roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
