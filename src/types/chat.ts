export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  conversation_id?: string;
  options?: {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  };
}

export interface ChatResponse {
  response: ChatMessage;
  conversation_id: string;
  metadata?: {
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    model?: string;
  };
}
