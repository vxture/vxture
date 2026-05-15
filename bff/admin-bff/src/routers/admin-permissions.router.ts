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
import type { PlatformAdminPermissionRecord, PlatformPermissionType, RequestContext } from '../types/console.types';

@Controller('api/admin-permissions')
export class AdminPermissionsRouter implements OnModuleDestroy {
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
  async listAdminPermissions(@Req() req: Request & RequestContext): Promise<PlatformAdminPermissionRecord[]> {
    assertCanViewAdminPermissions(req);

    if (!this.pool) {
      throw new BadGatewayException('Platform permission database is not configured');
    }

    const result = await this.pool.query<PlatformAdminPermissionRow>(PLATFORM_PERMISSION_SQL);
    return result.rows.map((row) => ({
      id: row.id,
      parentId: row.parent_id,
      permCode: row.perm_code,
      permName: row.perm_name,
      permType: row.perm_type,
      status: row.status,
      description: row.description,
      icon: row.icon,
      sort: row.sort,
      routePath: row.route_path,
      component: row.component,
      roleCount: row.role_count,
      activeRoleCount: row.active_role_count,
      createdAt: toIso(row.created_at),
      updatedAt: toIso(row.updated_at),
    }));
  }
}

function assertCanViewAdminPermissions(req: Request & RequestContext): void {
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

function toIso(value: Date | string | null): string {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

interface PlatformAdminPermissionRow {
  id: string;
  parent_id: string | null;
  perm_code: string;
  perm_name: string;
  perm_type: PlatformPermissionType;
  status: boolean;
  description: string;
  icon: string | null;
  sort: number;
  route_path: string | null;
  component: string | null;
  role_count: number;
  active_role_count: number;
  created_at: Date | string;
  updated_at: Date | string;
}

const PLATFORM_PERMISSION_SQL = `
  select
    p.id,
    p.parent_id,
    p.perm_code,
    p.perm_name,
    p.perm_type,
    p.is_active as status,
    p.description,
    p.icon,
    p.sort,
    nullif(p.route_path, '') as route_path,
    nullif(p.component, '') as component,
    p.created_at,
    p.updated_at,
    count(distinct rp.role_id)::int as role_count,
    count(distinct rp.role_id) filter (
      where r.status = 'active'
    )::int as active_role_count
  from ops.permission p
  left join ops.role_permission rp
    on rp.permission_id = p.id
  left join ops.role r
    on r.id = rp.role_id
  group by p.id
  order by p.perm_type asc, p.sort asc, p.perm_code asc
`;
