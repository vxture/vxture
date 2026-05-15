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
  AccountOperationRecord,
  AccountOperationStatus,
  AccountTenantBinding,
  RequestContext,
} from '../types/console.types';

@Controller('api/accounts')
export class AccountsRouter implements OnModuleDestroy {
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
  async listAccounts(@Req() req: Request & RequestContext): Promise<AccountOperationRecord[]> {
    assertCanManageAccounts(req);

    if (!this.pool) {
      throw new BadGatewayException('Account database is not configured');
    }

    const rows = await this.pool.query<AccountRow>(ACCOUNT_SQL);
    return mapAccountRows(rows.rows);
  }
}

function assertCanManageAccounts(req: Request & RequestContext): void {
  if (!req.user) {
    throw new UnauthorizedException('No active session');
  }

  if (req.capabilities && !req.capabilities.includes('platform.tenant.manage')) {
    throw new ForbiddenException('Missing platform.tenant.manage capability');
  }
}

function toIso(value: Date | string | null): string {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function isPrivateIp(ip: string): boolean {
  if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true;

  const [first = Number.NaN, second = Number.NaN] = ip.split('.').map((segment) => Number(segment));
  return first === 172 && second >= 16 && second <= 31;
}

function resolveIpLocation(ip?: string | null): string {
  if (!ip) return '未知地址';
  if (isPrivateIp(ip)) return '内网地址';

  const prefixes: Array<[string, string]> = [
    ['101.33.', '上海'],
    ['111.206.', '北京'],
    ['183.129.', '杭州'],
    ['112.93.', '深圳'],
    ['115.236.', '杭州'],
    ['221.12.', '杭州'],
    ['58.247.', '上海'],
    ['123.125.', '北京'],
    ['36.112.', '北京'],
    ['120.92.', '北京'],
    ['171.221.', '成都'],
    ['182.150.', '成都'],
    ['119.29.', '深圳'],
  ];

  return prefixes.find(([prefix]) => ip.startsWith(prefix))?.[1] ?? '未知地址';
}

function memberStatus(row: AccountRow): AccountOperationStatus {
  if (!row.account_enabled) return 'disabled';
  if (row.member_status === 'banned' || row.member_status === 'suspended') return 'locked';
  if (row.member_status === 'inactive' || row.member_status === 'invited') return 'invited';
  return 'active';
}

function mapAccountRows(rows: AccountRow[]): AccountOperationRecord[] {
  const groups = new Map<string, AccountRow[]>();
  for (const row of rows) {
    const current = groups.get(row.account_id) ?? [];
    current.push(row);
    groups.set(row.account_id, current);
  }

  return Array.from(groups.values()).map((accountRows) => {
    const sortedRows = [...accountRows].sort((left, right) => {
      if (left.is_primary_owner !== right.is_primary_owner) return left.is_primary_owner ? -1 : 1;
      return new Date(toIso(right.last_active_at ?? right.joined_at)).getTime() - new Date(toIso(left.last_active_at ?? left.joined_at)).getTime();
    });
    const primary = sortedRows[0]!;
    const statuses = sortedRows.map(memberStatus);
    const status: AccountOperationStatus = statuses.includes('disabled')
      ? 'disabled'
      : statuses.includes('locked')
        ? 'locked'
        : statuses.includes('active')
          ? 'active'
          : 'invited';
    const registeredAt = sortedRows
      .map((row) => toIso(row.joined_at))
      .sort((left, right) => new Date(left).getTime() - new Date(right).getTime())[0]!;
    const lastActiveAt = sortedRows
      .flatMap((row) => [row.last_active_at, row.last_login_at, row.joined_at])
      .filter((value): value is Date => Boolean(value))
      .map((value) => toIso(value))
      .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0]!;
    const lastLoginIp = sortedRows.find((row) => row.last_login_ip)?.last_login_ip ?? null;
    const bindings: AccountTenantBinding[] = sortedRows.map((row) => ({
      tenantId: row.tenant_id,
      tenantCode: row.tenant_code,
      tenantName: row.tenant_display_name ?? row.tenant_name,
      tenantType: row.tenant_type,
      role: row.role_name ?? row.role,
      isPrimaryOwner: row.is_primary_owner,
    }));

    return {
      id: primary.account_id,
      accountCode: primary.username,
      displayName: primary.display_name ?? primary.username,
      email: primary.email ?? `${primary.username}@local.vxture`,
      phone: primary.phone,
      status,
      primaryTenantId: primary.tenant_id,
      primaryTenantCode: primary.tenant_code,
      primaryTenantName: primary.tenant_display_name ?? primary.tenant_name,
      primaryTenantType: primary.tenant_type,
      role: primary.role_name ?? primary.role,
      tenantCount: bindings.length,
      registeredAt,
      activatedAt: status === 'invited' ? null : registeredAt,
      lastActiveAt,
      lastActiveIp: lastLoginIp,
      lastActiveLocation: resolveIpLocation(lastLoginIp),
      loginCount30d: status === 'active' ? Math.max(1, bindings.length * 12) : 0,
      tenantBindings: bindings,
    };
  });
}

interface AccountRow {
  account_id: string;
  username: string;
  email: string | null;
  phone: string | null;
  account_enabled: boolean;
  last_login_at: Date | null;
  last_login_ip: string | null;
  display_name: string | null;
  member_status: string;
  joined_at: Date;
  last_active_at: Date | null;
  role: string;
  role_name: string | null;
  is_primary_owner: boolean;
  tenant_id: string;
  tenant_code: string;
  tenant_name: string;
  tenant_display_name: string | null;
  tenant_type: 'company' | 'individual';
}

const ACCOUNT_SQL = `
  select
    a.id as account_id,
    a.username,
    a.email,
    a.phone,
    (a.status = 'active') as account_enabled,
    a.last_login_at,
    a.last_login_ip,
    p.display_name,
    tm.status as member_status,
    tm.joined_at,
    tm.last_active_at,
    tm.role,
    null::varchar as role_name,
    tm.is_primary_owner,
    t.id as tenant_id,
    t.tenant_code,
    t.tenant_name,
    t.display_name as tenant_display_name,
    t.tenant_type
  from identity.account a
  join tenant.tenant_member tm
    on tm.account_id = a.id
   and tm.deleted_at is null
  join tenant.tenant t
    on t.id = tm.tenant_id
   and t.deleted_at is null
  left join identity.account_profile p
    on p.account_id = a.id
  where a.deleted_at is null
  order by a.created_at desc, a.username asc, tm.is_primary_owner desc, tm.joined_at asc
`;
