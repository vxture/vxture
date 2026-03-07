/**
 * index.ts - 订阅管理服务入口
 * @package @vxture/service-subscription
 *
 * Description: 提供套餐管理、订阅创建、更新、取消等基础功能
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @layer Services
 * @category Business Services
 */

import type { Plan, Subscription, SubscriptionStatus, CreateSubscriptionInput, UpdateSubscriptionInput, PlanFeature } from './types';
import { planRepository } from './plan-repository';
import { subscriptionRepository } from './subscription-repository';
import { subscriptionService } from './services';

// 导出类型
export type {
  Plan,
  Subscription,
  SubscriptionStatus,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  PlanFeature
};

// 导出服务
export {
  planRepository,
  subscriptionRepository,
  subscriptionService
};

// 默认导出
export default {
  planRepository,
  subscriptionRepository,
  subscriptionService
};