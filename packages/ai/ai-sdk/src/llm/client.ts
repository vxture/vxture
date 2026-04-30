import type {
  LLMConfig,
  LLMError,
  LLMFinishReason,
  LLMMessage,
  LLMOptions,
  LLMResponse,
  LLMStreamChunk,
  LLMTool,
  LLMToolCall,
  LLMToolChoice,
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

interface GatewayChatMessage {
  role: LLMMessage['role'];
  content: string;
  toolCalls?: LLMToolCall[];
  toolCallId?: string;
  name?: string;
}

interface GatewayChatRequest {
  modelCode: string;
  messages: GatewayChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  tools?: LLMTool[];
  toolChoice?: LLMToolChoice;
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
    toolCalls?: LLMToolCall[];
  };
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  finishReason?: LLMFinishReason;
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
        'Use chatStream() for streaming responses',
      );
    }

    const request = this.buildRequest(messages, config, options, false);
    const response = await this.post<GatewayChatResponse>(
      '/ai/gateway/chat',
      request,
      options.timeout ?? this.defaultTimeoutMs,
    );

    return {
      content: response.message.content,
      toolCalls: response.message.toolCalls,
      finishReason: response.finishReason,
      usage: response.usage,
      model: response.modelCode,
      latency: response.latencyMs,
    };
  }

  /**
   * 流式对话，返回 AsyncGenerator<LLMStreamChunk>
   *
   * 调用方按事件类型增量处理：
   * - 'text' 事件 → 拼接到对外输出
   * - 'tool_call' 事件 → 中断本轮，执行工具，把结果以 role:'tool' 消息追加后再次调用
   * - 'done' 事件 → 本轮结束
   * - 'error' 事件 → 流内错误（HTTP 层错误以异常形式抛出）
   *
   * @example
   * for await (const chunk of client.chatStream(messages, config, { tools })) {
   *   if (chunk.type === 'text') process.stdout.write(chunk.delta);
   *   if (chunk.type === 'tool_call') await runTool(chunk.toolCall);
   * }
   */
  async *chatStream(
    messages: LLMMessage[],
    config: LLMConfig,
    options: GatewayLLMChatOptions = {},
  ): AsyncGenerator<LLMStreamChunk, void, void> {
    const request = this.buildRequest(messages, config, options, true);
    const controller = new AbortController();
    const timeoutMs = options.timeout ?? this.defaultTimeoutMs;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.gatewayUrl}/ai/gateway/chat`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'text/event-stream',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timer);
      throw new GatewayLLMError(
        'GATEWAY_REQUEST_FAILED',
        'AI gateway streaming request failed',
        error,
      );
    }

    if (!response.ok) {
      const errorText = await safeReadText(response);
      clearTimeout(timer);
      throw new GatewayLLMError(
        `HTTP_${response.status}`,
        parseErrorMessage(errorText, response.status),
      );
    }

    if (!response.body) {
      clearTimeout(timer);
      throw new GatewayLLMError('EMPTY_GATEWAY_STREAM', 'AI gateway returned an empty stream');
    }

    try {
      yield* parseSseStream(response.body);
    } finally {
      clearTimeout(timer);
    }
  }

  private buildRequest(
    messages: LLMMessage[],
    config: LLMConfig,
    options: GatewayLLMChatOptions,
    stream: boolean,
  ): GatewayChatRequest {
    return {
      modelCode: String(config.model),
      messages: messages.map(toWireMessage),
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      topP: config.topP,
      tools: options.tools,
      toolChoice: options.toolChoice,
      stream,
      tenantId: options.tenantId ?? this.tenantId,
      agentId: options.agentId ?? this.agentId,
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

function toWireMessage(message: LLMMessage): GatewayChatMessage {
  const wire: GatewayChatMessage = {
    role: message.role,
    content: message.content,
  };
  if (message.toolCalls?.length) {
    wire.toolCalls = message.toolCalls;
  }
  if (message.toolCallId) {
    wire.toolCallId = message.toolCallId;
  }
  if (message.name) {
    wire.name = message.name;
  }
  return wire;
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

/**
 * 解析 SSE 流为 LLMStreamChunk 序列
 *
 * Gateway 约定：每个 `data:` 行的内容是一段 JSON，
 * 形态为 LLMStreamChunk；流尾以 `data: [DONE]` 结束。
 */
async function* parseSseStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<LLMStreamChunk, void, void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });

      let separatorIndex = findEventBoundary(buffer);
      while (separatorIndex !== -1) {
        const rawEvent = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex).replace(/^(\r?\n){1,2}/, '');
        const chunk = parseSseEvent(rawEvent);
        if (chunk === 'done') {
          return;
        }
        if (chunk) {
          yield chunk;
        }
        separatorIndex = findEventBoundary(buffer);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function findEventBoundary(buffer: string): number {
  const lf = buffer.indexOf('\n\n');
  const crlf = buffer.indexOf('\r\n\r\n');
  if (lf === -1) return crlf;
  if (crlf === -1) return lf;
  return Math.min(lf, crlf);
}

function parseSseEvent(raw: string): LLMStreamChunk | 'done' | null {
  const dataLines: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^ /, ''));
    }
  }
  if (dataLines.length === 0) return null;

  const payload = dataLines.join('\n').trim();
  if (!payload) return null;
  if (payload === '[DONE]') return 'done';

  try {
    return JSON.parse(payload) as LLMStreamChunk;
  } catch {
    return { type: 'error', code: 'PARSE_FAILED', message: `Invalid SSE payload: ${payload}` };
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
