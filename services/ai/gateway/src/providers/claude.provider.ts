import { Injectable } from '@nestjs/common';

import { BaseProvider, joinEndpoint } from './base.provider';
import type {
  ChatMessage,
  ProviderChatRequest,
  ProviderChatResponse,
} from '../types/gateway.types';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeChatResponse {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  error?: {
    message?: string;
  };
}

@Injectable()
export class ClaudeProvider extends BaseProvider {
  readonly providerName = 'claude';

  async chat(request: ProviderChatRequest): Promise<ProviderChatResponse> {
    const response = await this.postJson<ClaudeChatResponse>(
      resolveClaudeMessagesEndpoint(request.endpointUrl),
      {
        'x-api-key': request.apiKey,
        'anthropic-version': readStringConfig(
          request.config,
          'anthropicVersion',
          '2023-06-01',
        ),
      },
      {
        model: request.modelCode,
        system: buildSystemPrompt(request.messages),
        messages: buildClaudeMessages(request.messages),
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature,
        top_p: request.topP,
      },
    );

    const content = response.content
      ?.map((item) => item.text)
      .filter((text): text is string => typeof text === 'string')
      .join('');

    if (!content) {
      const providerMessage = response.error?.message ?? 'empty model response';
      throw new Error(`${this.providerName} returned invalid response: ${providerMessage}`);
    }

    const promptTokens = response.usage?.input_tokens ?? 0;
    const completionTokens = response.usage?.output_tokens ?? 0;

    return {
      content,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }
}

function resolveClaudeMessagesEndpoint(endpointUrl: string): string {
  if (endpointUrl.endsWith('/messages')) {
    return endpointUrl;
  }

  return joinEndpoint(endpointUrl, '/v1/messages');
}

function buildSystemPrompt(messages: ChatMessage[]): string | undefined {
  const systemMessages = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content.trim())
    .filter(Boolean);

  return systemMessages.length > 0 ? systemMessages.join('\n\n') : undefined;
}

function buildClaudeMessages(messages: ChatMessage[]): ClaudeMessage[] {
  return messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content,
    }));
}

function readStringConfig(
  config: Record<string, unknown> | undefined,
  key: string,
  fallback: string,
): string {
  const value = config?.[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
}
