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
} from "@nestjs/common";
import { MailService } from "@vxture/core-mail";
import type { Request } from "express";
import type { Pool } from "pg";
import { ADMIN_BFF_RO_POOL, ADMIN_BFF_RW_POOL } from "../tokens";
import type {
  BillingBillStatus,
  BillingBillType,
  OrderOfflinePaymentType,
  OrderPaymentStatus,
  OrderPaySource,
  PaymentOperationRecord,
  PaymentReconciliationStatus,
  RequestContext,
} from "../types/console.types";

@Controller("api/payments")
export class PaymentsRouter {
  constructor(
    @Inject(ADMIN_BFF_RO_POOL) private readonly roPool: Pool,
    @Inject(ADMIN_BFF_RW_POOL) private readonly rwPool: Pool,
    @Inject(MailService) private readonly mailService: MailService,
  ) {}

  @Get()
  async listPayments(
    @Req() req: Request & RequestContext,
  ): Promise<PaymentOperationRecord[]> {
    assertCanManagePayments(req);

    const rows = await this.roPool.query<PaymentLedgerRow>(PAYMENT_LEDGER_SQL);
    return rows.rows.map(mapPaymentLedgerRow);
  }

  @Post(":paymentId/verify")
  async verifyPayment(
    @Req() req: Request & RequestContext,
    @Param("paymentId") paymentId: string,
    @Body() body: PaymentActionBody,
  ): Promise<PaymentOperationRecord> {
    assertCanManagePayments(req);

    const remark = normalizeRemark(body?.remark, "核销原因");
    const operatorId = req.user?.id ?? null;
    const client = await this.rwPool.connect();

    try {
      await client.query("begin");

      // 查询当前支付记录并锁行（FOR UPDATE），防止并发双核销
      const lookupResult = await client.query<PaymentLookupRow>(
        PAYMENT_LOOKUP_FOR_UPDATE_SQL,
        [paymentId],
      );
      const current = lookupResult.rows[0];

      if (!current) {
        throw new NotFoundException(`支付记录 ${paymentId} 不存在`);
      }
      if (current.pay_status !== "pending_verify") {
        throw new BadRequestException(
          `当前状态（${current.pay_status}）不允许核销，仅 pending_verify 状态可核销`,
        );
      }

      // 更新支付状态为已收款
      await client.query(PAYMENT_VERIFY_SQL, [remark, operatorId, paymentId]);

      // 联动更新账单收款金额和状态
      if (current.bill_id) {
        const paidAmount = Number(current.paid_amount ?? 0);
        await client.query(BILL_PAID_AMOUNT_UPDATE_SQL, [
          paidAmount,
          current.bill_id,
        ]);
      }

      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }

    const updated = await this.roPool.query<PaymentLedgerRow>(
      PAYMENT_LEDGER_BY_ID_SQL,
      [paymentId],
    );
    if (!updated.rows[0])
      throw new NotFoundException(`支付记录 ${paymentId} 不存在`);

    const result = mapPaymentLedgerRow(updated.rows[0]);
    const tenantEmail = updated.rows[0].contact_email;
    if (tenantEmail) {
      void this.mailService
        .send({
          to: tenantEmail,
          subject: `[Vxture] 付款已核销确认 — ${result.paymentNo}`,
          html: buildPaymentEmail("verify", result),
        })
        .catch(() => {});
    }

    return result;
  }

  @Post(":paymentId/reject")
  async rejectPayment(
    @Req() req: Request & RequestContext,
    @Param("paymentId") paymentId: string,
    @Body() body: PaymentActionBody,
  ): Promise<PaymentOperationRecord> {
    assertCanManagePayments(req);

    const remark = normalizeRemark(body?.remark, "驳回原因");
    const operatorId = req.user?.id ?? null;
    const client = await this.rwPool.connect();

    try {
      await client.query("begin");

      const lookupResult = await client.query<PaymentLookupRow>(
        PAYMENT_LOOKUP_FOR_UPDATE_SQL,
        [paymentId],
      );
      const current = lookupResult.rows[0];

      if (!current) {
        throw new NotFoundException(`支付记录 ${paymentId} 不存在`);
      }
      if (current.pay_status !== "pending_verify") {
        throw new BadRequestException(
          `当前状态（${current.pay_status}）不允许驳回，仅 pending_verify 状态可驳回`,
        );
      }

      await client.query(PAYMENT_REJECT_SQL, [remark, operatorId, paymentId]);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }

    const updated = await this.roPool.query<PaymentLedgerRow>(
      PAYMENT_LEDGER_BY_ID_SQL,
      [paymentId],
    );
    if (!updated.rows[0])
      throw new NotFoundException(`支付记录 ${paymentId} 不存在`);

    const result = mapPaymentLedgerRow(updated.rows[0]);
    const tenantEmail = updated.rows[0].contact_email;
    if (tenantEmail) {
      void this.mailService
        .send({
          to: tenantEmail,
          subject: `[Vxture] 付款申请驳回通知 — ${result.paymentNo}`,
          html: buildPaymentEmail("reject", result),
        })
        .catch(() => {});
    }

    return result;
  }
}

function assertCanManagePayments(req: Request & RequestContext): void {
  if (!req.user) {
    throw new UnauthorizedException("No active session");
  }

  const capabilities = req.capabilities ?? [];
  if (
    capabilities.length &&
    !capabilities.some(
      (item) =>
        item === "platform.pricing.manage" || item === "platform.tenant.manage",
    )
  ) {
    throw new ForbiddenException("Missing platform.pricing.manage capability");
  }
}

function toIso(value: Date | string | null): string {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function nullableIso(value: Date | string | null): string | null {
  return value ? toIso(value) : null;
}

function normalizeBillStatus(value: string | null): BillingBillStatus | null {
  if (
    value === "paying" ||
    value === "paid" ||
    value === "partial" ||
    value === "cancelled" ||
    value === "overdue" ||
    value === "unpaid"
  )
    return value;
  return null;
}

function normalizeBillType(value: string | null): BillingBillType | null {
  if (
    value === "normal" ||
    value === "adjust" ||
    value === "supplement" ||
    value === "prepaid"
  )
    return value;
  return null;
}

function normalizePaymentStatus(value: string | null): OrderPaymentStatus {
  if (
    value === "pending_verify" ||
    value === "paid" ||
    value === "failed" ||
    value === "closed" ||
    value === "refunding" ||
    value === "pending"
  ) {
    return value;
  }
  return "pending";
}

function normalizePaySource(value: string | null): OrderPaySource {
  if (value === "offline") return "offline";
  if (value === "online") return "online";
  return "none";
}

function normalizePaymentTypeOrNull(
  value: string | null,
): OrderOfflinePaymentType | null {
  if (value === "bank_transfer" || value === "cash" || value === "other")
    return value;
  return null;
}

function tierNameForPlan(
  planCode: string | null,
  planName: string | null,
): string | null {
  if (!planCode || !planName) return null;
  if (planCode === "starter") return "Free";
  if (planCode === "growth") return "Pro";
  if (planCode === "enterprise") return "Enterprise";
  return planName;
}

function reconciliationStatusFor(
  row: PaymentLedgerRow,
  paymentStatus: OrderPaymentStatus,
): PaymentReconciliationStatus {
  const paidAmount = Number(row.paid_amount ?? 0);
  const billPayableAmount = Number(row.payable_amount ?? 0);
  const billPaidAmount = Number(row.bill_paid_amount ?? 0);

  if (!row.bill_id) return "unlinked";
  if (paymentStatus === "pending_verify") return "pending_verify";
  if (
    paymentStatus === "failed" ||
    paymentStatus === "refunding" ||
    paymentStatus === "closed"
  )
    return "failed";
  if (row.bill_status === "cancelled") return "bill_cancelled";
  if (billPayableAmount > 0 && paidAmount > billPayableAmount + 0.01)
    return "overpaid";
  if (
    billPayableAmount > 0 &&
    billPaidAmount > 0 &&
    billPaidAmount < billPayableAmount
  )
    return "partial";
  return "normal";
}

function mapPaymentLedgerRow(row: PaymentLedgerRow): PaymentOperationRecord {
  const paymentStatus = normalizePaymentStatus(row.pay_status);

  return {
    id: row.id,
    paymentNo: row.pay_order_no,
    tenantId: row.tenant_id,
    tenantCode: row.tenant_code,
    tenantName: row.display_name ?? row.tenant_name,
    tenantType: row.tenant_type === "individual" ? "individual" : "company",
    region: [row.province, row.city].filter(Boolean).join(" / ") || "未设置",
    industry: row.industry ?? "未设置",
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
    currency: row.currency ?? row.bill_currency ?? "CNY",
    paymentStatus,
    reconciliationStatus: reconciliationStatusFor(row, paymentStatus),
    transactionId: row.transaction_id,
    channelOrderNo: row.channel_order_no,
    channelTransactionNo: row.channel_transaction_no,
    offlineEvidenceUrl: row.offline_evidence_url,
    statusMessage: row.status_msg,
    remark: row.operate_remark,
    operatorName: row.operator_display_name ?? row.operator_username ?? "系统",
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
  contact_email: string | null;
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
    org.contact_email,
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
  join tenant.tenant t
    on t.id = pay.tenant_id
   and t.deleted_at is null
  left join tenant.tenant_organization org
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
  left join identity.account operator
    on operator.id = pay.operator_id
  left join identity.account_profile operator_profile
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

// ─── 单条查询（verify / reject 后重新读取）────────────────────────────────────

const PAYMENT_LEDGER_BY_ID_SQL = PAYMENT_LEDGER_SQL.replace(
  "order by",
  "where pay.id = $1\n  order by",
);

// ─── 核销前状态查询 ────────────────────────────────────────────────────────────

const PAYMENT_LOOKUP_FOR_UPDATE_SQL = `
  select id, pay_status, paid_amount, bill_id
  from commerce.tenant_payment
  where id = $1
  for update
`;

// ─── 核销：pending_verify → paid ──────────────────────────────────────────────

const PAYMENT_VERIFY_SQL = `
  update commerce.tenant_payment
  set
    pay_status   = 'paid',
    operate_remark = coalesce(operate_remark || ' | 核销：', '核销：') || $1,
    operator_id  = $2,
    paid_at      = coalesce(paid_at, now()),
    updated_at   = now()
  where id = $3
    and pay_status = 'pending_verify'
`;

// ─── 驳回：pending_verify → failed ────────────────────────────────────────────

const PAYMENT_REJECT_SQL = `
  update commerce.tenant_payment
  set
    pay_status   = 'failed',
    operate_remark = coalesce(operate_remark || ' | 驳回：', '驳回：') || $1,
    operator_id  = $2,
    updated_at   = now()
  where id = $3
    and pay_status = 'pending_verify'
`;

// ─── 联动更新账单已收金额和状态 ───────────────────────────────────────────────

const BILL_PAID_AMOUNT_UPDATE_SQL = `
  update commerce.tenant_invoice
  set
    paid_amount = least(payable_amount, coalesce(paid_amount, 0) + $1),
    bill_status = case
      when least(payable_amount, coalesce(paid_amount, 0) + $1) >= payable_amount then 'paid'
      when least(payable_amount, coalesce(paid_amount, 0) + $1) > 0              then 'partial'
      else bill_status
    end,
    updated_at = now()
  where id = $2
    and deleted_at is null
`;

// ─── 请求体类型 ────────────────────────────────────────────────────────────────

interface PaymentLookupRow {
  id: string;
  pay_status: string | null;
  paid_amount: string | number | null;
  bill_id: string | null;
}

interface PaymentActionBody {
  remark?: unknown;
}

// ─── 辅助：文本规范化 ──────────────────────────────────────────────────────────

function normalizeRemark(value: unknown, fieldName: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length < 4) {
    throw new BadRequestException(`${fieldName}至少填写 4 个字`);
  }
  if (text.length > 512) {
    throw new BadRequestException(`${fieldName}不能超过 512 个字`);
  }
  return text;
}

// ─── 付款操作通知邮件 ──────────────────────────────────────────────────────────

function buildPaymentEmail(
  type: "verify" | "reject",
  rec: PaymentOperationRecord,
): string {
  const isVerify = type === "verify";
  const statusColor = isVerify ? "#16a34a" : "#dc2626";
  const statusText = isVerify ? "核销确认" : "驳回通知";
  const bodyText = isVerify
    ? `您于 ${rec.createdAt.slice(0, 10)} 提交的离线付款申请已由平台管理员审核通过，款项已确认收款。`
    : `您于 ${rec.createdAt.slice(0, 10)} 提交的离线付款申请未通过审核，请根据以下备注重新处理。`;

  return `
<div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#1a1a2e">
  <h2 style="color:${statusColor};margin-bottom:8px">付款${statusText}</h2>
  <p style="color:#555">${bodyText}</p>
  <table style="border-collapse:collapse;width:100%;margin:16px 0">
    <tr style="background:#f5f5f5">
      <td style="padding:10px 12px;color:#888;width:130px">付款单号</td>
      <td style="padding:10px 12px">${rec.paymentNo}</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;color:#888">套餐</td>
      <td style="padding:10px 12px">${rec.servicePlanName ?? "—"}</td>
    </tr>
    <tr style="background:#f5f5f5">
      <td style="padding:10px 12px;color:#888">付款金额</td>
      <td style="padding:10px 12px">${rec.currency} ${rec.paidAmount.toFixed(2)}</td>
    </tr>
    ${
      rec.remark
        ? `
    <tr>
      <td style="padding:10px 12px;color:#888">备注</td>
      <td style="padding:10px 12px">${rec.remark}</td>
    </tr>`
        : ""
    }
  </table>
  <p style="color:#aaa;font-size:12px;margin-top:24px">
    如有疑问，请联系 Vxture 支持团队。<br>
    此邮件由系统自动发送，请勿回复。
  </p>
</div>`;
}
