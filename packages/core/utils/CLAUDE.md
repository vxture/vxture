# CLAUDE.md — @vxture/core-utils

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/core-utils` |
| 路径 | `packages/core/utils/` |
| @layer | `Infrastructure` |

---

## 职责

平台级通用工具：日志、环境判断、类型守卫、平台级 helper。
与 `@vxture/shared` 的区别：shared 是纯通用工具，core-utils 是有平台意识的工具（如带结构化日志格式）。

---

## 目录结构

```
src/
├── utils/        # *.utils.ts   — 日志、环境、类型守卫等工具
├── types/        # *.types.ts   — 工具相关类型
└── index.ts      # 单一公共出口
```

---

## 允许的依赖

- `@vxture/shared`

## 禁止的依赖

- NestJS / Next.js / React
- Prisma / Redis
- `winston` / `pino`（日志库按需引入，但需双端兼容）
- `@vxture/service-*` / `bff-*` / `ai-sdk` / `design-system` / `platform-*`
- 任何仅浏览器或仅 Node.js 的 API（必须双端可运行）

---

## 文件命名

| 类型 | 规范 |
|------|------|
| 工具函数 | `*.utils.ts` |
| 类型定义 | `*.types.ts` |

---

## 文件头模板

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/core-utils
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
 * @category Utils | Types
 */
```

---

## 核心设计约束

- 日志工具需双端兼容（浏览器用 console，Node.js 用结构化输出）
- 环境判断工具（`isServer` / `isBrowser`）通过特征检测，不依赖 `process.env.NODE_ENV`
- 类型守卫必须是纯函数，无副作用
- 不引入任何有副作用的初始化逻辑

---

## Barrel Export 规则

```typescript
// src/index.ts
export { createLogger } from './utils/logger.utils'
export { isServer, isBrowser } from './utils/env.utils'
export { isString, isNumber, isNonNullable } from './utils/guard.utils'
export type { Logger, LogLevel } from './types/logger.types'
```

---

## TypeScript

- 禁止 `any`
- 类型守卫函数必须使用 `value is Type` 谓词签名
- 纯类型导入使用 `import type`
