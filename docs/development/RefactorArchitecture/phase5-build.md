# Phase 5 AI Prompt — 新 BFF 创建（ruinagent-bff）

> 直接将以下内容发送给执行 Claude。

---

你是 Vxture Monorepo 的重构执行专家。现在执行 Phase 5：从零创建 ruinagent-bff。

## 目标包

- `@vxture/bff-ruinagent`（bff/ruinagent-bff/）

---

## 背景

ruinagent-bff 是 Agent BFF，与 Portal BFF 不同：
- 同时桥接 `agent-studio/ruinagent`（前端）和 `agent-server/ruinagent`（后端）
- 前端通过此 BFF 间接访问 agent 私有逻辑和平台共享服务
- BFF 对前端屏蔽数据来源（agent-server or service）

```
agent-studio/ruinagent
       ↓ HTTP
bff/ruinagent-bff
       ├──► agent-server/ruinagent  （agent 私有逻辑）
       └──► @vxture/service-*       （平台共享能力）
```

---

## 技术栈约束

### 允许使用

| 用途 | 选型 |
|------|------|
| 框架 | NestJS |
| 认证 | Passport.js + JWT（`@nestjs/passport` / `passport-jwt`） |
| DTO 校验 | class-validator + class-transformer |
| API 文档 | @nestjs/swagger |
| 工具 | `@vxture/core-auth` / `@vxture/core-tenant` / `@vxture/shared` |
| Agent 通信 | HTTP（调用 agent-server/ruinagent 内部 API） |

### 严格禁止

- `@vxture/ai-sdk`（AI 能力在 agent-server，不进 BFF）
- `@vxture/design-system` / `platform-*`
- 跨 BFF 导入
- React / Next.js / 任何浏览器 API
- 在 BFF 中调用 AI 模型（属于 agent-server 职责）
- 直接 import agent-server 代码（只允许 HTTP 调用）

---

## 规范要求

### 1. 目录结构

```
src/
├── routers/        # *.router.ts     — 域路由模块
├── aggregators/    # *.aggregator.ts — 跨域数据聚合
├── middleware/     # *.middleware.ts — auth / tenant 中间件
├── types/          # *.types.ts      — 面向前端的 DTO 类型
└── index.ts        # 应用入口
```

### 2. 文件命名

与 Phase 4 一致，参见 Phase 4 规范。

### 3. 文件头注释（每个文件必须）

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/bff-ruinagent
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
 * @category Router | Aggregator | Middleware | Types
 */
```

- 注释语言：中文
- 超过 80 行必须加 Section 分隔注释

### 4. Agent BFF 专有设计

**与 Portal BFF 的区别**：

| 维度 | Portal BFF | Agent BFF |
|------|------|------|
| 数据来源 | 主要 service-* | agent-server + service-* |
| 业务性质 | CRUD 为主 | AI 交互为主（流式响应等）|
| 路由特点 | 标准 REST | 可能含 SSE / streaming 路由 |

**agent-server 通信**：
- 通过内部 HTTP 调用 agent-server/ruinagent 暴露的 API
- 不直接 import agent-server 代码
- 连接地址通过 @vxture/core-config 配置

**流式响应（如需）**：
- SSE（Server-Sent Events）用于 AI 流式输出
- 在 router 中处理流式转发，不在 aggregator 中处理

### 5. Middleware 规范

与 Phase 4 完全一致：
- auth.middleware.ts → 调用 @vxture/core-auth
- tenant.middleware.ts → 调用 @vxture/core-tenant
- 执行顺序：auth → tenant → router

### 6. 错误处理、响应塑形、TypeScript 规范

与 Phase 4 完全一致，参见 Phase 4 规范。

---

## 需要创建的初始 Router 模块

根据 ruinagent 的业务性质，至少包含：

- `agent.router.ts` — agent 核心交互路由（对接 agent-server）
- `session.router.ts` — 会话管理路由
- `billing.router.ts` — 计费查询路由（对接 @vxture/service-billing）

具体路由按实际业务补充，以上为初始骨架。

---

## 执行方式

从零创建，输出：
1. 完整 src/ 目录结构
2. 每个文件完整内容（含文件头注释）
3. package.json（name: @vxture/bff-ruinagent）
4. tsconfig.json（extends: ../../tsconfig.base.json）

---

End of Phase 5 Prompt.
