import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { ModelRegistryRepository } from "./model-registry.repository";
import type { AiModelRecord } from "../types/gateway.types";

@Injectable()
export class ModelRegistryService {
  constructor(
    @Inject(ModelRegistryRepository)
    private readonly repository: ModelRegistryRepository,
  ) {}

  async getActiveModel(modelCode: string): Promise<AiModelRecord> {
    const model = await this.repository.findActiveModelByCode(modelCode);

    if (!model) {
      throw new NotFoundException(
        `AI model "${modelCode}" is not registered or inactive`,
      );
    }

    return model;
  }

  listActiveModels(): Promise<AiModelRecord[]> {
    return this.repository.listActiveModels();
  }
}
