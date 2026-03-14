/**
 * roles.decorator.ts - 标记路由所需角色
 * @package @vxture/core-auth
 *
 * @example
 * @Roles('admin')
 * @Roles('admin', 'operator')
 */

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'vx:roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
