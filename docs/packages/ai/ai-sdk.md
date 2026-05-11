# @vxture/ai-sdk

> 更新：2026-05-12
> 架构层参考：[`docs/architecture/06-ai-sdk.md`](../../architecture/06-ai-sdk.md)
> 依赖网关：[`docs/packages/services/ai-gateway.md`](../services/ai-gateway.md)

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/ai-sdk` |
| 路径 | `packages/ai/ai-sdk/` |
| @layer | `Infrastructure` |
| 消费方 | `agent-server/vela`、`agent-server/ruyin`、`services/ai/gateway` |

---

## 定位

`@vxture/ai-sdk` 是平台的 **AI 能力基础层**，对上层 agent-server 提供统一的 LLM 调用、Embedding、RAG 检索和工作流编排接口，屏蔽底层 AI Gateway 的 HTTP 协议细节。

所有 LLM 请求经由 **AI Gateway**（端口 3100）转发，不直接调用 LLM provider API — 计费归因和模型路由均在 Gateway 层完成。

---

## 模块结构

```
packages/ai/ai-sdk/src/
├── llm/          # LLM 对话客户端（核心）
│   ├── client.ts   GatewayLLMClient 实现
│   ├── types.ts    LLM 类型体系
│   └── index.ts
├── embedding/    # 文本向量化（类型定义，实现在 Gateway）
│   ├── types.ts
│   └── index.ts
├── rag/          # 检索增强生成（类型定义）
│   ├── types.ts
│   └── index.ts
├── workflow/     # 工作流编排（类型定义）
│   ├── types.ts
│   └── index.ts
└── index.ts      # 统一导出
```

---

## LLM 模块（核心）

### GatewayLLMClient

唯一的 LLM 调用入口，通过 HTTP 代理到 AI Gateway：

```typescript
import { createGatewayLLMClient } from '@vxture/ai-sdk';

const client = createGatewayLLMClient({
  tenantId: 'tenant-uuid',       // 必填，用于计费归因
  agentId: 'agent-uuid',         // 可选，按 agent 计量时使用
  gatewayUrl: process.env.AI_GATEWAY_URL,  // 默认读环境变量
  defaultTimeoutMs: 60_000,
});
```

**两种调用方式：**

```typescript
// 1. 普通对话（同步，等待完整响应）
const response = await client.chat(messages, { model: 'doubao-seed-2-0-lite' });
console.log(response.content, response.usage);

// 2. 流式对话（SSE，逐 chunk 处理）
for await (const chunk of client.chatStream(messages, config, { tools })) {
  if (chunk.type === 'text')      process.stdout.write(chunk.delta);
  if (chunk.type === 'tool_call') await runTool(chunk.toolCall);
  if (chunk.type === 'done')      break;
  if (chunk.type === 'error')     throw new Error(chunk.message);
}
```

### 消息类型（LLMMessage）

| role | 用途 |
|------|------|
| `system` | 系统提示词 |
| `user` | 用户输入 |
| `assistant` | 模型输出（Tool Use Loop 中含 toolCalls） |
| `tool` | 工具执行结果回填，需配合 `toolCallId` |

### Tool Use Loop 约定

```
发送消息 → chatStream() → chunk.type === 'tool_call'
  → 执行工具，得到结果
  → 追加 { role: 'tool', content: JSON.stringify(result), toolCallId }
  → 再次调用 chatStream()，循环直到 finishReason === 'stop'
```

vela-server 的 `ToolUseLoop` 是当前唯一的实现方。

### 错误类型

| code | 含义 |
|------|------|
| `MISSING_TENANT_ID` | 构造时未传 tenantId |
| `MISSING_GATEWAY_URL` | 未设置 `AI_GATEWAY_URL` |
| `GATEWAY_REQUEST_FAILED` | HTTP 请求失败（网络 / 超时） |
| `HTTP_4xx / HTTP_5xx` | Gateway 返回错误状态码 |
| `STREAM_NOT_SUPPORTED` | 对 `chat()` 传入 `stream: true`（应使用 `chatStream()`） |
| `EMPTY_GATEWAY_STREAM` | Gateway 返回空 SSE 流 |

---

## Embedding 模块

当前导出类型定义，实际向量化计算由 AI Gateway 执行。消费方（ruyin-server）通过 Gateway HTTP API 调用，不直接使用 SDK 层的 embedding 功能。

---

## RAG 模块

提供检索增强生成的类型契约（查询参数、检索结果、上下文构建）。具体检索实现依赖向量数据库，由各 agent-server 自行持久化。

---

## Workflow 模块

提供多步骤工作流编排的类型定义（`WorkflowStep`、`WorkflowContext`、`WorkflowTask`）。当前 ruyin-server 的 `DocumentAnalysisWorkflow` 基于此类型构建。

---

## 依赖约束

**允许引用 `@vxture/ai-sdk` 的包：**
- `agent-server/vela`
- `agent-server/ruyin`
- `services/ai/gateway`

**禁止引用的包：**
- `bff/*` — BFF 层不直接调用 AI，通过 agent-server 中转
- `portals/*` / `agent-studio/*` — 前端层禁止
- `services/*`（非 ai/gateway）— 业务服务不直接调用 LLM

**环境变量：**
- `AI_GATEWAY_URL`（必填，默认 `http://localhost:3100`）
