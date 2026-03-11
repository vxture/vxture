/**
 * plan.repository.ts - 套餐数据访问层
 * @package @vxture/service-subscription
 *
 * Description: 提供套餐数据的存储和查询操作
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @layer Domain
 * @category Repository
 */

import type { Plan, PlanQueryParams } from '../types/subscription.types';
import { BillingCycle } from '../types/subscription.types';

// 模拟套餐数据
const mockPlans: Plan[] = [
  {
    id: '1',
    name: '免费版',
    code: 'free',
    description: '适合个人用户的基础套餐',
    price: 0,
    currency: 'CNY',
    cycle: BillingCycle.MONTHLY,
    features: [
      { id: 'f1', name: '基础功能', key: 'basic_features', included: true },
      { id: 'f2', name: '用户数量', key: 'user_limit', value: 1, included: true },
      { id: 'f3', name: 'API调用', key: 'api_limit', value: 1000, included: true },
      { id: 'f4', name: '高级功能', key: 'advanced_features', included: false }
    ],
    isActive: true,
    isPublic: true,
    sortOrder: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01')
  },
  {
    id: '2',
    name: '专业版',
    code: 'pro',
    description: '适合小团队的专业套餐',
    price: 99,
    currency: 'CNY',
    cycle: BillingCycle.MONTHLY,
    features: [
      { id: 'f1', name: '基础功能', key: 'basic_features', included: true },
      { id: 'f2', name: '用户数量', key: 'user_limit', value: 10, included: true },
      { id: 'f3', name: 'API调用', key: 'api_limit', value: 10000, included: true },
      { id: 'f4', name: '高级功能', key: 'advanced_features', included: true },
      { id: 'f5', name: '技术支持', key: 'support', included: true }
    ],
    isActive: true,
    isPublic: true,
    sortOrder: 2,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01')
  },
  {
    id: '3',
    name: '企业版',
    code: 'enterprise',
    description: '适合大企业的定制套餐',
    price: 999,
    currency: 'CNY',
    cycle: BillingCycle.YEARLY,
    features: [
      { id: 'f1', name: '全部功能', key: 'all_features', included: true },
      { id: 'f2', name: '无限用户', key: 'user_limit', included: true },
      { id: 'f3', name: '无限API调用', key: 'api_limit', included: true },
      { id: 'f4', name: '专属客服', key: 'dedicated_support', included: true },
      { id: 'f5', name: '定制开发', key: 'custom_development', included: true }
    ],
    isActive: true,
    isPublic: true,
    sortOrder: 3,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01')
  }
];

// 套餐仓库类
export class PlanRepository {
  private plans: Plan[];

  constructor() {
    this.plans = [...mockPlans];
  }

  // 获取所有套餐
  async getPlans(params: PlanQueryParams = {}): Promise<Plan[]> {
    let results = [...this.plans];

    if (params.isActive !== undefined) {
      results = results.filter(plan => plan.isActive === params.isActive);
    }

    if (params.isPublic !== undefined) {
      results = results.filter(plan => plan.isPublic === params.isPublic);
    }

    if (params.cycle) {
      results = results.filter(plan => plan.cycle === params.cycle);
    }

    results.sort((a, b) => a.sortOrder - b.sortOrder);

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return results.slice(startIndex, endIndex);
  }

  // 根据ID获取套餐
  async getPlanById(id: string): Promise<Plan | null> {
    return this.plans.find(plan => plan.id === id) || null;
  }

  // 根据代码获取套餐
  async getPlanByCode(code: string): Promise<Plan | null> {
    return this.plans.find(plan => plan.code === code) || null;
  }

  // 创建套餐
  async createPlan(plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plan> {
    const newPlan: Plan = {
      ...plan,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.plans.push(newPlan);
    return newPlan;
  }

  // 更新套餐
  async updatePlan(id: string, updates: Partial<Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Plan | null> {
    const index = this.plans.findIndex(plan => plan.id === id);

    if (index === -1) {
      return null;
    }

    this.plans[index] = {
      ...this.plans[index],
      ...updates,
      updatedAt: new Date()
    };

    return this.plans[index];
  }

  // 删除套餐
  async deletePlan(id: string): Promise<boolean> {
    const index = this.plans.findIndex(plan => plan.id === id);

    if (index === -1) {
      return false;
    }

    this.plans[index] = {
      ...this.plans[index],
      isActive: false,
      updatedAt: new Date()
    };

    return true;
  }

  // 获取活跃的公开套餐
  async getActivePublicPlans(cycle?: BillingCycle): Promise<Plan[]> {
    return this.getPlans({ isActive: true, isPublic: true, cycle });
  }
}

// 导出单例实例
export const planRepository = new PlanRepository();
