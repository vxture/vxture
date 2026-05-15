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
  BillingInvoiceLedgerRecord,
  BillingInvoiceStatus,
  BillingInvoiceTaxType,
  BillingInvoiceType,
  RequestContext,
} from '../types/console.types';

@Controller('api/invoices')
export class InvoicesRouter implements OnModuleDestroy {
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
  async listInvoices(@Req() req: Request & RequestContext): Promise<BillingInvoiceLedgerRecord[]> {
    assertCanManageInvoices(req);

    if (!this.pool) {
      throw new BadGatewayException('Invoice database is not configured');
    }

    const rows = await this.pool.query<InvoiceLedgerRow>(INVOICE_LEDGER_SQL);
    return rows.rows.map(mapInvoiceLedgerRow);
  }
}

function assertCanManageInvoices(req: Request & RequestContext): void {
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

function normalizeInvoiceType(value: string | null): BillingInvoiceType {
  if (value === 'special_vat' || value === 'normal_vat' || value === 'electronic' || value === 'paper') return value;
  return 'other';
}

function normalizeInvoiceTaxType(value: string | null): BillingInvoiceTaxType {
  if (value === 'enterprise' || value === 'individual' || value === 'government') return value;
  return 'other';
}

function tierNameForPlan(planCode: string | null, planName: string | null): string | null {
  if (!planCode || !planName) return null;
  if (planCode === 'starter') return 'Free';
  if (planCode === 'growth') return 'Pro';
  if (planCode === 'enterprise') return 'Enterprise';
  return planName;
}

function mapInvoiceLedgerRow(row: InvoiceLedgerRow): BillingInvoiceLedgerRecord {
  return {
    id: row.id,
    billId: row.bill_id,
    invoiceNo: row.invoice_no,
    invoiceType: normalizeInvoiceType(row.invoice_type),
    invoiceTaxType: normalizeInvoiceTaxType(row.invoice_tax_type),
    invoiceTitle: row.invoice_title,
    taxNo: row.tax_no,
    invoiceAmount: Number(row.invoice_amount ?? 0),
    taxAmount: Number(row.tax_amount ?? 0),
    currency: row.currency ?? row.bill_currency ?? 'CNY',
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
    billNo: row.bill_no,
    billStatus: normalizeBillStatus(row.bill_status),
    billType: normalizeBillType(row.bill_type),
    billPayableAmount: Number(row.payable_amount ?? 0),
    billPaidAmount: Number(row.paid_amount ?? 0),
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
    sourceLabel: 'offline',
  };
}

interface InvoiceLedgerRow {
  id: string;
  bill_id: string;
  invoice_no: string;
  invoice_type: string | null;
  invoice_tax_type: string | null;
  invoice_title: string;
  tax_no: string | null;
  invoice_amount: string | number | null;
  tax_amount: string | number | null;
  currency: string | null;
  invoice_status: string | null;
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
  bill_no: string;
  bill_status: string;
  bill_type: string | null;
  payable_amount: string | number | null;
  paid_amount: string | number | null;
  bill_currency: string | null;
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
}

const INVOICE_LEDGER_SQL = `
  select
    receipt.id,
    receipt.bill_id,
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
    receipt.updated_at,
    bill.bill_no,
    bill.bill_status,
    bill.bill_type,
    bill.payable_amount,
    bill.paid_amount,
    bill.currency as bill_currency,
    t.id as tenant_id,
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
    plan.plan_name
  from commerce.tenant_invoice_receipt receipt
  join commerce.tenant_invoice bill
    on bill.id = receipt.bill_id
   and bill.deleted_at is null
  join tenant.tenant t
    on t.id = receipt.tenant_id
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
  left join identity.account auditor
    on auditor.id = receipt.auditor_id
  left join identity.account_profile auditor_profile
    on auditor_profile.account_id = auditor.id
  where receipt.deleted_at is null
  order by
    case receipt.invoice_status
      when 'sending' then 1
      when 'issued' then 2
      when 'applying' then 3
      when 'auditing' then 4
      when 'rejected' then 5
      when 'red' then 6
      when 'finished' then 7
      else 8
    end,
    receipt.updated_at desc,
    receipt.invoice_no asc
`;
