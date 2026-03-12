# CLAUDE.md — @vxture/platform-browser

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只记录本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/platform-browser` |
| 路径 | `packages/platform/browser/` |
| @layer | `Infrastructure` |

---

## 职责

浏览器环境工具函数，封装浏览器 API。仅在浏览器环境使用，服务端代码禁止引用。

---

## 目录结构

```
src/
├── utils/        # *.utils.ts   — 浏览器工具函数
└── index.ts      # 单一公共出口
```

---

## 允许的依赖

- `@vxture/shared`
- 浏览器原生 API（window, document, navigator）

## 禁止的依赖

- `i18next` / `react-i18next`
- NestJS / Next.js / React
- `@vxture/service-*` / `bff-*` / `ai-sdk`
- 其他 core 包
- Node.js 专用 API

---

## 文件命名

| 类型 | 规范 |
|------|------|
| 工具函数 | `*.utils.ts` |

---

## 文件头模板

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/platform-browser
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
 * @category Utils
 */
```

---

## 核心设计约束

- 仅在浏览器环境使用
- 所有函数必须检查 `typeof window !== 'undefined'`
- 不依赖 React
- 禁止服务端代码引用此包

---

## Barrel Export 规则

```typescript
// src/index.ts
export { resetWindowScrollTop } from './utils/resetScrollTop.utils'
```

---

## TypeScript

- 禁止 `any`
- 所有 export 函数必须有完整 JSDoc
- 纯类型导入使用 `import type`
