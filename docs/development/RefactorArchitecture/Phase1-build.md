# Phase 1 AI Prompt — Shared & Core 层规范化

你是 Vxture Monorepo 的重构执行专家。现在执行 Phase 1：Shared & Core 层规范化。

## 目标包

- @vxture/shared （packages/shared/shared/）
- @vxture/core-api （packages/core/api/）
- @vxture/core-auth （packages/core/auth/）
- @vxture/core-config （packages/core/config/）
- @vxture/core-locale （packages/core/locale/）
- @vxture/core-tenant （packages/core/tenant/）
- @vxture/core-utils （packages/core/utils/）

---

## 技术栈约束

本层严格 framework-agnostic，需要在 Node.js 和浏览器双端可运行。

### 允许使用

| 用途         | 选型                                                |
| ------------ | --------------------------------------------------- |
| HTTP 客户端  | 原生 fetch（禁止 axios，双端兼容）                  |
| JWT 工具     | jsonwebtoken + @types/jsonwebtoken                  |
| Schema 校验  | zod（仅 @vxture/shared）                            |
| 日期工具     | dayjs（仅 @vxture/shared）                          |
| 环境变量     | 原生 process.env（禁止引入 dotenv，由上层应用负责） |
| 国际化格式化 | 原生 Intl API（禁止引入 i18next，属于上层）         |

### 严格禁止

- NestJS / Next.js / React 及其任何子包
- Prisma / TypeORM / 任何 ORM
- class-validator / class-transformer（NestJS 生态，属于上层）
- axios（双端不一致）
- dotenv（由上层应用负责加载）
- @vxture/ai-sdk / design-system / platform-_ / service-_ / bff-\*
- 任何浏览器专用 API（window / document / localStorage 等）
- 任何 Node.js 专用 API（fs / path / child_process 等）

---

## 规范要求

### 1. 文件结构

每个包 src/ 目录按职责分层：

```
@vxture/shared      → utils/ types/ constants/
@vxture/core-api    → client/ types/ utils/
@vxture/core-auth   → client/ types/ utils/
@vxture/core-config → types/ utils/
@vxture/core-locale → types/ utils/
@vxture/core-tenant → context/ types/ utils/
@vxture/core-utils  → types/ utils/
```

### 2. 文件命名

| 类型       | 规范            | 示例              |
| ---------- | --------------- | ----------------- |
| 类型定义   | \*.types.ts     | user.types.ts     |
| 常量       | \*.constants.ts | auth.constants.ts |
| 工具函数   | \*.utils.ts     | format.utils.ts   |
| API 客户端 | \*.client.ts    | api.client.ts     |
| 上下文     | \*.context.ts   | tenant.context.ts |

禁止：helpers.ts / misc.ts / utils.ts 等泛名

### 3. 文件头注释（每个文件必须）

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/[package-name]
 *
 * Description: 详细功能说明
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Shared | Infrastructure
 * @category Utils | Types | Constants | Client | Context
 */
```

- 注释语言：中文
- 超过 80 行必须加 Section 分隔注释：

```typescript
// ============================================================================
// Types
// ============================================================================
```

### 4. 函数注释

所有 export 函数必须有完整 JSDoc：

```typescript
/**
 * 函数功能描述
 *
 * @param param - 参数说明
 * @returns 返回值说明
 * @throws {ErrorType} 何时抛出此错误
 */
export function functionName(param: Type): ReturnType {}
```

### 5. Barrel Export

- 每个包只有一个公共出口：src/index.ts
- 全部 export 从此文件导出
- 禁止循环导出
- 禁止深路径导入

```typescript
// src/index.ts 示例
export * from './utils/request.utils';
export * from './types/api.types';
export type { SomeType } from './types/api.types';
```

### 6. 依赖约束

- @vxture/shared：只允许第三方轻量库（zod / dayjs）
- @vxture/core-\*：只允许依赖 @vxture/shared
- 全部 core-\* 包必须 framework-agnostic

### 7. TypeScript

- 严格模式，禁止 any，用 unknown 代替
- 纯类型导入使用 import type
- 不得使用 @ts-ignore（必要时须附中文说明注释）

---

## 各包职责说明

### @vxture/shared

纯工具、类型、常量，无任何业务逻辑。

### @vxture/core-api

- 统一 fetch 封装（请求拦截、错误标准化、retry / timeout）
- 标准 request / response 类型
- token 注入工具

### @vxture/core-auth

- JWT token 验证（jsonwebtoken）
- session 工具
- 平台级角色 / 权限原语（非业务级）

### @vxture/core-config

- 环境感知配置加载
- 类型化配置访问
- 多环境支持（dev / staging / production）

### @vxture/core-locale

- locale 解析
- 翻译 helper（key → string）
- 日期 / 数字 / 货币格式化（基于 Intl API）

### @vxture/core-tenant

- tenantId 解析
- 租户上下文传播
- 租户配置查询

### @vxture/core-utils

- 日志工具（双端兼容）
- 环境判断工具
- 类型守卫工具
- 通用 helper

---

## 执行方式

1. 逐包处理，执行顺序：
   @vxture/shared → core-config → core-utils → core-api → core-auth → core-tenant → core-locale

2. 每个包输出：
   - 完整 src/ 目录结构
   - 每个文件的完整内容
   - 更新后的 src/index.ts

3. 已有代码处理原则：
   - 合并规范，不覆盖已有逻辑
   - 只补齐缺失的规范项（文件头 / 命名 / 注释 / export）
   - 有冲突时说明原因，给出建议

---

End of Phase 1 Prompt.
