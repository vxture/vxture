import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PgSubscriptionRepository } from "../repository/pg-subscription.repository";
import type {
  SubscriptionRecord,
  SubscriptionHistoryRecord,
  ListSubscriptionsParams,
  ListSubscriptionsResult,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from "../types/subscription.types";

@Injectable()
export class SubscriptionService {
  constructor(private readonly repo: PgSubscriptionRepository) {}

  async listSubscriptions(
    params: ListSubscriptionsParams,
  ): Promise<ListSubscriptionsResult> {
    return this.repo.listSubscriptions(params);
  }

  async getSubscription(id: string): Promise<SubscriptionRecord> {
    const record = await this.repo.getById(id);
    if (!record) throw new NotFoundException(`订阅 ${id} 不存在`);
    return record;
  }

  async getActiveSubscription(
    tenantId: string,
  ): Promise<SubscriptionRecord | null> {
    return this.repo.getActiveByTenantId(tenantId);
  }

  async createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<SubscriptionRecord> {
    const existing = await this.repo.getActiveByTenantId(input.tenantId);
    if (existing)
      throw new ConflictException("租户已有活跃订阅，请先取消或升级现有订阅");
    return this.repo.create(input);
  }

  async cancelSubscription(
    id: string,
    operatorId?: string,
    remark?: string,
  ): Promise<SubscriptionRecord> {
    const subscription = await this.getSubscription(id);
    if (subscription.status === "cancelled")
      throw new ConflictException("订阅已取消");
    if (subscription.status === "expired")
      throw new ConflictException("订阅已过期");

    const result = await this.repo.update(id, subscription, {
      status: "cancelled",
      endAt: new Date(),
      operatorType: "operator",
      ...(operatorId !== undefined
        ? { operatorId, updatedBy: operatorId }
        : {}),
      ...(remark !== undefined ? { operatorRemark: remark } : {}),
    });
    return result!;
  }

  async upgradeSubscription(
    id: string,
    newPlanId: string,
    operatorId?: string,
    remark?: string,
  ): Promise<SubscriptionRecord> {
    const subscription = await this.getSubscription(id);
    if (subscription.status !== "active")
      throw new ConflictException("只有活跃订阅可以升级");

    const result = await this.repo.update(id, subscription, {
      toPlanId: newPlanId,
      operatorType: "operator",
      ...(operatorId !== undefined
        ? { operatorId, updatedBy: operatorId }
        : {}),
      ...(remark !== undefined ? { operatorRemark: remark } : {}),
    });
    return result!;
  }

  async updateSubscription(
    id: string,
    input: UpdateSubscriptionInput,
  ): Promise<SubscriptionRecord> {
    const subscription = await this.getSubscription(id);
    const result = await this.repo.update(id, subscription, input);
    if (!result) throw new NotFoundException(`订阅 ${id} 不存在`);
    return result;
  }

  async getHistory(id: string): Promise<SubscriptionHistoryRecord[]> {
    await this.getSubscription(id);
    return this.repo.getHistory(id);
  }
}
