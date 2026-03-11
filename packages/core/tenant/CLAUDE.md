# CLAUDE.md — @vxture/core-tenant

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/core-tenant` |
| 路径 | `packages/core/tenant/` |
| @layer | `Infrastructure` |

---

## 职责

多租户上下文管理：tenantId 解析、租户上下文传播、租户配置查询工具。
为所有后端层提供租户感知能力。

---

## 目录结构

```
src/
├── context/      # *.context.ts — 租户上下文存取工具
├── types/        # *.types.ts   — 租户相关类型
├── utils/        # *.utils.ts   — tenantId 解析、租户配置工具
└── index.ts      # 单一公共出口
```

---

## 允许的依赖

- `@vxture/shared`

## 禁止的依赖

- NestJS（本包是 framework-agnostic 原语）
- Next.js / React
- Prisma / Redis（不持久化状态）
- `@vxture/service-*` / `bff-*` / `ai-sdk` / `design-system` / `platform-*`

---

## 文件命名

| 类型 | 规范 |
|------|------|
| 上下文工具 | `*.context.ts` |
| 类型定义 | `*.types.ts` |
| 工具函数 | `*.utils.ts` |

---

## 文件头模板

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/core-tenant
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
 * @category Context | Types | Utils
 */
```

---

## 核心设计约束

- tenantId 解析支持多来源：请求头 / 子域名 / 路径参数（由调用方传入，本包只解析）
- 上下文传播使用 AsyncLocalStorage（Node.js）/ 参数传递（浏览器）双模式
- 不查询数据库，不持久化任何状态
- 租户配置查询通过回调 / 依赖注入方式接收数据源，不硬编码

---

## Barrel Export 规则

```typescript
// src/index.ts
export { getTenantContext, setTenantContext } from './context/tenant.context'
export { parseTenantId } from './utils/tenant.utils'
export type { TenantContext, TenantId } from './types/tenant.types'
```

---

## TypeScript

- 禁止 `any`
- 所有 export 函数必须有完整 JSDoc（`@param` / `@returns` / `@throws`）
- 纯类型导入使用 `import type`
