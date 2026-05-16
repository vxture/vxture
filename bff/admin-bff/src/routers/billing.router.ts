import {
  BadGatewayException,
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
  BillingBillAction,
  BillingBillStatus,
  BillingBillType,
  BillingDetailRecord,
  BillingInvoiceReceiptAction,
  BillingInvoiceReceiptRecord,
  BillingInvoiceStatus,
  BillingInvoiceTaxType,
  BillingInvoiceType,
  BillingOperationEvent,
  BillingRecord,
  OrderInvoiceItemRecord,
  OrderPaymentRecord,
  OrderPaymentStatus,
  OrderPaySource,
  RequestContext,
} from '../types/console.types';

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

@Controller('api/billing')
export class BillingRouter {
  constructor(
    @Inject(ADMIN_BFF_RO_POOL) private readonly roPool: Pool,
    @Inject(ADMIN_BFF_RW_POOL) private readonly rwPool: Pool,
  ) {}

  @Get()
  async listBilling(@Req() req: Request & RequestContext): Promise<BillingRecord[]> {
    assertCanManageBilling(req);

    const rows = await this.roPool.query<BillingRow>(BILLING_SQL);
    return rows.rows.map(mapBillingRow);
  }

  @Get(':billId')
  async getBilling(
    @Req() req: Request & RequestContext,
    @Param('billId') billId: string,
  ): Promise<BillingDetailRecord> {
    assertCanManageBilling(req);

    return loadBillingDetail(this.roPool, billId);
  }

  @Post(':billId/offline-invoice-sync')
  async syncOfflineInvoice(
    @Req() req: Request & RequestContext,
    @Param('billId') billId: string,
    @Body() body: SyncOfflineInvoiceBody,
  ): Promise<BillingDetailRecord> {
    assertCanManageBilling(req);

    const payload = normalizeSyncOfflineInvoiceBody(body);
    const client = await this.rwPool.connect();

    try {
      await client.query('begin');
      const currentResult = await client.query<BillingActionRow>(BILLING_ACTION_LOOKUP_SQL, [billId]);
      const current = currentResult.rows[0];

      if (!current) {
        throw new NotFoundException(`Bill ${billId} not found`);
      }

      validateOfflineInvoiceSync(current, payload);
      const operatorId = normalizeUuid(req.user?.id) ?? ZERO_UUID;
      const result = await client.query<{ id: string }>(BILLING_OFFLINE_INVOICE_UPSERT_SQL, [
        current.tenant_id,
        current.id,
        payload.invoiceNo,
        payload.invoiceType,
        payload.invoiceTaxType,
        payload.invoiceTitle,
        payload.taxNo,
        JSON.stringify({ invoiceTitle: payload.invoiceTitle, taxNo: payload.taxNo }),
        payload.invoiceAmount,
        payload.taxAmount,
        current.currency ?? 'CNY',
        payload.invoiceStatus,
        payload.statusRemark,
        payload.invoiceCode,
        payload.invoiceElectronicNo,
        payload.invoiceFileUrl,
        payload.issuedAt,
        payload.expressCompany,
        payload.expressNo,
        payload.sendAt,
        operatorId,
      ]);

      if (!result.rows[0]) {
        throw new BadRequestException('发票号码已被其他账单登记');
      }

      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }

    return loadBillingDetail(this.roPool, billId);
  }

  @Post(':billId/actions')
  async submitBillingAction(
    @Req() req: Request & RequestContext,
    @Param('billId') billId: string,
    @Body() body: BillingBillActionBody,
  ): Promise<BillingDetailRecord> {
    assertCanManageBilling(req);

    const payload = normalizeBillingBillActionBody(body);
    const operatorId = normalizeUuid(req.user?.id) ?? ZERO_UUID;
    const client = await this.rwPool.connect();
    let nextBillId = billId;

    try {
      await client.query('begin');
      const currentResult = await client.query<BillingActionRow>(BILLING_ACTION_LOOKUP_SQL, [billId]);
      const current = currentResult.rows[0];

      if (!current) {
        throw new NotFoundException(`Bill ${billId} not found`);
      }

      validateBillingBillAction(current, payload);

      if (payload.action === 'cancel') {
        await client.query(BILLING_CANCEL_SQL, [current.id, operatorId, payload.reason]);
      } else if (payload.action === 'discount') {
        await client.query(BILLING_DISCOUNT_SQL, [current.id, payload.discountAmount, operatorId, payload.reason]);
      } else if (payload.action === 'mark_overdue') {
        await client.query(BILLING_MARK_OVERDUE_SQL, [current.id, operatorId, payload.reason]);
      } else {
        const created = await client.query<{ id: string }>(BILLING_CREATE_EXCEPTION_BILL_SQL, [
          current.tenant_id,
          current.subscription_id,
          payload.action === 'create_adjustment' ? 'adjust' : 'supplement',
          payload.itemName,
          payload.amount,
          current.currency ?? 'CNY',
          payload.cycleStartDate,
          payload.cycleEndDate,
          operatorId,
          `${payload.reason}；来源账单：${current.bill_no}`,
        ]);
        const createdBillId = created.rows[0]?.id;

        if (!createdBillId) {
          throw new BadGatewayException('账单生成失败');
        }

        nextBillId = createdBillId;
      }

      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }

    return loadBillingDetail(this.roPool, nextBillId);
  }

  @Post(':billId/invoice-receipts/:receiptId/actions')
  async submitInvoiceReceiptAction(
    @Req() req: Request & RequestContext,
    @Param('billId') billId: string,
    @Param('receiptId') receiptId: string,
    @Body() body: InvoiceReceiptActionBody,
  ): Promise<BillingDetailRecord> {
    assertCanManageBilling(req);

    const payload = normalizeInvoiceReceiptActionBody(body);
    const client = await this.rwPool.connect();

    try {
      await client.query('begin');
      const currentResult = await client.query<BillingReceiptActionRow>(BILLING_RECEIPT_ACTION_LOOKUP_SQL, [billId, receiptId]);
      const current = currentResult.rows[0];

      if (!current) {
        throw new NotFoundException(`Invoice receipt ${receiptId} not found`);
      }

      validateInvoiceReceiptAction(current, payload);
      const operatorId = normalizeUuid(req.user?.id) ?? ZERO_UUID;
      await client.query(BILLING_RECEIPT_ACTION_UPDATE_SQL, [
        current.id,
        payload.nextStatus,
        payload.statusRemark,
        payload.expressCompany,
        payload.expressNo,
        payload.sendAt,
        operatorId,
      ]);
      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }

    return loadBillingDetail(this.roPool, billId);
  }
}

async function loadBillingDetail(pool: Pool, billId: string): Promise<BillingDetailRecord> {
  const [billRows, itemRows, paymentRows, receiptRows] = await Promise.all([
    pool.query<BillingRow>(BILLING_SQL),
    pool.query<BillingItemRow>(BILLING_ITEM_SQL, [billId]),
    pool.query<BillingPaymentRow>(BILLING_PAYMENT_SQL, [billId]),
    pool.query<BillingReceiptRow>(BILLING_RECEIPT_SQL, [billId]),
  ]);
  const row = billRows.rows.find((item) => item.id === billId);

  if (!row) {
    throw new NotFoundException(`Bill ${billId} not found`);
  }

  const record = mapBillingRow(row);
  const invoiceItems = itemRows.rows.map(mapBillingItemRow);
  const paymentRecords = paymentRows.rows.map(mapPaymentRow);
  const invoiceReceipts = receiptRows.rows.map(mapReceiptRow);

  return {
    ...record,
    invoiceItems,
    paymentRecords,
    invoiceReceipts,
    operationTimeline: buildBillingTimeline(row, record, paymentRecords, invoiceReceipts),
  };
}

function assertCanManageBilling(req: Request & RequestContext): void {
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

function normalizeUuid(value: string | null | undefined): string | null {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? value : null;
}

function normalizeBillStatus(value: string): BillingBillStatus {
  if (value === 'paying' || value === 'paid' || value === 'partial' || value === 'cancelled' || value === 'overdue') return value;
  return 'unpaid';
}

function normalizeBillType(value: string | null): BillingBillType {
  if (value === 'adjust' || value === 'supplement' || value === 'prepaid') return value;
  return 'normal';
}

function normalizeInvoiceStatus(value: string | null): BillingInvoiceStatus {
  if (value === 'applying' || value === 'auditing' || value === 'issued' || value === 'sending' || value === 'finished' || value === 'rejected' || value === 'red') return value;
  return 'none';
}

function normalizeInvoiceType(value: unknown): BillingInvoiceType {
  if (value === 'special_vat' || value === 'normal_vat' || value === 'electronic' || value === 'paper' || value === 'other') return value;
  throw new BadRequestException('请选择发票类型');
}

function normalizeInvoiceTaxType(value: unknown): BillingInvoiceTaxType {
  if (value === 'enterprise' || value === 'individual' || value === 'government' || value === 'other') return value;
  throw new BadRequestException('请选择抬头类型');
}

function normalizeManualInvoiceStatus(value: unknown): Exclude<BillingInvoiceStatus, 'none' | 'applying' | 'auditing' | 'rejected' | 'red'> {
  if (value === 'issued' || value === 'sending' || value === 'finished') return value;
  throw new BadRequestException('线下发票登记状态只能为已开票、寄送中或已完成');
}

function normalizeInvoiceReceiptAction(value: unknown): BillingInvoiceReceiptAction {
  if (value === 'update_shipping' || value === 'finish' || value === 'red') return value;
  throw new BadRequestException('请选择有效的发票后续动作');
}

function normalizeBillingBillAction(value: unknown): BillingBillAction {
  if (value === 'cancel' || value === 'discount' || value === 'mark_overdue' || value === 'create_adjustment' || value === 'create_supplement') return value;
  throw new BadRequestException('请选择有效的账单处理动作');
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

function normalizeOptionalDate(value: unknown): Date | null {
  if (!value) return null;
  const date = new Date(String(value));
  if (!Number.isFinite(date.getTime())) {
    throw new BadRequestException('日期格式不正确');
  }
  return date;
}

function normalizeSyncOfflineInvoiceBody(body: SyncOfflineInvoiceBody): SyncOfflineInvoicePayload {
  const invoiceAmount = Number(body?.invoiceAmount);
  const taxAmount = Number(body?.taxAmount ?? 0);
  const issuedAt = normalizeOptionalDate(body?.issuedAt) ?? new Date();
  const sendAt = normalizeOptionalDate(body?.sendAt);

  if (!Number.isFinite(invoiceAmount) || invoiceAmount <= 0) {
    throw new BadRequestException('发票金额必须大于 0');
  }
  if (!Number.isFinite(taxAmount) || taxAmount < 0) {
    throw new BadRequestException('税额不能为负数');
  }
  if (issuedAt.getTime() > Date.now() + 5 * 60 * 1000) {
    throw new BadRequestException('开票时间不能晚于当前时间');
  }

  return {
    invoiceNo: normalizeText(body?.invoiceNo, '发票号码', 64),
    invoiceType: normalizeInvoiceType(body?.invoiceType),
    invoiceTaxType: normalizeInvoiceTaxType(body?.invoiceTaxType),
    invoiceTitle: normalizeText(body?.invoiceTitle, '发票抬头', 256),
    taxNo: normalizeOptionalText(body?.taxNo, 128),
    invoiceAmount: Math.round(invoiceAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    invoiceStatus: normalizeManualInvoiceStatus(body?.invoiceStatus),
    statusRemark: normalizeText(body?.statusRemark, '登记说明', 512, 4),
    invoiceCode: normalizeOptionalText(body?.invoiceCode, 64),
    invoiceElectronicNo: normalizeOptionalText(body?.invoiceElectronicNo, 64),
    invoiceFileUrl: normalizeOptionalText(body?.invoiceFileUrl, 512),
    issuedAt,
    expressCompany: normalizeOptionalText(body?.expressCompany, 64),
    expressNo: normalizeOptionalText(body?.expressNo, 64),
    sendAt,
  };
}

function normalizeInvoiceReceiptActionBody(body: InvoiceReceiptActionBody): InvoiceReceiptActionPayload {
  const action = normalizeInvoiceReceiptAction(body?.action);
  const statusRemark = normalizeText(body?.statusRemark, '操作说明', 512, 4);
  const rawSendAt = normalizeOptionalDate(body?.sendAt);
  const sendAt = rawSendAt ?? (action === 'update_shipping' ? new Date() : null);
  const expressCompany = normalizeOptionalText(body?.expressCompany, 64);
  const expressNo = normalizeOptionalText(body?.expressNo, 64);

  if (sendAt && sendAt.getTime() > Date.now() + 5 * 60 * 1000) {
    throw new BadRequestException('寄送时间不能晚于当前时间');
  }
  if (action === 'update_shipping' && (!expressCompany || !expressNo)) {
    throw new BadRequestException('更新寄送信息需要填写快递公司和快递单号');
  }

  return {
    action,
    nextStatus: action === 'red' ? 'red' : action === 'finish' ? 'finished' : 'sending',
    statusRemark,
    expressCompany,
    expressNo,
    sendAt,
  };
}

function normalizeBillingBillActionBody(body: BillingBillActionBody): BillingBillActionPayload {
  const action = normalizeBillingBillAction(body?.action);
  const reason = normalizeText(body?.reason, '处理说明', 512, 4);
  const discountAmount = Number(body?.discountAmount);
  const amount = Number(body?.amount);
  const itemName = typeof body?.itemName === 'string' ? body.itemName.trim() : '';
  const cycleStartDate = normalizeOptionalDate(body?.cycleStartDate) ?? new Date();
  const cycleEndDate = normalizeOptionalDate(body?.cycleEndDate) ?? cycleStartDate;

  if (action === 'discount' && (!Number.isFinite(discountAmount) || discountAmount <= 0)) {
    throw new BadRequestException('减免金额必须大于 0');
  }
  if ((action === 'create_adjustment' || action === 'create_supplement') && (!Number.isFinite(amount) || amount <= 0)) {
    throw new BadRequestException('账单金额必须大于 0');
  }
  if ((action === 'create_adjustment' || action === 'create_supplement') && (itemName.length < 2 || itemName.length > 128)) {
    throw new BadRequestException('账单项目名称需为 2-128 个字符');
  }
  if ((action === 'create_adjustment' || action === 'create_supplement') && cycleEndDate.getTime() < cycleStartDate.getTime()) {
    throw new BadRequestException('账期结束不能早于账期开始');
  }

  return {
    action,
    reason,
    discountAmount: Math.round((Number.isFinite(discountAmount) ? discountAmount : 0) * 100) / 100,
    amount: Math.round((Number.isFinite(amount) ? amount : 0) * 100) / 100,
    itemName: itemName || null,
    cycleStartDate,
    cycleEndDate,
  };
}

function validateOfflineInvoiceSync(current: BillingActionRow, payload: SyncOfflineInvoicePayload): void {
  const payableAmount = Number(current.payable_amount ?? 0);
  const invoicedAmount = Number(current.invoiced_amount ?? 0);

  if (current.bill_status === 'cancelled') {
    throw new BadRequestException('已取消账单不能登记发票');
  }
  if (payableAmount <= 0) {
    throw new BadRequestException('零金额账单不能登记发票');
  }
  if (payload.invoiceAmount > payableAmount + 0.01) {
    throw new BadRequestException(`发票金额不能超过账单应收 ${payableAmount.toFixed(2)}`);
  }
  if (invoicedAmount + payload.invoiceAmount > payableAmount + 0.01) {
    throw new BadRequestException(`累计开票金额不能超过账单应收 ${payableAmount.toFixed(2)}`);
  }
}

function validateInvoiceReceiptAction(current: BillingReceiptActionRow, payload: InvoiceReceiptActionPayload): void {
  const currentStatus = normalizeInvoiceStatus(current.invoice_status);

  if (currentStatus === 'red' || currentStatus === 'rejected') {
    throw new BadRequestException('已红冲或已驳回的发票不能继续操作');
  }
  if (payload.action !== 'red' && current.bill_status === 'cancelled') {
    throw new BadRequestException('已取消账单只能登记发票红冲/作废结果');
  }
  if (payload.action === 'finish' && currentStatus === 'finished') {
    throw new BadRequestException('发票已完成，无需重复确认');
  }
  if (payload.action === 'update_shipping' && currentStatus === 'finished') {
    return;
  }
  if (payload.action === 'update_shipping' && currentStatus !== 'issued' && currentStatus !== 'sending') {
    throw new BadRequestException('只有已开票或寄送中的发票可以更新寄送信息');
  }
  if (payload.action === 'finish' && currentStatus !== 'issued' && currentStatus !== 'sending') {
    throw new BadRequestException('只有已开票或寄送中的发票可以确认完成');
  }
}

function validateBillingBillAction(current: BillingActionRow, payload: BillingBillActionPayload): void {
  const totalAmount = Number(current.total_amount ?? 0);
  const discountAmount = Number(current.discount_amount ?? 0);
  const payableAmount = Number(current.payable_amount ?? 0);
  const paidAmount = Number(current.paid_amount ?? 0);
  const invoicedAmount = Number(current.invoiced_amount ?? 0);

  if (payload.action !== 'create_adjustment' && payload.action !== 'create_supplement' && current.bill_status === 'cancelled') {
    throw new BadRequestException('已取消账单不能继续处理');
  }
  if (payload.action === 'cancel') {
    if (paidAmount > 0) {
      throw new BadRequestException('已有收款的账单不能直接作废，请先走退款或调整流程');
    }
    if (invoicedAmount > 0) {
      throw new BadRequestException('已有有效发票的账单不能直接作废，请先完成红冲/作废登记');
    }
  }
  if (payload.action === 'discount') {
    const nextDiscountAmount = discountAmount + payload.discountAmount;
    const nextPayableAmount = Math.max(0, totalAmount - nextDiscountAmount);

    if (totalAmount <= 0) {
      throw new BadRequestException('零金额账单不需要应收减免');
    }
    if (payload.discountAmount > payableAmount + 0.01) {
      throw new BadRequestException(`减免金额不能超过当前应收 ${payableAmount.toFixed(2)}`);
    }
    if (nextPayableAmount + 0.01 < paidAmount) {
      throw new BadRequestException(`减免后应收不能低于已收 ${paidAmount.toFixed(2)}`);
    }
    if (nextPayableAmount + 0.01 < invoicedAmount) {
      throw new BadRequestException(`减免后应收不能低于已开票 ${invoicedAmount.toFixed(2)}`);
    }
  }
  if (payload.action === 'mark_overdue' && current.bill_status === 'paid') {
    throw new BadRequestException('已结清账单不能标记逾期');
  }
}

function tierNameForPlan(planCode: string | null, planName: string | null): string | null {
  if (!planCode || !planName) return null;
  if (planCode === 'starter') return 'Free';
  if (planCode === 'growth') return 'Pro';
  if (planCode === 'enterprise') return 'Enterprise';
  return planName;
}

function mapBillingRow(row: BillingRow): BillingRecord {
  return {
    id: row.id,
    billNo: row.bill_no,
    tenantId: row.tenant_id,
    tenantCode: row.tenant_code,
    tenantName: row.display_name ?? row.tenant_name,
    tenantType: row.tenant_type,
    region: [row.province, row.city].filter(Boolean).join(' / ') || '未设置',
    industry: row.industry ?? '未设置',
    subscriptionId: row.subscription_id,
    orderNo: row.order_no,
    servicePlanName: row.plan_name,
    tierName: tierNameForPlan(row.plan_code, row.plan_name),
    billCycle: row.bill_cycle,
    cycleStartDate: toIso(row.cycle_start_date),
    cycleEndDate: toIso(row.cycle_end_date),
    billStatus: normalizeBillStatus(row.bill_status),
    billType: normalizeBillType(row.bill_type),
    invoiceStatus: normalizeInvoiceStatus(row.invoice_status),
    invoiceNo: row.invoice_no,
    totalAmount: Number(row.total_amount ?? 0),
    discountAmount: Number(row.discount_amount ?? 0),
    payableAmount: Number(row.payable_amount ?? 0),
    paidAmount: Number(row.paid_amount ?? 0),
    invoicedAmount: Number(row.invoiced_amount ?? 0),
    currency: row.currency ?? 'CNY',
    paymentMethod: row.payment_method,
    transactionNo: row.transaction_no,
    operationRemark: row.operate_remark,
    operatorName: row.operator_display_name ?? row.operator_username ?? '系统',
    paidAt: nullableIso(row.paid_at),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapBillingItemRow(row: BillingItemRow): OrderInvoiceItemRecord {
  return {
    id: row.id,
    itemName: row.item_name,
    itemType: row.item_type,
    itemUnit: row.item_unit,
    quantity: Number(row.quantity ?? 0),
    unitPrice: Number(row.unit_price ?? 0),
    totalAmount: Number(row.total_amount ?? 0),
    remark: row.remark,
  };
}

function normalizePaymentRowStatus(value: string): OrderPaymentStatus {
  if (value === 'pending_verify' || value === 'paid' || value === 'failed' || value === 'closed' || value === 'refunding' || value === 'pending') {
    return value;
  }
  return 'pending';
}

function normalizePaymentTypeSource(value: string): OrderPaySource {
  return value === 'offline' ? 'offline' : 'online';
}

function mapPaymentRow(row: BillingPaymentRow): OrderPaymentRecord {
  return {
    id: row.id,
    paymentNo: row.pay_order_no,
    paySource: normalizePaymentTypeSource(row.pay_source),
    payMethod: row.pay_method,
    offlinePayType: row.offline_pay_type === 'bank_transfer' || row.offline_pay_type === 'cash' || row.offline_pay_type === 'other' ? row.offline_pay_type : null,
    offlinePayerName: row.offline_payer_name,
    paidAmount: Number(row.paid_amount ?? 0),
    currency: row.currency ?? 'CNY',
    paymentStatus: normalizePaymentRowStatus(row.pay_status),
    paidAt: nullableIso(row.paid_at),
    operatorName: row.operator_display_name ?? row.operator_username ?? '系统',
    remark: row.operate_remark ?? row.status_msg,
  };
}

function mapReceiptRow(row: BillingReceiptRow): BillingInvoiceReceiptRecord {
  return {
    id: row.id,
    invoiceNo: row.invoice_no,
    invoiceType: normalizeInvoiceType(row.invoice_type),
    invoiceTaxType: normalizeInvoiceTaxType(row.invoice_tax_type),
    invoiceTitle: row.invoice_title,
    taxNo: row.tax_no,
    invoiceAmount: Number(row.invoice_amount ?? 0),
    taxAmount: Number(row.tax_amount ?? 0),
    currency: row.currency ?? 'CNY',
    invoiceStatus: normalizeInvoiceStatus(row.invoice_status),
    statusRemark: row.status_remark,
    invoiceCode: row.invoice_code,
    invoiceElectronicNo: row.invoice_electronic_no,
    invoiceFileUrl: row.invoice_file_url,
    issuedAt: nullableIso(row.issued_at),
    expressCompany: row.express_company,
    expressNo: row.express_no,
    sendAt: nullableIso(row.send_at),
    auditorName: row.auditor_display_name ?? row.auditor_username ?? '系统',
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function billStatusTitle(status: BillingBillStatus): string {
  if (status === 'paid') return '账单已收款';
  if (status === 'partial') return '账单部分收款';
  if (status === 'paying') return '账单支付中';
  if (status === 'overdue') return '账单逾期';
  if (status === 'cancelled') return '账单已取消';
  return '账单待收款';
}

function buildBillingTimeline(
  row: BillingRow,
  record: BillingRecord,
  payments: OrderPaymentRecord[],
  receipts: BillingInvoiceReceiptRecord[],
): BillingOperationEvent[] {
  const paymentEvents: BillingOperationEvent[] = payments.map((payment) => ({
    id: payment.id,
    title: payment.paymentStatus === 'paid' ? '收款记录' : '支付记录',
    description: `${payment.paySource === 'offline' ? '线下' : '线上'}收款 ${payment.paidAmount.toFixed(2)} ${payment.currency}${payment.remark ? `，${payment.remark}` : ''}`,
    actor: payment.operatorName,
    at: payment.paidAt ?? record.updatedAt,
    tone: payment.paymentStatus === 'paid' ? 'success' : payment.paymentStatus === 'failed' ? 'danger' : 'warning',
  }));
  const receiptEvents: BillingOperationEvent[] = receipts.map((receipt) => ({
    id: receipt.id,
    title: receipt.invoiceStatus === 'red'
      ? '发票红冲'
      : receipt.invoiceStatus === 'rejected'
        ? '发票驳回'
        : receipt.invoiceStatus === 'sending'
          ? '发票寄送'
          : receipt.invoiceStatus === 'finished'
            ? '发票完成'
            : '发票登记',
    description: `线下发票 ${receipt.invoiceNo} 已登记，金额 ${receipt.invoiceAmount.toFixed(2)} ${receipt.currency}${receipt.statusRemark ? `，${receipt.statusRemark}` : ''}`,
    actor: receipt.auditorName,
    at: receipt.issuedAt ?? receipt.createdAt,
    tone: receipt.invoiceStatus === 'red' || receipt.invoiceStatus === 'rejected' ? 'danger' : 'success',
  }));

  const currentTone: BillingOperationEvent['tone'] =
    record.billStatus === 'paid'
      ? 'success'
      : record.billStatus === 'unpaid' || record.billStatus === 'paying' || record.billStatus === 'partial'
        ? 'warning'
        : record.billStatus === 'cancelled'
          ? 'neutral'
          : 'danger';

  const events: BillingOperationEvent[] = [
    {
      id: `${record.id}:created`,
      title: '账单生成',
      description: `${record.tenantName} 生成账单 ${record.billNo}，应收 ${record.payableAmount.toFixed(2)} ${record.currency}。`,
      actor: record.operatorName,
      at: toIso(row.created_at),
      tone: 'neutral',
    },
    ...paymentEvents,
    ...receiptEvents,
    {
      id: `${record.id}:current`,
      title: billStatusTitle(record.billStatus),
      description: `当前已收 ${record.paidAmount.toFixed(2)}，已开票 ${record.invoicedAmount.toFixed(2)}。${record.operationRemark ? ` ${record.operationRemark}` : ''}`,
      actor: '系统',
      at: record.updatedAt,
      tone: currentTone,
    },
  ];

  return events.sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime());
}

interface SyncOfflineInvoiceBody {
  invoiceNo?: unknown;
  invoiceType?: unknown;
  invoiceTaxType?: unknown;
  invoiceTitle?: unknown;
  taxNo?: unknown;
  invoiceAmount?: unknown;
  taxAmount?: unknown;
  invoiceStatus?: unknown;
  statusRemark?: unknown;
  invoiceCode?: unknown;
  invoiceElectronicNo?: unknown;
  invoiceFileUrl?: unknown;
  issuedAt?: unknown;
  expressCompany?: unknown;
  expressNo?: unknown;
  sendAt?: unknown;
}

interface InvoiceReceiptActionBody {
  action?: unknown;
  statusRemark?: unknown;
  expressCompany?: unknown;
  expressNo?: unknown;
  sendAt?: unknown;
}

interface BillingBillActionBody {
  action?: unknown;
  reason?: unknown;
  discountAmount?: unknown;
  amount?: unknown;
  itemName?: unknown;
  cycleStartDate?: unknown;
  cycleEndDate?: unknown;
}

interface SyncOfflineInvoicePayload {
  invoiceNo: string;
  invoiceType: BillingInvoiceType;
  invoiceTaxType: BillingInvoiceTaxType;
  invoiceTitle: string;
  taxNo: string | null;
  invoiceAmount: number;
  taxAmount: number;
  invoiceStatus: Exclude<BillingInvoiceStatus, 'none' | 'applying' | 'auditing' | 'rejected' | 'red'>;
  statusRemark: string;
  invoiceCode: string | null;
  invoiceElectronicNo: string | null;
  invoiceFileUrl: string | null;
  issuedAt: Date;
  expressCompany: string | null;
  expressNo: string | null;
  sendAt: Date | null;
}

interface InvoiceReceiptActionPayload {
  action: BillingInvoiceReceiptAction;
  nextStatus: Exclude<BillingInvoiceStatus, 'none' | 'applying' | 'auditing' | 'rejected'>;
  statusRemark: string;
  expressCompany: string | null;
  expressNo: string | null;
  sendAt: Date | null;
}

interface BillingBillActionPayload {
  action: BillingBillAction;
  reason: string;
  discountAmount: number;
  amount: number;
  itemName: string | null;
  cycleStartDate: Date;
  cycleEndDate: Date;
}

interface BillingRow {
  id: string;
  bill_no: string;
  tenant_id: string;
  tenant_code: string;
  tenant_name: string;
  display_name: string | null;
  tenant_type: 'company' | 'individual';
  province: string | null;
  city: string | null;
  industry: string | null;
  subscription_id: string | null;
  order_no: string | null;
  plan_code: string | null;
  plan_name: string | null;
  bill_cycle: string;
  cycle_start_date: Date | string;
  cycle_end_date: Date | string;
  total_amount: string | number | null;
  discount_amount: string | number | null;
  payable_amount: string | number | null;
  paid_amount: string | number | null;
  currency: string | null;
  bill_status: string;
  bill_type: string | null;
  payment_method: string | null;
  transaction_no: string | null;
  operate_remark: string | null;
  paid_at: Date | string | null;
  invoice_no: string | null;
  invoice_status: string | null;
  invoiced_amount: string | number | null;
  operator_username: string | null;
  operator_display_name: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface BillingItemRow {
  id: string;
  item_name: string;
  item_type: string;
  item_unit: string | null;
  quantity: string | number | null;
  unit_price: string | number | null;
  total_amount: string | number | null;
  remark: string | null;
}

interface BillingPaymentRow {
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

interface BillingReceiptRow {
  id: string;
  invoice_no: string;
  invoice_type: string;
  invoice_tax_type: string;
  invoice_title: string;
  tax_no: string | null;
  invoice_amount: string | number | null;
  tax_amount: string | number | null;
  currency: string | null;
  invoice_status: string;
  status_remark: string | null;
  invoice_code: string | null;
  invoice_electronic_no: string | null;
  invoice_file_url: string | null;
  issued_at: Date | string | null;
  express_company: string | null;
  express_no: string | null;
  send_at: Date | string | null;
  auditor_username: string | null;
  auditor_display_name: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface BillingActionRow {
  id: string;
  bill_no: string;
  tenant_id: string;
  subscription_id: string | null;
  total_amount: string | number;
  discount_amount: string | number;
  payable_amount: string | number;
  paid_amount: string | number;
  currency: string | null;
  bill_status: string;
  invoiced_amount: string | number;
}

interface BillingReceiptActionRow {
  id: string;
  bill_id: string;
  bill_status: string;
  invoice_status: string;
}

const BILLING_SQL = `
  select
    bill.id,
    bill.bill_no,
    bill.tenant_id,
    t.tenant_code,
    t.tenant_name,
    t.display_name,
    t.tenant_type,
    org.province,
    org.city,
    org.industry,
    bill.subscription_id,
    sub.order_no,
    plan.plan_code,
    plan.plan_name,
    bill.bill_cycle,
    bill.cycle_start_date,
    bill.cycle_end_date,
    bill.total_amount,
    bill.discount_amount,
    bill.payable_amount,
    bill.paid_amount,
    bill.currency,
    bill.bill_status,
    bill.bill_type,
    bill.payment_method,
    bill.transaction_no,
    bill.operate_remark,
    bill.paid_at,
    receipt.invoice_no,
    receipt.invoice_status,
    coalesce(receipt_sum.invoiced_amount, 0) as invoiced_amount,
    operator.username as operator_username,
    operator_profile.display_name as operator_display_name,
    bill.created_at,
    bill.updated_at
  from commerce.tenant_invoice bill
  join tenant.tenant t
    on t.id = bill.tenant_id
   and t.deleted_at is null
  left join tenant.tenant_organization org
    on org.tenant_id = t.id
   and org.deleted_at is null
  left join commerce.tenant_subscription sub
    on sub.id = bill.subscription_id
   and sub.deleted_at is null
  left join product.plan plan
    on plan.id = sub.plan_id
   and plan.deleted_at is null
  left join lateral (
    select r.invoice_no, r.invoice_status
    from commerce.tenant_invoice_receipt r
    where r.bill_id = bill.id
      and r.deleted_at is null
    order by r.updated_at desc, r.created_at desc
    limit 1
  ) receipt on true
  left join lateral (
    select coalesce(sum(r.invoice_amount) filter (where r.invoice_status not in ('red', 'rejected')), 0) as invoiced_amount
    from commerce.tenant_invoice_receipt r
    where r.bill_id = bill.id
      and r.deleted_at is null
  ) receipt_sum on true
  left join identity.account operator
    on operator.id = bill.operator_id
  left join identity.account_profile operator_profile
    on operator_profile.account_id = operator.id
  where bill.deleted_at is null
  order by
    case bill.bill_status
      when 'overdue' then 1
      when 'unpaid' then 2
      when 'partial' then 3
      when 'paying' then 4
      when 'paid' then 5
      when 'cancelled' then 6
      else 7
    end,
    bill.updated_at desc,
    t.tenant_code asc
`;

const BILLING_ITEM_SQL = `
  select
    id,
    item_name,
    item_type,
    item_unit,
    quantity,
    unit_price,
    total_amount,
    remark
  from commerce.tenant_invoice_item
  where bill_id = $1
    and deleted_at is null
  order by created_at asc, item_name asc
`;

const BILLING_PAYMENT_SQL = `
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
  left join identity.account operator
    on operator.id = pay.operator_id
  left join identity.account_profile operator_profile
    on operator_profile.account_id = operator.id
  where pay.bill_id = $1
  order by pay.created_at desc
`;

const BILLING_RECEIPT_SQL = `
  select
    receipt.id,
    receipt.invoice_no,
    receipt.invoice_type,
    receipt.invoice_tax_type,
    receipt.invoice_title,
    receipt.tax_no,
    receipt.invoice_amount,
    receipt.tax_amount,
    receipt.currency,
    receipt.invoice_status,
    receipt.status_remark,
    receipt.invoice_code,
    receipt.invoice_electronic_no,
    receipt.invoice_file_url,
    receipt.issued_at,
    receipt.express_company,
    receipt.express_no,
    receipt.send_at,
    auditor.username as auditor_username,
    auditor_profile.display_name as auditor_display_name,
    receipt.created_at,
    receipt.updated_at
  from commerce.tenant_invoice_receipt receipt
  left join identity.account auditor
    on auditor.id = receipt.auditor_id
  left join identity.account_profile auditor_profile
    on auditor_profile.account_id = auditor.id
  where receipt.bill_id = $1
    and receipt.deleted_at is null
  order by receipt.created_at desc
`;

const BILLING_ACTION_LOOKUP_SQL = `
  select
    bill.id,
    bill.bill_no,
    bill.tenant_id,
    bill.subscription_id,
    bill.total_amount,
    bill.discount_amount,
    bill.payable_amount,
    bill.paid_amount,
    bill.currency,
    bill.bill_status,
    coalesce(receipt_sum.invoiced_amount, 0) as invoiced_amount
  from commerce.tenant_invoice bill
  left join lateral (
    select coalesce(sum(r.invoice_amount) filter (where r.invoice_status not in ('red', 'rejected')), 0) as invoiced_amount
    from commerce.tenant_invoice_receipt r
    where r.bill_id = bill.id
      and r.deleted_at is null
  ) receipt_sum on true
  where bill.id = $1
    and bill.deleted_at is null
  for update of bill
`;

const BILLING_CANCEL_SQL = `
  update commerce.tenant_invoice
  set
    bill_status = 'cancelled',
    operator_id = $2,
    operate_remark = $3,
    updated_by = $2,
    updated_at = now()
  where id = $1
`;

const BILLING_DISCOUNT_SQL = `
  update commerce.tenant_invoice
  set
    discount_amount = coalesce(discount_amount, 0) + $2,
    payable_amount = greatest(0, total_amount - (coalesce(discount_amount, 0) + $2)),
    bill_status = case
      when greatest(0, total_amount - (coalesce(discount_amount, 0) + $2)) <= coalesce(paid_amount, 0) then 'paid'
      when coalesce(paid_amount, 0) > 0 then 'partial'
      when bill_status = 'overdue' then 'overdue'
      else 'unpaid'
    end,
    operator_id = $3,
    operate_remark = $4,
    updated_by = $3,
    updated_at = now()
  where id = $1
`;

const BILLING_MARK_OVERDUE_SQL = `
  update commerce.tenant_invoice
  set
    bill_status = 'overdue',
    operator_id = $2,
    operate_remark = $3,
    updated_by = $2,
    updated_at = now()
  where id = $1
`;

const BILLING_CREATE_EXCEPTION_BILL_SQL = `
  with created_bill as (
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
      concat(case when $3 = 'adjust' then 'BILL-ADJ-' else 'BILL-SUP-' end, to_char(now(), 'YYYYMMDDHH24MISSMS'), '-', substr(gen_random_uuid()::text, 1, 8)),
      $2,
      'once',
      $7,
      $8,
      $5,
      0,
      $5,
      0,
      $6,
      'unpaid',
      $3,
      $9,
      $10,
      $9,
      $9
    )
    returning id, tenant_id, subscription_id
  )
  insert into commerce.tenant_invoice_item (
    bill_id,
    tenant_id,
    subscription_id,
    item_name,
    item_type,
    item_unit,
    quantity,
    unit_price,
    total_amount,
    remark
  )
  select
    id,
    tenant_id,
    subscription_id,
    coalesce($4, case when $3 = 'adjust' then '运营调整单' else '运营补录单' end),
    $3,
    '项',
    1,
    $5,
    $5,
    $10
  from created_bill
  returning bill_id as id
`;

const BILLING_RECEIPT_ACTION_LOOKUP_SQL = `
  select
    receipt.id,
    receipt.bill_id,
    bill.bill_status,
    receipt.invoice_status
  from commerce.tenant_invoice_receipt receipt
  join commerce.tenant_invoice bill
    on bill.id = receipt.bill_id
   and bill.deleted_at is null
  where receipt.bill_id = $1
    and receipt.id = $2
    and receipt.deleted_at is null
  for update of receipt, bill
`;

const BILLING_RECEIPT_ACTION_UPDATE_SQL = `
  update commerce.tenant_invoice_receipt
  set
    invoice_status = case
      when invoice_status = 'finished' and $2 = 'sending' then invoice_status
      else $2
    end,
    status_remark = $3,
    express_company = coalesce($4, express_company),
    express_no = coalesce($5, express_no),
    send_at = coalesce($6, send_at),
    auditor_id = $7,
    audit_at = now(),
    updated_at = now()
  where id = $1
`;

const BILLING_OFFLINE_INVOICE_UPSERT_SQL = `
  insert into commerce.tenant_invoice_receipt (
    tenant_id,
    bill_id,
    invoice_no,
    invoice_type,
    invoice_tax_type,
    invoice_title,
    tax_no,
    company_info,
    invoice_amount,
    tax_amount,
    currency,
    invoice_status,
    status_remark,
    invoice_code,
    invoice_electronic_no,
    invoice_file_url,
    issued_at,
    express_company,
    express_no,
    send_at,
    created_by,
    auditor_id,
    audit_at
  ) values (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8::jsonb,
    $9,
    $10,
    $11,
    $12,
    $13,
    $14,
    $15,
    $16,
    $17,
    $18,
    $19,
    $20,
    $21,
    $21,
    now()
  )
  on conflict (invoice_no) do update
  set
    invoice_type = excluded.invoice_type,
    invoice_tax_type = excluded.invoice_tax_type,
    invoice_title = excluded.invoice_title,
    tax_no = excluded.tax_no,
    company_info = excluded.company_info,
    invoice_amount = excluded.invoice_amount,
    tax_amount = excluded.tax_amount,
    currency = excluded.currency,
    invoice_status = excluded.invoice_status,
    status_remark = excluded.status_remark,
    invoice_code = excluded.invoice_code,
    invoice_electronic_no = excluded.invoice_electronic_no,
    invoice_file_url = excluded.invoice_file_url,
    issued_at = excluded.issued_at,
    express_company = excluded.express_company,
    express_no = excluded.express_no,
    send_at = excluded.send_at,
    auditor_id = excluded.auditor_id,
    audit_at = now(),
    updated_at = now(),
    deleted_at = null
  where commerce.tenant_invoice_receipt.bill_id = excluded.bill_id
  returning id
`;
