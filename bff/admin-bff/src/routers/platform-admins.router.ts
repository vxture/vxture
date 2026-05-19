import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import type { Pool } from "pg";
import { ADMIN_BFF_RO_POOL } from "../tokens";
import type {
  PlatformAdminRecord,
  RequestContext,
} from "../types/console.types";

@Controller("api/platform-admins")
export class PlatformAdminsRouter {
  constructor(@Inject(ADMIN_BFF_RO_POOL) private readonly pool: Pool) {}

  @Get()
  async listPlatformAdmins(
    @Req() req: Request & RequestContext,
  ): Promise<PlatformAdminRecord[]> {
    assertCanManagePlatformAdmins(req);

    const result = await this.pool.query<PlatformAdminRow>(PLATFORM_ADMIN_SQL);
    return result.rows.map(mapPlatformAdminRow);
  }
}

function assertCanManagePlatformAdmins(req: Request & RequestContext): void {
  if (!req.user) {
    throw new UnauthorizedException("No active session");
  }

  if (req.capabilities && !req.capabilities.includes("platform.admin.manage")) {
    throw new ForbiddenException("Missing platform.admin.manage capability");
  }
}

function toIso(value: Date | string | null): string | null {
  if (!value) return null;
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function mapPlatformAdminRow(row: PlatformAdminRow): PlatformAdminRecord {
  return {
    id: row.id,
    sort: row.sort,
    username: row.username,
    displayName: row.display_name,
    phone: row.phone,
    email: row.email,
    roleId: row.role_id,
    roleCode: row.role_code,
    roleNameI18nKey: row.name_i18n_key,
    roleNameEn: row.name_en,
    roleStatusCode: normalizeRoleStatusCode(
      row.role_status_code,
      row.role_status,
    ),
    roleStatus: row.role_status,
    statusCode: normalizeStatusCode(row.status_code, row.status),
    status: row.status,
    isSystem: row.is_system,
    lastLoginAt: toIso(row.last_login_at),
    lastLoginIp: row.last_login_ip,
    remark: row.remark,
    createdAt: toIso(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: toIso(row.updated_at) ?? new Date(0).toISOString(),
  };
}

function normalizeStatusCode(
  value: string | null,
  legacyStatus: boolean,
): PlatformAdminRecord["statusCode"] {
  if (
    value === "active" ||
    value === "disabled" ||
    value === "locked" ||
    value === "pending" ||
    value === "suspended"
  ) {
    return value;
  }
  return legacyStatus ? "active" : "disabled";
}

interface PlatformAdminRow {
  id: string;
  sort: number;
  username: string;
  display_name: string;
  phone: string | null;
  email: string | null;
  role_id: string;
  role_code: string;
  name_i18n_key: string;
  name_en: string;
  role_status_code: string | null;
  role_status: boolean;
  status_code: string | null;
  status: boolean;
  is_system: boolean;
  last_login_at: Date | string | null;
  last_login_ip: string | null;
  remark: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

const PLATFORM_ADMIN_SQL = `
  select
    a.id,
    a.sort,
    a.username,
    a.display_name,
    a.phone,
    a.email,
    a.role_id,
    r.role_code,
    r.name_i18n_key,
    r.name_en,
    r.status as role_status_code,
    (r.status = 'active') as role_status,
    a.status as status_code,
    (a.status = 'active') as status,
    a.is_system,
    a.last_login_at,
    a.last_login_ip,
    a.remark,
    a.created_at,
    a.updated_at
  from ops.admin a
  join ops.role r
    on r.id = a.role_id
  where a.deleted_at is null
  order by a.sort asc, a.created_at asc
`;

function normalizeRoleStatusCode(
  value: string | null,
  legacyStatus: boolean,
): PlatformAdminRecord["roleStatusCode"] {
  if (value === "active" || value === "disabled" || value === "archived") {
    return value;
  }
  return legacyStatus ? "active" : "disabled";
}
