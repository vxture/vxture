import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../tokens';
import type {
  OrganizationProfileView,
  OrganizationReadRepository,
  TenantContextView,
  TenantMemberView,
  TenantMemberSummary,
  TenantMembershipView,
  TenantPermissionView,
  TenantRoleView,
  UpsertTenantMemberInput,
} from '../types/organization.types';

interface TenantMembershipRow {
  tenant_id: string;
  account_id: string;
  role_code: string | null;
  role_name: string | null;
  is_primary_owner: boolean;
  status: 'active' | 'inactive' | 'banned';
  joined_at: Date;
}

interface TenantContextRow {
  tenant_id: string;
  tenant_code: string;
  tenant_name: string;
  display_name: string | null;
  tenant_type: 'company' | 'individual';
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  language: string | null;
  time_zone: string | null;
  company_name: string | null;
  primary_domain: string | null;
}

interface TenantMemberSummaryRow {
  total_members: string;
  active_members: string;
  primary_owners: string;
  active_roles: string;
}

interface OrganizationProfileRow {
  tenant_id: string;
  tenant_code: string;
  tenant_name: string;
  display_name: string | null;
  tenant_type: 'company' | 'individual';
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  logo_url: string | null;
  description: string | null;
  language: string | null;
  time_zone: string | null;
  company_name: string | null;
  unified_social_credit_code: string | null;
  business_license_url: string | null;
  industry: string | null;
  scale: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  country_code: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  postal_code: string | null;
  verified_status: 'unverified' | 'pending' | 'verified' | 'rejected' | null;
  verified_at: Date | null;
  rejected_reason: string | null;
  primary_domain: string | null;
  updated_at: Date | null;
}

interface TenantMemberRow {
  id: string;
  tenant_id: string;
  account_id: string;
  username: string;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  nickname: string | null;
  remark: string | null;
  role_code: string | null;
  role_name: string | null;
  status: 'active' | 'inactive' | 'banned';
  is_primary_owner: boolean;
  joined_at: Date;
  last_active_at: Date | null;
}

interface TenantRoleRow {
  id: string;
  tenant_id: string;
  role_code: string;
  role_name: string;
  description: string | null;
  is_system: boolean;
  status: 'active' | 'disabled';
  sort: number;
}

interface TenantPermissionRow {
  id: string;
  permission_code: string;
  permission_name: string;
  permission_type: string | null;
  description: string | null;
  sort: number;
}

interface AccountLookupRow {
  id: string;
  username: string;
}

@Injectable()
export class PgOrganizationRepository implements OrganizationReadRepository {
  private profileTableEnsured = false;

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async getTenantMembershipsByAccountId(accountId: string): Promise<TenantMembershipView[]> {
    const result = await this.pool.query<TenantMembershipRow>(
      `
        select
          tm.tenant_id,
          tm.account_id,
          tr.role_code,
          tr.role_name,
          tm.is_primary_owner,
          tm.status,
          tm.joined_at
        from tenancy.tenant_member tm
        left join tenancy.tenant t
          on t.id = tm.tenant_id
         and t.deleted_at is null
        left join tenancy.tenant_role tr
          on tr.id = tm.role_id
         and tr.deleted_at is null
        where tm.account_id = $1
          and tm.deleted_at is null
        order by
          tm.is_primary_owner desc,
          case when t.tenant_type = 'company' then 0 else 1 end,
          tm.joined_at asc
      `,
      [accountId],
    );

    return result.rows.map((row) => ({
      tenantId: row.tenant_id,
      accountId: row.account_id,
      roleCode: row.role_code,
      roleName: row.role_name,
      isPrimaryOwner: row.is_primary_owner,
      status: row.status,
      joinedAt: row.joined_at,
    }));
  }

  async getTenantContextById(tenantId: string): Promise<TenantContextView | null> {
    const result = await this.pool.query<TenantContextRow>(
      `
        select
          t.id as tenant_id,
          t.tenant_code,
          t.tenant_name,
          t.display_name,
          t.tenant_type,
          t.status,
          t.language,
          t.time_zone,
          org.company_name,
          domain.domain as primary_domain
        from tenancy.tenant t
        left join tenancy.tenant_organization org
          on org.tenant_id = t.id
         and org.deleted_at is null
        left join tenancy.tenant_domain domain
          on domain.tenant_id = t.id
         and domain.is_primary = true
         and domain.deleted_at is null
        where t.id = $1
          and t.deleted_at is null
        limit 1
      `,
      [tenantId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      tenantId: row.tenant_id,
      tenantCode: row.tenant_code,
      tenantName: row.tenant_name,
      displayName: row.display_name ?? row.tenant_name,
      tenantType: row.tenant_type,
      status: row.status,
      language: row.language ?? 'zh-CN',
      timeZone: row.time_zone ?? 'Asia/Shanghai',
      companyName: row.company_name,
      primaryDomain: row.primary_domain,
      workspace: row.tenant_code.toUpperCase(),
    };
  }

  async getOrganizationProfileByTenantId(tenantId: string): Promise<OrganizationProfileView | null> {
    const result = await this.pool.query<OrganizationProfileRow>(
      `
        select
          t.id as tenant_id,
          t.tenant_code,
          t.tenant_name,
          t.display_name,
          t.tenant_type,
          t.status,
          t.logo_url,
          t.description,
          t.language,
          t.time_zone,
          org.company_name,
          org.unified_social_credit_code,
          org.business_license_url,
          org.industry,
          org.scale,
          org.contact_name,
          org.contact_phone,
          org.contact_email,
          org.country_code::text,
          org.province,
          org.city,
          org.district,
          org.address,
          org.postal_code,
          org.verified_status,
          org.verified_at,
          org.rejected_reason,
          domain.domain as primary_domain,
          coalesce(org.updated_at, t.updated_at) as updated_at
        from tenancy.tenant t
        left join tenancy.tenant_organization org
          on org.tenant_id = t.id
         and org.deleted_at is null
        left join tenancy.tenant_domain domain
          on domain.tenant_id = t.id
         and domain.is_primary = true
         and domain.deleted_at is null
        where t.id = $1
          and t.deleted_at is null
        limit 1
      `,
      [tenantId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      tenantId: row.tenant_id,
      tenantCode: row.tenant_code,
      tenantName: row.tenant_name,
      displayName: row.display_name ?? row.tenant_name,
      tenantType: row.tenant_type,
      status: row.status,
      logoUrl: row.logo_url,
      description: row.description,
      language: row.language ?? 'zh-CN',
      timeZone: row.time_zone ?? 'Asia/Shanghai',
      companyName: row.company_name,
      unifiedSocialCreditCode: row.unified_social_credit_code,
      businessLicenseUrl: row.business_license_url,
      industry: row.industry,
      scale: row.scale,
      contactName: row.contact_name,
      contactPhone: row.contact_phone,
      contactEmail: row.contact_email,
      countryCode: row.country_code,
      province: row.province,
      city: row.city,
      district: row.district,
      address: row.address,
      postalCode: row.postal_code,
      verifiedStatus: row.verified_status,
      verifiedAt: row.verified_at,
      rejectedReason: row.rejected_reason,
      primaryDomain: row.primary_domain,
      updatedAt: row.updated_at,
    };
  }

  async getTenantMemberById(tenantId: string, memberId: string): Promise<TenantMemberView | null> {
    await this.ensureAccountProfileTable();

    const result = await this.pool.query<TenantMemberRow>(
      `
        select
          tm.id,
          tm.tenant_id,
          tm.account_id,
          account.username,
          profile.avatar_url,
          account.email,
          account.phone,
          tm.nickname,
          tm.remark,
          tr.role_code,
          tr.role_name,
          tm.status,
          tm.is_primary_owner,
          tm.joined_at,
          tm.last_active_at
        from tenancy.tenant_member tm
        join account.account account
          on account.id = tm.account_id
         and account.deleted_at is null
        left join account.account_profile profile
          on profile.account_id = account.id
        left join tenancy.tenant_role tr
          on tr.id = tm.role_id
         and tr.deleted_at is null
        where tm.tenant_id = $1
          and tm.id = $2
          and tm.deleted_at is null
        limit 1
      `,
      [tenantId, memberId],
    );

    return mapTenantMember(result.rows[0]);
  }

  async listTenantRoles(tenantId: string): Promise<TenantRoleView[]> {
    const [rolesResult, permissionsResult] = await Promise.all([
      this.pool.query<TenantRoleRow>(
      `
        select
          id,
          tenant_id,
          role_code,
          role_name,
          description,
          is_system,
          status,
          sort
        from tenancy.tenant_role
        where tenant_id = $1
          and deleted_at is null
        order by sort asc, role_name asc
      `,
      [tenantId],
    ),
      this.pool.query<{
        role_id: string;
        id: string;
        permission_code: string;
        permission_name: string;
        permission_type: string | null;
        description: string | null;
        sort: number;
      }>(
        `
          select
            trp.role_id,
            tp.id,
            tp.permission_code,
            tp.permission_name,
            tp.permission_type,
            tp.description,
            tp.sort
          from tenancy.tenant_role_permission trp
          join tenancy.tenant_permission tp
            on tp.id = trp.permission_id
          where trp.tenant_id = $1
            and tp.deleted_at is null
          order by tp.sort asc, tp.permission_name asc
        `,
        [tenantId],
      ),
    ]);

    const permissionsByRole = new Map<string, TenantPermissionView[]>();
    for (const row of permissionsResult.rows) {
      const list = permissionsByRole.get(row.role_id) ?? [];
      list.push({
        id: row.id,
        permissionCode: row.permission_code,
        permissionName: row.permission_name,
        permissionType: row.permission_type,
        description: row.description,
        sort: row.sort,
      });
      permissionsByRole.set(row.role_id, list);
    }

    return rolesResult.rows.map((row) => ({
      id: row.id,
      tenantId: row.tenant_id,
      roleCode: row.role_code,
      roleName: row.role_name,
      description: row.description,
      isSystem: row.is_system,
      status: row.status,
      sort: row.sort,
      permissions: permissionsByRole.get(row.id) ?? [],
    }));
  }

  async listTenantPermissions(tenantId: string): Promise<TenantPermissionView[]> {
    const result = await this.pool.query<TenantPermissionRow>(
      `
        select
          id,
          permission_code,
          permission_name,
          permission_type,
          description,
          sort
        from tenancy.tenant_permission
        where deleted_at is null
          and (
            permission_scope = 'platform'
            or (permission_scope = 'tenant' and tenant_id = $1)
          )
        order by sort asc, permission_name asc
      `,
      [tenantId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      permissionCode: row.permission_code,
      permissionName: row.permission_name,
      permissionType: row.permission_type,
      description: row.description,
      sort: row.sort,
    }));
  }

  async createTenantRole(
    tenantId: string,
    operatorAccountId: string,
    input: {
      roleCode: string;
      roleName: string;
      description?: string | null;
      permissionIds?: string[];
    },
  ): Promise<TenantRoleView> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');

      const roleResult = await client.query<{ id: string }>(
        `
          insert into tenancy.tenant_role (
            tenant_id,
            role_code,
            role_name,
            description,
            is_system,
            created_by,
            updated_by,
            created_at,
            updated_at,
            status,
            sort
          )
          values ($1, $2, $3, $4, false, $5, $5, now(), now(), 'active', 999)
          returning id
        `,
        [tenantId, input.roleCode.trim(), input.roleName.trim(), normalizeNullable(input.description), operatorAccountId],
      );

      const roleId = roleResult.rows[0]?.id;
      if (!roleId) {
        throw new Error('Role creation completed without a returned id.');
      }

      await this.replaceRolePermissions(client, tenantId, roleId, operatorAccountId, input.permissionIds ?? []);
      await client.query('commit');

      const role = (await this.listTenantRoles(tenantId)).find((item) => item.id === roleId);
      if (!role) {
        throw new Error('Role creation completed but record could not be reloaded.');
      }

      return role;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateTenantRole(
    tenantId: string,
    roleId: string,
    operatorAccountId: string,
    input: {
      roleName?: string | null;
      description?: string | null;
      status?: 'active' | 'disabled';
      permissionIds?: string[];
    },
  ): Promise<TenantRoleView | null> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      await client.query(
        `
          update tenancy.tenant_role
          set
            role_name = coalesce($3, role_name),
            description = coalesce($4, description),
            status = coalesce($5, status),
            updated_by = $6,
            updated_at = now()
          where tenant_id = $1
            and id = $2
            and deleted_at is null
        `,
        [tenantId, roleId, normalizeNullable(input.roleName), normalizeNullable(input.description), input.status ?? null, operatorAccountId],
      );

      if (input.permissionIds) {
        await this.replaceRolePermissions(client, tenantId, roleId, operatorAccountId, input.permissionIds);
      }

      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }

    return (await this.listTenantRoles(tenantId)).find((item) => item.id === roleId) ?? null;
  }

  async removeTenantRole(tenantId: string, roleId: string, operatorAccountId: string): Promise<boolean> {
    const result = await this.pool.query(
      `
        update tenancy.tenant_role
        set
          deleted_at = now(),
          updated_by = $3,
          updated_at = now()
        where tenant_id = $1
          and id = $2
          and deleted_at is null
          and is_system = false
      `,
      [tenantId, roleId, operatorAccountId],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async upsertTenantMember(tenantId: string, operatorAccountId: string, input: UpsertTenantMemberInput): Promise<TenantMemberView> {
    const client = await this.pool.connect();

    try {
      await client.query('begin');

      const accountId = await this.resolveAccountId(client, input.email);
      const roleId = await this.resolveRoleId(client, tenantId, input.roleId ?? null, input.roleCode ?? null);

      const result = await client.query<TenantMemberRow>(
        `
          insert into tenancy.tenant_member (
            tenant_id,
            account_id,
            role_id,
            role,
            is_primary_owner,
            status,
            nickname,
            remark,
            joined_source,
            joined_at,
            created_by,
            updated_by,
            created_at,
            updated_at,
            deleted_at
          )
          values (
            $1, $2, $3, coalesce($4, 'member'), false, $5, $6, $7, $8, now(), $9, $9, now(), now(), null
          )
          on conflict (tenant_id, account_id) do update set
            role_id = excluded.role_id,
            role = excluded.role,
            status = excluded.status,
            nickname = excluded.nickname,
            remark = excluded.remark,
            joined_source = excluded.joined_source,
            updated_by = excluded.updated_by,
            updated_at = now(),
            deleted_at = null
          returning id, tenant_id, account_id, ''::varchar as username, null::varchar as avatar_url,
            $10::varchar as email, null::varchar as phone,
            nickname, remark, $4::varchar as role_code, null::varchar as role_name, status, is_primary_owner, joined_at, last_active_at
        `,
        [
          tenantId,
          accountId,
          roleId,
          input.roleCode ?? 'member',
          input.status,
          normalizeNullable(input.nickname),
          normalizeNullable(input.remark),
          input.joinedSource,
          operatorAccountId,
          input.email,
        ],
      );

      await client.query('commit');

      const insertedMemberId = result.rows[0]?.id;
      if (!insertedMemberId) {
        throw new Error('Member upsert completed without a returned id.');
      }

      const member = await this.getTenantMemberById(tenantId, insertedMemberId);
      if (!member) {
        throw new Error('Member upsert completed but record could not be reloaded.');
      }

      return member;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateTenantMember(
    tenantId: string,
    memberId: string,
    operatorAccountId: string,
    input: {
      nickname?: string | null;
      remark?: string | null;
      roleId?: string | null;
      status?: 'active' | 'inactive' | 'banned';
    },
  ): Promise<TenantMemberView | null> {
    const roleId = input.roleId === undefined ? undefined : await this.resolveRoleId(this.pool, tenantId, input.roleId, null);

    await this.pool.query(
      `
        update tenancy.tenant_member
        set
          nickname = coalesce($4, nickname),
          remark = coalesce($5, remark),
          role_id = coalesce($6, role_id),
          status = coalesce($7, status),
          updated_by = $3,
          updated_at = now()
        where tenant_id = $1
          and id = $2
          and deleted_at is null
      `,
      [tenantId, memberId, operatorAccountId, normalizeNullable(input.nickname), normalizeNullable(input.remark), roleId ?? null, input.status ?? null],
    );

    return this.getTenantMemberById(tenantId, memberId);
  }

  async removeTenantMember(tenantId: string, memberId: string, operatorAccountId: string): Promise<boolean> {
    const result = await this.pool.query(
      `
        update tenancy.tenant_member
        set
          deleted_at = now(),
          updated_by = $3,
          updated_at = now()
        where tenant_id = $1
          and id = $2
          and deleted_at is null
      `,
      [tenantId, memberId, operatorAccountId],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async getTenantMemberSummary(tenantId: string): Promise<TenantMemberSummary> {
    const result = await this.pool.query<TenantMemberSummaryRow>(
      `
        select
          count(*)::text as total_members,
          count(*) filter (where tm.status = 'active')::text as active_members,
          count(*) filter (where tm.is_primary_owner = true and tm.status = 'active')::text as primary_owners,
          count(distinct tr.id) filter (where tr.status = 'active' and tr.deleted_at is null)::text as active_roles
        from tenancy.tenant_member tm
        left join tenancy.tenant_role tr
          on tr.id = tm.role_id
        where tm.tenant_id = $1
          and tm.deleted_at is null
      `,
      [tenantId],
    );

    const row = result.rows[0];
    return {
      totalMembers: Number(row?.total_members ?? 0),
      activeMembers: Number(row?.active_members ?? 0),
      primaryOwners: Number(row?.primary_owners ?? 0),
      activeRoles: Number(row?.active_roles ?? 0),
    };
  }

  async listTenantMembers(tenantId: string): Promise<TenantMemberView[]> {
    await this.ensureAccountProfileTable();

    const result = await this.pool.query<TenantMemberRow>(
      `
        select
          tm.id,
          tm.tenant_id,
          tm.account_id,
          account.username,
          profile.avatar_url,
          account.email,
          account.phone,
          tm.nickname,
          tm.remark,
          tr.role_code,
          tr.role_name,
          tm.status,
          tm.is_primary_owner,
          tm.joined_at,
          tm.last_active_at
        from tenancy.tenant_member tm
        join account.account account
          on account.id = tm.account_id
         and account.deleted_at is null
        left join account.account_profile profile
          on profile.account_id = account.id
        left join tenancy.tenant_role tr
          on tr.id = tm.role_id
         and tr.deleted_at is null
        where tm.tenant_id = $1
          and tm.deleted_at is null
        order by
          tm.is_primary_owner desc,
          coalesce(tr.sort, 999) asc,
          tm.joined_at asc
      `,
      [tenantId],
    );

    return result.rows.map(mapTenantMember).filter((member): member is TenantMemberView => Boolean(member));
  }

  private async resolveAccountId(client: Pool | { query: Pool['query'] }, email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await client.query<AccountLookupRow>(
      `
        select id, username
        from account.account
        where lower(coalesce(email, '')) = $1
          and deleted_at is null
        limit 1
      `,
      [normalizedEmail],
    );

    if (existing.rows[0]) {
      return existing.rows[0].id;
    }

    const username = buildUsernameFromEmail(normalizedEmail);
    const inserted = await client.query<AccountLookupRow>(
      `
        insert into account.account (
          username,
          email,
          status,
          created_at,
          updated_at
        )
        values ($1, $2, true, now(), now())
        returning id, username
      `,
      [username, normalizedEmail],
    );

    const insertedAccountId = inserted.rows[0]?.id;
    if (!insertedAccountId) {
      throw new Error('Account creation completed without a returned id.');
    }

    return insertedAccountId;
  }

  private async resolveRoleId(
    client: Pool | { query: Pool['query'] },
    tenantId: string,
    roleId?: string | null,
    roleCode?: string | null,
  ) {
    if (roleId) {
      return roleId;
    }

    const result = await client.query<{ id: string }>(
      `
        select id
        from tenancy.tenant_role
        where tenant_id = $1
          and deleted_at is null
          and status = 'active'
          and role_code = $2
        limit 1
      `,
      [tenantId, roleCode ?? 'member'],
    );

    return result.rows[0]?.id ?? null;
  }

  private async replaceRolePermissions(
    client: Pool | { query: Pool['query'] },
    tenantId: string,
    roleId: string,
    operatorAccountId: string,
    permissionIds: string[],
  ) {
    await client.query(
      `
        delete from tenancy.tenant_role_permission
        where tenant_id = $1
          and role_id = $2
      `,
      [tenantId, roleId],
    );

    for (const permissionId of permissionIds) {
      await client.query(
        `
          insert into tenancy.tenant_role_permission (
            tenant_id,
            role_id,
            permission_id,
            created_by,
            created_at
          )
          values ($1, $2, $3, $4, now())
          on conflict (role_id, permission_id) do nothing
        `,
        [tenantId, roleId, permissionId, operatorAccountId],
      );
    }
  }

  private async ensureAccountProfileTable() {
    if (this.profileTableEnsured) {
      return;
    }

    await this.pool.query(`
      create table if not exists account.account_profile (
        account_id uuid primary key references account.account(id) on delete cascade,
        display_name varchar(96),
        avatar_url varchar(512),
        headline varchar(128),
        bio text,
        timezone varchar(64),
        language varchar(32),
        updated_at timestamptz default now()
      )
    `);

    this.profileTableEnsured = true;
  }
}

function mapTenantMember(row?: TenantMemberRow): TenantMemberView | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    tenantId: row.tenant_id,
    accountId: row.account_id,
    username: row.username,
    avatarUrl: row.avatar_url,
    email: row.email,
    phone: row.phone,
    nickname: row.nickname,
    remark: row.remark,
    roleCode: row.role_code,
    roleName: row.role_name,
    status: row.status,
    isPrimaryOwner: row.is_primary_owner,
    joinedAt: row.joined_at,
    lastActiveAt: row.last_active_at,
  };
}

function normalizeNullable(value: string | null | undefined) {
  if (value === undefined) {
    return null;
  }

  const normalized = value?.trim() ?? '';
  return normalized ? normalized : null;
}

function buildUsernameFromEmail(email: string) {
  const base = email.split('@')[0]?.replace(/[^a-z0-9._-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'user';
  return `${base}-${Date.now().toString(36)}`.slice(0, 64);
}
