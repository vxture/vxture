# CLAUDE.md — @vxture/core-api

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/core-api` |
| 路径 | `packages/core/api/` |
| @layer | `Infrastructure` |

---

## 职责

统一 HTTP 请求基础设施：请求封装、拦截器、错误标准化、retry / timeout。
供 BFF、Service、Agent Server 层使用。必须双端可运行（Node.js + 浏览器）。

---

## 目录结构

```
src/
├── client/       # *.client.ts  — fetch 封装、请求拦截
├── types/        # *.types.ts   — 请求 / 响应类型
├── utils/        # *.utils.ts   — retry、timeout、错误处理工具
└── index.ts      # 单一公共出口
```

---

## 允许的依赖

- `@vxture/shared`
- 原生 `fetch`（禁止 axios）

## 禁止的依赖

- `axios`（Node/Browser 行为不一致）
- NestJS / Next.js / React
- Prisma / ioredis / BullMQ
- `@vxture/service-*` / `bff-*` / `ai-sdk` / `design-system` / `platform-*`
- `fs` / `path` 等 Node.js 专用模块
- `window` / `document` 等浏览器专用 API

---

## 文件命名

| 类型 | 规范 |
|------|------|
| HTTP 客户端 | `*.client.ts` |
| 类型定义 | `*.types.ts` |
| 工具函数 | `*.utils.ts` |

---

## 文件头模板

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/core-api
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
 * @layer Infrastructure
 * @category Client | Types | Utils
 */
```

---

## 核心设计约束

- HTTP 客户端基于原生 `fetch` 封装，不暴露 fetch 实现细节给消费方
- 错误统一转化为标准 `ApiError` 类型，不抛出原始 fetch 异常
- token 注入通过参数 / 回调注入，不硬编码任何 auth 逻辑
- retry / timeout 为可选配置项

---

## Barrel Export 规则

```typescript
// src/index.ts
export { createApiClient } from './client/api.client'
export type { ApiRequestConfig, ApiResponse, ApiError } from './types/api.types'
export { withRetry, withTimeout } from './utils/retry.utils'
```

---

## TypeScript

- 禁止 `any`
- 所有 export 函数必须有完整 JSDoc（`@param` / `@returns` / `@throws`）
- 纯类型导入使用 `import type`
