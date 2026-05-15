import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Pool } from 'pg';
import { ADMIN_BFF_RO_POOL, ADMIN_BFF_RW_POOL } from '../tokens';
import type {
  ProductSolutionTierCode,
  RequestContext,
  SubscriptionEntitlementSnapshot,
  SubscriptionOperationAction,
  SubscriptionOperationDetailRecord,
  SubscriptionOperationCycle,
  SubscriptionOperationEvent,
  SubscriptionOperationQuotaRisk,
  SubscriptionOperationRecord,
  SubscriptionOperationStatus,
  SubscriptionSolutionAssociation,
} from '../types/console.types';
import { getProductServicePlanDetail } from './products.router';

const CURRENT_USAGE_MONTH = new Date().toISOString().slice(0, 7).replace('-', '');
const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

@Controller('api/subscriptions')
export class SubscriptionRouter {
  constructor(
    @Inject(ADMIN_BFF_RO_POOL) private readonly roPool: Pool,
    @Inject(ADMIN_BFF_RW_POOL) private readonly rwPool: Pool,
  ) {}

  @Get()
  async listSubscriptions(@Req() req: Request & RequestContext): Promise<SubscriptionOperationRecord[]> {
    assertCanManageSubscriptions(req);

    const rows = await this.roPool.query<SubscriptionOperationRow>(SUBSCRIPTION_OPERATION_SQL, [CURRENT_USAGE_MONTH]);
    return rows.rows.map(mapSubscriptionOperationRow);
  }

  @Get(':subscriptionId')
  async getSubscription(
    @Req() req: Request & RequestContext,
    @Param('subscriptionId') subscriptionId: string,
  ): Promise<SubscriptionOperationDetailRecord> {
    assertCanManageSubscriptions(req);

    return loadSubscriptionDetail(this.roPool, subscriptionId);
  }

  @Post(':subscriptionId/actions')
  async submitSubscriptionAction(
    @Req() req: Request & RequestContext,
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: SubscriptionActionBody,
  ): Promise<SubscriptionOperationDetailRecord> {
    assertCanManageSubscriptions(req);

    const action = normalizeSubscriptionAction(body?.action);
    const reason = normalizeOperationReason(body?.reason);
    const client = await this.rwPool.connect();

    try {
      await client.query('begin');
      const currentResult = await client.query<SubscriptionActionRow>(SUBSCRIPTION_ACTION_LOOKUP_SQL, [subscriptionId]);
      const current = currentResult.rows[0];

      if (!current) {
        throw new NotFoundException(`Subscription ${subscriptionId} not found`);
      }

      const update = resolveSubscriptionActionUpdate(action, current);
      const operatorId = normalizeUuid(req.user?.id);
      const clientIp = normalizeClientIp(req);

      await client.query(SUBSCRIPTION_ACTION_UPDATE_SQL, [
        current.id,
        update.status,
        update.endAt,
        update.autoRenew,
        operatorId,
      ]);
      await client.query(SUBSCRIPTION_ACTION_HISTORY_INSERT_SQL, [
        current.tenant_id,
        current.id,
        subscriptionActionHistoryType(action),
        current.plan_id,
        current.plan_id,
        current.status,
        update.status,
        operatorId,
        reason,
        clientIp,
      ]);
      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }

    return loadSubscriptionDetail(this.roPool, subscriptionId);
  }
}

async function loadSubscriptionDetail(pool: Pool, subscriptionId: string): Promise<SubscriptionOperationDetailRecord> {
  const [records, historyRows] = await Promise.all([
    pool.query<SubscriptionOperationRow>(SUBSCRIPTION_OPERATION_SQL, [CURRENT_USAGE_MONTH]),
    pool.query<SubscriptionHistoryRow>(SUBSCRIPTION_HISTORY_SQL, [subscriptionId]),
  ]);
  const row = records.rows.find((item) => item.id === subscriptionId);
  if (!row) {
    throw new NotFoundException(`Subscription ${subscriptionId} not found`);
  }

  const record = mapSubscriptionOperationRow(row);
  const solutionAssociation = resolveSolutionAssociation(row);
  return {
    ...record,
    solutionCode: solutionAssociation.solutionCode,
    solutionName: solutionAssociation.solutionName,
    tierName: solutionAssociation.tierName,
    solutionAssociation,
    entitlementSnapshot: buildEntitlementSnapshot(row, solutionAssociation),
    operationTimeline: buildOperationTimeline(row, record, historyRows.rows),
  };
}

function assertCanManageSubscriptions(req: Request & RequestContext): void {
  if (!req.user) {
    throw new UnauthorizedException('No active session');
  }

  const capabilities = req.capabilities ?? [];
  if (capabilities.length && !capabilities.some((item) => item === 'platform.pricing.manage' || item === 'platform.tenant.manage')) {
    throw new ForbiddenException('Missing platform.pricing.manage capability');
  }
}

function normalizeSubscriptionAction(value: unknown): SubscriptionOperationAction {
  if (value === 'renew' || value === 'suspend' || value === 'resume' || value === 'cancel') {
    return value;
  }

  throw new BadRequestException('不支持的订阅操作');
}

function normalizeOperationReason(value: unknown): string {
  const reason = typeof value === 'string' ? value.trim() : '';
  if (!reason) {
    throw new BadRequestException('请填写操作原因');
  }

  if (reason.length < 4) {
    throw new BadRequestException('操作原因至少需要 4 个字符');
  }

  if (reason.length > 512) {
    throw new BadRequestException('操作原因不能超过 512 个字符');
  }

  return reason;
}

function normalizeUuid(value: string | null | undefined): string | null {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? value : null;
}

function normalizeClientIp(req: Request): string | null {
  const request = req as unknown as {
    headers?: Record<string, string | string[] | undefined>;
    ip?: string;
    socket?: { remoteAddress?: string };
  };
  const forwardedFor = request.headers?.['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0];
  return (forwardedIp?.trim() || request.ip || request.socket?.remoteAddress || null)?.slice(0, 64) ?? null;
}

function subscriptionActionHistoryType(action: SubscriptionOperationAction): string {
  if (action === 'renew') return 'renewed';
  if (action === 'suspend') return 'suspended';
  if (action === 'resume') return 'resumed';
  return 'cancelled';
}

function resolveSubscriptionActionUpdate(
  action: SubscriptionOperationAction,
  current: SubscriptionActionRow,
): { status: string; endAt: Date | string | null; autoRenew: boolean } {
  const lifecycle = subscriptionLifecycleForAction(current);

  if (action === 'renew') {
    if (lifecycle === 'cancelled') {
      throw new BadRequestException('已取消订阅为终态，不能续期确认');
    }

    return {
      status: 'active',
      endAt: extendSubscriptionEndAt(current.end_at, current.cycle_type),
      autoRenew: current.cycle_type !== 'once',
    };
  }

  if (action === 'suspend') {
    if (lifecycle === 'suspended') {
      throw new BadRequestException('订阅已处于暂停状态');
    }
    if (lifecycle === 'cancelled') {
      throw new BadRequestException('已取消订阅为终态，不能暂停');
    }

    return {
      status: 'suspended',
      endAt: current.end_at,
      autoRenew: false,
    };
  }

  if (action === 'resume') {
    if (lifecycle !== 'suspended') {
      throw new BadRequestException('只有暂停中的订阅可以恢复');
    }
    if (isPastEndAt(current.end_at)) {
      throw new BadRequestException('暂停订阅已过期，请先做续期确认，不能直接恢复');
    }

    return {
      status: 'active',
      endAt: current.end_at,
      autoRenew: current.auto_renew,
    };
  }

  if (lifecycle === 'cancelled') {
    throw new BadRequestException('订阅已取消');
  }

  return {
    status: 'cancelled',
    endAt: new Date(),
    autoRenew: false,
  };
}

function subscriptionLifecycleForAction(current: SubscriptionActionRow): SubscriptionOperationStatus {
  if (current.status === 'trial') return 'trial';
  if (current.status === 'suspended') return 'suspended';
  if (current.status === 'cancelled') return 'cancelled';
  if (current.status === 'expired') return 'overdue';
  if (isPastEndAt(current.end_at)) return 'overdue';
  if (isExpiringEndAt(current.end_at)) return 'expiring';
  return 'active';
}

function isPastEndAt(value: Date | string | null): boolean {
  if (!value) return false;
  const endAt = new Date(value).getTime();
  return Number.isFinite(endAt) && endAt < Date.now();
}

function isExpiringEndAt(value: Date | string | null): boolean {
  if (!value) return false;
  const endAt = new Date(value).getTime();
  if (!Number.isFinite(endAt)) return false;
  const now = Date.now();
  return endAt >= now && endAt - now <= 30 * 24 * 60 * 60 * 1000;
}

function extendSubscriptionEndAt(value: Date | string | null, cycleType: string): Date {
  const now = new Date();
  const currentEndAt = value ? new Date(value) : now;
  const anchor = Number.isFinite(currentEndAt.getTime()) && currentEndAt.getTime() > now.getTime() ? currentEndAt : now;
  const next = new Date(anchor);

  if (cycleType === 'monthly') {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setFullYear(next.getFullYear() + 1);
  }

  return next;
}

function toIso(value: Date | string | null): string {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function nullableIso(value: Date | string | null): string | null {
  return value ? toIso(value) : null;
}

function normalizeCycle(value: string | null): SubscriptionOperationCycle {
  if (value === 'yearly' || value === 'once') return value;
  return 'monthly';
}

function normalizeSubscriptionStatus(row: SubscriptionOperationRow): SubscriptionOperationStatus {
  if (row.status === 'trial') return 'trial';
  if (row.status === 'suspended') return 'suspended';
  if (row.status === 'cancelled') return 'cancelled';
  if (row.status === 'expired') return 'overdue';

  if (isPastEndAt(row.end_at)) return 'overdue';
  if (isExpiringEndAt(row.end_at)) return 'expiring';

  return 'active';
}

function inferSolution(row: SubscriptionOperationRow): { code: string | null; name: string } {
  const searchable = `${row.tenant_code} ${row.industry ?? ''} ${row.plan_name} ${row.plan_code}`.toLowerCase();

  if (searchable.includes('法律') || searchable.includes('法务') || searchable.includes('law')) {
    return { code: 'smart-legal', name: '智慧法务' };
  }

  if (searchable.includes('应急') || searchable.includes('政务') || searchable.includes('水利') || searchable.includes('flood')) {
    if (searchable.includes('水利') || searchable.includes('flood')) {
      return { code: 'flood-regulation', name: '洪涝灾害监管业务' };
    }
    return { code: 'emergency-command', name: '应急指挥协同' };
  }

  if (searchable.includes('智能体') || searchable.includes('ai') || searchable.includes('agent')) {
    return { code: null, name: '智能体平台服务' };
  }

  return { code: null, name: '平台基础服务' };
}

function tierNameForPlan(planCode: string, planName: string): string {
  if (planCode === 'starter') return 'Free';
  if (planCode === 'growth') return 'Pro';
  if (planCode === 'enterprise') return 'Enterprise';
  return planName;
}

function tierCodeForPlan(planCode: string): ProductSolutionTierCode {
  if (planCode === 'starter') return 'free';
  if (planCode === 'growth') return 'pro';
  if (planCode === 'enterprise') return 'enterprise';
  return 'custom';
}

function monthlyRevenueFor(row: SubscriptionOperationRow): number {
  const amount = Number(row.pay_amount ?? 0);
  if (row.cycle_type === 'yearly') return Math.round(amount / 12);
  return amount;
}

function quotaRiskFor(usageRate: number, status: SubscriptionOperationStatus): SubscriptionOperationQuotaRisk {
  if (status === 'overdue' || usageRate >= 95) return 'danger';
  if (status === 'expiring' || usageRate >= 80) return 'warning';
  return 'normal';
}

function operationHintFor(status: SubscriptionOperationStatus): string {
  if (status === 'trial') return '试用转正';
  if (status === 'expiring') return '续期确认';
  if (status === 'overdue') return '续期或取消';
  if (status === 'suspended') return '恢复或续期';
  if (status === 'cancelled') return '已结束归档';
  return '正常巡检';
}

function resolveSolutionAssociation(row: SubscriptionOperationRow): SubscriptionSolutionAssociation {
  const solution = inferSolution(row);
  const tierCode = tierCodeForPlan(row.plan_code);
  const tierName = tierNameForPlan(row.plan_code, row.plan_name);

  if (solution.code) {
    return {
      solutionCode: solution.code,
      solutionName: solution.name,
      tierCode,
      tierName,
      source: 'industry_rule',
      note: '当前订阅已按租户行业、套餐层级和运营规则关联到业务产品方案。后续可迁移为数据库中的显式 solution_id。',
    };
  }

  return {
    solutionCode: null,
    solutionName: solution.name,
    tierCode,
    tierName,
    source: 'legacy_plan',
    note: '当前订阅来自历史 plan_id 结构，尚未显式绑定业务产品方案，权益快照按平台基础套餐兼容展示。',
  };
}

function buildEntitlementSnapshot(
  row: SubscriptionOperationRow,
  association: SubscriptionSolutionAssociation,
): SubscriptionEntitlementSnapshot[] {
  if (association.solutionCode) {
    try {
      return getProductServicePlanDetail(association.solutionCode, association.tierCode).entitlements.map((item) => ({
        productCode: item.productCode,
        productName: item.productName,
        productType: item.productType,
        source: item.source,
        included: item.included,
        quotaSummary: item.quotaSummary,
        note: item.note,
      }));
    } catch {
      // Fall through to the legacy plan snapshot if the product solution is not ready yet.
    }
  }

  return [
    {
      productCode: row.plan_code,
      productName: row.plan_name,
      productType: 'platform',
      source: 'self',
      included: true,
      quotaSummary: `${Number(row.max_users ?? 0)} 席位 | ${formatTokenQuota(Number(row.period_tokens ?? 0))}`,
      note: association.note,
    },
  ];
}

function formatTokenQuota(value: number): string {
  if (value >= 100_000_000) return `${Math.round(value / 100_000_000)} 亿 token`;
  if (value >= 10_000) return `${Math.round(value / 10_000)} 万 token`;
  return `${value} token`;
}

function buildOperationTimeline(
  row: SubscriptionOperationRow,
  record: SubscriptionOperationRecord,
  histories: SubscriptionHistoryRow[],
): SubscriptionOperationEvent[] {
  const historyEvents: SubscriptionOperationEvent[] = histories.map((item) => ({
    id: item.id,
    title: historyTitle(item.change_type),
    description: item.operator_remark || [item.from_status, item.to_status].filter(Boolean).join(' -> ') || '订阅状态已更新。',
    actor: item.operator_display_name ?? item.operator_username ?? item.operator_type,
    at: toIso(item.created_at),
    tone: historyTone(item.to_status),
  }));
  const currentTone: SubscriptionOperationEvent['tone'] =
    record.status === 'overdue' || record.status === 'suspended'
      ? 'danger'
      : record.status === 'expiring' || record.status === 'trial'
        ? 'warning'
        : 'neutral';

  const events: SubscriptionOperationEvent[] = [
    {
      id: `${row.id}:created`,
      title: '订阅开通',
      description: `${record.tenantName} 开通 ${record.servicePlanName}，周期为${record.cycleType === 'yearly' ? '年付' : record.cycleType === 'once' ? '一次性' : '月付'}。`,
      actor: record.operatorName,
      at: toIso(row.created_at),
      tone: 'success',
    },
    ...historyEvents,
    {
      id: `${row.id}:current`,
      title: record.operationHint,
      description: `当前状态为 ${record.rawStatus}，配额消耗 ${record.quota.usageRate}%。`,
      actor: '系统',
      at: toIso(row.updated_at),
      tone: currentTone,
    },
  ];

  return events.sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime());
}

function historyTitle(changeType: string): string {
  if (changeType === 'renewed') return '续期确认';
  if (changeType === 'paused' || changeType === 'suspended') return '订阅暂停';
  if (changeType === 'resumed') return '订阅恢复';
  if (changeType === 'cancelled') return '订阅取消';
  if (changeType === 'upgraded') return '套餐升级';
  if (changeType === 'downgraded') return '套餐降级';
  return '订阅变更';
}

function historyTone(status: string | null): SubscriptionOperationEvent['tone'] {
  if (status === 'cancelled' || status === 'suspended' || status === 'expired') return 'danger';
  if (status === 'trial') return 'warning';
  if (status === 'active') return 'success';
  return 'neutral';
}

function mapSubscriptionOperationRow(row: SubscriptionOperationRow): SubscriptionOperationRecord {
  const status = normalizeSubscriptionStatus(row);
  const usedTokens = Number(row.used_tokens ?? 0);
  const periodTokens = Number(row.period_tokens ?? 0);
  const usageRate = periodTokens > 0 ? Math.min(999, Math.round((usedTokens / periodTokens) * 100)) : usedTokens > 0 ? 100 : 0;
  const solution = inferSolution(row);
  const cycleType = normalizeCycle(row.cycle_type);

  return {
    id: row.id,
    subscriptionCode: row.order_no ?? row.id.slice(0, 8),
    orderNo: row.order_no,
    tenantId: row.tenant_id,
    tenantCode: row.tenant_code,
    tenantName: row.display_name ?? row.tenant_name,
    tenantType: row.tenant_type,
    tenantStatus: row.tenant_status,
    region: [row.province, row.city].filter(Boolean).join(' / ') || '未设置',
    industry: row.industry ?? '未设置',
    solutionCode: solution.code,
    solutionName: solution.name,
    servicePlanCode: row.plan_code,
    servicePlanName: row.plan_name,
    tierName: tierNameForPlan(row.plan_code, row.plan_name),
    status,
    rawStatus: row.status,
    cycleType,
    autoRenew: row.auto_renew,
    currency: row.currency ?? 'CNY',
    payAmount: Number(row.pay_amount ?? 0),
    monthlyRevenue: monthlyRevenueFor(row),
    quota: {
      maxUsers: Number(row.max_users ?? 0),
      periodTokens,
      usedTokens,
      usageRate,
      quotaCycle: normalizeCycle(row.quota_cycle),
      allowedModelCount: row.allowed_models?.length ?? 0,
      allowCustomModel: row.allow_custom_model ?? false,
      risk: quotaRiskFor(usageRate, status),
    },
    operatorName: row.operator_display_name ?? row.operator_username ?? '系统',
    operationHint: operationHintFor(status),
    startAt: toIso(row.start_at),
    endAt: nullableIso(row.end_at),
    trialEndAt: nullableIso(row.trial_end_at),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

interface SubscriptionOperationRow {
  id: string;
  tenant_id: string;
  tenant_code: string;
  tenant_name: string;
  display_name: string | null;
  tenant_type: 'company' | 'individual';
  tenant_status: 'trial' | 'active' | 'suspended' | 'cancelled';
  province: string | null;
  city: string | null;
  industry: string | null;
  plan_code: string;
  plan_name: string;
  cycle_type: string;
  start_at: Date | string;
  end_at: Date | string | null;
  trial_end_at: Date | string | null;
  status: string;
  auto_renew: boolean;
  order_no: string | null;
  pay_amount: string | number | null;
  currency: string | null;
  max_users: number | null;
  period_tokens: string | number | null;
  quota_cycle: string | null;
  allowed_models: string[] | null;
  allow_custom_model: boolean | null;
  used_tokens: string | number | null;
  operator_username: string | null;
  operator_display_name: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface SubscriptionHistoryRow {
  id: string;
  change_type: string;
  from_status: string | null;
  to_status: string | null;
  operator_type: string;
  operator_remark: string | null;
  operator_username: string | null;
  operator_display_name: string | null;
  created_at: Date | string;
}

interface SubscriptionActionBody {
  action?: unknown;
  reason?: unknown;
}

interface SubscriptionActionRow {
  id: string;
  tenant_id: string;
  plan_id: string;
  cycle_type: string;
  end_at: Date | string | null;
  status: string;
  auto_renew: boolean;
}

const SUBSCRIPTION_OPERATION_SQL = `
  with usage_stats as (
    select
      tenant_id,
      coalesce(sum(total_quota) filter (where stat_type = 'summary'), 0)::bigint as used_tokens
    from commerce.tenant_usage_summary
    where cycle_month = $1
      and feature_id = '${ZERO_UUID}'::uuid
      and agent_id = '${ZERO_UUID}'::uuid
    group by tenant_id
  )
  select
    s.id,
    s.tenant_id,
    t.tenant_code,
    t.tenant_name,
    t.display_name,
    t.tenant_type,
    t.status as tenant_status,
    org.province,
    org.city,
    org.industry,
    p.plan_code,
    p.plan_name,
    s.cycle_type,
    s.start_at,
    s.end_at,
    s.trial_end_at,
    s.status,
    coalesce(s.auto_renew, false) as auto_renew,
    s.order_no,
    s.pay_amount,
    s.currency,
    q.max_users,
    q.period_tokens,
    q.quota_cycle,
    q.allowed_models,
    q.allow_custom_model,
    coalesce(us.used_tokens, 0) as used_tokens,
    operator.username as operator_username,
    operator_profile.display_name as operator_display_name,
    s.created_at,
    s.updated_at
  from commerce.tenant_subscription s
  join tenant.tenant t
    on t.id = s.tenant_id
   and t.deleted_at is null
  join product.plan p
    on p.id = s.plan_id
   and p.deleted_at is null
  left join tenant.tenant_organization org
    on org.tenant_id = t.id
   and org.deleted_at is null
  left join lateral (
    select
      q.max_users,
      q.period_tokens,
      q.quota_cycle,
      q.allowed_models,
      q.allow_custom_model
    from commerce.tenant_subscription_quota q
    where q.tenant_id = s.tenant_id
      and (q.subscription_id = s.id or q.subscription_id is null)
    order by (q.subscription_id = s.id) desc, q.effective_at desc, q.updated_at desc
    limit 1
  ) q on true
  left join usage_stats us
    on us.tenant_id = s.tenant_id
  left join identity.account operator
    on operator.id = s.created_by
  left join identity.account_profile operator_profile
    on operator_profile.account_id = operator.id
  where s.deleted_at is null
  order by
    case s.status
      when 'trial' then 1
      when 'active' then 2
      when 'suspended' then 3
      when 'expired' then 4
      when 'cancelled' then 5
      else 6
    end,
    s.updated_at desc,
    t.tenant_code asc
`;

const SUBSCRIPTION_ACTION_LOOKUP_SQL = `
  select
    id,
    tenant_id,
    plan_id,
    cycle_type,
    end_at,
    status,
    coalesce(auto_renew, false) as auto_renew
  from commerce.tenant_subscription
  where id = $1
    and deleted_at is null
  for update
`;

const SUBSCRIPTION_ACTION_UPDATE_SQL = `
  update commerce.tenant_subscription
  set
    status = $2,
    end_at = $3,
    auto_renew = $4,
    updated_by = $5,
    updated_at = now()
  where id = $1
`;

const SUBSCRIPTION_ACTION_HISTORY_INSERT_SQL = `
  insert into commerce.tenant_subscription_history (
    tenant_id,
    subscription_id,
    change_type,
    from_plan_id,
    to_plan_id,
    from_status,
    to_status,
    operator_type,
    operator_id,
    operator_remark,
    client_ip
  ) values (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    'platform_admin',
    $8,
    $9,
    $10
  )
`;

const SUBSCRIPTION_HISTORY_SQL = `
  select
    h.id,
    h.change_type,
    h.from_status,
    h.to_status,
    h.operator_type,
    h.operator_remark,
    operator.username as operator_username,
    operator_profile.display_name as operator_display_name,
    h.created_at
  from commerce.tenant_subscription_history h
  left join identity.account operator
    on operator.id = h.operator_id
  left join identity.account_profile operator_profile
    on operator_profile.account_id = operator.id
  where h.subscription_id = $1
  order by h.created_at desc
`;
