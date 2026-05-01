/**
 * billing.service.ts - 计费管理业务逻辑层
 * @package @vxture/service-billing
 *
 * Description: 实现计费管理的核心业务逻辑
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @layer Domain
 * @category Service
 */

import type {
  Invoice,
  Payment,
  Subscription,
  CreateInvoiceInput,
  ProcessPaymentInput,
  InvoiceQueryParams,
  PaymentQueryParams,
  SubscriptionQueryParams,
  BillingStats,
  BillingStatsQuery,
  QueryInvoicesParams
} from '../types/billing.types';
import { InvoiceStatus, PaymentStatus } from '../types/billing.types';
import { billingRepository } from '../repository/billing.repository';

// 计费服务类
export class BillingService {
  /**
   * 创建发票
   * @param input 创建发票输入参数
   * @returns 新创建的发票
   * @throws {Error} 当输入参数验证失败时
   */
  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    if (!input.customerId || !input.customerName || !input.customerEmail) {
      throw new Error('客户信息不能为空');
    }

    if (!input.lineItems || input.lineItems.length === 0) {
      throw new Error('发票必须包含至少一个订单项');
    }

    for (const item of input.lineItems) {
      if (!item.description) {
        throw new Error('订单项描述不能为空');
      }
      if (item.quantity <= 0) {
        throw new Error('订单项数量必须大于0');
      }
      if (item.unitPrice <= 0) {
        throw new Error('订单项单价必须大于0');
      }
    }

    if (input.dueDate && input.dueDate < new Date()) {
      throw new Error('截止日期不能早于当前日期');
    }

    const invoice = await billingRepository.createInvoice(input);
    return invoice;
  }

  /**
   * 根据ID获取发票
   * @param id 发票ID
   * @returns 发票对象
   * @throws {Error} 当发票不存在时
   */
  async getInvoiceById(id: string): Promise<Invoice> {
    if (!id || id.trim().length === 0) {
      throw new Error('发票ID不能为空');
    }

    const invoice = await billingRepository.getInvoiceById(id);

    if (!invoice) {
      throw new Error('发票不存在');
    }

    return invoice;
  }

  /**
   * 获取发票列表
   * @param params 查询参数
   * @returns 发票列表
   */
  async getInvoices(params: InvoiceQueryParams = {}): Promise<Invoice[]> {
    const invoices = await billingRepository.getInvoices(params);
    return invoices;
  }

  async queryInvoices(params: QueryInvoicesParams = {}): Promise<Invoice[]> {
    const invoices = await billingRepository.getInvoices(normalizeBillingPeriod(params));
    return invoices;
  }

  /**
   * 发送发票
   * @param id 发票ID
   * @returns 更新后的发票
   * @throws {Error} 当发票状态不是草稿时
   */
  async sendInvoice(id: string): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error('只能发送草稿状态的发票');
    }

    const updatedInvoice = await billingRepository.updateInvoiceStatus(id, InvoiceStatus.PENDING);
    return updatedInvoice!;
  }

  /**
   * 标记发票为已支付
   * @param id 发票ID
   * @returns 更新后的发票
   * @throws {Error} 当发票状态不符合要求时
   */
  async markInvoiceAsPaid(id: string): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('发票已经是已支付状态');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error('已取消的发票无法标记为已支付');
    }

    const updatedInvoice = await billingRepository.updateInvoiceStatus(id, InvoiceStatus.PAID);
    return updatedInvoice!;
  }

  /**
   * 取消发票
   * @param id 发票ID
   * @returns 更新后的发票
   * @throws {Error} 当发票状态不符合要求时
   */
  async cancelInvoice(id: string, reason?: string): Promise<Invoice> {
    void reason;
    const invoice = await this.getInvoiceById(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('已支付的发票无法取消');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error('发票已经是取消状态');
    }

    const updatedInvoice = await billingRepository.updateInvoiceStatus(id, InvoiceStatus.CANCELLED);
    return updatedInvoice!;
  }

  /**
   * 处理支付
   * @param input 支付输入参数
   * @returns 支付记录
   * @throws {Error} 当输入参数验证失败或发票状态不符合要求时
   */
  async processPayment(input: ProcessPaymentInput): Promise<Payment> {
    if (!input.invoiceId || !input.amount || !input.method) {
      throw new Error('支付信息不完整');
    }

    if (input.amount <= 0) {
      throw new Error('支付金额必须大于0');
    }

    const invoice = await this.getInvoiceById(input.invoiceId);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('发票已经支付');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error('发票已取消');
    }

    const payment = await billingRepository.createPayment(input);
    await this.simulatePaymentProcessing(payment.id);

    return payment;
  }

  private async simulatePaymentProcessing(paymentId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      await billingRepository.updatePaymentStatus(
        paymentId,
        PaymentStatus.SUCCESS,
        `txn_${Date.now()}`
      );

      const payment = await billingRepository.getPaymentById(paymentId);
      if (payment) {
        await billingRepository.updateInvoiceStatus(payment.invoiceId, InvoiceStatus.PAID);
      }
    } else {
      await billingRepository.updatePaymentStatus(
        paymentId,
        PaymentStatus.FAILED,
        undefined,
        '支付失败，请重试'
      );
    }
  }

  /**
   * 根据ID获取支付记录
   * @param id 支付记录ID
   * @returns 支付记录
   * @throws {Error} 当支付记录不存在时
   */
  async getPaymentById(id: string): Promise<Payment> {
    if (!id || id.trim().length === 0) {
      throw new Error('支付记录ID不能为空');
    }

    const payment = await billingRepository.getPaymentById(id);

    if (!payment) {
      throw new Error('支付记录不存在');
    }

    return payment;
  }

  /**
   * 获取支付记录列表
   * @param params 查询参数
   * @returns 支付记录列表
   */
  async getPayments(params: PaymentQueryParams = {}): Promise<Payment[]> {
    const payments = await billingRepository.getPayments(params);
    return payments;
  }

  /**
   * 获取发票的支付记录
   * @param invoiceId 发票ID
   * @returns 支付记录列表
   * @throws {Error} 当发票ID为空时
   */
  async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    if (!invoiceId || invoiceId.trim().length === 0) {
      throw new Error('发票ID不能为空');
    }

    const payments = await billingRepository.getPayments({ invoiceId });
    return payments;
  }

  /**
   * 退款
   * @param paymentId 支付记录ID
   * @param reason 退款原因
   * @returns 更新后的支付记录
   * @throws {Error} 当支付记录状态不符合要求时
   */
  async refundPayment(paymentId: string, reason?: string): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new Error('只能退款已成功的支付');
    }

    const updatedPayment = await billingRepository.updatePaymentStatus(
      paymentId,
      PaymentStatus.REFUNDED,
      undefined,
      reason
    );

    await billingRepository.updateInvoiceStatus(payment.invoiceId, InvoiceStatus.OVERDUE);

    return updatedPayment!;
  }

  /**
   * 根据ID获取订阅
   * @param id 订阅ID
   * @returns 订阅对象
   * @throws {Error} 当订阅不存在时
   */
  async getSubscriptionById(id: string): Promise<Subscription> {
    if (!id || id.trim().length === 0) {
      throw new Error('订阅ID不能为空');
    }

    const subscription = await billingRepository.getSubscriptionById(id);

    if (!subscription) {
      throw new Error('订阅不存在');
    }

    return subscription;
  }

  /**
   * 获取客户的订阅列表
   * @param customerId 客户ID
   * @returns 订阅列表
   * @throws {Error} 当客户ID为空时
   */
  async getCustomerSubscriptions(customerId: string): Promise<Subscription[]> {
    if (!customerId || customerId.trim().length === 0) {
      throw new Error('客户ID不能为空');
    }

    const subscriptions = await billingRepository.getSubscriptionsByCustomerId(customerId);
    return subscriptions;
  }

  /**
   * 获取订阅列表
   * @param params 查询参数
   * @returns 订阅列表
   */
  async getSubscriptions(params: SubscriptionQueryParams = {}): Promise<Subscription[]> {
    const subscriptions = await billingRepository.getSubscriptions(params);
    return subscriptions;
  }

  /**
   * 暂停订阅
   * @param id 订阅ID
   * @returns 更新后的订阅
   * @throws {Error} 当订阅状态不符合要求时
   */
  async pauseSubscription(id: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status !== 'active') {
      throw new Error('只能暂停活跃的订阅');
    }

    return subscription!;
  }

  /**
   * 恢复订阅
   * @param id 订阅ID
   * @returns 更新后的订阅
   * @throws {Error} 当订阅状态不符合要求时
   */
  async resumeSubscription(id: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status !== 'paused') {
      throw new Error('只能恢复暂停的订阅');
    }

    return subscription!;
  }

  /**
   * 取消订阅
   * @param id 订阅ID
   * @param reason 取消原因
   * @returns 更新后的订阅
   * @throws {Error} 当订阅状态不符合要求时
   */
  async cancelSubscription(id: string, reason?: string): Promise<Subscription> {
    void reason;
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status === 'cancelled' || subscription.status === 'expired') {
      throw new Error('订阅已经是取消或过期状态');
    }

    return subscription!;
  }

  /**
   * 获取计费统计
   * @param customerId 客户ID（可选）
   * @returns 计费统计数据
   */
  async getBillingStats(customerId?: string): Promise<BillingStats> {
    const invoices = await billingRepository.getInvoices(customerId ? { customerId } : {});
    const subscriptions = await billingRepository.getSubscriptions(customerId ? { customerId } : {});

    const paidInvoices = invoices.filter(i => i.status === InvoiceStatus.PAID);
    const pendingInvoices = invoices.filter(i => i.status === InvoiceStatus.PENDING);
    const overdueInvoices = invoices.filter(i => i.status === InvoiceStatus.OVERDUE);
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

    return {
      totalInvoices: invoices.length,
      paidInvoices: paidInvoices.length,
      pendingInvoices: pendingInvoices.length,
      overdueInvoices: overdueInvoices.length,
      totalRevenue,
      activeSubscriptions
    };
  }

  async getBillingOverview(query: BillingStatsQuery = {}): Promise<BillingStats> {
    const params = normalizeBillingPeriod(query);
    const invoices = await billingRepository.getInvoices(params);
    const subscriptions = await billingRepository.getSubscriptions({
      tenantId: params.tenantId,
      customerId: params.customerId,
    });

    const paidInvoices = invoices.filter(i => i.status === InvoiceStatus.PAID);
    const pendingInvoices = invoices.filter(i => i.status === InvoiceStatus.PENDING);
    const overdueInvoices = invoices.filter(i => i.status === InvoiceStatus.OVERDUE);
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

    return {
      totalInvoices: invoices.length,
      paidInvoices: paidInvoices.length,
      pendingInvoices: pendingInvoices.length,
      overdueInvoices: overdueInvoices.length,
      totalRevenue,
      activeSubscriptions
    };
  }
}

// 导出单例实例
export const billingService = new BillingService();

function normalizeBillingPeriod<T extends BillingStatsQuery | QueryInvoicesParams>(
  query: T,
): T & { startDate?: Date; endDate?: Date } {
  if (!query.period) return query;

  const endDate = new Date();
  const startDate = new Date(endDate);

  switch (query.period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  return { ...query, startDate, endDate };
}
