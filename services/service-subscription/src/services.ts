/**
 * services.ts - 订阅管理服务业务逻辑层
 * @package @vxture/service-subscription
 *
 * Description: 实现订阅管理的核心业务逻辑
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @layer Services
 * @category Business Services
 */

import type {
  Plan,
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  PlanQueryParams,
  SubscriptionQueryParams
} from './types';
import { SubscriptionStatus, BillingCycle } from './types';
import { planRepository } from './plan-repository';
import { subscriptionRepository } from './subscription-repository';

// 订阅服务类
export class SubscriptionService {
  // 套餐相关服务
  async getPlans(params: PlanQueryParams = {}): Promise<Plan[]> {
    const plans = await planRepository.getPlans(params);
    return plans;
  }

  async getPlanById(id: string): Promise<Plan | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('套餐ID不能为空');
    }

    const plan = await planRepository.getPlanById(id);

    if (!plan) {
      throw new Error('套餐不存在');
    }

    return plan;
  }

  async getPlanByCode(code: string): Promise<Plan | null> {
    if (!code || code.trim().length === 0) {
      throw new Error('套餐代码不能为空');
    }

    const plan = await planRepository.getPlanByCode(code);

    if (!plan) {
      throw new Error('套餐不存在');
    }

    return plan;
  }

  async getActivePublicPlans(cycle?: BillingCycle): Promise<Plan[]> {
    const plans = await planRepository.getActivePublicPlans(cycle);
    return plans;
  }

  // 订阅相关服务
  async createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
    // 验证输入
    if (!input.customerId || !input.planId) {
      throw new Error('客户ID和套餐ID不能为空');
    }

    // 验证套餐是否存在且可用
    const plan = await this.getPlanById(input.planId);

    if (!plan.isActive) {
      throw new Error('所选套餐已不可用');
    }

    // 检查客户是否已有活跃订阅
    const existingActiveSubscription = await subscriptionRepository.getActiveSubscriptionByCustomerId(input.customerId);

    if (existingActiveSubscription) {
      throw new Error('该客户已有活跃订阅，请先取消或升级现有订阅');
    }

    // 计算订阅日期
    const startDate = input.startDate || new Date();
    let nextBillingDate: Date;
    let trialEndDate: Date | undefined;
    let isTrial = false;

    if (input.trialDays && input.trialDays > 0) {
      isTrial = true;
      trialEndDate = new Date(startDate.getTime() + input.trialDays * 24 * 60 * 60 * 1000);
      nextBillingDate = trialEndDate;
    } else {
      nextBillingDate = this.calculateNextBillingDate(startDate, input.cycle || plan.cycle);
    }

    // 创建订阅
    const subscription = await subscriptionRepository.createSubscription({
      customerId: input.customerId,
      planId: input.planId,
      planName: plan.name,
      status: SubscriptionStatus.ACTIVE,
      price: plan.price,
      currency: plan.currency,
      cycle: input.cycle || plan.cycle,
      startDate,
      nextBillingDate,
      trialEndDate,
      isTrial,
      autoRenew: input.autoRenew !== false, // 默认自动续费
      cancelAtPeriodEnd: false,
      paymentMethodId: input.paymentMethodId,
      metadata: input.metadata
    });

    return subscription;
  }

  private calculateNextBillingDate(fromDate: Date, cycle: BillingCycle): Date {
    const nextDate = new Date(fromDate);

    switch (cycle) {
      case BillingCycle.DAILY:
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case BillingCycle.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case BillingCycle.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case BillingCycle.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case BillingCycle.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('订阅ID不能为空');
    }

    const subscription = await subscriptionRepository.getSubscriptionById(id);

    if (!subscription) {
      throw new Error('订阅不存在');
    }

    return subscription;
  }

  async getCustomerSubscriptions(customerId: string): Promise<Subscription[]> {
    if (!customerId || customerId.trim().length === 0) {
      throw new Error('客户ID不能为空');
    }

    const subscriptions = await subscriptionRepository.getSubscriptionsByCustomerId(customerId);
    return subscriptions;
  }

  async getCustomerActiveSubscription(customerId: string): Promise<Subscription | null> {
    if (!customerId || customerId.trim().length === 0) {
      throw new Error('客户ID不能为空');
    }

    const subscription = await subscriptionRepository.getActiveSubscriptionByCustomerId(customerId);
    return subscription;
  }

  async getSubscriptions(params: SubscriptionQueryParams = {}): Promise<Subscription[]> {
    const subscriptions = await subscriptionRepository.getSubscriptions(params);
    return subscriptions;
  }

  async updateSubscription(
    id: string,
    input: UpdateSubscriptionInput,
    changedBy: string = 'system'
  ): Promise<Subscription | null> {
    const existingSubscription = await this.getSubscriptionById(id);

    // 如果要换套餐，验证新套餐
    if (input.planId && input.planId !== existingSubscription.planId) {
      const newPlan = await this.getPlanById(input.planId);

      if (!newPlan.isActive) {
        throw new Error('目标套餐已不可用');
      }

      // 更新套餐相关信息
      input.planName = newPlan.name;
      input.price = newPlan.price;
      input.currency = newPlan.currency;
      input.cycle = newPlan.cycle;
    }

    const updatedSubscription = await subscriptionRepository.updateSubscription(id, input, changedBy);
    return updatedSubscription;
  }

  async pauseSubscription(id: string, reason?: string, changedBy: string = 'system'): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error('只能暂停活跃的订阅');
    }

    if (subscription.isTrial) {
      throw new Error('试用订阅无法暂停');
    }

    const updatedSubscription = await subscriptionRepository.updateSubscription(
      id,
      {
        status: SubscriptionStatus.PAUSED,
        metadata: { ...subscription.metadata, pauseReason: reason }
      },
      changedBy
    );

    return updatedSubscription!;
  }

  async resumeSubscription(id: string, changedBy: string = 'system'): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new Error('只能恢复暂停的订阅');
    }

    const updatedSubscription = await subscriptionRepository.updateSubscription(
      id,
      {
        status: SubscriptionStatus.ACTIVE
      },
      changedBy
    );

    return updatedSubscription!;
  }

  async cancelSubscription(
    id: string,
    reason?: string,
    immediate: boolean = false,
    changedBy: string = 'system'
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status === SubscriptionStatus.CANCELLED || subscription.status === SubscriptionStatus.EXPIRED) {
      throw new Error('订阅已经是取消或过期状态');
    }

    if (immediate) {
      // 立即取消
      const updatedSubscription = await subscriptionRepository.updateSubscription(
        id,
        {
          status: SubscriptionStatus.CANCELLED,
          endDate: new Date(),
          cancelAtPeriodEnd: false,
          metadata: { ...subscription.metadata, cancelReason: reason }
        },
        changedBy
      );

      return updatedSubscription!;
    } else {
      // 到期取消
      const updatedSubscription = await subscriptionRepository.updateSubscription(
        id,
        {
          cancelAtPeriodEnd: true,
          metadata: { ...subscription.metadata, cancelReason: reason }
        },
        changedBy
      );

      return updatedSubscription!;
    }
  }

  async reactivateSubscription(id: string, changedBy: string = 'system'): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status !== SubscriptionStatus.CANCELLED) {
      throw new Error('只能重新激活已取消的订阅');
    }

    // 验证套餐是否仍然可用
    const plan = await this.getPlanById(subscription.planId);

    if (!plan.isActive) {
      throw new Error('原套餐已不可用，请选择新套餐');
    }

    const newStartDate = new Date();
    const newNextBillingDate = this.calculateNextBillingDate(newStartDate, subscription.cycle);

    const updatedSubscription = await subscriptionRepository.updateSubscription(
      id,
      {
        status: SubscriptionStatus.ACTIVE,
        startDate: newStartDate,
        nextBillingDate: newNextBillingDate,
        endDate: undefined,
        cancelAtPeriodEnd: false,
        metadata: { ...subscription.metadata, reactivatedAt: new Date() }
      },
      changedBy
    );

    return updatedSubscription!;
  }

  async upgradePlan(
    id: string,
    newPlanId: string,
    changedBy: string = 'system'
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error('只能升级活跃的订阅');
    }

    if (subscription.planId === newPlanId) {
      throw new Error('已在该套餐中');
    }

    const newPlan = await this.getPlanById(newPlanId);

    if (!newPlan.isActive) {
      throw new Error('目标套餐已不可用');
    }

    // 更新套餐，立即生效
    const updatedSubscription = await subscriptionRepository.updateSubscription(
      id,
      {
        planId: newPlanId,
        planName: newPlan.name,
        price: newPlan.price,
        currency: newPlan.currency,
        cycle: newPlan.cycle,
        nextBillingDate: this.calculateNextBillingDate(new Date(), newPlan.cycle),
        metadata: {
          ...subscription.metadata,
          upgradedFromPlanId: subscription.planId,
          upgradedAt: new Date()
        }
      },
      changedBy
    );

    return updatedSubscription!;
  }

  async processTrialEnd(id: string, changedBy: string = 'system'): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    if (!subscription.isTrial) {
      throw new Error('不是试用订阅');
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error('试用订阅不是活跃状态');
    }

    if (!subscription.trialEndDate || subscription.trialEndDate > new Date()) {
      throw new Error('试用期尚未结束');
    }

    // 试用结束，开始正式计费
    const updatedSubscription = await subscriptionRepository.updateSubscription(
      id,
      {
        isTrial: false,
        trialEndDate: undefined,
        nextBillingDate: this.calculateNextBillingDate(new Date(), subscription.cycle),
        metadata: {
          ...subscription.metadata,
          trialEndedAt: new Date()
        }
      },
      changedBy
    );

    return updatedSubscription!;
  }

  async processRenewal(id: string, changedBy: string = 'system'): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error('只能续费活跃的订阅');
    }

    if (!subscription.autoRenew) {
      throw new Error('该订阅未开启自动续费');
    }

    if (subscription.cancelAtPeriodEnd) {
      throw new Error('该订阅已设置到期取消');
    }

    // 生成新的计费周期
    const newNextBillingDate = this.calculateNextBillingDate(subscription.nextBillingDate, subscription.cycle);

    const updatedSubscription = await subscriptionRepository.updateSubscription(
      id,
      {
        nextBillingDate: newNextBillingDate,
        metadata: {
          ...subscription.metadata,
          lastRenewedAt: new Date()
        }
      },
      changedBy
    );

    return updatedSubscription!;
  }

  // 订阅统计
  async getSubscriptionStats(customerId?: string): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    pendingSubscriptions: number;
    pausedSubscriptions: number;
    cancelledSubscriptions: number;
    trialSubscriptions: number;
    byPlan: { [planId: string]: number };
  }> {
    const subscriptions = await subscriptionRepository.getSubscriptions(customerId ? { customerId } : {});

    const stats = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE).length,
      pendingSubscriptions: subscriptions.filter(s => s.status === SubscriptionStatus.PENDING).length,
      pausedSubscriptions: subscriptions.filter(s => s.status === SubscriptionStatus.PAUSED).length,
      cancelledSubscriptions: subscriptions.filter(s => s.status === SubscriptionStatus.CANCELLED || s.status === SubscriptionStatus.EXPIRED).length,
      trialSubscriptions: subscriptions.filter(s => s.isTrial).length,
      byPlan: {} as { [planId: string]: number }
    };

    // 按套餐统计
    subscriptions.forEach(subscription => {
      if (!stats.byPlan[subscription.planId]) {
        stats.byPlan[subscription.planId] = 0;
      }
      stats.byPlan[subscription.planId]++;
    });

    return stats;
  }
}

// 导出单例实例
export const subscriptionService = new SubscriptionService();