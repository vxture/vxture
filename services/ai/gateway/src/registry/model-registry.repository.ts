import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { prisma, type AiGatewayPrismaClient } from "../prisma";
import type {
  AiModelGrantRecord,
  AiModelRecord,
  CreateAiModelGrantInput,
  CreateAiModelInput,
  TenantSubscriptionQuotaRecord,
  TenantUsageEventRecord,
  TenantUsageSummaryRecord,
  UpdateAiModelGrantInput,
  UpdateAiModelInput,
  UsageLogInput,
} from "../types/gateway.types";

const COMMERCE_SENTINEL_UUID = "00000000-0000-0000-0000-000000000000";

type UsagePersistenceInput = UsageLogInput & {
  normalizedAgentId: string;
  normalizedFeatureId: string;
  cycleDate: Date;
  cycleMonth: string;
};

@Injectable()
export class ModelRegistryRepository {
  findActiveModelByCode(modelCode: string): Promise<AiModelRecord | null> {
    return prisma.modelDefinition.findFirst({
      where: {
        modelCode,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  listActiveModels(): Promise<AiModelRecord[]> {
    return prisma.modelDefinition.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  listModels(includeInactive = false): Promise<AiModelRecord[]> {
    return prisma.modelDefinition.findMany({
      where: includeInactive
        ? { deletedAt: null }
        : { isActive: true, deletedAt: null },
      orderBy: [
        { isActive: "desc" },
        { provider: "asc" },
        { createdAt: "desc" },
      ],
    });
  }

  findModelById(modelId: string): Promise<AiModelRecord | null> {
    return prisma.modelDefinition.findFirst({
      where: {
        id: modelId,
        deletedAt: null,
      },
    });
  }

  createModel(input: CreateAiModelInput): Promise<AiModelRecord> {
    return prisma.modelDefinition.create({
      data: input,
    });
  }

  updateModel(
    modelId: string,
    input: UpdateAiModelInput,
  ): Promise<AiModelRecord> {
    return prisma.modelDefinition.update({
      where: {
        id: modelId,
      },
      data: input,
    });
  }

  deleteGrant(grantId: string): Promise<AiModelGrantRecord> {
    return prisma.modelGrant.update({
      where: { id: grantId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async deleteModel(modelId: string): Promise<AiModelRecord> {
    const deletedAt = new Date();

    return prisma.$transaction(async (tx) => {
      await tx.modelGrant.updateMany({
        where: {
          modelId,
          deletedAt: null,
        },
        data: {
          isActive: false,
          deletedAt,
        },
      });

      return tx.modelDefinition.update({
        where: {
          id: modelId,
        },
        data: {
          isActive: false,
          deletedAt,
        },
      });
    });
  }

  async findBestGrant(
    modelId: string,
    tenantId: string,
    agentId?: string,
  ): Promise<AiModelGrantRecord | null> {
    const grants = await prisma.modelGrant.findMany({
      where: {
        modelId,
        tenantId,
        deletedAt: null,
        isActive: true,
        OR: [{ agentId: agentId ?? null }, { agentId: null }],
        AND: [
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        ],
      },
      orderBy: [
        { agentId: "desc" },
        { priority: "asc" },
        { createdAt: "desc" },
      ],
      take: 2,
    });

    return (
      grants.find((grant) => grant.agentId === (agentId ?? null)) ??
      grants.find((grant) => grant.agentId === null) ??
      null
    );
  }

  listGrants(filters: {
    tenantId?: string;
    modelId?: string;
  }): Promise<AiModelGrantRecord[]> {
    return prisma.modelGrant.findMany({
      where: {
        ...(filters.tenantId ? { tenantId: filters.tenantId } : {}),
        ...(filters.modelId ? { modelId: filters.modelId } : {}),
        deletedAt: null,
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });
  }

  findGrantById(grantId: string): Promise<AiModelGrantRecord | null> {
    return prisma.modelGrant.findFirst({
      where: {
        id: grantId,
        deletedAt: null,
      },
    });
  }

  createGrant(input: CreateAiModelGrantInput): Promise<AiModelGrantRecord> {
    return prisma.modelGrant.create({
      data: {
        modelId: input.modelId,
        tenantId: input.tenantId,
        agentId: input.agentId ?? null,
        priority: input.priority ?? 100,
        reason: input.reason ?? null,
        expiresAt: input.expiresAt ?? null,
        isActive: input.isActive ?? true,
      },
    });
  }

  updateGrant(
    grantId: string,
    input: UpdateAiModelGrantInput,
  ): Promise<AiModelGrantRecord> {
    return prisma.modelGrant.update({
      where: {
        id: grantId,
      },
      data: input,
    });
  }

  findCurrentSubscriptionQuota(
    tenantId: string,
    at: Date,
  ): Promise<TenantSubscriptionQuotaRecord | null> {
    return prisma.tenantSubscriptionQuota.findFirst({
      where: {
        tenantId,
        effectiveAt: { lte: at },
        OR: [{ expiresAt: null }, { expiresAt: { gt: at } }],
      },
      orderBy: [{ effectiveAt: "desc" }, { createdAt: "desc" }],
    });
  }

  findUsageSummary(input: {
    tenantId: string;
    agentId: string;
    featureId: string;
    cycleMonth: string;
    statType: string;
  }): Promise<TenantUsageSummaryRecord | null> {
    return prisma.tenantUsageSummary.findFirst({
      where: input,
    });
  }

  async recordUsage(
    input: UsagePersistenceInput,
  ): Promise<TenantUsageEventRecord | null> {
    try {
      return await prisma.$transaction(async (tx) => {
        const event = await tx.tenantUsageEvent.create({
          data: {
            tenantId: input.tenantId,
            agentId: input.normalizedAgentId,
            featureId: input.normalizedFeatureId,
            userId: input.userId ?? null,
            usedQuota: BigInt(input.usage.totalTokens),
            inputQuota: BigInt(input.usage.promptTokens),
            outputQuota: BigInt(input.usage.completionTokens),
            requestId: input.requestId,
            businessId: input.businessId ?? null,
            usageType: input.usageType ?? "normal",
            cycleDate: input.cycleDate,
            cycleMonth: input.cycleMonth,
            modelCode: input.modelCode,
            latencyMs: input.latencyMs,
          },
        });

        await Promise.all([
          this.upsertUsageSummaryWithClient(tx, {
            tenantId: input.tenantId,
            agentId: input.normalizedAgentId,
            featureId: input.normalizedFeatureId,
            cycleMonth: input.cycleMonth,
            statType: "detail",
            usage: input.usage,
          }),
          this.upsertUsageSummaryWithClient(tx, {
            tenantId: input.tenantId,
            agentId: COMMERCE_SENTINEL_UUID,
            featureId: COMMERCE_SENTINEL_UUID,
            cycleMonth: input.cycleMonth,
            statType: "summary",
            usage: input.usage,
          }),
        ]);

        return event;
      });
    } catch (error) {
      if (isUniqueConstraintError(error) && input.requestId) {
        return null;
      }

      throw error;
    }
  }

  upsertUsageSummary(input: {
    tenantId: string;
    agentId: string;
    featureId: string;
    cycleMonth: string;
    statType: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }): Promise<TenantUsageSummaryRecord> {
    return this.upsertUsageSummaryWithClient(prisma, input);
  }

  private upsertUsageSummaryWithClient(
    client: Pick<AiGatewayPrismaClient, "tenantUsageSummary">,
    input: {
      tenantId: string;
      agentId: string;
      featureId: string;
      cycleMonth: string;
      statType: string;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    },
  ): Promise<TenantUsageSummaryRecord> {
    return client.tenantUsageSummary.upsert({
      where: {
        tenantId_featureId_agentId_cycleMonth_statType: {
          tenantId: input.tenantId,
          featureId: input.featureId,
          agentId: input.agentId,
          cycleMonth: input.cycleMonth,
          statType: input.statType,
        },
      },
      create: {
        tenantId: input.tenantId,
        featureId: input.featureId,
        agentId: input.agentId,
        cycleMonth: input.cycleMonth,
        statType: input.statType,
        totalQuota: BigInt(input.usage.totalTokens),
        inputQuota: BigInt(input.usage.promptTokens),
        outputQuota: BigInt(input.usage.completionTokens),
        requestCount: 1n,
      },
      update: {
        totalQuota: { increment: BigInt(input.usage.totalTokens) },
        inputQuota: { increment: BigInt(input.usage.promptTokens) },
        outputQuota: { increment: BigInt(input.usage.completionTokens) },
        requestCount: { increment: 1n },
        lastSyncedAt: new Date(),
      },
    });
  }
}

function isUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
