import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { MeteringService } from '../metering/metering.service';
import { ModelRegistryService } from '../registry/model-registry.service';
import { ModelRouterService } from '../router/model-router.service';
import { QuotaService } from '../quota/quota.service';
import type {
  AiModelRecord,
  ChatRequest,
  ChatResponse,
  TokenUsage,
} from '../types/gateway.types';

@Injectable()
export class GatewayService {
  constructor(
    @Inject(ModelRegistryService)
    private readonly registry: ModelRegistryService,
    @Inject(ModelRouterService)
    private readonly router: ModelRouterService,
    @Inject(QuotaService)
    private readonly quota: QuotaService,
    @Inject(MeteringService)
    private readonly metering: MeteringService,
  ) {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    this.validateChatRequest(request);

    if (request.stream) {
      throw new BadRequestException('Streaming chat is not enabled in the gateway yet');
    }

    const model = await this.registry.getActiveModel(request.modelCode);
    await this.quota.assertAllowed(model, request);
    const provider = this.router.resolve(model.provider);
    const apiKey = this.resolveApiKey(model);
    const startedAt = Date.now();
    const requestId = request.requestId?.trim() || randomUUID();

    try {
      const providerResponse = await provider.chat({
        endpointUrl: model.endpointUrl,
        apiKey,
        modelCode: model.modelCode,
        messages: request.messages,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
        topP: request.topP,
        config: model.config ?? undefined,
      });
      const latencyMs = Date.now() - startedAt;

      await this.recordUsage(model, request, requestId, providerResponse, latencyMs);

      return {
        id: requestId,
        modelCode: model.modelCode,
        message: {
          role: 'assistant',
          content: providerResponse.content,
        },
        usage: {
          promptTokens: providerResponse.promptTokens,
          completionTokens: providerResponse.completionTokens,
          totalTokens: providerResponse.totalTokens,
        },
        latencyMs,
      };
    } catch (error) {
      throw error instanceof Error
        ? new InternalServerErrorException(error.message)
        : new InternalServerErrorException('AI gateway request failed');
    }
  }

  private validateChatRequest(request: ChatRequest): void {
    if (typeof request.tenantId !== 'string' || !request.tenantId.trim()) {
      throw new BadRequestException('tenantId is required');
    }

    if (typeof request.modelCode !== 'string' || !request.modelCode.trim()) {
      throw new BadRequestException('modelCode is required');
    }

    if (!Array.isArray(request.messages) || request.messages.length === 0) {
      throw new BadRequestException('messages cannot be empty');
    }

    const invalidMessage = request.messages.some((message) => (
      !['system', 'user', 'assistant'].includes(message.role)
      || typeof message.content !== 'string'
      || !message.content.trim()
    ));

    if (invalidMessage) {
      throw new BadRequestException('messages contain invalid role or content');
    }
  }

  private resolveApiKey(model: AiModelRecord): string {
    if (!model.apiKeyEnvVar.trim()) {
      return '';
    }

    const apiKey = process.env[model.apiKeyEnvVar];

    if (!apiKey && model.provider !== 'private') {
      throw new UnauthorizedException(
        `Missing API key environment variable "${model.apiKeyEnvVar}" for model "${model.modelCode}"`,
      );
    }

    return apiKey ?? '';
  }

  private async recordUsage(
    model: AiModelRecord,
    request: ChatRequest,
    requestId: string,
    usage: TokenUsage,
    latencyMs: number,
  ): Promise<void> {
    await this.metering.record({
      requestId,
      tenantId: request.tenantId,
      agentId: request.agentId,
      userId: request.userId,
      featureId: request.featureId,
      businessId: request.businessId,
      usageType: request.usageType,
      modelCode: model.modelCode,
      usage,
      latencyMs,
    });
  }
}
