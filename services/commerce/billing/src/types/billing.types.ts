/**
 * billing.types.ts - 计费管理领域类型定义
 * @package @vxture/service-billing
 *
 * Description: 包含计费管理相关的所有类型定义
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @layer Domain
 * @category Types
 */

// ============================================================================
// Enums
// ============================================================================

// 计费周期
export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  ONCE = 'once'
}

// 发票状态
export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

// 支付状态
export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

// 支付方式
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  ALIPAY = 'alipay',
  WECHAT_PAY = 'wechat_pay',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash'
}

// ============================================================================
// Domain Types
// ============================================================================

// 订单项类型
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
}

// 发票类型
export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  dueDate: Date;
  paidDate?: Date;
  lineItems: LineItem[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 支付记录类型
export interface Payment {
  id: string;
  tenantId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 订阅类型
export interface Subscription {
  id: string;
  tenantId: string;
  customerId: string;
  planId: string;
  planName: string;
  cycle: BillingCycle;
  price: number;
  currency: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  nextBillingDate: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Query Params
// ============================================================================

// 发票查询参数类型
export interface InvoiceQueryParams {
  tenantId?: string;
  customerId?: string;
  search?: string;
  status?: InvoiceStatus;
  period?: BillingPeriod;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

// 支付查询参数类型
export interface PaymentQueryParams {
  tenantId?: string;
  invoiceId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

// 订阅查询参数类型
export interface SubscriptionQueryParams {
  tenantId?: string;
  customerId?: string;
  status?: Subscription['status'];
  page?: number;
  limit?: number;
}

export type BillingPeriod = '7d' | '30d' | '90d' | '1y';

export interface BillingStatsQuery {
  tenantId?: string;
  customerId?: string;
  period?: BillingPeriod;
}

export interface QueryInvoicesParams extends InvoiceQueryParams {
  limit?: number;
}

export interface CreateInvoiceInput {
  tenantId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  lineItems: Omit<LineItem, 'id' | 'amount' | 'taxAmount'>[];
  currency?: string;
  dueDate?: Date;
  notes?: string;
}

export interface ProcessPaymentInput {
  tenantId?: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  currency?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface BillingStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  activeSubscriptions: number;
}
