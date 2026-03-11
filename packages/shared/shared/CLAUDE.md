# CLAUDE.md — @vxture/shared

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/shared` |
| 路径 | `packages/shared/shared/` |
| @layer | `Shared` |

---

## 职责

纯工具、类型、常量。无任何业务逻辑、无任何平台逻辑。
所有包都可以依赖本包，本包不依赖任何内部包。

---

## 目录结构

```
src/
├── utils/        # *.utils.ts   — 纯工具函数
├── types/        # *.types.ts   — 全局通用类型
├── constants/    # *.constants.ts — 全局常量
└── index.ts      # 单一公共出口
```

---

## 允许的依赖

- `zod` — schema 校验
- `dayjs` — 日期工具
- 其他轻量无副作用三方库

## 禁止的依赖

- 任何 `@vxture/*` 内部包
- NestJS / Next.js / React
- Prisma / axios / dotenv
- 任何浏览器专用 API
- 任何 Node.js 专用 API

---

## 文件命名

| 类型 | 规范 |
|------|------|
| 工具函数 | `*.utils.ts` |
| 类型定义 | `*.types.ts` |
| 常量 | `*.constants.ts` |

禁止：`utils.ts` / `helpers.ts` / `misc.ts` 等泛名。

---

## 文件头模板

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/shared
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
 * @layer Shared
 * @category Utils | Types | Constants
 */
```

---

## Barrel Export 规则

```typescript
// src/index.ts — 只导出公共 API
export * from './utils/xxx.utils'
export * from './types/xxx.types'
export * from './constants/xxx.constants'
```

消费方只从 `@vxture/shared` 导入，禁止深路径。

---

## TypeScript

- 禁止 `any`，用 `unknown` + 类型守卫代替
- 纯类型导入使用 `import type`
- 所有 export 函数必须有 JSDoc（`@param` / `@returns`）
