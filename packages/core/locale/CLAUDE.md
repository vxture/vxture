# CLAUDE.md — @vxture/core-locale

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/core-locale` |
| 路径 | `packages/core/locale/` |
| @layer | `Infrastructure` |

---

## 职责

Locale 解析、翻译 helper、日期 / 数字 / 货币格式化基础工具。
只提供平台级基础能力，不包含具体翻译文案（文案由各应用自管理）。

---

## 目录结构

```
src/
├── types/        # *.types.ts   — Locale、翻译相关类型
├── utils/        # *.utils.ts   — locale 解析、格式化工具
└── index.ts      # 单一公共出口
```

---

## 允许的依赖

- `@vxture/shared`
- 原生 `Intl` API（日期 / 数字 / 货币格式化）

## 禁止的依赖

- `i18next` / `react-i18next`（属于上层应用）
- `next-intl`（属于 Next.js 应用层）
- NestJS / React / Next.js
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
 * @package @vxture/core-locale
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

- 格式化全部基于原生 `Intl` API，保证双端一致
- 只提供格式化工具，不存储翻译文案
- locale 解析返回标准 `SupportedLocale` 枚举值，不返回裸字符串
- 不依赖任何运行时状态（纯函数）

---

## Barrel Export 规则

```typescript
// src/index.ts
export { parseLocale, formatDate, formatNumber, formatCurrency } from './utils/locale.utils'
export type { SupportedLocale, LocaleConfig } from './types/locale.types'
```

---

## TypeScript

- 禁止 `any`
- 所有 export 函数必须有完整 JSDoc
- 纯类型导入使用 `import type`
