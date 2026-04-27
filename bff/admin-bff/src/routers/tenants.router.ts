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
  RequestContext,
  TenantOperationAuditEvent,
  TenantOperationMember,
  TenantOperationModelPolicy,
  TenantOperationRecord,
  TenantOperationSubscription,
  TenantOperationUsageMetric,
  TenantRiskLevel,
} from '../types/console.types';

const CURRENT_USAGE_MONTH = new Date().toISOString().slice(0, 7).replace('-', '');
const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

@Controller('api/tenants')
export class TenantsRouter implements OnModuleDestroy {
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
  async listTenants(@Req() req: Request & RequestContext): Promise<TenantOperationRecord[]> {
    assertCanManageTenants(req);

    if (!this.pool) {
      throw new BadGatewayException('Tenant database is not configured');
    }

    const [tenantRows, memberRows, subscriptionRows, usageRows, modelRows] = await Promise.all([
      this.pool.query<TenantRow>(TENANT_SQL),
      this.pool.query<MemberRow>(MEMBER_SQL),
      this.pool.query<SubscriptionRow>(SUBSCRIPTION_SQL),
      this.pool.query<UsageRow>(USAGE_SQL, [CURRENT_USAGE_MONTH]),
      this.pool.query<ModelPolicyRow>(MODEL_POLICY_SQL),
    ]);

    const membersByTenant = groupBy(memberRows.rows, (row) => row.tenant_id);
    const subscriptionsByTenant = groupBy(subscriptionRows.rows, (row) => row.tenant_id);
    const usageByTenant = groupBy(usageRows.rows, (row) => row.tenant_id);
    const modelsByTenant = groupBy(modelRows.rows, (row) => row.tenant_id);

    return tenantRows.rows.map((tenant) => {
      const usage = mapUsageRows(usageByTenant.get(tenant.id) ?? [], tenant.period_tokens, tenant.max_users, tenant.member_count);
      const tokenUsed = usage.find((item) => item.code === 'tokens')?.used ?? 0;
      const tokenQuota = tenant.period_tokens;
      const monthlyRevenue = Number(tenant.monthly_revenue ?? 0);
      const riskLevel = normalizeTenantRiskLevel(tenant.risk_level);
      const monthlyCost = Math.round(monthlyRevenue * costRateForRisk(riskLevel));
      const grossMarginRate = monthlyRevenue > 0 ? Math.round(((monthlyRevenue - monthlyCost) / monthlyRevenue) * 100) : tenant.status === 'active' ? 0 : -100;

      return {
        id: tenant.id,
        tenantCode: tenant.tenant_code,
        tenantName: tenant.tenant_name,
        displayName: tenant.display_name ?? tenant.tenant_name,
        tenantType: tenant.tenant_type,
        status: tenant.status,
        verifiedStatus: tenant.verified_status ?? 'unverified',
        verificationSubmittedAt: toIso(tenant.verification_submitted_at ?? tenant.created_at),
        verifiedAt: tenant.verified_at ? toIso(tenant.verified_at) : null,
        riskLevel,
        region: [tenant.province, tenant.city].filter(Boolean).join(' / ') || '未设置',
        industry: tenant.industry ?? '未设置',
        scale: tenant.scale ?? '未设置',
        ownerName: tenant.owner_display_name ?? tenant.owner_username ?? '未设置',
        ownerEmail: tenant.owner_email ?? `${tenant.owner_username ?? tenant.tenant_code}@local.vxture`,
        contactName: tenant.contact_name ?? tenant.owner_display_name ?? tenant.owner_username ?? '未设置',
        contactPhone: tenant.contact_phone ?? tenant.owner_phone ?? '',
        createdAt: toIso(tenant.created_at),
        lastActiveAt: toIso(tenant.last_active_at ?? tenant.updated_at),
        memberCount: tenant.member_count,
        activeMemberCount: tenant.active_member_count,
        adminCount: tenant.admin_count,
        subscriptionCount: tenant.subscription_count,
        productCount: tenant.product_count,
        monthlyRevenue,
        monthlyCost,
        grossMarginRate,
        tokenUsed,
        tokenQuota,
        ticketOpenCount: ticketCountForRisk(riskLevel, tenant.status),
        satisfaction: satisfactionForRisk(riskLevel),
        sla: slaForRisk(riskLevel),
        tags: tenantTags(tenant, riskLevel),
        notes: tenant.description ?? `${tenant.tenant_name} 的平台运营测试数据。`,
        members: (membersByTenant.get(tenant.id) ?? []).map(mapMemberRow),
        subscriptions: (subscriptionsByTenant.get(tenant.id) ?? []).map(mapSubscriptionRow),
        usage,
        modelPolicies: (modelsByTenant.get(tenant.id) ?? []).map((row) => mapModelPolicyRow(row, tokenUsed, tokenQuota)),
        auditEvents: buildAuditEvents(tenant, riskLevel),
        tickets: [],
      };
    });
  }
}

function assertCanManageTenants(req: Request & RequestContext): void {
  if (!req.user) {
    throw new UnauthorizedException('No active session');
  }

  if (req.capabilities && !req.capabilities.includes('platform.tenant.manage')) {
    throw new ForbiddenException('Missing platform.tenant.manage capability');
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

function mapMemberStatus(status: string): TenantOperationMember['status'] {
  if (status === 'active') return 'active';
  if (status === 'inactive') return 'invited';
  return 'suspended';
}

function mapSubscriptionStatus(status: string): TenantOperationSubscription['status'] {
  if (status === 'trial') return 'trial';
  if (status === 'active') return 'active';
  if (status === 'cancelled') return 'cancelled';
  return 'past_due';
}

function usageStatus(used: number, quota: number | null): TenantOperationUsageMetric['status'] {
  if (!quota || quota <= 0) return used > 0 ? 'danger' : 'normal';
  const ratio = used / quota;
  if (ratio >= 0.9) return 'danger';
  if (ratio >= 0.75) return 'warning';
  return 'normal';
}

function mapUsageRows(rows: UsageRow[], tokenQuota: number, maxUsers: number, memberCount: number): TenantOperationUsageMetric[] {
  const tokenUsed = rows
    .filter((row) => row.stat_type === 'summary' && row.feature_id === ZERO_UUID)
    .reduce((total, row) => total + Number(row.total_quota), 0);

  return [
    {
      code: 'tokens',
      label: '模型 Token',
      used: tokenUsed,
      quota: tokenQuota,
      unit: 'tokens',
      trend: tokenUsed > 0 ? '+测试' : '冻结',
      status: usageStatus(tokenUsed, tokenQuota),
    },
    {
      code: 'members',
      label: '成员席位',
      used: memberCount,
      quota: maxUsers,
      unit: 'seats',
      trend: memberCount > 0 ? '+同步' : '无',
      status: usageStatus(memberCount, maxUsers),
    },
  ];
}

function mapMemberRow(row: MemberRow): TenantOperationMember {
  return {
    id: row.id,
    name: row.display_name ?? row.nickname ?? row.username,
    email: row.email ?? `${row.username}@local.vxture`,
    role: row.role_name ?? row.role,
    status: mapMemberStatus(row.status),
    lastActiveAt: toIso(row.last_active_at ?? row.joined_at),
  };
}

function mapSubscriptionRow(row: SubscriptionRow): TenantOperationSubscription {
  return {
    id: row.id,
    productName: row.plan_name,
    releaseName: row.plan_code,
    planName: row.plan_name,
    status: mapSubscriptionStatus(row.status),
    seats: row.max_users ?? 0,
    monthlyRevenue: Number(row.pay_amount ?? 0),
    startedAt: toIso(row.start_at),
    renewsAt: row.end_at ? toIso(row.end_at) : null,
  };
}

function mapModelPolicyRow(row: ModelPolicyRow, tokenUsed: number, tokenQuota: number): TenantOperationModelPolicy {
  const ratio = tokenQuota > 0 ? tokenUsed / tokenQuota : 0;
  return {
    id: row.id,
    agentName: row.agent_name ?? '全部智能体',
    productName: row.plan_name ?? '租户默认',
    modelCode: row.model_code,
    quotaTokens: tokenQuota,
    usedTokens: tokenUsed,
    state: !row.is_active ? 'disabled' : ratio >= 0.9 ? 'limited' : 'effective',
    source: row.agent_id ? 'tenant' : 'default',
  };
}

function normalizeTenantRiskLevel(risk: RawTenantRiskLevel): TenantRiskLevel {
  if (risk === 'high') return 'high';
  if (risk === 'medium' || risk === 'follow_up') return 'follow_up';
  return 'normal';
}

function buildAuditEvents(row: TenantRow, riskLevel: TenantRiskLevel): TenantOperationAuditEvent[] {
  const result = riskLevel === 'high' ? 'danger' : riskLevel === 'follow_up' ? 'warning' : 'success';
  return [
    {
      id: `${row.id}:created`,
      action: '租户创建',
      actor: row.owner_username ?? 'system',
      at: toIso(row.created_at),
      result: 'success',
    },
    {
      id: `${row.id}:status`,
      action: '状态同步',
      actor: 'system',
      at: toIso(row.updated_at),
      result,
    },
  ];
}

function tenantTags(row: TenantRow, riskLevel: TenantRiskLevel): string[] {
  const tags = [row.tenant_type === 'company' ? '企业租户' : '个人租户'];
  if (row.verified_status === 'pending') tags.push('认证待审');
  if (riskLevel !== 'normal') tags.push(riskLevel === 'high' ? '高风险' : '需跟进');
  if (row.status === 'trial') tags.push('试用期');
  if (row.status === 'suspended') tags.push('服务暂停');
  if (row.status === 'cancelled') tags.push('已注销');
  return tags;
}

function costRateForRisk(risk: TenantRiskLevel) {
  if (risk === 'high') return 0.42;
  if (risk === 'follow_up') return 0.34;
  return 0.26;
}

function ticketCountForRisk(risk: TenantRiskLevel, status: string) {
  if (status === 'cancelled') return 2;
  if (status === 'suspended') return 4;
  if (risk === 'high') return 3;
  if (risk === 'follow_up') return 1;
  return 0;
}

function satisfactionForRisk(risk: TenantRiskLevel) {
  if (risk === 'high') return 3.4;
  if (risk === 'follow_up') return 4.2;
  return 4.8;
}

function slaForRisk(risk: TenantRiskLevel) {
  if (risk === 'high') return '98.40%';
  if (risk === 'follow_up') return '99.82%';
  return '99.96%';
}

type RawTenantRiskLevel = TenantRiskLevel | 'low' | 'medium';

interface TenantRow {
  id: string;
  tenant_code: string;
  tenant_name: string;
  display_name: string | null;
  tenant_type: 'company' | 'individual';
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  description: string | null;
  created_at: Date;
  updated_at: Date;
  last_active_at: Date | null;
  verified_status: 'unverified' | 'pending' | 'verified' | 'rejected' | null;
  verification_submitted_at: Date | null;
  verified_at: Date | null;
  province: string | null;
  city: string | null;
  industry: string | null;
  scale: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  owner_username: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  owner_display_name: string | null;
  member_count: number;
  active_member_count: number;
  admin_count: number;
  subscription_count: number;
  product_count: number;
  monthly_revenue: string | number;
  period_tokens: number;
  max_users: number;
  risk_level: RawTenantRiskLevel;
}

interface MemberRow {
  id: string;
  tenant_id: string;
  username: string;
  email: string | null;
  nickname: string | null;
  display_name: string | null;
  role: string;
  role_name: string | null;
  status: string;
  joined_at: Date;
  last_active_at: Date | null;
}

interface SubscriptionRow {
  id: string;
  tenant_id: string;
  status: string;
  pay_amount: string | number | null;
  start_at: Date;
  end_at: Date | null;
  plan_code: string;
  plan_name: string;
  max_users: number | null;
}

interface UsageRow {
  tenant_id: string;
  feature_id: string;
  agent_id: string;
  stat_type: string;
  total_quota: string | number;
}

interface ModelPolicyRow {
  id: string;
  tenant_id: string;
  agent_id: string | null;
  agent_name: string | null;
  model_code: string;
  is_active: boolean;
  plan_name: string | null;
}

const TENANT_SQL = `
  with member_stats as (
    select
      tm.tenant_id,
      count(*) filter (where tm.deleted_at is null)::int as member_count,
      count(*) filter (where tm.deleted_at is null and tm.status = 'active')::int as active_member_count,
      count(*) filter (where tm.deleted_at is null and tm.role in ('owner', 'admin'))::int as admin_count,
      max(tm.last_active_at) as last_active_at
    from tenancy.tenant_member tm
    group by tm.tenant_id
  ),
  subscription_stats as (
    select
      s.tenant_id,
      count(*) filter (where s.deleted_at is null)::int as subscription_count,
      count(distinct s.plan_id) filter (where s.deleted_at is null)::int as product_count,
      coalesce(sum(s.pay_amount) filter (where s.deleted_at is null and s.status in ('active', 'trial')), 0) as monthly_revenue
    from commerce.tenant_subscription s
    group by s.tenant_id
  ),
  quota_stats as (
    select distinct on (q.tenant_id)
      q.tenant_id,
      q.period_tokens::bigint as period_tokens,
      q.max_users::int as max_users
    from commerce.tenant_subscription_quota q
    order by q.tenant_id, q.effective_at desc
  )
  select
    t.id,
    t.tenant_code,
    t.tenant_name,
    t.display_name,
    t.tenant_type,
    t.status,
    t.description,
    t.created_at,
    t.updated_at,
    ms.last_active_at,
    org.verified_status,
    org.created_at as verification_submitted_at,
    org.verified_at,
    org.province,
    org.city,
    org.industry,
    org.scale,
    org.contact_name,
    org.contact_phone,
    owner.username as owner_username,
    owner.email as owner_email,
    owner.phone as owner_phone,
    profile.display_name as owner_display_name,
    coalesce(ms.member_count, 0) as member_count,
    coalesce(ms.active_member_count, 0) as active_member_count,
    coalesce(ms.admin_count, 0) as admin_count,
    coalesce(ss.subscription_count, 0) as subscription_count,
    coalesce(ss.product_count, 0) as product_count,
    coalesce(ss.monthly_revenue, 0) as monthly_revenue,
    coalesce(qs.period_tokens, 0) as period_tokens,
    coalesce(qs.max_users, 0) as max_users,
    coalesce(risk.config_value, 'normal') as risk_level
  from tenancy.tenant t
  left join tenancy.tenant_organization org
    on org.tenant_id = t.id
   and org.deleted_at is null
  left join account.account owner
    on owner.id = t.tenant_owner
  left join account.account_profile profile
    on profile.account_id = owner.id
  left join member_stats ms
    on ms.tenant_id = t.id
  left join subscription_stats ss
    on ss.tenant_id = t.id
  left join quota_stats qs
    on qs.tenant_id = t.id
  left join tenancy.tenant_config risk
    on risk.tenant_id = t.id
   and risk.config_key = 'ops.risk_level'
   and risk.deleted_at is null
  where t.deleted_at is null
  order by t.created_at desc, t.tenant_code asc
`;

const MEMBER_SQL = `
  select
    tm.id,
    tm.tenant_id,
    a.username,
    a.email,
    tm.nickname,
    p.display_name,
    tm.role,
    tr.role_name,
    tm.status,
    tm.joined_at,
    tm.last_active_at
  from tenancy.tenant_member tm
  join account.account a
    on a.id = tm.account_id
  left join account.account_profile p
    on p.account_id = a.id
  left join tenancy.tenant_role tr
    on tr.id = tm.role_id
  where tm.deleted_at is null
  order by tm.is_primary_owner desc, tr.sort asc nulls last, tm.joined_at asc
`;

const SUBSCRIPTION_SQL = `
  select
    s.id,
    s.tenant_id,
    s.status,
    s.pay_amount,
    s.start_at,
    s.end_at,
    p.plan_code,
    p.plan_name,
    q.max_users
  from commerce.tenant_subscription s
  join product.plan p
    on p.id = s.plan_id
  left join commerce.tenant_subscription_quota q
    on q.subscription_id = s.id
  where s.deleted_at is null
  order by s.created_at desc
`;

const USAGE_SQL = `
  select
    tenant_id,
    feature_id::text as feature_id,
    agent_id::text as agent_id,
    stat_type,
    total_quota
  from commerce.tenant_usage_summary
  where cycle_month = $1
`;

const MODEL_POLICY_SQL = `
  select
    g.id,
    g.tenant_id,
    g.agent_id,
    a.agent_name,
    m.model_code,
    g.is_active,
    p.plan_name
  from ai_gateway.ai_model_grant g
  join ai_gateway.ai_model m
    on m.id = g.model_id
  left join product.agent a
    on a.id = g.agent_id
  left join commerce.tenant_subscription s
    on s.tenant_id = g.tenant_id
   and s.deleted_at is null
  left join product.plan p
    on p.id = s.plan_id
  where g.deleted_at is null
  order by g.priority asc, m.model_code asc
`;
