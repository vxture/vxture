/**
 * services.ts - 计费管理服务业务逻辑层
 * @package @vxture/service-billing
 *
 * Description: 实现计费管理的核心业务逻辑
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @layer Services
 * @category Business Services
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
} from './types';
import { InvoiceStatus, PaymentStatus, PaymentMethod } from './types';
import { billingRepository } from './repository';

// 计费服务类
export class BillingService {
  // 发票相关服务
  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    // 验证输入
    if (!input.customerId || !input.customerName || !input.customerEmail) {
      throw new Error('客户信息不能为空');
    }

    if (!input.lineItems || input.lineItems.length === 0) {
      throw new Error('发票必须包含至少一个订单项');
    }

    // 验证每个订单项
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

    // 验证截止日期
    if (input.dueDate && input.dueDate < new Date()) {
      throw new Error('截止日期不能早于当前日期');
    }

    const invoice = await billingRepository.createInvoice(input);
    return invoice;
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('发票ID不能为空');
    }

    const invoice = await billingRepository.getInvoiceById(id);

    if (!invoice) {
      throw new Error('发票不存在');
    }

    return invoice;
  }

  async getInvoices(params: InvoiceQueryParams = {}): Promise<Invoice[]> {
    const invoices = await billingRepository.getInvoices(params);
    return invoices;
  }

  async sendInvoice(id: string): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error('只能发送草稿状态的发票');
    }

    const updatedInvoice = await billingRepository.updateInvoiceStatus(id, InvoiceStatus.PENDING);
    return updatedInvoice!;
  }

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

  async cancelInvoice(id: string, reason?: string): Promise<Invoice> {
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

  // 支付相关服务
  async processPayment(input: ProcessPaymentInput): Promise<Payment> {
    if (!input.invoiceId || !input.amount || !input.method) {
      throw new Error('支付信息不完整');
    }

    if (input.amount <= 0) {
      throw new Error('支付金额必须大于0');
    }

    // 验证发票是否存在
    const invoice = await this.getInvoiceById(input.invoiceId);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('发票已经支付');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error('发票已取消');
    }

    // 创建支付记录（待处理状态）
    const payment = await billingRepository.createPayment(input);

    // 模拟支付处理
    await this.simulatePaymentProcessing(payment.id);

    return payment;
  }

  private async simulatePaymentProcessing(paymentId: string): Promise<void> {
    // 模拟异步支付处理
    await new Promise(resolve => setTimeout(resolve, 100));

    // 随机成功或失败（演示用）
    const isSuccess = Math.random() > 0.1; // 90%成功率

    if (isSuccess) {
      await billingRepository.updatePaymentStatus(
        paymentId,
        PaymentStatus.SUCCESS,
        `txn_${Date.now()}`
      );

      // 获取支付记录并更新发票状态
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

  async getPaymentById(id: string): Promise<Payment | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('支付记录ID不能为空');
    }

    const payment = await billingRepository.getPaymentById(id);

    if (!payment) {
      throw new Error('支付记录不存在');
    }

    return payment;
  }

  async getPayments(params: PaymentQueryParams = {}): Promise<Payment[]> {
    const payments = await billingRepository.getPayments(params);
    return payments;
  }

  async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    if (!invoiceId || invoiceId.trim().length === 0) {
      throw new Error('发票ID不能为空');
    }

    const payments = await billingRepository.getPayments({ invoiceId });
    return payments;
  }

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

    // 同时更新发票状态
    await billingRepository.updateInvoiceStatus(payment.invoiceId, InvoiceStatus.OVERDUE);

    return updatedPayment!;
  }

  // 订阅相关服务
  async getSubscriptionById(id: string): Promise<Subscription | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('订阅ID不能为空');
    }

    const subscription = await billingRepository.getSubscriptionById(id);

    if (!subscription) {
      throw new Error('订阅不存在');
    }

    return subscription;
  }

  async getCustomerSubscriptions(customerId: string): Promise<Subscription[]> {
    if (!customerId || customerId.trim().length === 0) {
      throw new Error('客户ID不能为空');
    }

    const subscriptions = await billingRepository.getSubscriptionsByCustomerId(customerId);
    return subscriptions;
  }

  async getSubscriptions(params: SubscriptionQueryParams = {}): Promise<Subscription[]> {
    const subscriptions = await billingRepository.getSubscriptions(params);
    return subscriptions;
  }

  async pauseSubscription(id: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status !== 'active') {
      throw new Error('只能暂停活跃的订阅');
    }

    // 这里只是模拟，实际需要更新数据
    return subscription!;
  }

  async resumeSubscription(id: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status !== 'paused') {
      throw new Error('只能恢复暂停的订阅');
    }

    // 这里只是模拟，实际需要更新数据
    return subscription!;
  }

  async cancelSubscription(id: string, reason?: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status === 'cancelled' || subscription.status === 'expired') {
      throw new Error('订阅已经是取消或过期状态');
    }

    // 这里只是模拟，实际需要更新数据
    return subscription!;
  }

  // 计费统计
  async getBillingStats(customerId?: string): Promise<{
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
    totalRevenue: number;
    activeSubscriptions: number;
  }> {
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
}

// 导出单例实例
export const billingService = new BillingService();