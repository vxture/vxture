# @vxture/service-ai-gateway

> 能力域设计：[`docs/design/ai-gateway.md`](../../design/ai-gateway.md)

---

## 包信息

| 项 | 值 |
|----|-----|
| 包名 | `@vxture/service-ai-gateway` |
| 路径 | `services/ai/gateway/` |
| @layer | `Domain` |
| 端口 | 3100 |
| 框架 | NestJS |

## 职责

AI 模型统一调度层：模型注册、路由调度、配额控制、用量计量。所有 agent-server 的 LLM 调用必须经过此服务，禁止直接对接 provider API。

## 目录结构

```
src/
├── gateway/        ← 请求路由主逻辑
├── registry/       ← 模型注册表（provider × model）
├── router/         ← 路由策略（按租户 / 按模型 / 按 quota）
├── quota/          ← 配额管理
├── metering/       ← 用量计量与记录
├── providers/      ← Provider 适配层（Anthropic / Doubao 等）
└── types/          ← 共享类型
```

## 依赖约束

```typescript
✅ @vxture/core-* / @vxture/shared
✅ @prisma/client（计量数据持久化）
❌ @vxture/ai-sdk（ai-sdk 调用 gateway，非反向）
❌ agent-server/* / bff-* / portals/*
```

## 核心约束

- 所有 LLM 调用必须经过 `gateway/` 主逻辑，不可绕过
- Provider 适配层隔离在 `providers/`，禁止在其他模块直接 import Anthropic / Doubao SDK
- 配额超出时返回标准错误，不静默降级
