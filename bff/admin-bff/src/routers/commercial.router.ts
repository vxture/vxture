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
  BillingBillStatus,
  CommerceOverviewPlanRevenue,
  CommerceOverviewSnapshot,
  PromotionOperationRecord,
  PromotionOperationStatus,
  PromotionOperationType,
  PromotionRedemptionRecord,
  PromotionRedemptionStatus,
  RequestContext,
  UsageMeteringRecord,
  UsageMeteringRisk,
} from '../types/console.types';

@Controller('api/commercial')
export class CommercialRouter implements OnModuleDestroy {
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

  @Get('usage-metering')
  async listUsageMetering(@Req() req: Request & RequestContext): Promise<UsageMeteringRecord[]> {
    assertCanManageCommercial(req);

    if (!this.pool) {
      throw new BadGatewayException('Commercial database is not configured');
    }

    const rows = await this.pool.query<UsageMeteringRow>(USAGE_METERING_SQL);
    return rows.rows.map(mapUsageMeteringRow);
  }

  @Get('promotions')
  async listPromotions(@Req() req: Request & RequestContext): Promise<PromotionOperationRecord[]> {
    assertCanManageCommercial(req);

    if (!this.pool) {
      throw new BadGatewayException('Commercial database is not configured');
    }

    const rows = await this.pool.query<PromotionRow>(PROMOTION_SQL);
    return rows.rows.map(mapPromotionRow);
  }

  @Get('promotion-redemptions')
  async listPromotionRedemptions(@Req() req: Request & RequestContext): Promise<PromotionRedemptionRecord[]> {
    assertCanManageCommercial(req);

    if (!this.pool) {
      throw new BadGatewayException('Commercial database is not configured');
    }

    const rows = await this.pool.query<PromotionRedemptionRow>(PROMOTION_REDEMPTION_SQL);
    return rows.rows.map(mapPromotionRedemptionRow);
  }

  @Get('overview')
  async getCommerceOverview(@Req() req: Request & RequestContext): Promise<CommerceOverviewSnapshot> {
    assertCanManageCommercial(req);

    if (!this.pool) {
      throw new BadGatewayException('Commercial database is not configured');
    }

    const [metricsResult, riskResult, planRevenueResult] = await Promise.all([
      this.pool.query<OverviewMetricRow>(OVERVIEW_METRICS_SQL),
      this.pool.query<OverviewRiskRow>(OVERVIEW_RISK_SQL),
      this.pool.query<OverviewPlanRevenueRow>(OVERVIEW_PLAN_REVENUE_SQL),
    ]);
    const metrics = metricsResult.rows[0] ?? emptyMetricRow();
    const overdueBills = Number(metrics.overdue_bills ?? 0);
    const pendingInvoices = Number(metrics.pending_invoices ?? 0);
    const warningUsage = Number(metrics.warning_usage ?? 0);
    const discountAmount = Number(metrics.discount_amount ?? 0);

    return {
      generatedAt: new Date().toISOString(),
      metrics: [
        {
          key: 'subscriptions',
          label: '订阅实例',
          value: Number(metrics.subscription_count ?? 0),
          tone: 'blue',
          hint: `有效 ${Number(metrics.active_subscription_count ?? 0)}，试用 ${Number(metrics.trial_subscription_count ?? 0)}`,
        },
        {
          key: 'receivable',
          label: '应收金额',
          value: Number(metrics.bill_count ?? 0),
          amount: Number(metrics.receivable_amount ?? 0),
          currency: 'CNY',
          tone: 'green',
          hint: `已收 ${Number(metrics.paid_amount ?? 0).toFixed(0)}，减免 ${discountAmount.toFixed(0)}`,
        },
        {
          key: 'payments',
          label: '收款记录',
          value: Number(metrics.payment_count ?? 0),
          amount: Number(metrics.payment_amount ?? 0),
          currency: 'CNY',
          tone: Number(metrics.payment_attention_count ?? 0) ? 'amber' : 'green',
          hint: `线下 ${Number(metrics.offline_payment_amount ?? 0).toFixed(0)}，待核 ${Number(metrics.pending_verify_payment_count ?? 0)}`,
        },
        {
          key: 'invoices',
          label: '发票登记',
          value: Number(metrics.invoice_count ?? 0),
          amount: Number(metrics.invoice_amount ?? 0),
          currency: 'CNY',
          tone: pendingInvoices ? 'amber' : 'green',
          hint: `待交付 ${pendingInvoices}，异常 ${Number(metrics.exception_invoice_count ?? 0)}`,
        },
      ],
      risks: [
        {
          id: 'overdue-bills',
          title: `逾期账单 ${overdueBills}`,
          detail: overdueBills ? '存在逾期未结清账单，建议进入账单管理跟进。' : '当前无逾期账单。',
          tone: overdueBills ? 'rose' : 'green',
          href: '/billing',
        },
        {
          id: 'usage-risk',
          title: `用量预警 ${warningUsage}`,
          detail: warningUsage ? '存在接近或超过配额的租户用量记录。' : '当前用量消耗处于正常区间。',
          tone: warningUsage ? 'amber' : 'green',
          href: '/usage-metering',
        },
        {
          id: 'invoice-pending',
          title: `发票待交付 ${pendingInvoices}`,
          detail: pendingInvoices ? '存在已开票未完成交付的线下发票。' : '线下发票交付状态正常。',
          tone: pendingInvoices ? 'amber' : 'green',
          href: '/invoices',
        },
        ...riskResult.rows.map(mapOverviewRiskRow),
      ],
      planRevenue: planRevenueResult.rows.map(mapOverviewPlanRevenueRow),
    };
  }
}

function assertCanManageCommercial(req: Request & RequestContext): void {
  if (!req.user) {
    throw new UnauthorizedException('No active session');
  }

  const capabilities = req.capabilities ?? [];
  if (capabilities.length && !capabilities.some((item) => item === 'platform.pricing.manage' || item === 'platform.tenant.manage')) {
    throw new ForbiddenException('Missing platform.pricing.manage capability');
  }
}

function toIso(value: Date | string | null): string {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function nullableIso(value: Date | string | null): string | null {
  return value ? toIso(value) : null;
}

function tierNameForPlan(planCode: string | null, planName: string | null): string | null {
  if (!planCode || !planName) return null;
  if (planCode === 'starter') return 'Free';
  if (planCode === 'growth') return 'Pro';
  if (planCode === 'enterprise') return 'Enterprise';
  return planName;
}

function normalizeBillStatus(value: string | null): BillingBillStatus {
  if (value === 'paying' || value === 'paid' || value === 'partial' || value === 'cancelled' || value === 'overdue') return value;
  return 'unpaid';
}

function usageRiskFor(usageRate: number, quotaValue: number): UsageMeteringRisk {
  if (!Number.isFinite(usageRate) || quotaValue <= 0) return 'anomaly';
  if (usageRate > 1) return 'danger';
  if (usageRate >= 0.85) return 'warning';
  return 'normal';
}

function productTypeFor(row: UsageMeteringRow): string {
  if (row.agent_type === 'business') return '智能体';
  if (row.feature_type === 'model') return '大模型';
  if (row.feature_type === 'platform') return '平台';
  if (row.feature_code?.includes('api') || row.feature_code?.includes('integration')) return '三方接入';
  return row.agent_id === '00000000-0000-0000-0000-000000000000' ? '平台' : '产品能力';
}

function metricNameFor(row: UsageMeteringRow): { code: string; name: string; unit: string } {
  if (row.feature_code && row.feature_name) {
    return {
      code: row.feature_code,
      name: row.feature_name,
      unit: row.feature_code.includes('storage') ? 'GB' : row.feature_code.includes('request') ? '次' : 'token',
    };
  }

  if (row.stat_type === 'summary') return { code: 'tenant.tokens', name: '租户总 Token', unit: 'token' };
  if (row.agent_name) return { code: `${row.agent_code}.tokens`, name: `${row.agent_name} Token`, unit: 'token' };
  return { code: 'usage.tokens', name: '用量消耗', unit: 'token' };
}

function mapUsageMeteringRow(row: UsageMeteringRow): UsageMeteringRecord {
  const usedValue = Number(row.total_quota ?? 0);
  const quotaValue = Number(row.effective_quota ?? 0);
  const usageRate = quotaValue > 0 ? usedValue / quotaValue : 0;
  const metric = metricNameFor(row);

  return {
    id: row.id,
    tenantId: row.tenant_id,
    tenantCode: row.tenant_code,
    tenantName: row.display_name ?? row.tenant_name,
    tenantType: row.tenant_type === 'individual' ? 'individual' : 'company',
    region: [row.province, row.city].filter(Boolean).join(' / ') || '未设置',
    industry: row.industry ?? '未设置',
    subscriptionId: row.subscription_id,
    orderNo: row.order_no,
    servicePlanName: row.plan_name,
    tierName: tierNameForPlan(row.plan_code, row.plan_name),
    productCode: row.agent_code ?? row.feature_code ?? (row.stat_type === 'summary' ? 'tenant-summary' : 'unknown'),
    productName: row.agent_name ?? row.feature_name ?? (row.stat_type === 'summary' ? '租户总用量' : '未命名能力'),
    productType: productTypeFor(row),
    metricCode: metric.code,
    metricName: metric.name,
    metricUnit: metric.unit,
    cycleMonth: row.cycle_month,
    usedValue,
    quotaValue,
    usageRate,
    requestCount: Number(row.request_count ?? 0),
    inputTokens: Number(row.input_quota ?? 0),
    outputTokens: Number(row.output_quota ?? 0),
    risk: usageRiskFor(usageRate, quotaValue),
    lastSyncedAt: toIso(row.last_synced_at),
    updatedAt: toIso(row.updated_at),
  };
}

function promotionStatusFor(row: PromotionRow): PromotionOperationStatus {
  if (!row.plan_status || !row.price_status) return 'paused';
  const endsAt = row.ends_at ? new Date(row.ends_at).getTime() : null;
  if (endsAt !== null && endsAt < Date.now()) return 'expired';
  return 'active';
}

function promotionTypeFor(row: PromotionRow): PromotionOperationType {
  if (row.discount_amount > 0) return 'discount';
  if (row.plan_code === 'starter') return 'campaign';
  return 'coupon';
}

function mapPromotionRow(row: PromotionRow): PromotionOperationRecord {
  const discountAmount = Number(row.discount_amount ?? 0);
  const salePrice = Number(row.sale_price ?? 0);
  const originalPrice = Number(row.original_price ?? salePrice);
  const discountLabel = discountAmount > 0
    ? `立减 ${discountAmount.toFixed(0)}`
    : row.plan_code === 'starter'
      ? '免费试用'
      : '合同优惠';
  const tierName = tierNameForPlan(row.plan_code, row.plan_name);

  return {
    id: row.id,
    promotionCode: `PROMO-${(row.plan_code ?? row.id.slice(0, 8)).toUpperCase()}`,
    promotionName: `${tierName ?? row.plan_name} 套餐优惠`,
    promotionType: promotionTypeFor(row),
    status: promotionStatusFor(row),
    scopeLabel: row.plan_name,
    planCode: row.plan_code,
    planName: row.plan_name,
    tierName,
    discountLabel,
    currency: row.currency ?? 'CNY',
    originalPrice,
    salePrice,
    discountAmount,
    redemptionCount: Number(row.redemption_count ?? 0),
    usedAmount: Number(row.used_amount ?? 0),
    tenantCount: Number(row.tenant_count ?? 0),
    startsAt: toIso(row.starts_at),
    endsAt: nullableIso(row.ends_at),
    ownerName: row.owner_display_name ?? row.owner_username ?? '市场运营',
    description: row.description ?? '基于当前套餐价格和账单减免记录生成的推广优惠 MVP 台账。',
    updatedAt: toIso(row.updated_at),
  };
}

function redemptionStatusFor(row: PromotionRedemptionRow): PromotionRedemptionStatus {
  if (row.bill_status === 'cancelled') return 'reversed';
  if (Number(row.paid_amount ?? 0) >= Number(row.payable_amount ?? 0)) return 'redeemed';
  return 'applied';
}

function mapPromotionRedemptionRow(row: PromotionRedemptionRow): PromotionRedemptionRecord {
  const tierName = tierNameForPlan(row.plan_code, row.plan_name);

  return {
    id: row.id,
    redemptionNo: `RED-${row.bill_no.replace(/[^a-z0-9]/gi, '').slice(-12)}`,
    promotionCode: `PROMO-${(row.plan_code ?? 'CUSTOM').toUpperCase()}`,
    promotionName: `${tierName ?? row.plan_name ?? '自定义'} 账单优惠`,
    status: redemptionStatusFor(row),
    tenantId: row.tenant_id,
    tenantCode: row.tenant_code,
    tenantName: row.display_name ?? row.tenant_name,
    tenantType: row.tenant_type === 'individual' ? 'individual' : 'company',
    orderNo: row.order_no,
    billId: row.id,
    billNo: row.bill_no,
    billStatus: normalizeBillStatus(row.bill_status),
    servicePlanName: row.plan_name,
    tierName,
    currency: row.currency ?? 'CNY',
    orderAmount: Number(row.total_amount ?? 0),
    discountAmount: Number(row.discount_amount ?? 0),
    payableAmount: Number(row.payable_amount ?? 0),
    operatorName: row.operator_display_name ?? row.operator_username ?? '系统',
    redeemedAt: toIso(row.updated_at),
    remark: row.operate_remark,
  };
}

function mapOverviewRiskRow(row: OverviewRiskRow) {
  return {
    id: row.id,
    title: row.title,
    detail: row.detail,
    tone: row.tone === 'rose' || row.tone === 'amber' ? row.tone : 'green',
    href: row.href,
  } as const;
}

function mapOverviewPlanRevenueRow(row: OverviewPlanRevenueRow): CommerceOverviewPlanRevenue {
  return {
    planName: row.plan_name,
    tierName: tierNameForPlan(row.plan_code, row.plan_name) ?? row.plan_name,
    subscriptionCount: Number(row.subscription_count ?? 0),
    revenueAmount: Number(row.revenue_amount ?? 0),
    paidAmount: Number(row.paid_amount ?? 0),
    discountAmount: Number(row.discount_amount ?? 0),
    currency: row.currency ?? 'CNY',
  };
}

function emptyMetricRow(): OverviewMetricRow {
  return {
    subscription_count: 0,
    active_subscription_count: 0,
    trial_subscription_count: 0,
    bill_count: 0,
    overdue_bills: 0,
    receivable_amount: 0,
    paid_amount: 0,
    discount_amount: 0,
    payment_count: 0,
    payment_amount: 0,
    offline_payment_amount: 0,
    pending_verify_payment_count: 0,
    payment_attention_count: 0,
    invoice_count: 0,
    invoice_amount: 0,
    pending_invoices: 0,
    exception_invoice_count: 0,
    warning_usage: 0,
  };
}

interface UsageMeteringRow {
  id: string;
  tenant_id: string;
  tenant_code: string;
  tenant_name: string;
  display_name: string | null;
  tenant_type: string;
  province: string | null;
  city: string | null;
  industry: string | null;
  subscription_id: string | null;
  order_no: string | null;
  plan_code: string | null;
  plan_name: string | null;
  feature_code: string | null;
  feature_name: string | null;
  feature_type: string | null;
  agent_id: string;
  agent_code: string | null;
  agent_name: string | null;
  agent_type: string | null;
  cycle_month: string;
  total_quota: string | number | null;
  input_quota: string | number | null;
  output_quota: string | number | null;
  request_count: string | number | null;
  effective_quota: string | number | null;
  stat_type: string;
  last_synced_at: Date | string;
  updated_at: Date | string;
}

interface PromotionRow {
  id: string;
  plan_code: string | null;
  plan_name: string;
  description: string | null;
  plan_status: boolean | null;
  price_status: boolean | null;
  currency: string | null;
  sale_price: string | number | null;
  original_price: string | number | null;
  discount_amount: number;
  redemption_count: string | number | null;
  used_amount: string | number | null;
  tenant_count: string | number | null;
  starts_at: Date | string;
  ends_at: Date | string | null;
  owner_username: string | null;
  owner_display_name: string | null;
  updated_at: Date | string;
}

interface PromotionRedemptionRow {
  id: string;
  bill_no: string;
  tenant_id: string;
  tenant_code: string;
  tenant_name: string;
  display_name: string | null;
  tenant_type: string;
  order_no: string | null;
  plan_code: string | null;
  plan_name: string | null;
  total_amount: string | number | null;
  discount_amount: string | number | null;
  payable_amount: string | number | null;
  paid_amount: string | number | null;
  currency: string | null;
  bill_status: string | null;
  operate_remark: string | null;
  operator_username: string | null;
  operator_display_name: string | null;
  updated_at: Date | string;
}

interface OverviewMetricRow {
  subscription_count: string | number;
  active_subscription_count: string | number;
  trial_subscription_count: string | number;
  bill_count: string | number;
  overdue_bills: string | number;
  receivable_amount: string | number;
  paid_amount: string | number;
  discount_amount: string | number;
  payment_count: string | number;
  payment_amount: string | number;
  offline_payment_amount: string | number;
  pending_verify_payment_count: string | number;
  payment_attention_count: string | number;
  invoice_count: string | number;
  invoice_amount: string | number;
  pending_invoices: string | number;
  exception_invoice_count: string | number;
  warning_usage: string | number;
}

interface OverviewRiskRow {
  id: string;
  title: string;
  detail: string;
  tone: string;
  href: string;
}

interface OverviewPlanRevenueRow {
  plan_code: string | null;
  plan_name: string;
  subscription_count: string | number;
  revenue_amount: string | number;
  paid_amount: string | number;
  discount_amount: string | number;
  currency: string | null;
}

const USAGE_METERING_SQL = `
  select
    usage.id,
    usage.tenant_id,
    t.tenant_code,
    t.tenant_name,
    t.display_name,
    t.tenant_type,
    org.province,
    org.city,
    org.industry,
    sub.id as subscription_id,
    sub.order_no,
    plan.plan_code,
    plan.plan_name,
    feature.feature_code,
    feature.feature_name,
    feature.feature_type,
    usage.agent_id,
    agent.agent_code,
    agent.agent_name,
    agent.agent_type,
    usage.cycle_month,
    usage.total_quota,
    usage.input_quota,
    usage.output_quota,
    usage.request_count,
    coalesce(plan_feature.quota_value, quota.period_tokens, nullif(usage.total_quota, 0) * 2, 0) as effective_quota,
    usage.stat_type,
    usage.last_synced_at,
    usage.updated_at
  from commerce.tenant_usage_summary usage
  join tenancy.tenant t
    on t.id = usage.tenant_id
   and t.deleted_at is null
  left join tenancy.tenant_organization org
    on org.tenant_id = t.id
   and org.deleted_at is null
  left join product.feature feature
    on feature.id = usage.feature_id
   and feature.deleted_at is null
  left join product.agent agent
    on agent.id = usage.agent_id
   and agent.deleted_at is null
  left join lateral (
    select s.*
    from commerce.tenant_subscription s
    where s.tenant_id = usage.tenant_id
      and s.deleted_at is null
    order by
      case when s.status in ('active', 'trial') then 0 else 1 end,
      s.updated_at desc
    limit 1
  ) sub on true
  left join product.plan plan
    on plan.id = sub.plan_id
   and plan.deleted_at is null
  left join product.plan_feature plan_feature
    on plan_feature.plan_id = plan.id
   and plan_feature.feature_id = usage.feature_id
   and plan_feature.deleted_at is null
  left join lateral (
    select q.period_tokens
    from commerce.tenant_subscription_quota q
    where q.tenant_id = usage.tenant_id
      and (q.subscription_id = sub.id or q.subscription_id is null)
    order by q.effective_at desc, q.updated_at desc
    limit 1
  ) quota on true
  order by
    case
      when coalesce(plan_feature.quota_value, quota.period_tokens, 0) > 0
       and usage.total_quota::numeric / coalesce(plan_feature.quota_value, quota.period_tokens)::numeric > 1 then 1
      when coalesce(plan_feature.quota_value, quota.period_tokens, 0) > 0
       and usage.total_quota::numeric / coalesce(plan_feature.quota_value, quota.period_tokens)::numeric >= 0.85 then 2
      else 3
    end,
    usage.cycle_month desc,
    usage.updated_at desc
`;

const PROMOTION_SQL = `
  with redemption as (
    select
      plan.id as plan_id,
      count(*) as redemption_count,
      coalesce(sum(bill.discount_amount), 0) as used_amount,
      count(distinct bill.tenant_id) as tenant_count
    from commerce.tenant_invoice bill
    left join commerce.tenant_subscription sub
      on sub.id = bill.subscription_id
     and sub.deleted_at is null
    left join product.plan plan
      on plan.id = sub.plan_id
     and plan.deleted_at is null
    where bill.deleted_at is null
      and coalesce(bill.discount_amount, 0) > 0
    group by plan.id
  )
  select
    plan.id,
    plan.plan_code,
    plan.plan_name,
    plan.description,
    plan.status as plan_status,
    price.status as price_status,
    price.currency,
    price.price as sale_price,
    coalesce(price.original_price, price.price) as original_price,
    greatest(coalesce(price.original_price, price.price) - price.price, 0)::numeric as discount_amount,
    coalesce(redemption.redemption_count, 0) as redemption_count,
    coalesce(redemption.used_amount, 0) as used_amount,
    coalesce(redemption.tenant_count, 0) as tenant_count,
    plan.created_at as starts_at,
    null::timestamptz as ends_at,
    owner.username as owner_username,
    owner_profile.display_name as owner_display_name,
    greatest(plan.updated_at, coalesce(price.updated_at, plan.updated_at)) as updated_at
  from product.plan plan
  left join lateral (
    select *
    from product.plan_price pp
    where pp.plan_id = plan.id
      and pp.deleted_at is null
    order by pp.is_default desc nulls last, pp.sort asc nulls last, pp.updated_at desc
    limit 1
  ) price on true
  left join redemption
    on redemption.plan_id = plan.id
  left join account.account owner
    on owner.id = coalesce(plan.updated_by, plan.created_by)
  left join account.account_profile owner_profile
    on owner_profile.account_id = owner.id
  where plan.deleted_at is null
  order by plan.level asc nulls last, updated_at desc
`;

const PROMOTION_REDEMPTION_SQL = `
  select
    bill.id,
    bill.bill_no,
    bill.tenant_id,
    t.tenant_code,
    t.tenant_name,
    t.display_name,
    t.tenant_type,
    sub.order_no,
    plan.plan_code,
    plan.plan_name,
    bill.total_amount,
    bill.discount_amount,
    bill.payable_amount,
    bill.paid_amount,
    bill.currency,
    bill.bill_status,
    bill.operate_remark,
    operator.username as operator_username,
    operator_profile.display_name as operator_display_name,
    bill.updated_at
  from commerce.tenant_invoice bill
  join tenancy.tenant t
    on t.id = bill.tenant_id
   and t.deleted_at is null
  left join commerce.tenant_subscription sub
    on sub.id = bill.subscription_id
   and sub.deleted_at is null
  left join product.plan plan
    on plan.id = sub.plan_id
   and plan.deleted_at is null
  left join account.account operator
    on operator.id = bill.operator_id
  left join account.account_profile operator_profile
    on operator_profile.account_id = operator.id
  where bill.deleted_at is null
    and coalesce(bill.discount_amount, 0) > 0
  order by bill.updated_at desc, bill.bill_no asc
`;

const OVERVIEW_METRICS_SQL = `
  select
    (select count(*) from commerce.tenant_subscription s where s.deleted_at is null) as subscription_count,
    (select count(*) from commerce.tenant_subscription s where s.deleted_at is null and s.status = 'active') as active_subscription_count,
    (select count(*) from commerce.tenant_subscription s where s.deleted_at is null and s.status = 'trial') as trial_subscription_count,
    (select count(*) from commerce.tenant_invoice bill where bill.deleted_at is null) as bill_count,
    (select count(*) from commerce.tenant_invoice bill where bill.deleted_at is null and bill.bill_status = 'overdue') as overdue_bills,
    (select coalesce(sum(bill.payable_amount), 0) from commerce.tenant_invoice bill where bill.deleted_at is null) as receivable_amount,
    (select coalesce(sum(bill.paid_amount), 0) from commerce.tenant_invoice bill where bill.deleted_at is null) as paid_amount,
    (select coalesce(sum(bill.discount_amount), 0) from commerce.tenant_invoice bill where bill.deleted_at is null) as discount_amount,
    (select count(*) from commerce.tenant_payment pay) as payment_count,
    (select coalesce(sum(pay.paid_amount) filter (where pay.pay_status = 'paid'), 0) from commerce.tenant_payment pay) as payment_amount,
    (select coalesce(sum(pay.paid_amount) filter (where pay.pay_status = 'paid' and pay.pay_source = 'offline'), 0) from commerce.tenant_payment pay) as offline_payment_amount,
    (select count(*) from commerce.tenant_payment pay where pay.pay_status = 'pending_verify') as pending_verify_payment_count,
    (
      select count(*)
      from commerce.tenant_payment pay
      left join commerce.tenant_invoice bill on bill.id = pay.bill_id and bill.deleted_at is null
      where pay.pay_status in ('pending_verify', 'failed', 'refunding')
         or bill.bill_status in ('partial', 'cancelled')
    ) as payment_attention_count,
    (select count(*) from commerce.tenant_invoice_receipt receipt where receipt.deleted_at is null) as invoice_count,
    (
      select coalesce(sum(receipt.invoice_amount) filter (where receipt.invoice_status not in ('red', 'rejected')), 0)
      from commerce.tenant_invoice_receipt receipt
      where receipt.deleted_at is null
    ) as invoice_amount,
    (
      select count(*)
      from commerce.tenant_invoice_receipt receipt
      where receipt.deleted_at is null
        and receipt.invoice_status in ('issued', 'sending')
    ) as pending_invoices,
    (
      select count(*)
      from commerce.tenant_invoice_receipt receipt
      where receipt.deleted_at is null
        and receipt.invoice_status in ('red', 'rejected')
    ) as exception_invoice_count,
    (
      select count(*)
      from commerce.tenant_usage_summary usage
      left join lateral (
        select q.period_tokens
        from commerce.tenant_subscription_quota q
        where q.tenant_id = usage.tenant_id
        order by q.effective_at desc, q.updated_at desc
        limit 1
      ) quota on true
      where coalesce(quota.period_tokens, 0) > 0
        and usage.total_quota::numeric / quota.period_tokens::numeric >= 0.85
    ) as warning_usage
`;

const OVERVIEW_RISK_SQL = `
  select
    concat('tenant-', t.id) as id,
    concat(t.display_name, ' 商业跟进') as title,
    concat('租户 ', t.tenant_code, ' 存在账单、收款或用量需关注事项。') as detail,
    case when bool_or(bill.bill_status = 'overdue') then 'rose' else 'amber' end as tone,
    concat('/tenants/', t.id) as href
  from tenancy.tenant t
  left join commerce.tenant_invoice bill
    on bill.tenant_id = t.id
   and bill.deleted_at is null
  left join commerce.tenant_payment pay
    on pay.tenant_id = t.id
  where t.deleted_at is null
    and (
      bill.bill_status in ('overdue', 'partial')
      or pay.pay_status in ('pending_verify', 'failed', 'refunding')
    )
  group by t.id, t.display_name, t.tenant_code
  order by max(greatest(coalesce(bill.updated_at, t.updated_at), coalesce(pay.updated_at, t.updated_at))) desc
  limit 5
`;

const OVERVIEW_PLAN_REVENUE_SQL = `
  select
    plan.plan_code,
    plan.plan_name,
    count(distinct sub.id) as subscription_count,
    coalesce(sum(bill.payable_amount), 0) as revenue_amount,
    coalesce(sum(bill.paid_amount), 0) as paid_amount,
    coalesce(sum(bill.discount_amount), 0) as discount_amount,
    coalesce(max(bill.currency), max(sub.currency), 'CNY') as currency
  from product.plan plan
  left join commerce.tenant_subscription sub
    on sub.plan_id = plan.id
   and sub.deleted_at is null
  left join commerce.tenant_invoice bill
    on bill.subscription_id = sub.id
   and bill.deleted_at is null
  where plan.deleted_at is null
  group by plan.plan_code, plan.plan_name, plan.level
  order by revenue_amount desc, plan.level asc nulls last
  limit 8
`;
