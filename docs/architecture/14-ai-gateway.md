# Vxture AI Gateway — 架构设计与第一阶段实现

**Version**: 1.0.0
**Created**: 2026-04-23
**TypeScript**: 5.9.3 | **NestJS**: 11.x | **Prisma**: 6.x

---

## 一、为什么需要 AI Gateway

Vxture 平台需要接入多个 AI 模型：

- 云端模型：火山引擎豆包、Anthropic Claude
- 私有部署模型：视觉模型、机理模型（自研）

如果每个 agent-server 直接对接各自的模型 SDK，会导致：

- API Key 散落在各 agent，无法统一管理
- 无法做跨 agent 的配额控制和用量计量
- 切换模型或 provider 需要修改多处业务代码
- 私有模型协议适配逻辑重复开发

**AI Gateway 是解决这些问题的平台级基础设施**，所有模型调用统一经过它。

---

## 二、架构总览

### 2.1 调用链路

```
agent-studio/{N}
      │  HTTP
      ▼
bff/agent{N}-bff
      │  package import
      ▼
agent-server/{N}
      │  package import
      ▼
@vxture/ai-sdk          ← 统一调用接口（agent 只感知这一层）
      │  HTTP
      ▼
services/ai/gateway/    ← AI Gateway（@vxture/service-ai-gateway）
      │                    路由 · 授权 · 配额 · 计量
      ├──► 火山引擎豆包   (HTTPS)
      ├──► Anthropic Claude (HTTPS)
      ├──► 私有视觉模型   (内网 HTTP)
      └──► 私有机理模型   (内网 HTTP)
```

### 2.2 各层职责

| 层 | 位置 | 职责 |
|----|------|------|
| `@vxture/ai-sdk` | `packages/ai/ai-sdk/` | 统一调用接口，屏蔽 Gateway 细节 |
| `@vxture/service-ai-gateway` | `services/ai/gateway/` | 路由、授权、配额、计量、provider 适配 |
| Provider Adapters | gateway 内部 | 各模型协议适配，对外统一接口 |

### 2.3 架构对原有设计的调整

原架构文档（`06-ai-sdk.md`）中 `@vxture/ai-sdk` 直接调用 provider SDK。
调整后：

```
原来：ai-sdk → provider SDK（直接）
现在：ai-sdk → AI Gateway（HTTP）→ provider SDK（由 Gateway 管理）
```

`@vxture/ai-sdk` 的对外 API 保持不变，agent-server 代码无需修改。

---

## 三、目录结构

### 新增文件

```
packages/ai/ai-sdk/
└── src/
    └── llm/
        ├── client.ts           ← 修改：改为调用 Gateway HTTP API
        ├── providers/          ← 删除：provider 实现移入 Gateway
        ├── types.ts            ← 保持：统一类型定义
        └── index.ts

services/
└── ai/                         ← 新增 ai 业务域
    └── gateway/                ← @vxture/service-ai-gateway
        ├── package.json
        ├── tsconfig.json
        ├── prisma/
        │   └── schema.prisma   ← 模型注册、授权、用量表
        └── src/
            ├── providers/      ← Provider 适配器
            │   ├── base.provider.ts
            │   ├── doubao.provider.ts
            │   ├── claude.provider.ts
            │   └── private.provider.ts
            ├── router/         ← 路由引擎（选择哪个 provider）
            │   └── model-router.service.ts
            ├── quota/          ← 配额引擎
            │   └── quota.service.ts
            ├── metering/       ← 计量引擎
            │   └── metering.service.ts
            ├── registry/       ← 模型注册表
            │   ├── model-registry.service.ts
            │   └── model-registry.repository.ts
            ├── gateway/        ← 核心入口
            │   ├── gateway.service.ts
            │   └── gateway.controller.ts
            ├── types/
            │   └── gateway.types.ts
            ├── prisma.ts
            └── index.ts        ← 公共导出
```

---

## 四、数据模型（Prisma Schema）

文件：`services/ai/gateway/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 模型注册表 — 平台支持的所有 AI 模型
model AiModel {
  id           String   @id @default(cuid())
  modelCode    String   @unique  // 调用时使用，如 doubao-pro-32k
  modelName    String            // 显示名称
  provider     String            // doubao | claude | private
  endpointUrl  String            // API 地址
  protocol     String            // openai-compatible | custom
  capabilities String[]          // ["text","vision","embedding"]
  apiKeyEnvVar String            // 存放 API Key 的环境变量名，如 DOUBAO_API_KEY
  isActive     Boolean  @default(true)
  config       Json?             // 额外配置（不存密码，只存非敏感配置）
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  grants    AiModelGrant[]
  usageLogs AiUsageLog[]

  @@map("ai_model")
}

// 模型授权表 — 哪个租户/agent 可以使用哪个模型
model AiModelGrant {
  id          String    @id @default(cuid())
  modelId     String
  tenantId    String
  agentId     String?             // NULL 表示租户下所有 agent 均可用
  tokenQuota  BigInt    @default(-1)  // -1 = 无限制
  tokenUsed   BigInt    @default(0)
  expiresAt   DateTime?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  model AiModel @relation(fields: [modelId], references: [id])

  @@unique([modelId, tenantId, agentId])
  @@index([tenantId])
  @@index([modelId])
  @@map("ai_model_grant")
}

// 使用计量日志 — 每次调用记录
model AiUsageLog {
  id               String   @id @default(cuid())
  modelId          String
  tenantId         String
  agentId          String?
  promptTokens     Int      @default(0)
  completionTokens Int      @default(0)
  totalTokens      Int      @default(0)
  latencyMs        Int      @default(0)
  status           String   // success | failed
  errorCode        String?
  createdAt        DateTime @default(now())

  model AiModel @relation(fields: [modelId], references: [id])

  @@index([tenantId])
  @@index([modelId])
  @@index([createdAt])
  @@map("ai_usage_log")
}
```

---

## 五、类型定义

文件：`services/ai/gateway/src/types/gateway.types.ts`

```typescript
// 统一的聊天请求格式（OpenAI 兼容）
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  modelCode: string       // 对应 AiModel.modelCode
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
  // 调用方上下文（由 Gateway 用于授权和计量）
  tenantId: string
  agentId?: string
}

export interface ChatResponse {
  id: string
  modelCode: string
  message: ChatMessage
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  latencyMs: number
}

export interface StreamChunk {
  id: string
  delta: string
  done: boolean
}

// Provider 适配器接口 — 所有 provider 必须实现
export interface IModelProvider {
  readonly providerName: string
  chat(request: ProviderChatRequest): Promise<ProviderChatResponse>
  chatStream(request: ProviderChatRequest): AsyncGenerator<StreamChunk>
}

export interface ProviderChatRequest {
  endpointUrl: string
  apiKey: string
  modelCode: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}

export interface ProviderChatResponse {
  content: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

// 配额检查结果
export interface QuotaCheckResult {
  allowed: boolean
  reason?: string
  remaining: bigint
}
```

---

## 六、Provider 适配器

### 6.1 基类

文件：`services/ai/gateway/src/providers/base.provider.ts`

```typescript
import type {
  IModelProvider,
  ProviderChatRequest,
  ProviderChatResponse,
  StreamChunk,
} from '../types/gateway.types'

export abstract class BaseProvider implements IModelProvider {
  abstract readonly providerName: string
  abstract chat(request: ProviderChatRequest): Promise<ProviderChatResponse>
  abstract chatStream(request: ProviderChatRequest): AsyncGenerator<StreamChunk>

  // 将毫秒计时封装为 helper，子类使用
  protected startTimer(): () => number {
    const start = Date.now()
    return () => Date.now() - start
  }
}
```

### 6.2 豆包（火山引擎）适配器

文件：`services/ai/gateway/src/providers/doubao.provider.ts`

豆包使用 OpenAI 兼容接口，endpoint 为火山引擎 ARK API。

```typescript
import { Injectable } from '@nestjs/common'
import { BaseProvider } from './base.provider'
import type {
  ProviderChatRequest,
  ProviderChatResponse,
  StreamChunk,
} from '../types/gateway.types'

// 火山引擎 ARK API 响应类型
interface DoubaoResponse {
  id: string
  choices: {
    message: { role: string; content: string }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

@Injectable()
export class DoubaoProvider extends BaseProvider {
  readonly providerName = 'doubao'

  async chat(request: ProviderChatRequest): Promise<ProviderChatResponse> {
    const elapsed = this.startTimer()

    const response = await fetch(request.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${request.apiKey}`,
      },
      body: JSON.stringify({
        model: request.modelCode,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Doubao API error ${response.status}: ${error}`)
    }

    const data = (await response.json()) as DoubaoResponse
    const choice = data.choices[0]

    return {
      content: choice.message.content,
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    }
  }

  async *chatStream(request: ProviderChatRequest): AsyncGenerator<StreamChunk> {
    const response = await fetch(request.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${request.apiKey}`,
      },
      body: JSON.stringify({
        model: request.modelCode,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
        stream: true,
      }),
    })

    if (!response.ok || !response.body) {
      throw new Error(`Doubao stream error ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let id = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const lines = decoder.decode(value).split('\n')
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') {
          yield { id, delta: '', done: true }
          return
        }
        try {
          const parsed = JSON.parse(data) as {
            id: string
            choices: { delta: { content?: string } }[]
          }
          id = parsed.id
          const delta = parsed.choices[0]?.delta?.content ?? ''
          if (delta) yield { id, delta, done: false }
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}
```

### 6.3 私有模型适配器（通用 OpenAI 兼容）

文件：`services/ai/gateway/src/providers/private.provider.ts`

私有部署的视觉模型、机理模型只要实现 OpenAI 兼容接口即可复用此适配器。

```typescript
import { Injectable } from '@nestjs/common'
import { BaseProvider } from './base.provider'
import type {
  ProviderChatRequest,
  ProviderChatResponse,
  StreamChunk,
} from '../types/gateway.types'

// 复用 OpenAI 兼容协议，适配所有私有模型
@Injectable()
export class PrivateModelProvider extends BaseProvider {
  readonly providerName = 'private'

  async chat(request: ProviderChatRequest): Promise<ProviderChatResponse> {
    const response = await fetch(`${request.endpointUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 私有模型可能不需要 API Key，或用内网 token
        ...(request.apiKey ? { Authorization: `Bearer ${request.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: request.modelCode,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
      }),
    })

    if (!response.ok) {
      throw new Error(`Private model error ${response.status}: ${await response.text()}`)
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[]
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
    }

    return {
      content: data.choices[0].message.content,
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    }
  }

  async *chatStream(_request: ProviderChatRequest): AsyncGenerator<StreamChunk> {
    // 私有模型 streaming 按需实现，第一阶段留空
    throw new Error('Streaming not implemented for private models in phase 1')
  }
}
```

---

## 七、核心服务实现

### 7.1 模型注册表服务

文件：`services/ai/gateway/src/registry/model-registry.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common'
import { prisma } from '../prisma'
import type { AiModel } from '@prisma/client'

@Injectable()
export class ModelRegistryService {
  async findByCode(modelCode: string): Promise<AiModel> {
    const model = await prisma.aiModel.findUnique({
      where: { modelCode, isActive: true },
    })
    if (!model) {
      throw new NotFoundException(`Model not found or inactive: ${modelCode}`)
    }
    return model
  }

  async listActive(): Promise<AiModel[]> {
    return prisma.aiModel.findMany({ where: { isActive: true } })
  }

  // 从环境变量读取 API Key — 密钥不存数据库
  getApiKey(model: AiModel): string {
    const key = process.env[model.apiKeyEnvVar]
    if (!key && model.provider !== 'private') {
      throw new Error(`API key env var not set: ${model.apiKeyEnvVar}`)
    }
    return key ?? ''
  }
}
```

### 7.2 配额服务

文件：`services/ai/gateway/src/quota/quota.service.ts`

```typescript
import { Injectable } from '@nestjs/common'
import { prisma } from '../prisma'
import type { QuotaCheckResult } from '../types/gateway.types'

@Injectable()
export class QuotaService {
  async check(
    modelId: string,
    tenantId: string,
    agentId?: string,
  ): Promise<QuotaCheckResult> {
    const grant = await prisma.aiModelGrant.findFirst({
      where: {
        modelId,
        tenantId,
        isActive: true,
        OR: [{ agentId: agentId ?? null }, { agentId: null }],
        AND: [
          { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
        ],
      },
    })

    if (!grant) {
      return { allowed: false, reason: 'No active grant for this model', remaining: 0n }
    }

    if (grant.tokenQuota === -1n) {
      return { allowed: true, remaining: -1n }
    }

    const remaining = grant.tokenQuota - grant.tokenUsed
    if (remaining <= 0n) {
      return { allowed: false, reason: 'Token quota exceeded', remaining: 0n }
    }

    return { allowed: true, remaining }
  }

  async consume(
    modelId: string,
    tenantId: string,
    tokens: number,
    agentId?: string,
  ): Promise<void> {
    await prisma.aiModelGrant.updateMany({
      where: {
        modelId,
        tenantId,
        isActive: true,
        OR: [{ agentId: agentId ?? null }, { agentId: null }],
      },
      data: { tokenUsed: { increment: tokens } },
    })
  }
}
```

### 7.3 计量服务

文件：`services/ai/gateway/src/metering/metering.service.ts`

```typescript
import { Injectable } from '@nestjs/common'
import { prisma } from '../prisma'

export interface LogUsageParams {
  modelId: string
  tenantId: string
  agentId?: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  latencyMs: number
  status: 'success' | 'failed'
  errorCode?: string
}

@Injectable()
export class MeteringService {
  async log(params: LogUsageParams): Promise<void> {
    await prisma.aiUsageLog.create({ data: params })
  }
}
```

### 7.4 Gateway 核心服务

文件：`services/ai/gateway/src/gateway/gateway.service.ts`

```typescript
import { Injectable, ForbiddenException } from '@nestjs/common'
import { ModelRegistryService } from '../registry/model-registry.service'
import { QuotaService } from '../quota/quota.service'
import { MeteringService } from '../metering/metering.service'
import { DoubaoProvider } from '../providers/doubao.provider'
import { PrivateModelProvider } from '../providers/private.provider'
import type { IModelProvider } from '../types/gateway.types'
import type { ChatRequest, ChatResponse } from '../types/gateway.types'

@Injectable()
export class GatewayService {
  constructor(
    private readonly registry: ModelRegistryService,
    private readonly quota: QuotaService,
    private readonly metering: MeteringService,
    private readonly doubaoProvider: DoubaoProvider,
    private readonly privateProvider: PrivateModelProvider,
  ) {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const start = Date.now()

    // 1. 查找模型
    const model = await this.registry.findByCode(request.modelCode)

    // 2. 配额检查
    const quotaResult = await this.quota.check(
      model.id,
      request.tenantId,
      request.agentId,
    )
    if (!quotaResult.allowed) {
      throw new ForbiddenException(quotaResult.reason)
    }

    // 3. 选择 provider
    const provider = this.resolveProvider(model.provider)
    const apiKey = this.registry.getApiKey(model)

    // 4. 调用模型
    let status: 'success' | 'failed' = 'success'
    let errorCode: string | undefined

    try {
      const result = await provider.chat({
        endpointUrl: model.endpointUrl,
        apiKey,
        modelCode: model.modelCode,
        messages: request.messages,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
      })

      const latencyMs = Date.now() - start

      // 5. 扣减配额 + 记录计量（异步，不阻塞响应）
      void this.quota.consume(model.id, request.tenantId, result.totalTokens, request.agentId)
      void this.metering.log({
        modelId: model.id,
        tenantId: request.tenantId,
        agentId: request.agentId,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        totalTokens: result.totalTokens,
        latencyMs,
        status: 'success',
      })

      return {
        id: crypto.randomUUID(),
        modelCode: model.modelCode,
        message: { role: 'assistant', content: result.content },
        usage: {
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          totalTokens: result.totalTokens,
        },
        latencyMs,
      }
    } catch (err) {
      status = 'failed'
      errorCode = err instanceof Error ? err.message.slice(0, 64) : 'UNKNOWN'

      void this.metering.log({
        modelId: model.id,
        tenantId: request.tenantId,
        agentId: request.agentId,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        latencyMs: Date.now() - start,
        status,
        errorCode,
      })

      throw err
    }
  }

  private resolveProvider(providerName: string): IModelProvider {
    switch (providerName) {
      case 'doubao':
        return this.doubaoProvider
      case 'private':
        return this.privateProvider
      default:
        throw new Error(`Unsupported provider: ${providerName}`)
    }
  }
}
```

### 7.5 Gateway Controller（内部 HTTP API）

文件：`services/ai/gateway/src/gateway/gateway.controller.ts`

```typescript
import { Controller, Post, Body, HttpCode } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { GatewayService } from './gateway.service'
import type { ChatRequest, ChatResponse } from '../types/gateway.types'

@ApiTags('ai-gateway')
@Controller('ai/gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('chat')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unified chat completion endpoint' })
  async chat(@Body() request: ChatRequest): Promise<ChatResponse> {
    return this.gatewayService.chat(request)
  }
}
```

### 7.6 NestJS Module

文件：`services/ai/gateway/src/gateway.module.ts`

```typescript
import { Module } from '@nestjs/common'
import { GatewayController } from './gateway/gateway.controller'
import { GatewayService } from './gateway/gateway.service'
import { ModelRegistryService } from './registry/model-registry.service'
import { QuotaService } from './quota/quota.service'
import { MeteringService } from './metering/metering.service'
import { DoubaoProvider } from './providers/doubao.provider'
import { PrivateModelProvider } from './providers/private.provider'

@Module({
  controllers: [GatewayController],
  providers: [
    GatewayService,
    ModelRegistryService,
    QuotaService,
    MeteringService,
    DoubaoProvider,
    PrivateModelProvider,
  ],
  exports: [GatewayService],
})
export class GatewayModule {}
```

### 7.7 Barrel Export

文件：`services/ai/gateway/src/index.ts`

```typescript
export { GatewayModule } from './gateway.module'
export { GatewayService } from './gateway/gateway.service'
export type {
  ChatRequest,
  ChatResponse,
  ChatMessage,
  StreamChunk,
} from './types/gateway.types'
```

---

## 八、@vxture/ai-sdk 修改

`ai-sdk` 的 llm 模块改为调用 Gateway HTTP API，对外接口保持不变。

文件：`packages/ai/ai-sdk/src/llm/client.ts`

```typescript
import type { ChatMessage } from './types'

export interface LlmChatOptions {
  modelCode: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  tenantId: string
  agentId?: string
}

export interface LlmChatResult {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export class LlmClient {
  private readonly gatewayUrl: string

  constructor(gatewayUrl: string) {
    this.gatewayUrl = gatewayUrl
  }

  async chat(options: LlmChatOptions): Promise<LlmChatResult> {
    const response = await fetch(`${this.gatewayUrl}/ai/gateway/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error(`Gateway error ${response.status}: ${await response.text()}`)
    }

    const data = (await response.json()) as {
      message: { content: string }
      usage: { promptTokens: number; completionTokens: number; totalTokens: number }
    }

    return {
      content: data.message.content,
      usage: data.usage,
    }
  }
}

// 单例工厂（Gateway URL 从环境变量读取）
export function createLlmClient(): LlmClient {
  const url = process.env['AI_GATEWAY_URL']
  if (!url) throw new Error('AI_GATEWAY_URL environment variable is not set')
  return new LlmClient(url)
}

export const llmClient = {
  chat: async (options: LlmChatOptions) => createLlmClient().chat(options),
}
```

文件：`packages/ai/ai-sdk/src/llm/types.ts`

```typescript
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}
```

文件：`packages/ai/ai-sdk/src/llm/index.ts`

```typescript
export { llmClient, LlmClient, createLlmClient } from './client'
export type { LlmChatOptions, LlmChatResult } from './client'
export type { ChatMessage } from './types'
```

---

## 九、环境变量配置

### Gateway 服务（`services/ai/gateway/.env`）

```bash
# 数据库
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/vxture_dev"

# 豆包 / 火山引擎 ARK API Key
# 在火山引擎控制台 -> 方舟 -> API Keys 获取
DOUBAO_API_KEY="your-ark-api-key"

# 私有模型不需要 Key（内网直连），留空即可
PRIVATE_MODEL_API_KEY=""
```

### Agent Server（`agent-server/{N}/.env`）

```bash
# Gateway 地址（开发环境本机）
AI_GATEWAY_URL="http://localhost:3100"
```

### Gateway 服务端口约定

```
services/ai/gateway    → 端口 3100
bff/agent{N}-bff       → 端口 3200+
agent-server/{N}       → 端口 3300+
```

---

## 十、数据库初始化种子数据

创建豆包模型的注册记录（在 Navicat 或 psql 执行）：

```sql
-- 注册豆包 Pro 32K 模型
INSERT INTO ai_model (
  id, model_code, model_name, provider,
  endpoint_url, protocol, capabilities,
  api_key_env_var, is_active, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'doubao-pro-32k',
  '豆包 Pro 32K',
  'doubao',
  'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  'openai-compatible',
  ARRAY['text'],
  'DOUBAO_API_KEY',
  true,
  NOW(),
  NOW()
);

-- 给 zhangsan 的个人租户授权使用豆包模型（无限额，用于测试）
INSERT INTO ai_model_grant (
  id, model_id, tenant_id, agent_id,
  token_quota, token_used, is_active, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM ai_model WHERE model_code = 'doubao-pro-32k'),
  (SELECT id FROM tenant WHERE owner_id = '4df353bb-f716-471f-91dd-4a0f4c7dd210'),
  NULL,       -- 租户下所有 agent 均可用
  -1,         -- 无限制
  0,
  true,
  NOW(),
  NOW()
);
```

---

## 十一、第一阶段验证链路

以下是跑通技术通路的最小可用路径：

```
1. 启动 PostgreSQL（已有 Docker）
2. 执行 prisma migrate dev（创建 ai_model / ai_model_grant / ai_usage_log 表）
3. 执行上方种子 SQL（注册豆包模型 + 授权）
4. 启动 services/ai/gateway（端口 3100）
5. 用 curl 或 Postman 直接测试 Gateway：

   POST http://localhost:3100/ai/gateway/chat
   {
     "modelCode": "doubao-pro-32k",
     "tenantId": "<zhangsan的tenant id>",
     "messages": [{ "role": "user", "content": "你好，介绍一下你自己" }]
   }

6. 确认响应正常后，接入 agent-server：
   在 agent-server/agent01 中调用 @vxture/ai-sdk/llm 的 llmClient.chat()
7. 通路验证完成
```

---

## 十二、实施阶段路线

### 第一阶段（当前）— 跑通技术通路

```
目标：豆包模型完整调用链路可用
范围：
  ✅ Prisma Schema（ai_model / ai_model_grant / ai_usage_log）
  ✅ DoubaoProvider 适配器
  ✅ GatewayService（路由 + 配额检查 + 计量）
  ✅ GatewayController（POST /ai/gateway/chat）
  ✅ @vxture/ai-sdk llm 模块改为调用 Gateway
  ✅ 种子数据（模型注册 + 租户授权）
  ⏭ Streaming（跳过）
  ⏭ 管理界面（跳过）
```

### 第二阶段 — 接入 Agent

```
  agent-server/agent01 接入 ai-sdk
  agent01-bff 暴露对话接口
  agent-studio/agent01 前端对话界面
```

### 第三阶段 — 私有模型接入

```
  PrivateModelProvider 完善
  视觉模型 / 机理模型适配
  自定义协议支持
```

### 第四阶段 — 管理界面

```
  admin portal 模型管理页面
  租户配额管理
  用量统计看板
```

---

## 十三、依赖边界（遵循原架构规范）

```
新增组件的依赖规则：

@vxture/service-ai-gateway
  ✅ → @vxture/core-*
  ✅ → @vxture/shared
  ✅ → Prisma（数据库）
  ✅ → 外部 HTTP（模型 API）
  ❌ → @vxture/ai-sdk（反向依赖，禁止）
  ❌ → @vxture/bff-*
  ❌ → 任何前端包

@vxture/ai-sdk（llm 模块修改后）
  ✅ → @vxture/shared
  ✅ → 外部 HTTP（调用 Gateway）
  ❌ → @vxture/service-*（保持原规则）
```

---

## 十四、package.json 参考

文件：`services/ai/gateway/package.json`

```json
{
  "name": "@vxture/service-ai-gateway",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-fastify": "^11.0.0",
    "@nestjs/swagger": "^11.0.0",
    "@prisma/client": "^6.0.0",
    "@vxture/shared": "workspace:*"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "prisma": "^6.0.0",
    "typescript": "5.9.3"
  }
}
```

---

## 十五、给 Codex 的实现指令

将以下内容作为 Codex 的系统指令前缀：

```
## Project context

Monorepo: pnpm workspace, TypeScript 5.9.3 strict mode, NestJS 11, Prisma 6, PostgreSQL 16.
No `any` types. No cross-package relative imports. Export via src/index.ts only.
File naming: *.types.ts / *.service.ts / *.repository.ts / *.controller.ts / *.module.ts / *.provider.ts

## Task

Implement the AI Gateway as described in 14-ai-gateway.md.

Execute in this order:
1. Create services/ai/gateway/prisma/schema.prisma (Section 4)
2. Create services/ai/gateway/src/types/gateway.types.ts (Section 5)
3. Create services/ai/gateway/src/providers/ — base, doubao, private (Section 6)
4. Create services/ai/gateway/src/registry/model-registry.service.ts (Section 7.1)
5. Create services/ai/gateway/src/quota/quota.service.ts (Section 7.2)
6. Create services/ai/gateway/src/metering/metering.service.ts (Section 7.3)
7. Create services/ai/gateway/src/gateway/gateway.service.ts (Section 7.4)
8. Create services/ai/gateway/src/gateway/gateway.controller.ts (Section 7.5)
9. Create services/ai/gateway/src/gateway.module.ts (Section 7.6)
10. Create services/ai/gateway/src/index.ts (Section 7.7)
11. Create services/ai/gateway/src/prisma.ts — Prisma singleton with middleware guard
12. Modify packages/ai/ai-sdk/src/llm/client.ts (Section 8)
13. Create services/ai/gateway/package.json (Section 14)
14. Create services/ai/gateway/tsconfig.json — extends ../../../tsconfig.base.json

Do not create files outside of these paths.
Do not add any frontend packages, design-system, or platform-* imports.
All API keys come from process.env — never hardcode credentials.
```

---

End of document.
