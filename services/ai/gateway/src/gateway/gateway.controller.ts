import { Body, Controller, Get, Inject, Post } from '@nestjs/common';

import { GatewayService } from './gateway.service';
import { ModelRegistryService } from '../registry/model-registry.service';
import type { AiModelRecord, ChatRequest, ChatResponse } from '../types/gateway.types';

interface ModelSummary {
  modelCode: string;
  modelName: string;
  provider: string;
  protocol: string;
  capabilities: string[];
}

@Controller('ai/gateway')
export class GatewayController {
  constructor(
    @Inject(GatewayService)
    private readonly gateway: GatewayService,
    @Inject(ModelRegistryService)
    private readonly registry: ModelRegistryService,
  ) {}

  @Post('chat')
  chat(@Body() body: ChatRequest): Promise<ChatResponse> {
    return this.gateway.chat(body);
  }

  @Get('models')
  async listModels(): Promise<ModelSummary[]> {
    const models = await this.registry.listActiveModels();
    return models.map(toModelSummary);
  }
}

function toModelSummary(model: AiModelRecord): ModelSummary {
  return {
    modelCode: model.modelCode,
    modelName: model.modelName,
    provider: model.provider,
    protocol: model.protocol,
    capabilities: model.capabilities,
  };
}
