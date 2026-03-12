# CLAUDE.md — @vxture/shared

> **面向 AI 编码的开发指南**
> 本文档仅用于 AI 编码时的行为约束，详细使用方法见 README.md。
> 继承根 CLAUDE.md 全部规则，本文件只记录本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/shared` |
| 路径 | `packages/shared/shared/` |
| @layer | `Shared` |

---

## 职责定位

**仅提供纯工具、类型、常量。**

- ✅ 无业务逻辑
- ✅ 无平台逻辑
- ✅ 无运行时状态
- ✅ 所有包都可依赖本包
- ✅ 本包不依赖任何内部包

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

- ❌ 任何 `@vxture/*` 内部包
- ❌ NestJS / Next.js / React
- ❌ Prisma / axios / dotenv
- ❌ 任何浏览器专用 API（window、document、localStorage）
- ❌ 任何 Node.js 专用 API（fs、path、http）

---

## 文件命名规则

| 类型 | 规范 |
|------|------|
| 工具函数 | `*.utils.ts` |
| 类型定义 | `*.types.ts` |
| 常量 | `*.constants.ts` |

**禁止**：`utils.ts` / `helpers.ts` / `misc.ts` 等泛名。

---

## 文件头模板

**所有文件必须包含完整文件头：**

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

**src/index.ts — 只导出公共 API：**

```typescript
export * from './utils/xxx.utils'
export * from './types/xxx.types'
export * from './constants/xxx.constants'
```

**消费方只从 `@vxture/shared` 导入，禁止深路径。**

---

## TypeScript 编码规则

### 严格要求

1. **禁止 `any`**，用 `unknown` + 类型守卫代替
2. **纯类型导入使用 `import type`**
3. **所有 export 函数必须有完整 JSDoc**（`@param` / `@returns`）

### 新增文件时

1. 检查是否可以放到现有文件，避免文件碎片化
2. 确保不引入外部内部包依赖
3. 确保不使用浏览器或 Node.js 专用 API
4. 所有函数必须是纯函数，无副作用
5. 导出通过对应目录的 index.ts，最终汇总到 src/index.ts

---

## 现有模块说明

### 工具函数

| 文件 | 内容 | 注意事项 |
|------|------|---------|
| `debug.utils.ts` | 调试工具（开发环境） | 生产环境无副作用 |
| `locale.utils.ts` | 格式化工具 | 基于 Intl API，纯函数 |

### 类型定义

| 文件 | 内容 |
|------|------|
| `auth.types.ts` | 认证相关类型 |
| `locale.types.ts` | 语言相关类型 |
| `theme.types.ts` | 主题相关类型 |
| `content.types.ts` | 内容数据类型 |

### 常量配置

| 文件 | 内容 |
|------|------|
| `auth.constants.ts` | 认证常量 |
| `locale.constants.ts` | 语言常量（统一） |
| `theme.constants.ts` | 主题常量 |

---

## 修改检查清单

**修改本包前必须确认：**

- [ ] 不引入任何内部包依赖
- [ ] 不使用浏览器或 Node.js 专用 API
- [ ] 保持纯函数、无副作用
- [ ] 更新相应的 index.ts 导出
- [ ] 新增文件包含完整文件头
- [ ] 所有导出函数有 JSDoc
- [ ] 没有使用 `any` 类型
