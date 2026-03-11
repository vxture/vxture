/**
 * billing.repository.ts - 计费管理数据访问层
 * @package @vxture/service-billing
 *
 * Description: 提供计费数据的存储和查询操作
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @layer Domain
 * @category Repository
 */

import type {
  Invoice,
  Payment,
  Subscription,
  CreateInvoiceInput,
  ProcessPaymentInput,
  InvoiceQueryParams,
  PaymentQueryParams,
  SubscriptionQueryParams
} from '../types/billing.types';
import { InvoiceStatus, PaymentStatus, PaymentMethod, BillingCycle } from '../types/billing.types';

// 模拟数据生成函数
const generateInvoiceNumber = (): string => {
  return `INV-${Date.now()}`;
};

// 模拟发票数据
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2026-001',
    customerId: 'cust001',
    customerName: '测试客户',
    customerEmail: 'customer@example.com',
    status: InvoiceStatus.PAID,
    subtotal: 1000,
    taxAmount: 100,
    totalAmount: 1100,
    currency: 'CNY',
    dueDate: new Date('2026-03-15'),
    paidDate: new Date('2026-03-05'),
    lineItems: [
      {
        id: 'li1',
        description: '月度服务费',
        quantity: 1,
        unitPrice: 1000,
        amount: 1000,
        taxRate: 0.1,
        taxAmount: 100
      }
    ],
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-05')
  }
];

// 模拟支付数据
const mockPayments: Payment[] = [
  {
    id: '1',
    invoiceId: '1',
    amount: 1100,
    currency: 'CNY',
    method: PaymentMethod.CREDIT_CARD,
    status: PaymentStatus.SUCCESS,
    transactionId: 'txn_001',
    paymentDate: new Date('2026-03-05'),
    createdAt: new Date('2026-03-05'),
    updatedAt: new Date('2026-03-05')
  }
];

// 模拟订阅数据
const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    customerId: 'cust001',
    planId: 'plan-pro',
    planName: '专业版',
    cycle: BillingCycle.MONTHLY,
    price: 999,
    currency: 'CNY',
    status: 'active',
    startDate: new Date('2026-01-01'),
    nextBillingDate: new Date('2026-04-01'),
    autoRenew: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-03-01')
  }
];

// 计费仓库类
export class BillingRepository {
  private invoices: Invoice[];
  private payments: Payment[];
  private subscriptions: Subscription[];

  constructor() {
    this.invoices = [...mockInvoices];
    this.payments = [...mockPayments];
    this.subscriptions = [...mockSubscriptions];
  }

  // 发票相关操作
  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    // 计算金额
    const lineItems = input.lineItems.map((item, index) => {
      const amount = item.quantity * item.unitPrice;
      const taxRate = item.taxRate || 0;
      const taxAmount = amount * taxRate;
      return {
        ...item,
        id: `li-${Date.now()}-${index}`,
        amount,
        taxAmount
      };
    });

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = lineItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    const totalAmount = subtotal + taxAmount;

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      customerId: input.customerId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      status: InvoiceStatus.DRAFT,
      subtotal,
      taxAmount,
      totalAmount,
      currency: input.currency || 'CNY',
      dueDate: input.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lineItems,
      notes: input.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.invoices.push(newInvoice);
    return newInvoice;
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    return this.invoices.find(invoice => invoice.id === id) || null;
  }

  async getInvoices(params: InvoiceQueryParams = {}): Promise<Invoice[]> {
    let results = [...this.invoices];

    if (params.customerId) {
      results = results.filter(invoice => invoice.customerId === params.customerId);
    }

    if (params.status) {
      results = results.filter(invoice => invoice.status === params.status);
    }

    // 分页
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return results.slice(startIndex, endIndex);
  }

  async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice | null> {
    const index = this.invoices.findIndex(invoice => invoice.id === id);

    if (index === -1) {
      return null;
    }

    this.invoices[index] = {
      ...this.invoices[index],
      status,
      updatedAt: new Date(),
      ...(status === InvoiceStatus.PAID ? { paidDate: new Date() } : {})
    };

    return this.invoices[index];
  }

  // 支付相关操作
  async createPayment(input: ProcessPaymentInput): Promise<Payment> {
    const newPayment: Payment = {
      id: Date.now().toString(),
      invoiceId: input.invoiceId,
      amount: input.amount,
      currency: input.currency || 'CNY',
      method: input.method,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.payments.push(newPayment);
    return newPayment;
  }

  async updatePaymentStatus(id: string, status: PaymentStatus, transactionId?: string, failureReason?: string): Promise<Payment | null> {
    const index = this.payments.findIndex(payment => payment.id === id);

    if (index === -1) {
      return null;
    }

    this.payments[index] = {
      ...this.payments[index],
      status,
      transactionId,
      failureReason,
      ...(status === PaymentStatus.SUCCESS ? { paymentDate: new Date() } : {}),
      updatedAt: new Date()
    };

    return this.payments[index];
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return this.payments.find(payment => payment.id === id) || null;
  }

  async getPayments(params: PaymentQueryParams = {}): Promise<Payment[]> {
    let results = [...this.payments];

    if (params.invoiceId) {
      results = results.filter(payment => payment.invoiceId === params.invoiceId);
    }

    if (params.status) {
      results = results.filter(payment => payment.status === params.status);
    }

    if (params.method) {
      results = results.filter(payment => payment.method === params.method);
    }

    return results;
  }

  // 订阅相关操作
  async getSubscriptionById(id: string): Promise<Subscription | null> {
    return this.subscriptions.find(sub => sub.id === id) || null;
  }

  async getSubscriptionsByCustomerId(customerId: string): Promise<Subscription[]> {
    return this.subscriptions.filter(sub => sub.customerId === customerId);
  }

  async getSubscriptions(params: SubscriptionQueryParams = {}): Promise<Subscription[]> {
    let results = [...this.subscriptions];

    if (params.customerId) {
      results = results.filter(sub => sub.customerId === params.customerId);
    }

    if (params.status) {
      results = results.filter(sub => sub.status === params.status);
    }

    return results;
  }
}

// 导出单例实例
export const billingRepository = new BillingRepository();
