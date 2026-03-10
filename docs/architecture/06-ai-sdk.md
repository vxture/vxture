# Vxture AI SDK Architecture

**Version**: 1.2.0
**Last Updated**: 2026-03-10
**TypeScript**: 5.9.3

## Overview

`@vxture/ai-sdk` is the **shared AI capabilities package** for the Vxture platform.

It provides a unified interface for AI operations consumed by `agent-server/*` backends.
All AI model calls, retrieval pipelines, embedding operations, and workflow orchestration
go through this package — agent backends never integrate AI providers directly.

The SDK is organized as **a single package with independent internal modules**.
Each agent imports only the modules it needs.

---

# 1. Package

```
@vxture/ai-sdk
```

Location:

```
packages/ai/ai-sdk/
```

---

# 2. Internal Structure

```
packages/ai/ai-sdk/
├── package.json
├── tsconfig.json
└── src/
    ├── llm/              # LLM 客户端模块
    │   ├── client.ts
    │   ├── providers/    # Provider 实现
    │   ├── types.ts
    │   └── index.ts
    ├── rag/              # 检索增强生成模块
    │   ├── pipeline.ts
    │   ├── retriever.ts
    │   ├── types.ts
    │   └── index.ts
    ├── embedding/        # 向量化模块
    │   ├── embedder.ts
    │   ├── types.ts
    │   └── index.ts
    ├── workflow/         # 工作流编排模块
    │   ├── workflow.ts
    │   ├── step.ts
    │   ├── types.ts
    │   └── index.ts
    └── index.ts          # 统一导出入口
```

---

# 3. Modules

## llm — LLM 客户端

**职责**：统一的大语言模型调用接口，屏蔽不同 provider 的 API 差异。

- 统一调用接口（chat completion、streaming）
- Provider 抽象层：Doubao（豆包）、Claude（Anthropic）、自定义/私有模型
- 请求参数标准化
- 响应格式标准化
- 错误处理与重试

Provider 抽象原则：agent-server 只与统一接口交互，切换 provider 不需要修改业务代码。

```ts
import { llmClient } from '@vxture/ai-sdk/llm';

const response = await llmClient.chat({
  provider: 'doubao',
  model: 'doubao-pro-32k',
  messages: [{ role: 'user', content: '...' }],
});
```

## rag — 检索增强生成

**职责**：RAG 管道的标准化实现，将文档检索与 LLM 生成结合。

- 文档切片与预处理
- 向量检索接口
- 上下文组装
- 检索-生成管道编排

```ts
import { createRagPipeline } from '@vxture/ai-sdk/rag';

const pipeline = createRagPipeline({
  retriever: myRetriever,
  llm: llmClient,
});
const result = await pipeline.query('用户问题');
```

## embedding — 向量化

**职责**：文本向量化，为 RAG 和语义搜索提供基础能力。

- 文本转向量
- 批量向量化
- 向量相似度计算
- 支持多种 embedding 模型

```ts
import { embed } from '@vxture/ai-sdk/embedding';

const vector = await embed('需要向量化的文本');
const vectors = await embed(['文本1', '文本2']);
```

## workflow — 工作流编排

**职责**：多步骤 AI 工作流的定义与执行，支持串行、并行、条件分支。

- 工作流定义 DSL
- 步骤执行与状态管理
- 错误处理与回滚
- 工作流实例的生命周期管理

```ts
import { defineWorkflow } from '@vxture/ai-sdk/workflow';

const myWorkflow = defineWorkflow({
  steps: [
    { name: 'extract', handler: extractStep },
    { name: 'analyze', handler: analyzeStep },
    { name: 'generate', handler: generateStep },
  ],
});

await myWorkflow.run({ input: data });
```

---

# 4. Import Patterns

**模块级导入**（推荐）— 按需引入，减少包体积：

```ts
import { llmClient } from '@vxture/ai-sdk/llm';
import { createRagPipeline } from '@vxture/ai-sdk/rag';
import { embed } from '@vxture/ai-sdk/embedding';
import { defineWorkflow } from '@vxture/ai-sdk/workflow';
```

**包级导入** — 引入全部能力：

```ts
import { llmClient, createRagPipeline, embed, defineWorkflow } from '@vxture/ai-sdk';
```

---

# 5. Dependency Rules

Allowed:

```
@vxture/shared
```

Forbidden:

```
@vxture/service-*      (业务逻辑不属于 AI 基础设施)
@vxture/bff-*
@vxture/core-*         (TBD — 如需配置能力，通过参数注入而非直接依赖)
@vxture/design-system
@vxture/platform-*
Any frontend packages
```

**Constraint**: 严格服务端专用。任何前端代码（`portals/*`、`agent-studio/*`）禁止导入此包。

---

# 6. Consumers

`@vxture/ai-sdk` 仅被 `agent-server/*` 消费：

| Consumer         | 典型用途                                   |
| ---------------- | ------------------------------------------ |
| `agent-server/*` | 调用 LLM、构建 RAG 管道、向量化、执行工作流 |

BFF、service、portal、agent-studio 均不直接导入此包。

---

# 7. Extension Rules

**新增 AI 能力时**，优先在 `ai-sdk` 内新增模块：

```
packages/ai/ai-sdk/src/{new-module}/
```

**提升为独立包的条件**（需同时满足）：
- 该能力需要独立版本控制（不同 agent 依赖不同版本）
- 该能力有独立的部署或运行时要求
- 该能力足够大，独立维护成本低于耦合成本

在满足上述条件之前，所有 AI 能力统一在 `ai-sdk` 内维护。

---

# 8. AI Coding Rules

AI 在操作 `@vxture/ai-sdk` 时必须：

1. 所有 AI 模型调用通过 `@vxture/ai-sdk` 的统一接口 — 禁止在 `agent-server` 中直接集成 provider SDK
2. 新 AI 能力以模块形式添加到 `src/` 下，不新建顶层包
3. 每个模块有独立的 `index.ts` 导出，支持模块级导入
4. 不依赖任何 `@vxture/service-*` 或 `@vxture/core-*` 包
5. 不导入任何前端相关包
6. 所有公共 API 通过 `src/index.ts` 和各模块的 `index.ts` 导出
7. 不使用 `any` 类型

---

End of document.
