# CLAUDE.md — @vxture/core-config

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/core-config` |
| 路径 | `packages/core/config/` |
| @layer | `Infrastructure` |

---

## 职责

环境感知配置加载与类型化访问。
支持多环境（dev / staging / production）。

---

## 目录结构

```
src/
├── types/        # *.types.ts   — 配置类型定义
├── utils/        # *.utils.ts   — 配置读取、环境判断工具
└── index.ts      # 单一公共出口
```

---

## 允许的依赖

- `@vxture/shared`
- 原生 `process.env`

## 禁止的依赖

- `dotenv`（由上层应用负责加载，本包不处理 .env 文件）
- NestJS `@nestjs/config`（属于上层）
- Next.js / React
- `@vxture/service-*` / `bff-*` / `ai-sdk` / `design-system` / `platform-*`

---

## 文件命名

| 类型 | 规范 |
|------|------|
| 类型定义 | `*.types.ts` |
| 工具函数 | `*.utils.ts` |

---

## 文件头模板

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/core-config
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
 * @category Types | Utils
 */
```

---

## 核心设计约束

- 只读取 `process.env`，不加载 `.env` 文件
- 配置必须有类型定义，禁止返回裸 `string | undefined`
- 缺失必要配置时抛出明确错误，不静默返回 undefined
- 双端可运行（Node.js 侧有 process.env，浏览器侧由 Next.js 注入）

---

## Barrel Export 规则

```typescript
// src/index.ts
export { getConfig } from './utils/config.utils'
export type { AppConfig, DatabaseConfig } from './types/config.types'
```

---

## TypeScript

- 禁止 `any`
- 配置类型用 `interface`，字段全部明确类型
- 纯类型导入使用 `import type`
