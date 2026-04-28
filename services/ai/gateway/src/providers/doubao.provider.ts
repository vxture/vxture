import { Injectable } from '@nestjs/common';

import { BaseProvider, joinEndpoint } from './base.provider';
import type { OpenAiCompatibleChatResponse } from './openai-compatible.types';
import type {
  ProviderChatRequest,
  ProviderChatResponse,
} from '../types/gateway.types';

@Injectable()
export class DoubaoProvider extends BaseProvider {
  readonly providerName = 'doubao';

  async chat(request: ProviderChatRequest): Promise<ProviderChatResponse> {
    const response = await this.postJson<OpenAiCompatibleChatResponse>(
      resolveChatCompletionsEndpoint(request.endpointUrl),
      {
        authorization: `Bearer ${request.apiKey}`,
      },
      {
        model: request.modelCode,
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        top_p: request.topP,
      },
    );

    return normalizeOpenAiCompatibleResponse(this.providerName, response);
  }
}

export function normalizeOpenAiCompatibleResponse(
  providerName: string,
  response: OpenAiCompatibleChatResponse,
): ProviderChatResponse {
  const content = response.choices?.[0]?.message?.content;

  if (typeof content !== 'string') {
    const providerMessage = response.error?.message ?? 'empty model response';
    throw new Error(`${providerName} returned invalid response: ${providerMessage}`);
  }

  const promptTokens = response.usage?.prompt_tokens ?? 0;
  const completionTokens = response.usage?.completion_tokens ?? 0;

  return {
    content,
    promptTokens,
    completionTokens,
    totalTokens: response.usage?.total_tokens ?? promptTokens + completionTokens,
  };
}

export function resolveChatCompletionsEndpoint(endpointUrl: string): string {
  if (endpointUrl.endsWith('/chat/completions')) {
    return endpointUrl;
  }

  return joinEndpoint(endpointUrl, '/chat/completions');
}
