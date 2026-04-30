import { compare } from 'bcryptjs';
import { Inject, Injectable, OnModuleDestroy, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VxConfigService } from '@vxture/core-config';
import type { AuthTokenPair } from '@vxture/core-auth';
import { JwtUserType } from '@vxture/core-auth';
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
  private readonly mockAdminPassword = '123456';
  private readonly mockAdmin: PlatformAdminView = {
    id: 'platform_admin_mock',
    username: 'superadmin',
    email: 'superadmin@local.vxture',
    phone: '13800000000',
    displayName: 'Super Admin',
    roleCode: 'super_admin',
    roleName: 'Super Admin',
    permissions: PLATFORM_ADMIN_CAPABILITIES,
  };

  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(VxConfigService)
    private readonly configService: VxConfigService,
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

  async loginWithPassword(identifier: string, password: string): Promise<{
    tokens: AuthTokenPair;
    user: ConsoleUser;
  }> {
    const admin = await this.authenticatePlatformAdmin(identifier, password);

    const accessPayload: PlatformAdminJwtPayload = {
      sub: admin.id,
      email: admin.email ?? `${admin.username}@local.vxture`,
      role: 'admin',
      userType: JwtUserType.OPERATOR,
      permissions: admin.permissions,
      authScope: 'platform-admin',
      provider: 'password',
    };

    const refreshPayload: PlatformAdminRefreshPayload = {
      sub: admin.id,
      authScope: 'platform-admin',
      jti: `${admin.id}:${Date.now()}`,
    };

    const tokens = {
      accessToken: this.jwtService.sign(accessPayload, {
        secret: this.configService.auth.JWT_SECRET,
        expiresIn: this.configService.auth.JWT_ACCESS_EXPIRES_IN as never,
      }),
      refreshToken: this.jwtService.sign(refreshPayload, {
        secret: this.configService.auth.JWT_SECRET,
        expiresIn: this.configService.auth.JWT_REFRESH_EXPIRES_IN as never,
      }),
      expiresIn: parseExpiresToSeconds(this.configService.auth.JWT_ACCESS_EXPIRES_IN),
      refreshExpiresIn: parseExpiresToSeconds(this.configService.auth.JWT_REFRESH_EXPIRES_IN),
    };

    return {
      tokens,
      user: mapPlatformAdminUser(admin),
    };
  }

  async getCurrentUser(accountId: string): Promise<ConsoleUser | null> {
    const admin = await this.getPlatformAdminById(accountId);
    return admin ? mapPlatformAdminUser(admin) : null;
  }

  async getCapabilities(accountId: string): Promise<string[]> {
    const admin = await this.getPlatformAdminById(accountId);
    return admin?.permissions ?? [];
  }

  verifyAccessToken(token: string) {
    const payload = this.jwtService.verify<PlatformAdminJwtPayload>(token, {
      secret: this.configService.auth.JWT_SECRET,
    });
    if (payload.authScope !== 'platform-admin') {
      throw new UnauthorizedException('Invalid admin token');
    }
    return payload;
  }

  private async authenticatePlatformAdmin(identifier: string, password: string): Promise<PlatformAdminView> {
    if (!identifier.trim() || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!this.pool) {
      if (identifier.trim().toLowerCase() !== this.mockAdmin.username || password !== this.mockAdminPassword) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return this.mockAdmin;
    }

    const admin = await this.findPlatformAdminByIdentifier(identifier);
    if (!admin || !admin.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.pool.query(
      `
        update platform.platform_admin
        set last_login_at = now()
        where id = $1
      `,
      [admin.id],
    );

    return admin;
  }

  private async getPlatformAdminById(adminId: string): Promise<PlatformAdminView | null> {
    if (!this.pool) {
      return adminId === this.mockAdmin.id ? this.mockAdmin : null;
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
          r.role_name,
          coalesce(array_remove(array_agg(distinct p.perm_code), null), array[]::varchar[]) as permissions
        from platform.platform_admin a
        join platform.platform_role r
          on r.id = a.role_id
         and r.status = true
        left join platform.platform_role_permission rp
          on rp.role_id = r.id
        left join platform.platform_permission p
          on p.id = rp.permission_id
         and p.status = true
        where a.id = $1
          and a.deleted_at is null
          and a.status = true
        group by a.id, r.role_code, r.role_name
        limit 1
      `,
      [adminId],
    );

    return mapPlatformAdminRow(result.rows[0]);
  }

  private async findPlatformAdminByIdentifier(identifier: string): Promise<(PlatformAdminView & { passwordHash: string | null }) | null> {
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
          r.role_name,
          coalesce(array_remove(array_agg(distinct p.perm_code), null), array[]::varchar[]) as permissions
        from platform.platform_admin a
        join platform.platform_role r
          on r.id = a.role_id
         and r.status = true
        left join platform.platform_role_permission rp
          on rp.role_id = r.id
        left join platform.platform_permission p
          on p.id = rp.permission_id
         and p.status = true
        where a.deleted_at is null
          and a.status = true
          and (
            lower(a.username) = lower($1)
            or lower(coalesce(a.email, '')) = lower($1)
            or coalesce(a.phone, '') = $1
          )
        group by a.id, r.role_code, r.role_name
        limit 1
      `,
      [identifier.trim()],
    );

    return mapPlatformAdminRow(result.rows[0]);
  }
}

interface PlatformAdminJwtPayload {
  sub: string;
  email: string;
  role: string;
  /** 平台运营人员固定为 'operator'，供 vela-bff surface 校验使用 */
  userType: JwtUserType;
  permissions?: string[];
  authScope: 'platform-admin';
  provider: 'password';
  iat?: number;
  exp?: number;
}

interface PlatformAdminRefreshPayload {
  sub: string;
  authScope: 'platform-admin';
  jti: string;
  iat?: number;
  exp?: number;
}

interface PlatformAdminRow {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  display_name: string | null;
  role_code: string;
  role_name: string;
  permissions: string[];
}

interface PlatformAdminView {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  roleCode: string;
  roleName: string;
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
    roleName: row.role_name,
    permissions: normalizePlatformPermissions(row.role_code, row.permissions ?? []),
  };
}

function normalizePlatformPermissions(roleCode: string, permissions: string[]): string[] {
  const normalized = new Set(permissions);
  const isSuperAdmin =
    roleCode === 'super_admin' ||
    normalized.has('system:admin') ||
    normalized.has('admin:manage');

  if (isSuperAdmin) {
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
    roleLabel: admin.roleName,
    username: admin.username,
    phone: admin.phone,
  };
}

function parseExpiresToSeconds(value: string): number {
  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 900;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 60 * 60 * 24;
    default:
      return 900;
  }
}
