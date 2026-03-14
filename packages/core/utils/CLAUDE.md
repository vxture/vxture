# CLAUDE.md — @vxture/core-utils

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/core-utils` |
| 路径 | `packages/core/utils/` |
| @layer | `Infrastructure` |

---

## 职责

平台级通用工具：日志、环境判断、类型守卫、错误类。

与 `@vxture/shared` 的区别：
- **shared**：纯通用工具，无平台意识
- **core-utils**：有平台意识的工具（结构化日志、环境判断）

---

## 目录结构

```
src/
├── utils/        # error.utils.ts, logger.utils.ts, env.utils.ts, type-guards.utils.ts
├── types/        # utils.types.ts
└── index.ts      # 单一公共出口
```

---

## 允许/禁止

**允许：**
- `@vxture/shared`

**禁止：**
- NestJS / Next.js / React
- Prisma / Redis
- `@vxture/service-*` / `bff-*` / `ai-sdk` / `design-system` / `platform-*`
- 仅浏览器或仅 Node.js 的 API（必须双端可运行）

---

## 核心约束

- 日志工具需双端兼容（浏览器用 console，Node.js 用结构化输出）
- 环境判断通过特征检测，不依赖 `process.env.NODE_ENV`
- 类型守卫必须是纯函数，无副作用
- 不引入任何有副作用的初始化逻辑
