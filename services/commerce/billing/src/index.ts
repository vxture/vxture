/**
 * index.ts - 计费管理服务入口
 * @package @vxture/service-billing
 *
 * Description: 提供账单生成、支付处理、发票管理等基础功能
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @layer Domain
 * @category Service
 */

// ============================================================================
// Module Exports
// ============================================================================

export { BillingModule } from './module/billing.module';

// ============================================================================
// Service Exports
// ============================================================================

export { BillingService } from './service/billing.service';
export { billingService } from './service/billing.service';

// ============================================================================
// Types Exports
// ============================================================================

export type {
  Invoice,
  Payment,
  Subscription,
  BillingCycle,
  InvoiceStatus,
  PaymentStatus,
  PaymentMethod,
  InvoiceQueryParams,
  PaymentQueryParams,
  SubscriptionQueryParams,
  BillingStats
} from './types/billing.types';

// ============================================================================
// DTO Exports
// ============================================================================

export { CreateInvoiceInput } from './dto/create-invoice.dto';
export { ProcessPaymentInput } from './dto/process-payment.dto';
