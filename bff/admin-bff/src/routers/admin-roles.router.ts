import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  Put,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import type { Pool } from "pg";
import { ADMIN_BFF_RO_POOL, ADMIN_BFF_RW_POOL } from "../tokens";
import type {
  PlatformPermissionType,
  PlatformRolePermissionRecord,
  PlatformRoleRecord,
  RequestContext,
} from "../types/console.types";

@Controller("api/admin-roles")
export class AdminRolesRouter {
  constructor(
    @Inject(ADMIN_BFF_RO_POOL) private readonly roPool: Pool,
    @Inject(ADMIN_BFF_RW_POOL) private readonly rwPool: Pool,
  ) {}

  @Get()
  async listAdminRoles(
    @Req() req: Request & RequestContext,
  ): Promise<PlatformRoleRecord[]> {
    assertCanManageAdminRoles(req);

    const [roleRows, permissionRows] = await Promise.all([
      this.roPool.query<PlatformRoleRow>(PLATFORM_ROLE_SQL),
      this.roPool.query<PlatformRolePermissionRow>(
        `${PLATFORM_ROLE_PERMISSION_SQL} ${PLATFORM_ROLE_PERMISSION_ORDER_SQL}`,
      ),
    ]);
    const permissionsByRole = groupBy(
      permissionRows.rows,
      (row) => row.role_id,
    );

    return roleRows.rows.map((role) => ({
      id: role.id,
      roleCode: role.role_code,
      nameI18nKey: role.name_i18n_key,
      nameEn: role.name_en,
      descriptionI18nKey: role.description_i18n_key,
      description: role.description,
      isSystem: role.is_system,
      statusCode: normalizeRoleStatusCode(role.status_code, role.status),
      status: role.status,
      sort: role.sort,
      adminCount: role.admin_count,
      activeAdminCount: role.active_admin_count,
      permissionCount: role.permission_count,
      menuPermissionCount: role.menu_permission_count,
      buttonPermissionCount: role.button_permission_count,
      apiPermissionCount: role.api_permission_count,
      createdBy: role.created_by,
      createdByName: role.created_by_name,
      createdAt: toIso(role.created_at),
      updatedAt: toIso(role.updated_at),
      permissions: (permissionsByRole.get(role.id) ?? []).map(mapPermissionRow),
    }));
  }

  @Put(":roleId/permissions")
  async replaceAdminRolePermissions(
    @Req() req: Request & RequestContext,
    @Param("roleId") roleId: string,
    @Body() body: ReplaceRolePermissionsBody,
  ): Promise<PlatformRoleRecord> {
    assertCanManageAdminRoles(req);

    const actorId = requireUuid(
      req.user?.id,
      "Invalid platform admin principal",
    );
    const targetRoleId = requireUuid(roleId, "Invalid role id");
    const permissionIds = normalizePermissionIds(body?.permissionIds);
    const client = await this.rwPool.connect();

    try {
      await client.query("begin");

      const roleResult = await client.query<PlatformRoleIdentityRow>(
        `
          select
            r.id,
            r.role_code,
            r.status as status_code,
            exists (
              select 1
              from ops.admin a
              where a.id = $2
                and a.role_id = r.id
                and a.deleted_at is null
            ) as is_actor_role
          from ops.role r
          where r.id = $1
          for update
        `,
        [targetRoleId, actorId],
      );
      const role = roleResult.rows[0];
      if (!role) {
        throw new NotFoundException("Platform role not found");
      }
      if (role.status_code === "archived") {
        throw new BadRequestException("Archived roles cannot be authorized");
      }

      const permissionResult = await client.query<PermissionIntegrityRow>(
        `
          select id, parent_id, perm_code, is_active as status
          from ops.permission
          where id = any($1::uuid[])
        `,
        [permissionIds],
      );
      if (permissionResult.rowCount !== permissionIds.length) {
        throw new BadRequestException(
          "Permission set contains unknown permission ids",
        );
      }

      const permissionIdSet = new Set(permissionIds);
      for (const permission of permissionResult.rows) {
        if (!permission.status) {
          throw new BadRequestException(
            `Disabled permission cannot be authorized: ${permission.perm_code}`,
          );
        }
        if (
          permission.parent_id &&
          !permissionIdSet.has(permission.parent_id)
        ) {
          throw new BadRequestException(
            `Permission ancestor is required: ${permission.perm_code}`,
          );
        }
      }

      if (
        role.is_actor_role &&
        !permissionResult.rows.some(
          (permission) => permission.perm_code === "platform.admin.manage",
        )
      ) {
        throw new ForbiddenException(
          "Cannot remove platform.admin.manage from the active administrator role",
        );
      }

      await client.query(
        `
          delete from ops.role_permission
          where role_id = $1
            and not (permission_id = any($2::uuid[]))
        `,
        [targetRoleId, permissionIds],
      );

      if (permissionIds.length) {
        await client.query(
          `
            insert into ops.role_permission (role_id, permission_id, created_by, updated_by)
            select $1::uuid, selected.permission_id, $3::uuid, $3::uuid
            from unnest($2::uuid[]) as selected(permission_id)
            on conflict (role_id, permission_id) do update
              set updated_at = now(),
                  updated_by = excluded.updated_by
          `,
          [targetRoleId, permissionIds, actorId],
        );
      }

      await client.query(
        `
          update ops.role
          set updated_by = $2,
              updated_at = now()
          where id = $1
        `,
        [targetRoleId, actorId],
      );

      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }

    const [roleRows, permissionRows] = await Promise.all([
      this.roPool.query<PlatformRoleRow>(
        `${PLATFORM_ROLE_SQL_WITH_FILTER} where r.id = $1 ${PLATFORM_ROLE_SQL_GROUP_ORDER}`,
        [targetRoleId],
      ),
      this.roPool.query<PlatformRolePermissionRow>(
        `${PLATFORM_ROLE_PERMISSION_SQL} where rp.role_id = $1 ${PLATFORM_ROLE_PERMISSION_ORDER_SQL}`,
        [targetRoleId],
      ),
    ]);
    const updatedRole = roleRows.rows[0];
    if (!updatedRole) {
      throw new NotFoundException("Platform role not found");
    }
    const permissionsByRole = groupBy(
      permissionRows.rows,
      (row) => row.role_id,
    );
    return mapRoleRow(updatedRole, permissionsByRole);
  }
}

function assertCanManageAdminRoles(req: Request & RequestContext): void {
  if (!req.user) {
    throw new UnauthorizedException("No active session");
  }

  if (
    req.capabilities &&
    !req.capabilities.includes("platform.admin.manage") &&
    !req.capabilities.includes("platform.tenant.manage")
  ) {
    throw new ForbiddenException("Missing platform.admin.manage capability");
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
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function requireUuid(value: string | undefined, message: string) {
  if (
    !value ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new UnauthorizedException(message);
  }
  return value;
}

function normalizePermissionIds(value: unknown) {
  if (!Array.isArray(value)) {
    throw new BadRequestException("permissionIds must be an array");
  }
  if (value.length > 1000) {
    throw new BadRequestException(
      "Too many permissions in one authorization request",
    );
  }

  const ids = new Set<string>();
  for (const item of value) {
    if (
      typeof item !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        item,
      )
    ) {
      throw new BadRequestException(
        "permissionIds contains an invalid permission id",
      );
    }
    ids.add(item);
  }
  return [...ids];
}

function normalizeRoleStatusCode(
  value: string | null,
  legacyStatus: boolean,
): PlatformRoleRecord["statusCode"] {
  if (value === "active" || value === "disabled" || value === "archived") {
    return value;
  }
  return legacyStatus ? "active" : "disabled";
}

function mapPermissionRow(
  row: PlatformRolePermissionRow,
): PlatformRolePermissionRecord {
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

function mapRoleRow(
  role: PlatformRoleRow,
  permissionsByRole: Map<string, PlatformRolePermissionRow[]>,
): PlatformRoleRecord {
  return {
    id: role.id,
    roleCode: role.role_code,
    nameI18nKey: role.name_i18n_key,
    nameEn: role.name_en,
    descriptionI18nKey: role.description_i18n_key,
    description: role.description,
    isSystem: role.is_system,
    statusCode: normalizeRoleStatusCode(role.status_code, role.status),
    status: role.status,
    sort: role.sort,
    adminCount: role.admin_count,
    activeAdminCount: role.active_admin_count,
    permissionCount: role.permission_count,
    menuPermissionCount: role.menu_permission_count,
    buttonPermissionCount: role.button_permission_count,
    apiPermissionCount: role.api_permission_count,
    createdBy: role.created_by,
    createdByName: role.created_by_name,
    createdAt: toIso(role.created_at),
    updatedAt: toIso(role.updated_at),
    permissions: (permissionsByRole.get(role.id) ?? []).map(mapPermissionRow),
  };
}

interface ReplaceRolePermissionsBody {
  permissionIds?: unknown;
}

interface PlatformRoleIdentityRow {
  id: string;
  role_code: string;
  status_code: PlatformRoleRecord["statusCode"];
  is_actor_role: boolean;
}

interface PermissionIntegrityRow {
  id: string;
  parent_id: string | null;
  perm_code: string;
  status: boolean;
}

interface PlatformRoleRow {
  id: string;
  role_code: string;
  name_i18n_key: string;
  name_en: string;
  description_i18n_key: string | null;
  description: string;
  is_system: boolean;
  status_code: string | null;
  status: boolean;
  sort: number;
  admin_count: number;
  active_admin_count: number;
  permission_count: number;
  menu_permission_count: number;
  button_permission_count: number;
  api_permission_count: number;
  created_by: string | null;
  created_by_name: string | null;
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

const PLATFORM_ROLE_SQL_WITH_FILTER = `
  select
    r.id,
    r.role_code,
    r.name_i18n_key,
    r.name_en,
    r.description_i18n_key,
    r.description,
    r.is_system,
    coalesce(nullif(to_jsonb(r)->>'status_code', ''), case when r.status = true then 'active' else 'disabled' end) as status_code,
    r.status,
    r.sort,
    r.created_by,
    coalesce(nullif(creator.display_name, ''), nullif(creator.username, ''), r.created_by::text) as created_by_name,
    r.created_at,
    r.updated_at,
    count(distinct a.id) filter (where a.deleted_at is null)::int as admin_count,
    count(distinct a.id) filter (
      where a.deleted_at is null
        and a.status = 'active'
    )::int as active_admin_count,
    count(distinct p.id) filter (where p.is_active = true)::int as permission_count,
    count(distinct p.id) filter (where p.is_active = true and p.perm_type = 'MENU')::int as menu_permission_count,
    count(distinct p.id) filter (where p.is_active = true and p.perm_type = 'BUTTON')::int as button_permission_count,
    count(distinct p.id) filter (where p.is_active = true and p.perm_type = 'API')::int as api_permission_count
  from ops.role r
  left join ops.admin creator
    on creator.id = r.created_by
  left join ops.admin a
    on a.role_id = r.id
  left join ops.role_permission rp
    on rp.role_id = r.id
  left join ops.permission p
    on p.id = rp.permission_id
`;

const PLATFORM_ROLE_SQL_GROUP_ORDER = `
  group by r.id, creator.id
  order by r.sort asc, r.created_at asc
`;

const PLATFORM_ROLE_SQL = `${PLATFORM_ROLE_SQL_WITH_FILTER} ${PLATFORM_ROLE_SQL_GROUP_ORDER}`;

const PLATFORM_ROLE_PERMISSION_SQL = `
  select
    rp.role_id,
    p.id,
    p.parent_id,
    p.perm_code,
    p.perm_name,
    p.perm_type,
    p.is_active as status,
    p.description,
    nullif(p.route_path, '') as route_path
  from ops.role_permission rp
  join ops.permission p
    on p.id = rp.permission_id
`;

const PLATFORM_ROLE_PERMISSION_ORDER_SQL = `
  order by rp.role_id, p.sort asc, p.perm_type asc, p.perm_code asc
`;
