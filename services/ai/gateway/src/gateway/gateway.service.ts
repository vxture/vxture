import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { MeteringService } from "../metering/metering.service";
import { ModelRegistryService } from "../registry/model-registry.service";
import { ModelRouterService } from "../router/model-router.service";
import { QuotaService } from "../quota/quota.service";
import type {
  AiModelRecord,
  ChatRequest,
  ChatResponse,
  StreamEvent,
  TokenUsage,
} from "../types/gateway.types";

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
        ...(request.temperature !== undefined
          ? { temperature: request.temperature }
          : {}),
        ...(request.maxTokens !== undefined
          ? { maxTokens: request.maxTokens }
          : {}),
        ...(request.topP !== undefined ? { topP: request.topP } : {}),
        ...(request.tools !== undefined ? { tools: request.tools } : {}),
        ...(request.toolChoice !== undefined
          ? { toolChoice: request.toolChoice }
          : {}),
        ...(model.config != null ? { config: model.config } : {}),
      });
      const latencyMs = Date.now() - startedAt;

      await this.recordUsage(
        model,
        request,
        requestId,
        providerResponse,
        latencyMs,
      );

      return {
        id: requestId,
        modelCode: model.modelCode,
        message: {
          role: "assistant",
          content: providerResponse.content,
          ...(providerResponse.toolCalls !== undefined
            ? { toolCalls: providerResponse.toolCalls }
            : {}),
        },
        usage: {
          promptTokens: providerResponse.promptTokens,
          completionTokens: providerResponse.completionTokens,
          totalTokens: providerResponse.totalTokens,
        },
        latencyMs,
        ...(providerResponse.finishReason !== undefined
          ? { finishReason: providerResponse.finishReason }
          : {}),
      };
    } catch (error) {
      throw error instanceof Error
        ? new InternalServerErrorException(error.message)
        : new InternalServerErrorException("AI gateway request failed");
    }
  }

  /**
   * 流式对话，返回 AsyncGenerator<StreamEvent>
   *
   * 控制器把每个 event 序列化为 SSE `data:` 行写回客户端。
   * 用量统计在流结束（done 事件）时写入。
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<StreamEvent> {
    this.validateChatRequest(request);

    const model = await this.registry.getActiveModel(request.modelCode);
    await this.quota.assertAllowed(model, request);
    const provider = this.router.resolve(model.provider);
    const apiKey = this.resolveApiKey(model);
    const startedAt = Date.now();
    const requestId = request.requestId?.trim() || randomUUID();

    let lastUsage: TokenUsage | undefined;
    try {
      for await (const event of provider.chatStream({
        endpointUrl: model.endpointUrl,
        apiKey,
        modelCode: model.modelCode,
        messages: request.messages,
        ...(request.temperature !== undefined
          ? { temperature: request.temperature }
          : {}),
        ...(request.maxTokens !== undefined
          ? { maxTokens: request.maxTokens }
          : {}),
        ...(request.topP !== undefined ? { topP: request.topP } : {}),
        ...(request.tools !== undefined ? { tools: request.tools } : {}),
        ...(request.toolChoice !== undefined
          ? { toolChoice: request.toolChoice }
          : {}),
        ...(model.config != null ? { config: model.config } : {}),
      })) {
        if (event.type === "done" && event.usage) {
          lastUsage = event.usage;
        }
        yield event;
      }
    } catch (error) {
      yield {
        type: "error",
        code: "PROVIDER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "AI gateway streaming failed",
      };
      return;
    }

    if (lastUsage) {
      const latencyMs = Date.now() - startedAt;
      await this.recordUsage(model, request, requestId, lastUsage, latencyMs);
    }
  }

  private validateChatRequest(request: ChatRequest): void {
    if (typeof request.tenantId !== "string" || !request.tenantId.trim()) {
      throw new BadRequestException("tenantId is required");
    }

    if (typeof request.modelCode !== "string" || !request.modelCode.trim()) {
      throw new BadRequestException("modelCode is required");
    }

    if (!Array.isArray(request.messages) || request.messages.length === 0) {
      throw new BadRequestException("messages cannot be empty");
    }

    const validRoles = new Set(["system", "user", "assistant", "tool"]);
    const invalidMessage = request.messages.some((message) => {
      if (!validRoles.has(message.role)) return true;
      if (typeof message.content !== "string") return true;
      // assistant 发起 tool_calls 时 content 允许为空字符串；其他角色必须非空
      if (message.role === "assistant" && message.toolCalls?.length)
        return false;
      return !message.content.trim();
    });

    if (invalidMessage) {
      throw new BadRequestException("messages contain invalid role or content");
    }
  }

  private resolveApiKey(model: AiModelRecord): string {
    const config = model.config as Record<string, unknown> | null;
    const apiKeyEnvVar =
      typeof config?.["apiKeyEnvVar"] === "string"
        ? config["apiKeyEnvVar"]
        : "";

    if (!apiKeyEnvVar) {
      return "";
    }

    const apiKey = process.env[apiKeyEnvVar];

    if (
      !apiKey &&
      !["private", "custom", "self-hosted"].includes(model.provider)
    ) {
      throw new UnauthorizedException(
        `Missing API key environment variable "${apiKeyEnvVar}" for model "${model.modelCode}"`,
      );
    }

    return apiKey ?? "";
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
      ...(request.agentId !== undefined ? { agentId: request.agentId } : {}),
      ...(request.userId !== undefined ? { userId: request.userId } : {}),
      ...(request.featureId !== undefined
        ? { featureId: request.featureId }
        : {}),
      ...(request.businessId !== undefined
        ? { businessId: request.businessId }
        : {}),
      ...(request.usageType !== undefined
        ? { usageType: request.usageType }
        : {}),
      modelCode: model.modelCode,
      usage,
      latencyMs,
    });
  }
}
