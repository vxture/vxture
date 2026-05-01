# CLAUDE.md — agent-server/vela（Vela Server）

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 名称 | `vela-server`（无 @vxture 包名，独立应用）|
| 路径 | `agent-server/vela/` |
| @layer | `Application` / `Domain`（agent 私有）|
| 对外接口 | `POST /internal/vela/chat`（仅 vela-bff 调用）|

---

## 职责

1. 接收来自 vela-bff 的内部请求，解码并二次校验 `CallerContext`
2. 通过 `ToolRegistry` 过滤当前 context 允许的工具
3. 调用 `@vxture/ai-sdk/llm` 执行 Tool Use Loop
4. 流式返回 SSE 事件给 vela-bff（透传给前端）
5. 会话 + 消息持久化（Prisma → PostgreSQL）

---

## ⚠️ 核心约束（违反破坏安全）

1. `agent-server/vela` **禁止 import** 其他 `agent-server/*` 目录内容
2. 所有 LLM 调用通过 `@vxture/ai-sdk/llm`，禁止直接 import 任何 provider SDK
3. `console` surface 工具执行时必须以 `ctx.tenantId` 作为数据过滤条件
4. 工具执行前必须经过 `ToolRegistry` 的 `allowedTools` 白名单校验
5. `CallerContext` 在收到后必须二次校验 surface × userType 合法性
6. 执行类工具（二期）必须先写 `VelaAuditLog` 再执行操作

---

## 目录结构

```
src/
├── main.ts
├── app.module.ts
├── context/
│   ├── caller-context.types.ts  # 与 bff/vela-bff 镜像，禁止跨包 import
│   └── context.guard.ts         # CallerContext 解码 + 二次校验
├── chat/
│   ├── chat.module.ts
│   ├── chat.controller.ts       # POST /internal/vela/chat
│   ├── chat.service.ts          # Tool Use Loop 主逻辑
│   ├── chat.types.ts
│   └── prompts/
│       └── system.prompt.ts
├── tools/
│   ├── tool.types.ts            # VelaTool 接口
│   ├── tool-registry.ts         # ToolRegistry Injectable
│   ├── tool-whitelist.const.ts  # 与 bff/vela-bff 镜像，禁止跨包 import
│   ├── admin/                   # admin surface 工具（operator 专用）
│   │   ├── tenant-query.tool.ts
│   │   ├── billing-query.tool.ts
│   │   ├── subscription-query.tool.ts
│   │   └── ticket-query.tool.ts
│   └── console/                 # console surface 工具（tenantId 强制隔离）
│       ├── my-subscription.tool.ts
│       ├── my-billing.tool.ts
│       ├── my-usage.tool.ts
│       └── my-tickets.tool.ts
├── storage/
│   ├── session.repository.ts
│   └── message.repository.ts
└── index.ts
```

---

## 允许的依赖

- `@vxture/ai-sdk`（LLM 调用，禁止直接 import provider SDK）
- `@vxture/service-billing` / `@vxture/service-subscription` / `@vxture/service-ticket`
- `@vxture/core-auth` / `@vxture/core-config`
- `@vxture/shared`
- NestJS / `@prisma/client`

## 严格禁止

- 其他 `agent-server/*` 目录（vela 独立治理）
- `bff-*` 包（包引用）
- `@vxture/design-system` / `platform-*`
- React / Next.js / 浏览器 API
- 直接 import Anthropic SDK / Doubao SDK 等 provider SDK
