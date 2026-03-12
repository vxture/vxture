# CLAUDE.md — @vxture/core-locale

> **面向 AI 编码的开发指南**
> 本文档仅用于 AI 编码时的行为约束，详细使用方法见 README.md。
> 继承根 CLAUDE.md 全部规则，本文件只记录本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/core-locale` |
| 路径 | `packages/core/locale/` |
| @layer | `Infrastructure` |

---

## 职责定位

**仅提供服务端语言解析和内容本地化工具。**

- ✅ 服务端 Locale 解析（从 Request）
- ✅ 内容本地化查找（多语言内容按语言返回）
- ✅ 重新导出 @vxture/shared 的语言类型，方便使用
- ❌ 不提供翻译文案存储
- ❌ 不提供前端组件或 Hook

---

## 目录结构

```
src/
├── utils/        # *.utils.ts   — 服务端工具函数
├── types/        # *.types.ts   — core-locale 特有类型
└── index.ts      # 单一公共出口
```

---

## 允许的依赖

✅ **@vxture/shared** - 语言类型和常量

✅ **原生 Intl API** - 格式化工具

## 禁止的依赖

❌ **其他 core-* 包**（core 包之间不得互相依赖）

❌ **service-*、ai-sdk、bff-* 等业务包**

❌ **NestJS / Next.js / React**

❌ **i18next / react-i18next**（属于上层应用）

❌ **浏览器专用 API**（window、document、localStorage）

---

## 文件命名规则

| 类型 | 规范 |
|------|------|
| 工具函数 | `*.utils.ts` |
| 类型定义 | `*.types.ts` |

**禁止**：`utils.ts` / `helpers.ts` / `misc.ts` 等泛名。

---

## 文件头模板

**所有文件必须包含完整文件头：**

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

## Barrel Export 规则

**src/index.ts — 只导出公共 API：**

```typescript
// 重新导出 shared 类型
export type { Locale } from '@vxture/shared';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@vxture/shared';

// 导出核心工具
export { resolveLocale, localizeContent } from './utils/locale.utils';

// 导出 core-locale 特有类型
export * from './types';
```

---

## TypeScript 编码规则

### 严格要求

1. **禁止 `any`**，用 `unknown` + 类型守卫代替
2. **纯类型导入使用 `import type`**
3. **所有 export 函数必须有完整 JSDoc**（`@param` / `@returns`）

### 新增文件时

1. 检查是否可以放到现有文件，避免文件碎片化
2. 确保只引入 @vxture/shared 依赖
3. 确保不使用浏览器或 Node.js 专用 API（除 Request）
4. 所有函数必须是纯函数，无副作用
5. 导出通过 index.ts

---

## 核心实现约束

### 1. 语言解析函数

**resolveLocale(request: Request): Locale**

```typescript
// 严格按以下顺序解析：
1. 读取请求 Cookie 中的 NEXT_LOCALE 字段
2. 解析 Accept-Language Header，匹配 SUPPORTED_LOCALES
3. 回退到 DEFAULT_LOCALE
```

### 2. 内容本地化函数

**localizeContent(content: Partial<Record<Locale, string>>, locale: Locale): string**

```typescript
// 实现逻辑：
1. 首先返回 content[locale]
2. 如果不存在，回退到 content[DEFAULT_LOCALE]
3. 如果 DEFAULT_LOCALE 也不存在，返回空字符串
```

### 3. 类型定义

- 语言类型从 @vxture/shared 引入，不重复定义
- core-locale 类型只包含服务端解析和本地化配置
- 禁止与 shared 重复类型定义

---

## 现有模块说明

### 工具函数

| 文件 | 内容 |
|------|------|
| `locale.utils.ts` | 包含 resolveLocale 和 localizeContent 两个核心函数 |

### 类型定义

| 文件 | 内容 |
|------|------|
| `locale.types.ts` | LocalizationOptions 和 ResolveLocaleOptions 接口 |

---

## 修改检查清单

**修改本包前必须确认：**

- [ ] 不引入任何其他内部包依赖
- [ ] 不使用浏览器或 Node.js 专用 API（除 Request）
- [ ] 保持纯函数、无副作用
- [ ] 更新相应的 index.ts 导出
- [ ] 新增文件包含完整文件头
- [ ] 所有导出函数有 JSDoc
- [ ] 没有使用 `any` 类型
- [ ] 类型定义不与 shared 重复
- [ ] 遵守 core 层边界规则（不依赖其他 core 包）
