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
  BillingBillType,
  OrderOfflinePaymentType,
  OrderPaymentStatus,
  OrderPaySource,
  PaymentOperationRecord,
  PaymentReconciliationStatus,
  RequestContext,
} from '../types/console.types';

@Controller('api/payments')
export class PaymentsRouter implements OnModuleDestroy {
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
  async listPayments(@Req() req: Request & RequestContext): Promise<PaymentOperationRecord[]> {
    assertCanManagePayments(req);

    if (!this.pool) {
      throw new BadGatewayException('Payment database is not configured');
    }

    const rows = await this.pool.query<PaymentLedgerRow>(PAYMENT_LEDGER_SQL);
    return rows.rows.map(mapPaymentLedgerRow);
  }
}

function assertCanManagePayments(req: Request & RequestContext): void {
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

function normalizeBillStatus(value: string | null): BillingBillStatus | null {
  if (value === 'paying' || value === 'paid' || value === 'partial' || value === 'cancelled' || value === 'overdue' || value === 'unpaid') return value;
  return null;
}

function normalizeBillType(value: string | null): BillingBillType | null {
  if (value === 'normal' || value === 'adjust' || value === 'supplement' || value === 'prepaid') return value;
  return null;
}

function normalizePaymentStatus(value: string | null): OrderPaymentStatus {
  if (value === 'pending_verify' || value === 'paid' || value === 'failed' || value === 'closed' || value === 'refunding' || value === 'pending') {
    return value;
  }
  return 'pending';
}

function normalizePaySource(value: string | null): OrderPaySource {
  if (value === 'offline') return 'offline';
  if (value === 'online') return 'online';
  return 'none';
}

function normalizePaymentTypeOrNull(value: string | null): OrderOfflinePaymentType | null {
  if (value === 'bank_transfer' || value === 'cash' || value === 'other') return value;
  return null;
}

function tierNameForPlan(planCode: string | null, planName: string | null): string | null {
  if (!planCode || !planName) return null;
  if (planCode === 'starter') return 'Free';
  if (planCode === 'growth') return 'Pro';
  if (planCode === 'enterprise') return 'Enterprise';
  return planName;
}

function reconciliationStatusFor(row: PaymentLedgerRow, paymentStatus: OrderPaymentStatus): PaymentReconciliationStatus {
  const paidAmount = Number(row.paid_amount ?? 0);
  const billPayableAmount = Number(row.payable_amount ?? 0);
  const billPaidAmount = Number(row.bill_paid_amount ?? 0);

  if (!row.bill_id) return 'unlinked';
  if (paymentStatus === 'pending_verify') return 'pending_verify';
  if (paymentStatus === 'failed' || paymentStatus === 'refunding' || paymentStatus === 'closed') return 'failed';
  if (row.bill_status === 'cancelled') return 'bill_cancelled';
  if (billPayableAmount > 0 && paidAmount > billPayableAmount + 0.01) return 'overpaid';
  if (billPayableAmount > 0 && billPaidAmount > 0 && billPaidAmount < billPayableAmount) return 'partial';
  return 'normal';
}

function mapPaymentLedgerRow(row: PaymentLedgerRow): PaymentOperationRecord {
  const paymentStatus = normalizePaymentStatus(row.pay_status);

  return {
    id: row.id,
    paymentNo: row.pay_order_no,
    tenantId: row.tenant_id,
    tenantCode: row.tenant_code,
    tenantName: row.display_name ?? row.tenant_name,
    tenantType: row.tenant_type === 'individual' ? 'individual' : 'company',
    region: [row.province, row.city].filter(Boolean).join(' / ') || '未设置',
    industry: row.industry ?? '未设置',
    billId: row.bill_id,
    billNo: row.bill_no,
    billStatus: normalizeBillStatus(row.bill_status),
    billType: normalizeBillType(row.bill_type),
    billPayableAmount: Number(row.payable_amount ?? 0),
    billPaidAmount: Number(row.bill_paid_amount ?? 0),
    subscriptionId: row.subscription_id,
    orderNo: row.order_no,
    servicePlanName: row.plan_name,
    tierName: tierNameForPlan(row.plan_code, row.plan_name),
    paySource: normalizePaySource(row.pay_source),
    payChannel: row.pay_channel,
    payMethod: row.pay_method,
    offlinePayType: normalizePaymentTypeOrNull(row.offline_pay_type),
    offlinePayerName: row.offline_payer_name,
    totalAmount: Number(row.total_amount ?? 0),
    paidAmount: Number(row.paid_amount ?? 0),
    currency: row.currency ?? row.bill_currency ?? 'CNY',
    paymentStatus,
    reconciliationStatus: reconciliationStatusFor(row, paymentStatus),
    transactionId: row.transaction_id,
    channelOrderNo: row.channel_order_no,
    channelTransactionNo: row.channel_transaction_no,
    offlineEvidenceUrl: row.offline_evidence_url,
    statusMessage: row.status_msg,
    remark: row.operate_remark,
    operatorName: row.operator_display_name ?? row.operator_username ?? '系统',
    paidAt: nullableIso(row.paid_at),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

interface PaymentLedgerRow {
  id: string;
  tenant_id: string;
  transaction_id: string | null;
  pay_order_no: string;
  pay_source: string | null;
  pay_channel: string | null;
  pay_method: string | null;
  offline_pay_type: string | null;
  offline_payer_name: string | null;
  offline_evidence_url: string | null;
  total_amount: string | number | null;
  paid_amount: string | number | null;
  currency: string | null;
  pay_status: string | null;
  status_msg: string | null;
  channel_order_no: string | null;
  channel_transaction_no: string | null;
  operate_remark: string | null;
  paid_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
  operator_username: string | null;
  operator_display_name: string | null;
  tenant_code: string;
  tenant_name: string;
  display_name: string | null;
  tenant_type: string;
  province: string | null;
  city: string | null;
  industry: string | null;
  bill_id: string | null;
  bill_no: string | null;
  bill_status: string | null;
  bill_type: string | null;
  payable_amount: string | number | null;
  bill_paid_amount: string | number | null;
  bill_currency: string | null;
  subscription_id: string | null;
  order_no: string | null;
  plan_code: string | null;
  plan_name: string | null;
}

const PAYMENT_LEDGER_SQL = `
  select
    pay.id,
    pay.tenant_id,
    pay.transaction_id::text,
    pay.pay_order_no,
    pay.pay_source,
    pay.pay_channel,
    pay.pay_method,
    pay.offline_pay_type,
    pay.offline_payer_name,
    pay.offline_evidence_url,
    pay.total_amount,
    pay.paid_amount,
    pay.currency,
    pay.pay_status,
    pay.status_msg,
    pay.channel_order_no,
    pay.channel_transaction_no,
    pay.operate_remark,
    pay.paid_at,
    pay.created_at,
    pay.updated_at,
    operator.username as operator_username,
    operator_profile.display_name as operator_display_name,
    t.tenant_code,
    t.tenant_name,
    t.display_name,
    t.tenant_type,
    org.province,
    org.city,
    org.industry,
    bill.id as bill_id,
    bill.bill_no,
    bill.bill_status,
    bill.bill_type,
    bill.payable_amount,
    bill.paid_amount as bill_paid_amount,
    bill.currency as bill_currency,
    bill.subscription_id,
    sub.order_no,
    plan.plan_code,
    plan.plan_name
  from commerce.tenant_payment pay
  join tenancy.tenant t
    on t.id = pay.tenant_id
   and t.deleted_at is null
  left join tenancy.tenant_organization org
    on org.tenant_id = t.id
   and org.deleted_at is null
  left join commerce.tenant_invoice bill
    on bill.id = pay.bill_id
   and bill.deleted_at is null
  left join commerce.tenant_subscription sub
    on sub.id = bill.subscription_id
   and sub.deleted_at is null
  left join product.plan plan
    on plan.id = sub.plan_id
   and plan.deleted_at is null
  left join account.account operator
    on operator.id = pay.operator_id
  left join account.account_profile operator_profile
    on operator_profile.account_id = operator.id
  order by
    case
      when pay.pay_status = 'pending_verify' then 1
      when bill.bill_status = 'partial' then 2
      when bill.bill_status = 'cancelled' then 3
      when pay.pay_status in ('failed', 'refunding') then 4
      when pay.pay_status = 'paid' then 5
      else 6
    end,
    coalesce(pay.paid_at, pay.updated_at, pay.created_at) desc,
    pay.pay_order_no asc
`;
