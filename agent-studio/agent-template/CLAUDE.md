# CLAUDE.md — agent-server/ruinagent

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 路径 | `agent-server/ruinagent/` |
| @layer | `Application` |
| 性质 | Agent 私有后端，非共享包 |

---

## 职责

ruinagent 的私有后端服务：AI 模型编排、私有数据存储、工作流处理。
只被 `bff/ruinagent-bff` 消费，不对前端直接暴露。

---

## 目录结构

```
src/
├── routers/      # *.router.ts   — 路由，供 BFF 调用
├── workflows/    # *.workflow.ts — AI 工作流
├── providers/    # *.provider.ts — model provider 配置
├── storage/      # *.storage.ts  — 私有数据访问
├── services/     # *.service.ts  — 私有业务逻辑
├── types/        # *.types.ts    — 私有类型
└── index.ts
```

---

## 允许的依赖

- `@vxture/ai-sdk`（必须通过此包调用所有 AI 能力）
- `@vxture/service-*`（平台共享服务）
- `@vxture/core-*`
- `@vxture/shared`
- NestJS / Prisma / BullMQ / class-validator

## 严格禁止

- 直接 import Anthropic SDK / Doubao SDK / 任何 LLM provider 包
- 跨 `agent-server/*` 目录导入
- `@vxture/bff-*` / `design-system` / `platform-*`
- React / Next.js
- route handler 内联 Prisma 查询

---

## AI 调用规范

```typescript
// ✅ 只允许通过 ai-sdk
import { llmClient } from '@vxture/ai-sdk/llm'
import { embed } from '@vxture/ai-sdk/embedding'

// ❌ 禁止直接使用 provider SDK
import Anthropic from '@anthropic-ai/sdk'
```

---

## 文件头模板

```typescript
/**
 * filename.ts - 简短描述
 * @package agent-server/ruinagent
 *
 * Description: 详细说明
 *
 * @author AI-Generated
 * @date YYYY-MM-DD
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Router | Workflow | Provider | Storage | Service | Types
 */
```

---

## 晋升规则

当某段业务逻辑被 2 个以上 agent 需要时，提取到 `services/{domain}/{name}/`，不在 agent 间直接 import。

---

## TypeScript

- 禁止 `any`
- storage 方法返回类型必须明确，禁止返回 Prisma 原始类型
- 纯类型导入使用 `import type`
