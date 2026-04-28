import type {
  LLMConfig,
  LLMError,
  LLMMessage,
  LLMOptions,
  LLMResponse,
} from './types';

export interface GatewayLLMClientOptions {
  gatewayUrl?: string;
  tenantId: string;
  agentId?: string;
  defaultTimeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export interface GatewayLLMChatOptions extends LLMOptions {
  tenantId?: string;
  agentId?: string;
}

interface GatewayChatRequest {
  modelCode: string;
  messages: Array<{
    role: LLMMessage['role'];
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  tenantId: string;
  agentId?: string;
}

interface GatewayChatResponse {
  id: string;
  modelCode: string;
  message: {
    role: 'assistant';
    content: string;
  };
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
}

export class GatewayLLMError extends Error implements LLMError {
  constructor(
    readonly code: string,
    message: string,
    readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'GatewayLLMError';
  }
}

export class GatewayLLMClient {
  private readonly gatewayUrl: string;
  private readonly tenantId: string;
  private readonly agentId?: string;
  private readonly defaultTimeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: GatewayLLMClientOptions) {
    this.gatewayUrl = normalizeGatewayUrl(options.gatewayUrl ?? process.env.AI_GATEWAY_URL);
    if (!options.tenantId.trim()) {
      throw new GatewayLLMError('MISSING_TENANT_ID', 'tenantId is required for GatewayLLMClient');
    }

    this.tenantId = options.tenantId;
    this.agentId = options.agentId;
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 60_000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async chat(
    messages: LLMMessage[],
    config: LLMConfig,
    options: GatewayLLMChatOptions = {},
  ): Promise<LLMResponse> {
    if (options.stream) {
      throw new GatewayLLMError(
        'STREAM_NOT_SUPPORTED',
        'Gateway streaming is not enabled in the ai-sdk client yet',
      );
    }

    const request: GatewayChatRequest = {
      modelCode: String(config.model),
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      topP: config.topP,
      stream: false,
      tenantId: options.tenantId ?? this.tenantId,
      agentId: options.agentId ?? this.agentId,
    };

    const response = await this.post<GatewayChatResponse>(
      '/ai/gateway/chat',
      request,
      options.timeout ?? this.defaultTimeoutMs,
    );

    return {
      content: response.message.content,
      usage: response.usage,
      model: response.modelCode,
      latency: response.latencyMs,
    };
  }

  private async post<TResponse>(
    path: string,
    body: GatewayChatRequest,
    timeoutMs: number,
  ): Promise<TResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await this.fetchImpl(`${this.gatewayUrl}${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const responseText = await response.text();

      if (!response.ok) {
        throw new GatewayLLMError(
          `HTTP_${response.status}`,
          parseErrorMessage(responseText, response.status),
        );
      }

      return parseJson<TResponse>(responseText);
    } catch (error) {
      if (error instanceof GatewayLLMError) {
        throw error;
      }

      throw new GatewayLLMError('GATEWAY_REQUEST_FAILED', 'AI gateway request failed', error);
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createGatewayLLMClient(
  options: GatewayLLMClientOptions,
): GatewayLLMClient {
  return new GatewayLLMClient(options);
}

function normalizeGatewayUrl(url: string | undefined): string {
  if (!url?.trim()) {
    throw new GatewayLLMError(
      'MISSING_GATEWAY_URL',
      'AI_GATEWAY_URL is required for GatewayLLMClient',
    );
  }

  return url.replace(/\/+$/, '');
}

function parseJson<TResponse>(text: string): TResponse {
  if (!text.trim()) {
    throw new GatewayLLMError('EMPTY_GATEWAY_RESPONSE', 'AI gateway returned an empty response');
  }

  return JSON.parse(text) as TResponse;
}

function parseErrorMessage(responseText: string, status: number): string {
  if (!responseText.trim()) {
    return `AI gateway request failed with status ${status}`;
  }

  try {
    const parsed = JSON.parse(responseText) as { message?: unknown };
    return typeof parsed.message === 'string'
      ? parsed.message
      : `AI gateway request failed with status ${status}`;
  } catch {
    return responseText;
  }
}
