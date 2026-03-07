/**
 * index.ts - 计费管理服务入口
 * @package @vxture/service-billing
 *
 * Description: 提供账单生成、支付处理、发票管理等基础功能
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @layer Services
 * @category Business Services
 */

import type { Invoice, Payment, Subscription, BillingCycle, CreateInvoiceInput, ProcessPaymentInput } from './types';
import { billingRepository } from './repository';
import { billingService } from './services';

// 导出类型
export type {
  Invoice,
  Payment,
  Subscription,
  BillingCycle,
  CreateInvoiceInput,
  ProcessPaymentInput
};

// 导出服务
export {
  billingRepository,
  billingService
};

// 默认导出
export default {
  billingRepository,
  billingService
};