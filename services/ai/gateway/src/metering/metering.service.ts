import { Inject, Injectable } from "@nestjs/common";

import { normalizeUuidScope, toCycleMonth } from "../quota/quota.service";
import { ModelRegistryRepository } from "../registry/model-registry.repository";
import type { UsageLogInput } from "../types/gateway.types";

@Injectable()
export class MeteringService {
  constructor(
    @Inject(ModelRegistryRepository)
    private readonly repository: ModelRegistryRepository,
  ) {}

  async record(input: UsageLogInput): Promise<void> {
    const now = new Date();
    const cycleDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const cycleMonth = toCycleMonth(now);
    const normalizedAgentId = normalizeUuidScope(input.agentId);
    const normalizedFeatureId = normalizeUuidScope(input.featureId);

    await this.repository.recordUsage({
      ...input,
      normalizedAgentId,
      normalizedFeatureId,
      cycleDate,
      cycleMonth,
    });
  }
}
