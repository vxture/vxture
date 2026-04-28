import { ForbiddenException, Inject, Injectable } from '@nestjs/common';

import { ModelRegistryRepository } from '../registry/model-registry.repository';
import type {
  AiModelRecord,
  ChatRequest,
  QuotaCheckResult,
  TenantSubscriptionQuotaRecord,
} from '../types/gateway.types';

export const COMMERCE_SENTINEL_UUID = '00000000-0000-0000-0000-000000000000';

export interface QuotaContext {
  tenantId: string;
  agentId: string;
  featureId: string;
  cycleMonth: string;
  quota: TenantSubscriptionQuotaRecord;
  remaining: bigint;
}

@Injectable()
export class QuotaService {
  constructor(@Inject(ModelRegistryRepository) private readonly repository: ModelRegistryRepository) {}

  async assertAllowed(model: AiModelRecord, request: ChatRequest): Promise<QuotaContext> {
    const now = new Date();
    const grant = await this.repository.findBestGrant(model.id, request.tenantId, request.agentId);

    if (!grant) {
      throw new ForbiddenException('Current tenant or agent has no technical grant for this model');
    }

    const quota = await this.repository.findCurrentSubscriptionQuota(request.tenantId, now);

    if (!quota) {
      throw new ForbiddenException('Current tenant has no active subscription quota');
    }

    const commerceCheck = await this.checkCommerceQuota(model, request, quota, now);

    if (!commerceCheck.allowed) {
      throw new ForbiddenException(commerceCheck.reason ?? 'AI model quota is exhausted');
    }

    return {
      tenantId: request.tenantId,
      agentId: normalizeUuidScope(request.agentId),
      featureId: normalizeUuidScope(request.featureId),
      cycleMonth: toCycleMonth(now),
      quota,
      remaining: commerceCheck.remaining,
    };
  }

  private async checkCommerceQuota(
    model: AiModelRecord,
    request: ChatRequest,
    quota: TenantSubscriptionQuotaRecord,
    now: Date,
  ): Promise<QuotaCheckResult> {
    if (!this.isModelAllowed(model, quota)) {
      return {
        allowed: false,
        reason: `Model "${model.modelCode}" is not allowed by current tenant subscription`,
        remaining: 0n,
      };
    }

    const cycleMonth = toCycleMonth(now);

    if (quota.periodTokens < 0n) {
      return {
        allowed: true,
        remaining: -1n,
      };
    }

    const summary = await this.repository.findUsageSummary({
      tenantId: request.tenantId,
      agentId: COMMERCE_SENTINEL_UUID,
      featureId: COMMERCE_SENTINEL_UUID,
      cycleMonth,
      statType: 'summary',
    });
    const used = summary?.totalQuota ?? 0n;
    const remaining = quota.periodTokens - used;

    return {
      allowed: remaining > 0n,
      reason: remaining > 0n ? undefined : 'Tenant subscription token quota is exhausted',
      remaining,
    };
  }

  private isModelAllowed(model: AiModelRecord, quota: TenantSubscriptionQuotaRecord): boolean {
    const modelExplicitlyAllowed = quota.allowedModels.includes(model.modelCode);
    const platformDefaultAllowed = quota.allowedModels.length === 0 && !isPrivateProvider(model.provider);

    if (isPrivateProvider(model.provider)) {
      return quota.allowCustomModel || modelExplicitlyAllowed;
    }

    return platformDefaultAllowed || modelExplicitlyAllowed;
  }
}

export function normalizeUuidScope(value: string | undefined): string {
  return value?.trim() || COMMERCE_SENTINEL_UUID;
}

export function toCycleMonth(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

function isPrivateProvider(provider: string): boolean {
  return ['private', 'custom', 'self-hosted'].includes(provider);
}
