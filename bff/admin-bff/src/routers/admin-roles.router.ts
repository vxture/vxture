import {
  BadGatewayException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  OnModuleDestroy,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { VxConfigService } from '@vxture/core-config';
import type { Request } from 'express';
import { Pool } from 'pg';
import type {
  PlatformPermissionType,
  PlatformRolePermissionRecord,
  PlatformRoleRecord,
  RequestContext,
} from '../types/console.types';

@Controller('api/admin-roles')
export class AdminRolesRouter implements OnModuleDestroy {
  private readonly pool: Pool | null;

  constructor(@Inject(VxConfigService) private readonly configService: VxConfigService) {
    const database = this.configService.database;
    const hasDatabaseConfig = Boolean(database.DATABASE_URL || database.DB_PASSWORD);
    this.pool = hasDatabaseConfig
      ? new Pool(
          database.DATABASE_URL
            ? { connectionString: database.DATABASE_URL }
            : {
                host: database.DB_HOST,
                port: database.DB_PORT,
                database: database.DB_NAME,
                user: database.DB_USER,
                password: database.DB_PASSWORD,
                max: database.DB_POOL_MAX,
                ssl: database.DB_SSL === 'require' ? { rejectUnauthorized: false } : undefined,
              },
        )
      : null;
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  @Get()
  async listAdminRoles(@Req() req: Request & RequestContext): Promise<PlatformRoleRecord[]> {
    assertCanManageAdminRoles(req);

    if (!this.pool) {
      throw new BadGatewayException('Platform role database is not configured');
    }

    const [roleRows, permissionRows] = await Promise.all([
      this.pool.query<PlatformRoleRow>(PLATFORM_ROLE_SQL),
      this.pool.query<PlatformRolePermissionRow>(PLATFORM_ROLE_PERMISSION_SQL),
    ]);
    const permissionsByRole = groupBy(permissionRows.rows, (row) => row.role_id);

    return roleRows.rows.map((role) => ({
      id: role.id,
      roleCode: role.role_code,
      roleName: role.role_name,
      description: role.description,
      isSystem: role.is_system,
      status: role.status,
      sort: role.sort,
      adminCount: role.admin_count,
      activeAdminCount: role.active_admin_count,
      permissionCount: role.permission_count,
      menuPermissionCount: role.menu_permission_count,
      buttonPermissionCount: role.button_permission_count,
      apiPermissionCount: role.api_permission_count,
      createdAt: toIso(role.created_at),
      updatedAt: toIso(role.updated_at),
      permissions: (permissionsByRole.get(role.id) ?? []).map(mapPermissionRow),
    }));
  }
}

function assertCanManageAdminRoles(req: Request & RequestContext): void {
  if (!req.user) {
    throw new UnauthorizedException('No active session');
  }

  if (
    req.capabilities &&
    !req.capabilities.includes('platform.admin.manage') &&
    !req.capabilities.includes('platform.tenant.manage')
  ) {
    throw new ForbiddenException('Missing platform.admin.manage capability');
  }
}

function groupBy<T>(rows: T[], keyFn: (row: T) => string) {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = keyFn(row);
    const current = groups.get(key) ?? [];
    current.push(row);
    groups.set(key, current);
  }
  return groups;
}

function toIso(value: Date | string | null): string {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapPermissionRow(row: PlatformRolePermissionRow): PlatformRolePermissionRecord {
  return {
    id: row.id,
    parentId: row.parent_id,
    permCode: row.perm_code,
    permName: row.perm_name,
    permType: row.perm_type,
    status: row.status,
    description: row.description,
    routePath: row.route_path,
  };
}

interface PlatformRoleRow {
  id: string;
  role_code: string;
  role_name: string;
  description: string;
  is_system: boolean;
  status: boolean;
  sort: number;
  admin_count: number;
  active_admin_count: number;
  permission_count: number;
  menu_permission_count: number;
  button_permission_count: number;
  api_permission_count: number;
  created_at: Date;
  updated_at: Date;
}

interface PlatformRolePermissionRow {
  role_id: string;
  id: string;
  parent_id: string | null;
  perm_code: string;
  perm_name: string;
  perm_type: PlatformPermissionType;
  status: boolean;
  description: string;
  route_path: string | null;
}

const PLATFORM_ROLE_SQL = `
  select
    r.id,
    r.role_code,
    r.role_name,
    r.description,
    r.is_system,
    r.status,
    r.sort,
    r.created_at,
    r.updated_at,
    count(distinct a.id) filter (where a.deleted_at is null)::int as admin_count,
    count(distinct a.id) filter (where a.deleted_at is null and a.status = true)::int as active_admin_count,
    count(distinct p.id) filter (where p.status = true)::int as permission_count,
    count(distinct p.id) filter (where p.status = true and p.perm_type = 'MENU')::int as menu_permission_count,
    count(distinct p.id) filter (where p.status = true and p.perm_type = 'BUTTON')::int as button_permission_count,
    count(distinct p.id) filter (where p.status = true and p.perm_type = 'API')::int as api_permission_count
  from platform.platform_role r
  left join platform.platform_admin a
    on a.role_id = r.id
  left join platform.platform_role_permission rp
    on rp.role_id = r.id
  left join platform.platform_permission p
    on p.id = rp.permission_id
  group by r.id
  order by r.sort asc, r.created_at asc
`;

const PLATFORM_ROLE_PERMISSION_SQL = `
  select
    rp.role_id,
    p.id,
    p.parent_id,
    p.perm_code,
    p.perm_name,
    p.perm_type,
    p.status,
    p.description,
    nullif(p.route_path, '') as route_path
  from platform.platform_role_permission rp
  join platform.platform_permission p
    on p.id = rp.permission_id
  order by rp.role_id, p.sort asc, p.perm_type asc, p.perm_code asc
`;
