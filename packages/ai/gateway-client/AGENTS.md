# @vxture/ai-gateway-client

> 上下文导航指针 | 完整文档在 `docs/` 体系

## 工作前必读

| 步骤            | 文档                                                                        |
| --------------- | --------------------------------------------------------------------------- |
| 1. 全局规则     | 根目录 `AGENTS.md`（G1–G6）                                                 |
| 2. 任务路由     | [`docs/agent.md`](../../../docs/agent.md)                                   |
| 3. 层架构规范   | [`docs/architecture/06-ai-sdk.md`](../../../docs/architecture/06-ai-sdk.md) |
| 4. 包实现上下文 | [`docs/packages/ai/ai-sdk.md`](../../../docs/packages/ai/ai-sdk.md)         |

> 职责：AI Gateway HTTP 客户端封装（LLM / Embedding / RAG / Workflow 类型）
> 消费方：agent-server/vela、agent-server/ruyin — 禁止 bff/_ 和 portals/_ 直接引用
