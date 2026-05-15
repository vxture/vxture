import { compare } from 'bcryptjs';
import { BadGatewayException, Inject, Injectable, OnModuleDestroy, UnauthorizedException } from '@nestjs/common';
import { VxConfigService } from '@vxture/core-config';
import { Pool } from 'pg';
import type { ConsoleUser } from '../types/console.types';

const PLATFORM_ADMIN_CAPABILITIES = [
  'platform.admin.manage',
  'platform.tenant.manage',
  'platform.product.manage',
  'platform.pricing.manage',
  'platform.model.manage',
];

@Injectable()
export class PlatformAuthService implements OnModuleDestroy {
  private readonly pool: Pool | null;

  constructor(
    @Inject(VxConfigService) private readonly configService: VxConfigService,
  ) {
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

  /**
   * 【重构 v1.4】仅做 DB 密码校验，不再签发 JWT。
   * JWT 签发统一委托给 auth-bff 的 /auth/internal/sign。
   */
  async loginWithPassword(identifier: string, password: string): Promise<{
    user: ConsoleUser;
    permissions: string[];
  }> {
    const admin = await this.authenticatePlatformAdmin(identifier, password);

    return {
      user: mapPlatformAdminUser(admin),
      permissions: admin.permissions,
    };
  }

  async loginWithPhone(phone: string): Promise<{
    user: ConsoleUser;
    permissions: string[];
  }> {
    const admin = await this.authenticatePlatformAdminPhone(phone);

    return {
      user: mapPlatformAdminUser(admin),
      permissions: admin.permissions,
    };
  }

  async canUsePhoneLogin(phone: string): Promise<boolean> {
    if (!this.pool) {
      throw new BadGatewayException('Platform admin database is not configured');
    }

    const admin = await this.findPlatformAdminByPhone(phone);
    return Boolean(admin);
  }

  async getCurrentUser(accountId: string): Promise<ConsoleUser | null> {
    const admin = await this.getPlatformAdminById(accountId);
    return admin ? mapPlatformAdminUser(admin) : null;
  }

  async getCapabilities(accountId: string): Promise<string[]> {
    const admin = await this.getPlatformAdminById(accountId);
    return admin?.permissions ?? [];
  }

  private async authenticatePlatformAdmin(identifier: string, password: string): Promise<PlatformAdminView> {
    if (!identifier.trim() || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!this.pool) {
      throw new BadGatewayException('Platform admin database is not configured');
    }

    const admin = await this.findPlatformAdminByIdentifier(identifier);
    if (!admin || !admin.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.recordLastLogin(admin.id);

    return admin;
  }

  private async authenticatePlatformAdminPhone(phone: string): Promise<PlatformAdminView> {
    if (!phone.trim()) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!this.pool) {
      throw new BadGatewayException('Platform admin database is not configured');
    }

    const admin = await this.findPlatformAdminByPhone(phone);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.recordLastLogin(admin.id);

    return admin;
  }

  private async getPlatformAdminById(adminId: string): Promise<PlatformAdminView | null> {
    if (!this.pool) {
      throw new BadGatewayException('Platform admin database is not configured');
    }

    return this.findPlatformAdmin('a.id = $1', [adminId]);
  }

  private async findPlatformAdminByIdentifier(identifier: string): Promise<(PlatformAdminView & { passwordHash: string | null }) | null> {
    if (!this.pool) {
      return null;
    }

    return this.findPlatformAdmin(
      `
        (
          lower(a.username) = lower($1)
          or lower(coalesce(a.email, '')) = lower($1)
          or coalesce(a.phone, '') = $1
        )
      `,
      [identifier.trim()],
    );
  }

  private async findPlatformAdminByPhone(phone: string): Promise<(PlatformAdminView & { passwordHash: string | null }) | null> {
    if (!this.pool) {
      return null;
    }

    return this.findPlatformAdmin('coalesce(a.phone, \'\') = $1', [normalizePhone(phone)]);
  }

  private async findPlatformAdmin(
    predicate: string,
    params: readonly unknown[],
  ): Promise<(PlatformAdminView & { passwordHash: string | null }) | null> {
    if (!this.pool) {
      return null;
    }

    const result = await this.pool.query<PlatformAdminRow>(
      `
        select
          a.id,
          a.username,
          a.email,
          a.phone,
          a.password_hash,
          a.display_name,
          r.role_code,
          r.name_i18n_key,
          r.name_en,
          coalesce(array_remove(array_agg(distinct p.perm_code), null), array[]::varchar[]) as permissions
        from ops.admin a
        join ops.role r
          on r.id = a.role_id
         and r.status = 'active'
        left join ops.role_permission rp
          on rp.role_id = r.id
        left join ops.permission p
          on p.id = rp.permission_id
         and p.is_active = true
        where a.deleted_at is null
          and a.status = 'active'
          and ${predicate}
        group by a.id, r.role_code, r.name_i18n_key, r.name_en
        limit 1
      `,
      [...params],
    );

    return mapPlatformAdminRow(result.rows[0]);
  }

  private async recordLastLogin(adminId: string): Promise<void> {
    await this.pool?.query(
      `
        update ops.admin
        set last_login_at = now()
        where id = $1
      `,
      [adminId],
    );
  }
}

interface PlatformAdminRow {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  display_name: string | null;
  role_code: string;
  name_i18n_key: string;
  name_en: string;
  permissions: string[];
}

interface PlatformAdminView {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  roleCode: string;
  roleI18nKey: string;
  roleNameEn: string;
  permissions: string[];
  passwordHash?: string | null;
}

async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  if (passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$') || passwordHash.startsWith('$2y$')) {
    return compare(password, passwordHash);
  }

  return password === passwordHash;
}

function mapPlatformAdminRow(row?: PlatformAdminRow): (PlatformAdminView & { passwordHash: string | null }) | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    roleCode: row.role_code,
    roleI18nKey: row.name_i18n_key,
    roleNameEn: row.name_en,
    permissions: normalizePlatformPermissions(row.role_code, row.permissions ?? []),
  };
}

function normalizePlatformPermissions(roleCode: string, permissions: string[]): string[] {
  const normalized = new Set(permissions);
  const isPlatformArchitect =
    roleCode === 'PLATFORM_ARCHITECT' ||
    normalized.has('system:admin') ||
    normalized.has('admin:manage');

  if (isPlatformArchitect) {
    PLATFORM_ADMIN_CAPABILITIES.forEach((permission) => normalized.add(permission));
  }

  if (normalized.has('tenant:manage')) {
    normalized.add('platform.tenant.manage');
  }

  return [...normalized];
}

function mapPlatformAdminUser(admin: PlatformAdminView): ConsoleUser {
  return {
    id: admin.id,
    name: admin.username,
    displayName: admin.displayName,
    email: admin.email ?? `${admin.username}@local.vxture`,
    roleLabel: admin.roleI18nKey,
    roleCode: admin.roleCode,
    roleI18nKey: admin.roleI18nKey,
    roleNameEn: admin.roleNameEn,
    username: admin.username,
    phone: admin.phone,
  };
}

function normalizePhone(phone: string): string {
  return phone.trim().replace(/\s+/g, '');
}
