/**
 * types.ts - 订阅管理服务类型定义
 * @package @vxture/service-subscription
 *
 * Description: 包含订阅管理相关的所有类型定义
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @layer Services
 * @category Business Services
 */

// 订阅状态
export enum SubscriptionStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended'
}

// 计费周期
export enum BillingCycle {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

// 套餐特性
export interface PlanFeature {
  id: string;
  name: string;
  key: string;
  value?: string | number | boolean;
  included: boolean;
  description?: string;
}

// 套餐类型
export interface Plan {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  currency: string;
  cycle: BillingCycle;
  features: PlanFeature[];
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// 订阅类型
export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  price: number;
  currency: string;
  cycle: BillingCycle;
  startDate: Date;
  endDate?: Date;
  nextBillingDate: Date;
  trialEndDate?: Date;
  isTrial: boolean;
  autoRenew: boolean;
  cancelAtPeriodEnd: boolean;
  paymentMethodId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// 订阅变更历史
export interface SubscriptionChange {
  id: string;
  subscriptionId: string;
  action: 'created' | 'updated' | 'cancelled' | 'paused' | 'resumed' | 'renewed';
  oldStatus?: SubscriptionStatus;
  newStatus?: SubscriptionStatus;
  oldPlanId?: string;
  newPlanId?: string;
  reason?: string;
  changedBy: string;
  changedAt: Date;
}

// 创建订阅输入类型
export interface CreateSubscriptionInput {
  customerId: string;
  planId: string;
  cycle?: BillingCycle;
  startDate?: Date;
  trialDays?: number;
  autoRenew?: boolean;
  paymentMethodId?: string;
  metadata?: Record<string, unknown>;
}

// 更新订阅输入类型
export interface UpdateSubscriptionInput {
  planId?: string;
  cycle?: BillingCycle;
  autoRenew?: boolean;
  cancelAtPeriodEnd?: boolean;
  paymentMethodId?: string;
  metadata?: Record<string, unknown>;
}

// 套餐查询参数类型
export interface PlanQueryParams {
  isActive?: boolean;
  isPublic?: boolean;
  cycle?: BillingCycle;
  page?: number;
  limit?: number;
}

// 订阅查询参数类型
export interface SubscriptionQueryParams {
  customerId?: string;
  planId?: string;
  status?: SubscriptionStatus;
  cycle?: BillingCycle;
  startDateFrom?: Date;
  startDateTo?: Date;
  page?: number;
  limit?: number;
}