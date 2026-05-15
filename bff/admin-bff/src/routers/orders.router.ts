import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  OnModuleDestroy,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { VxConfigService } from '@vxture/core-config';
import type { Request } from 'express';
import { Pool } from 'pg';
import type { PoolClient } from 'pg';
import type {
  OrderInvoiceItemRecord,
  OrderOfflinePaymentType,
  OrderOperationDetailRecord,
  OrderOperationEvent,
  OrderOperationRecord,
  OrderOperationStatus,
  OrderPaymentRecord,
  OrderPaymentStatus,
  OrderPaySource,
  RequestContext,
  SubscriptionOperationCycle,
  SubscriptionOperationStatus,
} from '../types/console.types';

@Controller('api/orders')
export class OrdersRouter implements OnModuleDestroy {
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
  async listOrders(@Req() req: Request & RequestContext): Promise<OrderOperationRecord[]> {
    assertCanManageOrders(req);

    if (!this.pool) {
      throw new BadGatewayException('Order database is not configured');
    }

    const rows = await this.pool.query<OrderOperationRow>(ORDER_OPERATION_SQL);
    return rows.rows.map(mapOrderOperationRow);
  }

  @Get(':orderId')
  async getOrder(
    @Req() req: Request & RequestContext,
    @Param('orderId') orderId: string,
  ): Promise<OrderOperationDetailRecord> {
    assertCanManageOrders(req);

    if (!this.pool) {
      throw new BadGatewayException('Order database is not configured');
    }

    return loadOrderDetail(this.pool, orderId);
  }

  @Post(':orderId/offline-payment-confirm')
  async confirmOfflinePayment(
    @Req() req: Request & RequestContext,
    @Param('orderId') orderId: string,
    @Body() body: ConfirmOfflinePaymentBody,
  ): Promise<OrderOperationDetailRecord> {
    assertCanManageOrders(req);

    if (!this.pool) {
      throw new BadGatewayException('Order database is not configured');
    }

    const payload = normalizeConfirmOfflinePaymentBody(body);
    const client = await this.pool.connect();

    try {
      await client.query('begin');
      const currentResult = await client.query<OrderActionRow>(ORDER_ACTION_LOOKUP_SQL, [orderId]);
      const current = currentResult.rows[0];

      if (!current) {
        throw new NotFoundException(`Order ${orderId} not found`);
      }

      validateOfflinePaymentConfirm(current, payload);
      const operatorId = normalizeUuid(req.user?.id);
      const billId = await ensureInvoiceForOfflinePayment(client, current, payload, operatorId);

      await client.query(ORDER_OFFLINE_PAYMENT_INSERT_SQL, [
        current.tenant_id,
        billId,
        current.order_no,
        payload.offlinePayType,
        payload.payerName,
        payload.paidAt,
        payload.evidenceUrl,
        current.payable_amount,
        payload.paidAmount,
        current.currency ?? 'CNY',
        payload.transactionNo,
        operatorId,
        payload.reason,
      ]);
      await client.query(ORDER_INVOICE_PAYMENT_UPDATE_SQL, [
        billId,
        payload.paidAmount,
        payload.paidAt,
        'offline',
        payload.transactionNo,
        operatorId,
        payload.reason,
      ]);
      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }

    return loadOrderDetail(this.pool, orderId);
  }
}

async function loadOrderDetail(pool: Pool, orderId: string): Promise<OrderOperationDetailRecord> {
  const [orderRows, invoiceItemRows, paymentRows] = await Promise.all([
    pool.query<OrderOperationRow>(ORDER_OPERATION_SQL),
    pool.query<OrderInvoiceItemRow>(ORDER_INVOICE_ITEM_SQL, [orderId]),
    pool.query<OrderPaymentRow>(ORDER_PAYMENT_SQL, [orderId]),
  ]);
  const row = orderRows.rows.find((item) => item.id === orderId);

  if (!row) {
    throw new NotFoundException(`Order ${orderId} not found`);
  }

  const record = mapOrderOperationRow(row);
  const invoiceItems = mapInvoiceItems(row, invoiceItemRows.rows);
  const paymentRecords = paymentRows.rows.map(mapPaymentRow);

  return {
    ...record,
    invoiceItems,
    paymentRecords,
    operationTimeline: buildOrderTimeline(row, record, paymentRecords),
  };
}

function assertCanManageOrders(req: Request & RequestContext): void {
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

function normalizeCycle(value: string | null): SubscriptionOperationCycle {
  if (value === 'yearly' || value === 'once') return value;
  return 'monthly';
}

function normalizeSubscriptionStatus(row: OrderOperationRow): SubscriptionOperationStatus {
  if (row.subscription_status === 'trial') return 'trial';
  if (row.subscription_status === 'suspended') return 'suspended';
  if (row.subscription_status === 'cancelled') return 'cancelled';
  if (row.subscription_status === 'expired') return 'overdue';

  const endAt = row.end_at ? new Date(row.end_at).getTime() : null;
  if (endAt !== null) {
    const now = Date.now();
    if (endAt < now) return 'overdue';
    if (endAt - now <= 30 * 24 * 60 * 60 * 1000) return 'expiring';
  }

  return 'active';
}

function normalizePaymentStatus(row: OrderOperationRow): OrderPaymentStatus {
  if (Number(row.amount ?? 0) <= 0) return 'not_required';
  if (row.bill_status === 'partial' || (Number(row.paid_amount ?? 0) > 0 && Number(row.paid_amount ?? 0) < Number(row.amount ?? 0))) return 'partial';
  if (row.payment_status === 'pending_verify') return 'pending_verify';
  if (row.payment_status === 'paid' || row.bill_status === 'paid') return 'paid';
  if (row.payment_status === 'failed') return 'failed';
  if (row.payment_status === 'closed' || row.bill_status === 'cancelled') return 'closed';
  if (row.payment_status === 'refunding') return 'refunding';
  if (row.payment_status === 'pending' || row.bill_status === 'paying') return 'pending';
  return 'unpaid';
}

function normalizeOrderStatus(row: OrderOperationRow, paymentStatus: OrderPaymentStatus): OrderOperationStatus {
  if (row.subscription_status === 'cancelled' || paymentStatus === 'closed') return 'closed';
  if (paymentStatus === 'failed' || paymentStatus === 'refunding') return 'abnormal';
  if (paymentStatus === 'pending_verify') return 'pending_verify';
  if (paymentStatus === 'paid' || paymentStatus === 'not_required') return 'confirmed';
  if (row.bill_status === 'overdue' || normalizeSubscriptionStatus(row) === 'overdue') return 'overdue';
  return 'pending';
}

function normalizePaySource(row: OrderOperationRow, paymentStatus: OrderPaymentStatus): OrderPaySource {
  if (paymentStatus === 'not_required' || !row.pay_source) return 'none';
  return row.pay_source === 'offline' ? 'offline' : 'online';
}

function normalizeOfflinePaymentType(value: unknown): OrderOfflinePaymentType {
  if (value === 'bank_transfer' || value === 'cash' || value === 'other') return value;
  throw new BadRequestException('请选择线下收款方式');
}

function normalizeText(value: unknown, fieldName: string, maxLength: number, minLength = 1): string {
  const text = typeof value === 'string' ? value.trim() : '';
  if (text.length < minLength) {
    throw new BadRequestException(`${fieldName}不能为空`);
  }
  if (text.length > maxLength) {
    throw new BadRequestException(`${fieldName}不能超过 ${maxLength} 个字符`);
  }
  return text;
}

function normalizeOptionalText(value: unknown, maxLength: number): string | null {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return null;
  if (text.length > maxLength) {
    throw new BadRequestException(`字段长度不能超过 ${maxLength} 个字符`);
  }
  return text;
}

function normalizeConfirmOfflinePaymentBody(body: ConfirmOfflinePaymentBody): ConfirmOfflinePaymentPayload {
  const paidAmount = Number(body?.paidAmount);
  if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
    throw new BadRequestException('确认金额必须大于 0');
  }

  const paidAt = typeof body?.paidAt === 'string' ? new Date(body.paidAt) : new Date();
  if (!Number.isFinite(paidAt.getTime())) {
    throw new BadRequestException('请选择有效的收款时间');
  }
  if (paidAt.getTime() > Date.now() + 5 * 60 * 1000) {
    throw new BadRequestException('收款时间不能晚于当前时间');
  }

  return {
    paidAmount: Math.round(paidAmount * 100) / 100,
    offlinePayType: normalizeOfflinePaymentType(body?.offlinePayType),
    payerName: normalizeText(body?.payerName, '付款方', 128),
    paidAt,
    transactionNo: normalizeOptionalText(body?.transactionNo, 128),
    evidenceUrl: normalizeOptionalText(body?.evidenceUrl, 512),
    reason: normalizeText(body?.reason, '确认原因', 512, 4),
  };
}

function validateOfflinePaymentConfirm(current: OrderActionRow, payload: ConfirmOfflinePaymentPayload): void {
  const payableAmount = Number(current.payable_amount ?? 0);
  const paidAmount = Number(current.paid_amount ?? 0);
  const remainingAmount = Math.max(0, payableAmount - paidAmount);

  if (current.subscription_status === 'cancelled') {
    throw new BadRequestException('已取消订阅对应的订单不能确认收款');
  }

  if (payableAmount <= 0) {
    throw new BadRequestException('免费订单或零金额订单不需要确认收款');
  }

  if (current.bill_status === 'cancelled' || current.payment_status === 'closed') {
    throw new BadRequestException('已关闭订单不能确认收款');
  }

  if (current.payment_status === 'refunding') {
    throw new BadRequestException('退款中的订单不能确认收款');
  }

  if (current.bill_status === 'paid' || remainingAmount <= 0) {
    throw new BadRequestException('订单已完成收款确认');
  }

  if (payload.paidAmount > remainingAmount + 0.01) {
    throw new BadRequestException(`确认金额不能超过剩余应收 ${remainingAmount.toFixed(2)}`);
  }
}

function normalizeUuid(value: string | null | undefined): string | null {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? value : null;
}

function toDateOnly(value: Date | string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function addCycle(value: Date | string, cycleType: string): Date {
  const next = new Date(value);
  if (cycleType === 'monthly') {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

function billCycleFor(value: Date): string {
  return value.toISOString().slice(0, 7).replace('-', '');
}

function billNoFor(current: OrderActionRow): string {
  const suffix = (current.order_no ?? current.id).replace(/[^a-z0-9]/gi, '').slice(-12) || current.id.slice(0, 8);
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  return `BILL-${stamp}-${suffix}`;
}

async function ensureInvoiceForOfflinePayment(
  client: PoolClient,
  current: OrderActionRow,
  payload: ConfirmOfflinePaymentPayload,
  operatorId: string | null,
): Promise<string> {
  if (current.bill_id) return current.bill_id;

  const cycleStartDate = toDateOnly(current.start_at);
  const cycleEndDate = toDateOnly(current.end_at ?? addCycle(current.start_at, current.cycle_type));
  const result = await client.query<{ id: string }>(ORDER_INVOICE_CREATE_SQL, [
    current.tenant_id,
    billNoFor(current),
    current.id,
    billCycleFor(payload.paidAt),
    cycleStartDate,
    cycleEndDate,
    current.payable_amount,
    current.currency ?? 'CNY',
    operatorId,
    `平台运营确认线下收款时自动补录账单：${payload.reason}`,
  ]);

  const createdInvoice = result.rows[0];
  if (!createdInvoice) {
    throw new BadRequestException('账单补录失败，请稍后重试');
  }

  return createdInvoice.id;
}

function inferSolution(row: OrderOperationRow): { code: string | null; name: string } {
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

function orderOperationHint(status: OrderOperationStatus): string {
  if (status === 'pending_verify') return '收款复核';
  if (status === 'confirmed') return '已确认';
  if (status === 'overdue') return '逾期催收';
  if (status === 'closed') return '已关闭';
  if (status === 'abnormal') return '异常处理';
  return '等待付款';
}

function mapOrderOperationRow(row: OrderOperationRow): OrderOperationRecord {
  const paymentStatus = normalizePaymentStatus(row);
  const orderStatus = normalizeOrderStatus(row, paymentStatus);
  const solution = inferSolution(row);
  const amount = Number(row.amount ?? 0);
  const paidAmount = Number(row.paid_amount ?? 0);
  const tierName = tierNameForPlan(row.plan_code, row.plan_name);

  return {
    id: row.id,
    orderNo: row.order_no ?? row.bill_no ?? row.id.slice(0, 8),
    tenantId: row.tenant_id,
    tenantCode: row.tenant_code,
    tenantName: row.display_name ?? row.tenant_name,
    tenantType: row.tenant_type,
    region: [row.province, row.city].filter(Boolean).join(' / ') || '未设置',
    industry: row.industry ?? '未设置',
    solutionCode: solution.code,
    solutionName: solution.name,
    servicePlanCode: row.plan_code,
    servicePlanName: row.plan_name,
    tierName,
    subscriptionId: row.id,
    subscriptionStatus: normalizeSubscriptionStatus(row),
    cycleType: normalizeCycle(row.cycle_type),
    orderStatus,
    paymentStatus,
    paySource: normalizePaySource(row, paymentStatus),
    payMethod: row.pay_method ?? row.payment_method,
    billId: row.bill_id,
    billNo: row.bill_no,
    billStatus: row.bill_status,
    paymentId: row.payment_id,
    paymentNo: row.pay_order_no,
    amount,
    paidAmount,
    currency: row.currency ?? 'CNY',
    operatorName: row.operator_display_name ?? row.operator_username ?? '系统',
    operationHint: orderOperationHint(orderStatus),
    createdAt: toIso(row.created_at),
    confirmedAt: nullableIso(row.confirmed_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapInvoiceItems(row: OrderOperationRow, items: OrderInvoiceItemRow[]): OrderInvoiceItemRecord[] {
  if (items.length) {
    return items.map((item) => ({
      id: item.id,
      itemName: item.item_name,
      itemType: item.item_type,
      itemUnit: item.item_unit,
      quantity: Number(item.quantity ?? 0),
      unitPrice: Number(item.unit_price ?? 0),
      totalAmount: Number(item.total_amount ?? 0),
      remark: item.remark,
    }));
  }

  return [
    {
      id: `${row.id}:subscription`,
      itemName: `${row.plan_name} ${normalizeCycle(row.cycle_type) === 'yearly' ? '年付' : normalizeCycle(row.cycle_type) === 'once' ? '一次性' : '月付'}订阅`,
      itemType: 'subscription',
      itemUnit: '项',
      quantity: 1,
      unitPrice: Number(row.amount ?? 0),
      totalAmount: Number(row.amount ?? 0),
      remark: '当前订单尚未生成账单明细，按订阅订单金额兼容展示。',
    },
  ];
}

function mapPaymentRow(row: OrderPaymentRow): OrderPaymentRecord {
  const paymentStatus = normalizePaymentRowStatus(row.pay_status);

  return {
    id: row.id,
    paymentNo: row.pay_order_no,
    paySource: row.pay_source === 'offline' ? 'offline' : 'online',
    payMethod: row.pay_method,
    offlinePayType: normalizePaymentTypeOrNull(row.offline_pay_type),
    offlinePayerName: row.offline_payer_name,
    paidAmount: Number(row.paid_amount ?? 0),
    currency: row.currency ?? 'CNY',
    paymentStatus,
    paidAt: nullableIso(row.paid_at),
    operatorName: row.operator_display_name ?? row.operator_username ?? '系统',
    remark: row.operate_remark ?? row.status_msg,
  };
}

function normalizePaymentRowStatus(value: string): OrderPaymentStatus {
  if (value === 'pending_verify' || value === 'paid' || value === 'failed' || value === 'closed' || value === 'refunding' || value === 'pending') {
    return value;
  }
  return 'pending';
}

function normalizePaymentTypeOrNull(value: string | null): OrderOfflinePaymentType | null {
  if (value === 'bank_transfer' || value === 'cash' || value === 'other') return value;
  return null;
}

function buildOrderTimeline(
  row: OrderOperationRow,
  record: OrderOperationRecord,
  paymentRecords: OrderPaymentRecord[],
): OrderOperationEvent[] {
  const paymentEvents: OrderOperationEvent[] = paymentRecords.map((payment) => ({
    id: payment.id,
    title: payment.paymentStatus === 'paid' ? '收款确认' : '支付记录',
    description: `${payment.paySource === 'offline' ? '线下' : '线上'}收款 ${payment.paidAmount.toFixed(2)} ${payment.currency}${payment.remark ? `，${payment.remark}` : ''}`,
    actor: payment.operatorName,
    at: payment.paidAt ?? toIso(row.updated_at),
    tone: payment.paymentStatus === 'paid' ? 'success' : payment.paymentStatus === 'failed' ? 'danger' : 'warning',
  }));

  const currentTone: OrderOperationEvent['tone'] =
    record.orderStatus === 'confirmed'
      ? 'success'
      : record.orderStatus === 'pending' || record.orderStatus === 'pending_verify'
        ? 'warning'
        : record.orderStatus === 'closed'
          ? 'neutral'
          : 'danger';

  const events: OrderOperationEvent[] = [
    {
      id: `${record.id}:created`,
      title: '订单生成',
      description: `${record.tenantName} 生成 ${record.servicePlanName} 订阅订单，应收 ${record.amount.toFixed(2)} ${record.currency}。`,
      actor: record.operatorName,
      at: toIso(row.created_at),
      tone: 'neutral',
    },
    ...paymentEvents,
    {
      id: `${record.id}:current`,
      title: record.operationHint,
      description: `当前订单状态为 ${orderOperationHint(record.orderStatus)}，支付状态为 ${record.paymentStatus}。`,
      actor: '系统',
      at: toIso(row.updated_at),
      tone: currentTone,
    },
  ];

  return events.sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime());
}

interface ConfirmOfflinePaymentBody {
  paidAmount?: unknown;
  offlinePayType?: unknown;
  payerName?: unknown;
  paidAt?: unknown;
  transactionNo?: unknown;
  evidenceUrl?: unknown;
  reason?: unknown;
}

interface ConfirmOfflinePaymentPayload {
  paidAmount: number;
  offlinePayType: OrderOfflinePaymentType;
  payerName: string;
  paidAt: Date;
  transactionNo: string | null;
  evidenceUrl: string | null;
  reason: string;
}

interface OrderOperationRow {
  id: string;
  order_no: string | null;
  tenant_id: string;
  tenant_code: string;
  tenant_name: string;
  display_name: string | null;
  tenant_type: 'company' | 'individual';
  province: string | null;
  city: string | null;
  industry: string | null;
  plan_code: string;
  plan_name: string;
  cycle_type: string;
  end_at: Date | string | null;
  subscription_status: string;
  amount: string | number | null;
  paid_amount: string | number | null;
  currency: string | null;
  bill_id: string | null;
  bill_no: string | null;
  bill_status: string | null;
  payment_method: string | null;
  payment_id: string | null;
  pay_order_no: string | null;
  pay_source: string | null;
  pay_method: string | null;
  payment_status: string | null;
  operator_username: string | null;
  operator_display_name: string | null;
  created_at: Date | string;
  confirmed_at: Date | string | null;
  updated_at: Date | string;
}

interface OrderInvoiceItemRow {
  id: string;
  item_name: string;
  item_type: string;
  item_unit: string | null;
  quantity: string | number | null;
  unit_price: string | number | null;
  total_amount: string | number | null;
  remark: string | null;
}

interface OrderPaymentRow {
  id: string;
  pay_order_no: string;
  pay_source: string;
  pay_method: string | null;
  offline_pay_type: string | null;
  offline_payer_name: string | null;
  paid_amount: string | number | null;
  currency: string | null;
  pay_status: string;
  status_msg: string | null;
  paid_at: Date | string | null;
  operate_remark: string | null;
  operator_username: string | null;
  operator_display_name: string | null;
}

interface OrderActionRow {
  id: string;
  tenant_id: string;
  order_no: string | null;
  cycle_type: string;
  start_at: Date | string;
  end_at: Date | string | null;
  subscription_status: string;
  payable_amount: string | number;
  paid_amount: string | number;
  currency: string | null;
  bill_id: string | null;
  bill_status: string | null;
  payment_status: string | null;
}

const ORDER_OPERATION_SQL = `
  select
    s.id,
    s.order_no,
    s.tenant_id,
    t.tenant_code,
    t.tenant_name,
    t.display_name,
    t.tenant_type,
    org.province,
    org.city,
    org.industry,
    p.plan_code,
    p.plan_name,
    s.cycle_type,
    s.end_at,
    s.status as subscription_status,
    coalesce(inv.payable_amount, s.pay_amount, 0) as amount,
    coalesce(pay.paid_amount, inv.paid_amount, 0) as paid_amount,
    coalesce(pay.currency, inv.currency, s.currency, 'CNY') as currency,
    inv.id as bill_id,
    inv.bill_no,
    inv.bill_status,
    inv.payment_method,
    pay.id as payment_id,
    pay.pay_order_no,
    pay.pay_source,
    pay.pay_method,
    pay.pay_status as payment_status,
    operator.username as operator_username,
    operator_profile.display_name as operator_display_name,
    s.created_at,
    coalesce(pay.paid_at, inv.paid_at) as confirmed_at,
    greatest(s.updated_at, coalesce(inv.updated_at, s.updated_at), coalesce(pay.updated_at, s.updated_at)) as updated_at
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
      i.id,
      i.bill_no,
      i.bill_status,
      i.payable_amount,
      i.paid_amount,
      i.currency,
      i.payment_method,
      i.operator_id,
      i.paid_at,
      i.updated_at
    from commerce.tenant_invoice i
    where i.subscription_id = s.id
      and i.deleted_at is null
    order by i.cycle_end_date desc, i.created_at desc
    limit 1
  ) inv on true
  left join lateral (
    select
      tp.id,
      tp.pay_order_no,
      tp.pay_source,
      tp.pay_method,
      tp.pay_status,
      tp.paid_amount,
      tp.currency,
      tp.operator_id,
      tp.paid_at,
      tp.updated_at
    from commerce.tenant_payment tp
    where tp.bill_id = inv.id
    order by tp.updated_at desc, tp.created_at desc
    limit 1
  ) pay on true
  left join identity.account operator
    on operator.id = coalesce(pay.operator_id, inv.operator_id, s.created_by)
  left join identity.account_profile operator_profile
    on operator_profile.account_id = operator.id
  where s.deleted_at is null
  order by
    case
      when pay.pay_status = 'pending_verify' then 1
      when inv.bill_status = 'overdue' then 2
      when coalesce(inv.payable_amount, s.pay_amount, 0) > 0
       and coalesce(pay.pay_status, inv.bill_status, '') not in ('paid', 'closed', 'cancelled') then 3
      when coalesce(pay.pay_status, inv.bill_status, '') in ('failed', 'refunding') then 4
      else 5
    end,
    greatest(s.updated_at, coalesce(inv.updated_at, s.updated_at), coalesce(pay.updated_at, s.updated_at)) desc,
    t.tenant_code asc
`;

const ORDER_INVOICE_ITEM_SQL = `
  select
    item.id,
    item.item_name,
    item.item_type,
    item.item_unit,
    item.quantity,
    item.unit_price,
    item.total_amount,
    item.remark
  from commerce.tenant_invoice_item item
  join commerce.tenant_invoice inv
    on inv.id = item.bill_id
   and inv.deleted_at is null
  where inv.subscription_id = $1
    and item.deleted_at is null
  order by item.created_at asc, item.item_name asc
`;

const ORDER_PAYMENT_SQL = `
  select
    pay.id,
    pay.pay_order_no,
    pay.pay_source,
    pay.pay_method,
    pay.offline_pay_type,
    pay.offline_payer_name,
    pay.paid_amount,
    pay.currency,
    pay.pay_status,
    pay.status_msg,
    pay.paid_at,
    pay.operate_remark,
    operator.username as operator_username,
    operator_profile.display_name as operator_display_name
  from commerce.tenant_payment pay
  join commerce.tenant_invoice inv
    on inv.id = pay.bill_id
   and inv.deleted_at is null
  left join identity.account operator
    on operator.id = pay.operator_id
  left join identity.account_profile operator_profile
    on operator_profile.account_id = operator.id
  where inv.subscription_id = $1
  order by pay.created_at desc
`;

const ORDER_ACTION_LOOKUP_SQL = `
  select
    s.id,
    s.tenant_id,
    s.order_no,
    s.cycle_type,
    s.start_at,
    s.end_at,
    s.status as subscription_status,
    coalesce(inv.payable_amount, s.pay_amount, 0) as payable_amount,
    coalesce(inv.paid_amount, 0) as paid_amount,
    coalesce(inv.currency, s.currency, 'CNY') as currency,
    inv.id as bill_id,
    inv.bill_status,
    pay.pay_status as payment_status
  from commerce.tenant_subscription s
  left join lateral (
    select
      i.id,
      i.bill_status,
      i.payable_amount,
      i.paid_amount,
      i.currency
    from commerce.tenant_invoice i
    where i.subscription_id = s.id
      and i.deleted_at is null
    order by i.cycle_end_date desc, i.created_at desc
    limit 1
  ) inv on true
  left join lateral (
    select tp.pay_status
    from commerce.tenant_payment tp
    where tp.bill_id = inv.id
    order by tp.updated_at desc, tp.created_at desc
    limit 1
  ) pay on true
  where s.id = $1
    and s.deleted_at is null
  for update of s
`;

const ORDER_INVOICE_CREATE_SQL = `
  insert into commerce.tenant_invoice (
    tenant_id,
    bill_no,
    subscription_id,
    bill_cycle,
    cycle_start_date,
    cycle_end_date,
    total_amount,
    discount_amount,
    payable_amount,
    paid_amount,
    currency,
    bill_status,
    bill_type,
    operator_id,
    operate_remark,
    created_by,
    updated_by
  ) values (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    0,
    $7,
    0,
    $8,
    'unpaid',
    'supplement',
    $9,
    $10,
    $9,
    $9
  )
  returning id
`;

const ORDER_OFFLINE_PAYMENT_INSERT_SQL = `
  insert into commerce.tenant_payment (
    tenant_id,
    bill_id,
    transaction_id,
    pay_order_no,
    pay_source,
    pay_channel,
    pay_method,
    offline_pay_type,
    offline_payer_name,
    offline_pay_time,
    offline_evidence_url,
    total_amount,
    paid_amount,
    currency,
    pay_status,
    status_msg,
    channel_order_no,
    channel_transaction_no,
    operator_id,
    operate_remark,
    paid_at
  ) values (
    $1,
    $2,
    gen_random_uuid(),
    concat('OFFPAY-', to_char(now(), 'YYYYMMDDHH24MISSMS'), '-', substr(gen_random_uuid()::text, 1, 8)),
    'offline',
    'offline',
    'offline',
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    'paid',
    concat('平台运营确认线下收款', case when $3 is null then '' else concat('，订单 ', $3) end),
    $11,
    $11,
    $12,
    $13,
    $6
  )
`;

const ORDER_INVOICE_PAYMENT_UPDATE_SQL = `
  update commerce.tenant_invoice
  set
    paid_amount = least(payable_amount, coalesce(paid_amount, 0) + $2),
    bill_status = case
      when least(payable_amount, coalesce(paid_amount, 0) + $2) >= payable_amount then 'paid'
      else 'partial'
    end,
    paid_at = case
      when least(payable_amount, coalesce(paid_amount, 0) + $2) >= payable_amount then $3
      else paid_at
    end,
    payment_method = $4,
    transaction_no = $5,
    operator_id = $6,
    operate_remark = $7,
    updated_by = $6,
    updated_at = now()
  where id = $1
`;
