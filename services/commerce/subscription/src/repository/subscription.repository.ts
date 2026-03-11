/**
 * subscription.repository.ts - 订阅数据访问层
 * @package @vxture/service-subscription
 *
 * Description: 提供订阅数据的存储和查询操作
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @layer Domain
 * @category Repository
 */

import type { Subscription, SubscriptionQueryParams, SubscriptionChange, SubscriptionStatus, BillingCycle } from '../types/subscription.types';

// 模拟订阅数据
const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    customerId: 'cust001',
    planId: '2',
    planName: '专业版',
    status: SubscriptionStatus.ACTIVE,
    price: 99,
    currency: 'CNY',
    cycle: BillingCycle.MONTHLY,
    startDate: new Date('2026-02-01'),
    nextBillingDate: new Date('2026-04-01'),
    isTrial: false,
    autoRenew: true,
    cancelAtPeriodEnd: false,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-03-01')
  }
];

// 模拟订阅变更历史
const mockSubscriptionChanges: SubscriptionChange[] = [
  {
    id: '1',
    subscriptionId: '1',
    action: 'created',
    newStatus: SubscriptionStatus.ACTIVE,
    newPlanId: '2',
    changedBy: 'system',
    changedAt: new Date('2026-02-01')
  }
];

// 订阅仓库类
export class SubscriptionRepository {
  private subscriptions: Subscription[];
  private subscriptionChanges: SubscriptionChange[];

  constructor() {
    this.subscriptions = [...mockSubscriptions];
    this.subscriptionChanges = [...mockSubscriptionChanges];
  }

  // 创建订阅
  async createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const newSubscription: Subscription = {
      ...subscription,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.subscriptions.push(newSubscription);

    this.recordChange(newSubscription.id, 'created', undefined, newSubscription.status, undefined, newSubscription.planId);

    return newSubscription;
  }

  // 根据ID获取订阅
  async getSubscriptionById(id: string): Promise<Subscription | null> {
    return this.subscriptions.find(sub => sub.id === id) || null;
  }

  // 获取客户的所有订阅
  async getSubscriptionsByCustomerId(customerId: string): Promise<Subscription[]> {
    return this.subscriptions.filter(sub => sub.customerId === customerId);
  }

  // 获取客户的活跃订阅
  async getActiveSubscriptionByCustomerId(customerId: string): Promise<Subscription | null> {
    const activeSubscriptions = this.subscriptions.filter(
      sub => sub.customerId === customerId &&
      sub.status === SubscriptionStatus.ACTIVE
    );

    if (activeSubscriptions.length > 0) {
      return activeSubscriptions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    }

    return null;
  }

  // 查询订阅列表
  async getSubscriptions(params: SubscriptionQueryParams = {}): Promise<Subscription[]> {
    let results = [...this.subscriptions];

    if (params.customerId) {
      results = results.filter(sub => sub.customerId === params.customerId);
    }

    if (params.planId) {
      results = results.filter(sub => sub.planId === params.planId);
    }

    if (params.status) {
      results = results.filter(sub => sub.status === params.status);
    }

    if (params.cycle) {
      results = results.filter(sub => sub.cycle === params.cycle);
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return results.slice(startIndex, endIndex);
  }

  // 更新订阅
  async updateSubscription(
    id: string,
    updates: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>,
    changedBy: string = 'system'
  ): Promise<Subscription | null> {
    const index = this.subscriptions.findIndex(sub => sub.id === id);

    if (index === -1) {
      return null;
    }

    const oldSubscription = { ...this.subscriptions[index] };

    this.subscriptions[index] = {
      ...this.subscriptions[index],
      ...updates,
      updatedAt: new Date()
    };

    if (updates.status && updates.status !== oldSubscription.status) {
      let action: SubscriptionChange['action'];
      switch (updates.status) {
        case SubscriptionStatus.ACTIVE:
          action = 'resumed';
          break;
        case SubscriptionStatus.PAUSED:
          action = 'paused';
          break;
        case SubscriptionStatus.CANCELLED:
          action = 'cancelled';
          break;
        default:
          action = 'updated';
      }
      this.recordChange(id, action, oldSubscription.status, updates.status, changedBy);
    } else if (updates.planId && updates.planId !== oldSubscription.planId) {
      this.recordChange(id, 'updated', undefined, undefined, oldSubscription.planId, updates.planId, changedBy);
    }

    return this.subscriptions[index];
  }

  // 记录订阅变更历史
  private recordChange(
    subscriptionId: string,
    action: SubscriptionChange['action'],
    oldStatus?: SubscriptionStatus,
    newStatus?: SubscriptionStatus,
    changedBy?: string,
    oldPlanId?: string,
    newPlanId?: string
  ): void {
    const change: SubscriptionChange = {
      id: Date.now().toString(),
      subscriptionId,
      action,
      oldStatus,
      newStatus,
      oldPlanId,
      newPlanId,
      changedBy: changedBy || 'system',
      changedAt: new Date()
    };

    this.subscriptionChanges.push(change);
  }

  // 获取订阅的变更历史
  async getSubscriptionChanges(subscriptionId: string): Promise<SubscriptionChange[]> {
    return this.subscriptionChanges
      .filter(change => change.subscriptionId === subscriptionId)
      .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());
  }

  // 获取即将计费的订阅
  async getUpcomingRenewals(withinDays: number = 7): Promise<Subscription[]> {
    const now = new Date();
    const targetDate = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);

    return this.subscriptions.filter(
      sub => sub.status === SubscriptionStatus.ACTIVE &&
      sub.autoRenew &&
      sub.nextBillingDate <= targetDate &&
      sub.nextBillingDate >= now
    );
  }

  // 获取过期的订阅
  async getExpiredSubscriptions(): Promise<Subscription[]> {
    const now = new Date();

    return this.subscriptions.filter(
      sub => sub.status === SubscriptionStatus.ACTIVE &&
      sub.endDate &&
      sub.endDate < now
    );
  }

  // 获取试用即将结束的订阅
  async getEndingTrials(withinDays: number = 3): Promise<Subscription[]> {
    const now = new Date();
    const targetDate = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);

    return this.subscriptions.filter(
      sub => sub.status === SubscriptionStatus.ACTIVE &&
      sub.isTrial &&
      sub.trialEndDate &&
      sub.trialEndDate <= targetDate &&
      sub.trialEndDate >= now
    );
  }
}

// 导出单例实例
export const subscriptionRepository = new SubscriptionRepository();
