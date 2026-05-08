# ruyin-server（@vxture/agent-server-ruyin）

> ⚠️ 待大版本重构 | 内容待核查补充
> 架构层参考：[`docs/architecture/11-agent-server.md`](../../architecture/11-agent-server.md)
> 产品规格：[`docs/product/agents/ruyin/spec.md`](../../product/agents/ruyin/spec.md)

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/agent-server-ruyin` |
| 路径 | `agent-server/ruyin/` |
| @layer | `Application` / `Domain`（agent 私有） |
| 端口 | 3112 |

## 当前状态

🟡 **运行中**（server 端），`agent-studio/ruyin` 和 `bff/ruyin-bff` 建设中。

## 已知特性

- 使用 BullMQ（Redis）处理异步任务队列
- 依赖 `@vxture/ai-sdk` 进行 LLM 调用
- 与 AI Gateway（端口 3100）通信

## 依赖约束

**允许：**
- `@vxture/ai-sdk` / `@vxture/service-billing` / `@vxture/service-subscription`
- `@vxture/core-*` / `@vxture/shared`
- NestJS / BullMQ / `@prisma/client`

**禁止：**
- 其他 `agent-server/*`（ruyin 独立治理）
- `bff-*` / `design-system` / `platform-*` / React / Next.js

## 待核查

- [ ] 确认 ruyin-server 已实现的核心功能模块
- [ ] 确认与 AI Gateway 的接口协议
- [ ] 确认 Prisma schema 范围
