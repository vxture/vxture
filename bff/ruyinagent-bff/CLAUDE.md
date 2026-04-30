# CLAUDE.md — @vxture/bff-ruyinagent

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/bff-ruyinagent` |
| 路径 | `bff/ruyinagent-bff/` |
| @layer | `Application` |
| 服务对象 | `agent-studio/ruyinagent` ↔ `agent-server/ruyinagent` |

---

## 职责

Agent BFF，同时桥接前端和 agent 后端：
- 前端通过 HTTP 访问此 BFF
- BFF 聚合 agent-server/ruyinagent（私有逻辑）和 @vxture/service-*（平台能力）
- 前端不感知数据来自 agent-server 还是 service

```
agent-studio/ruyinagent
       ↓ HTTP
bff/ruyinagent-bff
       ├──► agent-server/ruyinagent（HTTP）
       └──► @vxture/service-*
```

---

## 目录结构

```
src/
├── routers/        # *.router.ts
├── aggregators/    # *.aggregator.ts
├── middleware/     # auth.middleware.ts / tenant.middleware.ts
├── types/          # *.types.ts
└── index.ts
```

---

## 允许的依赖

- `@vxture/core-auth` / `@vxture/core-tenant` / `@vxture/core-config` / `@vxture/core-*`
- `@vxture/shared`
- `@vxture/service-billing` / `@vxture/service-subscription`
- NestJS / Passport.js / class-validator / @nestjs/swagger

## 严格禁止

- `@vxture/ai-sdk`（AI 在 agent-server，不进 BFF）
- 直接 import `agent-server/ruyinagent` 代码（只允许 HTTP 调用）
- `@vxture/design-system` / `platform-*`
- 跨 BFF 导入
- React / Next.js / 浏览器 API

---

## 文件头模板

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/bff-ruyinagent
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
 * @category Router | Aggregator | Middleware | Types
 */
```

---

## Agent BFF 专有约束

- agent-server 地址通过 `@vxture/core-config` 读取，不硬编码
- 如有 AI 流式输出，使用 SSE 在 router 层转发，不在 aggregator 处理
- agent-server 通信失败时独立处理，不影响 service-* 路由

---

## 关键约束

- 每个 router 独立 try/catch，错误不冒泡
- middleware 执行顺序：auth → tenant → router
- 响应做字段投影，不透传后端原始结构
- 禁止 any，响应 DTO 类型明确
