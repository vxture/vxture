/**
 * index.ts - 订阅管理服务入口
 * @package @vxture/service-subscription
 *
 * Description: 提供套餐管理、订阅创建、更新、取消等基础功能
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

export { SubscriptionModule } from './module/subscription.module';

// ============================================================================
// Service Exports
// ============================================================================

export { SubscriptionService } from './service/subscription.service';
export { subscriptionService } from './service/subscription.service';

// ============================================================================
// Types Exports
// ============================================================================

export type {
  Plan,
  Subscription,
  PlanFeature,
  SubscriptionChange,
  SubscriptionStatus,
  BillingCycle,
  PlanQueryParams,
  SubscriptionQueryParams,
  SubscriptionStats
} from './types/subscription.types';

// ============================================================================
// DTO Exports
// ============================================================================

export { CreateSubscriptionInput } from './dto/create-subscription.dto';
export { UpdateSubscriptionInput } from './dto/update-subscription.dto';
