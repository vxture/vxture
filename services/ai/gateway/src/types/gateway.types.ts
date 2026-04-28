export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  modelCode: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  tenantId: string;
  agentId?: string;
  userId?: string;
  featureId?: string;
  requestId?: string;
  businessId?: string;
  usageType?: 'normal' | 'retry' | 'test';
}

export interface ChatResponse {
  id: string;
  modelCode: string;
  message: ChatMessage;
  usage: TokenUsage;
  latencyMs: number;
}

export interface StreamChunk {
  id: string;
  delta: string;
  done: boolean;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface IModelProvider {
  readonly providerName: string;
  chat(request: ProviderChatRequest): Promise<ProviderChatResponse>;
  chatStream(request: ProviderChatRequest): AsyncGenerator<StreamChunk>;
}

export interface ProviderChatRequest {
  endpointUrl: string;
  apiKey: string;
  modelCode: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  config?: ModelConfig;
}

export interface ProviderChatResponse extends TokenUsage {
  content: string;
}

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  remaining: bigint;
}

export type ModelConfig = Record<string, unknown>;

export interface AiModelRecord {
  id: string;
  providerId: string | null;
  modelCode: string;
  modelName: string;
  provider: string;
  endpointUrl: string;
  protocol: string;
  capabilities: string[];
  apiKeyEnvVar: string;
  isActive: boolean;
  config: ModelConfig | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface AiModelGrantRecord {
  id: string;
  modelId: string;
  tenantId: string;
  agentId: string | null;
  priority: number;
  reason: string | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface TenantSubscriptionQuotaRecord {
  id: string;
  tenantId: string;
  subscriptionId: string | null;
  maxUsers: number;
  maxApiKeys: number;
  maxWorkflows: number;
  maxConcurrent: number;
  rateLimitPerMinute: number;
  periodTokens: bigint;
  quotaCycle: string;
  allowedModels: string[];
  allowCustomModel: boolean;
  effectiveAt: Date;
  expiresAt: Date | null;
}

export interface TenantUsageSummaryRecord {
  id: string;
  tenantId: string;
  featureId: string;
  agentId: string;
  cycleMonth: string;
  totalQuota: bigint;
  inputQuota: bigint;
  outputQuota: bigint;
  requestCount: bigint;
  statType: string;
}

export interface TenantUsageEventRecord {
  id: string;
  tenantId: string;
  agentId: string;
  featureId: string;
  userId: string | null;
  usedQuota: bigint;
  inputQuota: bigint | null;
  outputQuota: bigint | null;
  requestId: string | null;
  businessId: string | null;
  usageType: string;
  cycleDate: Date;
  cycleMonth: string;
  createdAt: Date;
  modelCode: string | null;
  latencyMs: number | null;
}

export interface UsageLogInput {
  requestId: string;
  tenantId: string;
  agentId?: string;
  userId?: string;
  featureId?: string;
  businessId?: string;
  modelCode: string;
  usage: TokenUsage;
  latencyMs: number;
  usageType?: 'normal' | 'retry' | 'test';
}

export interface CreateAiModelInput {
  providerId?: string | null;
  modelCode: string;
  modelName: string;
  provider: string;
  endpointUrl: string;
  protocol: string;
  capabilities: string[];
  apiKeyEnvVar: string;
  config?: ModelConfig | null;
}

export interface UpdateAiModelInput {
  providerId?: string | null;
  modelCode?: string;
  modelName?: string;
  provider?: string;
  endpointUrl?: string;
  protocol?: string;
  capabilities?: string[];
  apiKeyEnvVar?: string;
  config?: ModelConfig | null;
  isActive?: boolean;
}

export interface CreateAiModelGrantInput {
  modelId: string;
  tenantId: string;
  agentId?: string | null;
  priority?: number;
  reason?: string | null;
  expiresAt?: Date | null;
  isActive?: boolean;
}

export interface UpdateAiModelGrantInput {
  agentId?: string | null;
  priority?: number;
  reason?: string | null;
  expiresAt?: Date | null;
  isActive?: boolean;
}
