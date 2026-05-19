import { Body, Controller, Get, Inject, Post, Res } from "@nestjs/common";

import { GatewayService } from "./gateway.service";
import { ModelRegistryService } from "../registry/model-registry.service";
import type {
  AiModelRecord,
  ChatRequest,
  ChatResponse,
  StreamEvent,
} from "../types/gateway.types";

interface ModelSummary {
  modelCode: string;
  modelName: string;
  provider: string;
  protocol: string;
  capabilities: string[];
}

interface GatewayResponse {
  status(code: number): this;
  json(body: unknown): this;
  setHeader(name: string, value: string): this;
  write(chunk: string): boolean;
  end(): void;
  flushHeaders?: () => void;
}

@Controller("ai/gateway")
export class GatewayController {
  constructor(
    @Inject(GatewayService)
    private readonly gateway: GatewayService,
    @Inject(ModelRegistryService)
    private readonly registry: ModelRegistryService,
  ) {}

  @Post("chat")
  async chat(
    @Body() body: ChatRequest,
    @Res() res: GatewayResponse,
  ): Promise<void> {
    if (body.stream) {
      await this.streamChat(body, res);
      return;
    }
    const response = await this.gateway.chat(body);
    res.json(response satisfies ChatResponse);
  }

  @Get("models")
  async listModels(): Promise<ModelSummary[]> {
    const models = await this.registry.listActiveModels();
    return models.map(toModelSummary);
  }

  private async streamChat(
    body: ChatRequest,
    res: GatewayResponse,
  ): Promise<void> {
    res.status(200);
    res.setHeader("content-type", "text/event-stream; charset=utf-8");
    res.setHeader("cache-control", "no-cache, no-transform");
    res.setHeader("connection", "keep-alive");
    res.setHeader("x-accel-buffering", "no"); // 提示 Nginx 关闭缓冲
    res.flushHeaders?.();

    const writeEvent = (event: StreamEvent): void => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    try {
      for await (const event of this.gateway.chatStream(body)) {
        writeEvent(event);
      }
      res.write("data: [DONE]\n\n");
    } catch (error) {
      writeEvent({
        type: "error",
        code: "GATEWAY_STREAM_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "AI gateway streaming failed",
      });
    } finally {
      res.end();
    }
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
