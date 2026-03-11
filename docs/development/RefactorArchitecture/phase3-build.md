# Phase 3 AI Prompt — Agent Server 层规范化

> 直接将以下内容发送给执行 Claude。

---

你是 Vxture Monorepo 的重构执行专家。现在执行 Phase 3：Agent Server 层规范化。

## 目标

- `agent-server/ruinagent/`

---

## 技术栈约束

### 允许使用

| 用途 | 选型 |
|------|------|
| 框架 | NestJS（Module / Injectable / Controller） |
| ORM | Prisma |
| DTO 校验 | class-validator + class-transformer |
| AI 调用 | `@vxture/ai-sdk`（统一接口，禁止直接集成 provider） |
| 队列 | BullMQ（基础功能） |
| 向量 | pgvector（通过 Prisma） |
| 文件存储 | 云 OSS S3 兼容接口 |
| 工具 | `@vxture/shared` / `@vxture/core-*` |

### 严格禁止

- 直接引用 Doubao SDK / Anthropic SDK / 任何 LLM provider SDK
- 跨 `agent-server/*` 目录导入（cross-agent 隔离）
- `@vxture/bff-*` / `design-system` / `platform-*`
- 任何前端包（React / Next.js）
- route handler 内联 Prisma 查询（必须通过 repository）
- 直接面向前端暴露 API（必须经过 BFF）

---

## 规范要求

### 1. 目录结构

```
src/
├── routers/      # *.router.ts  — HTTP 路由 / tRPC procedures（供 BFF 调用）
├── workflows/    # *.workflow.ts — AI 工作流定义
├── providers/    # *.provider.ts — AI model provider 配置
├── storage/      # *.storage.ts  — agent 私有数据访问封装
├── services/     # *.service.ts  — agent 私有业务逻辑
├── types/        # *.types.ts    — agent 私有类型
└── index.ts      # 应用入口
```

### 2. 文件命名

| 类型 | 规范 |
|------|------|
| 路由 | `*.router.ts` |
| 工作流 | `*.workflow.ts` |
| Provider 配置 | `*.provider.ts` |
| 数据访问 | `*.storage.ts` |
| 业务逻辑 | `*.service.ts` |
| 类型定义 | `*.types.ts` |

### 3. 文件头注释（每个文件必须）

```typescript
/**
 * filename.ts - 简短描述
 * @package agent-server/ruinagent
 *
 * Description: 详细功能说明
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Router | Workflow | Provider | Storage | Service | Types
 */
```

- 注释语言：中文
- 超过 80 行必须加 Section 分隔注释

### 4. 分层职责规范

**routers/**
- 只处理请求路由和响应格式化
- 调用 services/，不含业务逻辑
- 每个 router 独立捕获处理自己的错误

**workflows/**
- 使用 `@vxture/ai-sdk/workflow`（当前阶段用简单串行调用）
- 工作流定义与执行逻辑分离
- 不直接调用 LLM provider

**providers/**
- 通过 `@vxture/ai-sdk/llm` 配置 model provider
- 封装 provider 初始化，不在业务代码中硬编码

**storage/**
- 封装所有 Prisma 操作和 pgvector 查询
- 返回 agent 领域类型，不返回 Prisma 原始类型
- route handler 和 service 禁止内联 DB 查询

**services/**
- agent 私有业务逻辑
- 调用 storage/ 获取数据，调用 @vxture/ai-sdk 处理 AI 任务
- 可消费 @vxture/service-* 平台能力

### 5. AI 调用规范

```typescript
// ✅ 正确
import { llmClient } from '@vxture/ai-sdk/llm'
import { embed } from '@vxture/ai-sdk/embedding'

// ❌ 禁止
import Anthropic from '@anthropic-ai/sdk'
import { Doubao } from 'doubao-sdk'
```

### 6. 队列使用规范（BullMQ）

- 耗时 AI 任务通过 BullMQ 队列异步处理
- Queue / Worker / Processor 分文件定义
- 只使用 BullMQ 基础功能（add job / process job）

### 7. TypeScript

- 严格模式，禁止 any
- storage 方法返回类型必须明确
- 纯类型导入使用 import type

---

## 平台能力消费方式

```typescript
// 认证原语
import { verifyToken } from '@vxture/core-auth'
// 租户上下文
import { getTenantContext } from '@vxture/core-tenant'
// 平台服务（通过包名，不通过域路径）
import { BillingService } from '@vxture/service-billing'
import { SubscriptionService } from '@vxture/service-subscription'
```

---

## 执行方式

1. 输出完整 src/ 目录结构
2. 每个文件输出完整内容
3. 已有代码：合并规范，不覆盖已有逻辑，补齐缺失规范项

---

End of Phase 3 Prompt.
