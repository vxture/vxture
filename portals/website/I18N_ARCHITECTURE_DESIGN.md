# Vxture i18n 架构设计方案

> 分析日期：2026-03-12
> 基于项目现有架构和技术栈文档分析

---

## 📊 架构概览

### 1. 技术栈选型（来自 tech-stack.md）

根据 [docs/architecture/13-tech-stack.md](d:\MyWebSite\vxture\docs\architecture\13-tech-stack.md)，**前端 i18n 方案未在文档中明确列出**，但以下技术已在使用中：

| 技术 | 当前状态 | 说明 |
|------|----------|------|
| `react-i18next` | ✅ 已引入 | 在 website/package.json 中 |
| `i18next` | ✅ 已引入 | 在 website/package.json 中 |
| `i18next-browser-languagedetector` | ✅ 已引入 | 在 website/package.json 中 |
| `i18next-http-backend` | ✅ 已引入 | 在 website/package.json 中 |

---

## 🏗️ 分层架构设计

Vxture i18n 采用**三层架构**，严格遵循项目的层边界约束：

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation Layer (portals/website)                       │
│  - react-i18next 组件                                      │
│  - i18nStore (Zustand)                                     │
│  - useLocale Hook                                          │
│  - 翻译资源存储（JSON 文件）                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Infrastructure Layer (packages/core/locale)               │
│  - LocaleManager 类（框架无关）                            │
│  - LocaleDetector 类（浏览器/URL/Cookie 检测）             │
│  - 格式化工具（基于原生 Intl API）                          │
│  - 类型定义（LocaleConfig, TranslationDictionary）          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Shared Layer (packages/shared)                            │
│  - 无 i18n 业务逻辑（仅基础工具）                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 核心层：@vxture/core-locale

### 2.1 职责定义（来自 core-locale/CLAUDE.md）

**绝对不做的**：
- ❌ 不包含具体翻译文案（文案由各应用自管理）
- ❌ 不依赖 `i18next` / `react-i18next`（属于上层应用）
- ❌ 不依赖 `next-intl`（属于 Next.js 应用层）
- ❌ 不依赖 React / Next.js

**必须做的**：
- ✅ 提供 Locale 解析、翻译 helper
- ✅ 日期/数字/货币格式化（基于原生 Intl API）
- ✅ 纯函数，不依赖任何运行时状态
- ✅ 只依赖 `@vxture/shared` 和原生 API

### 2.2 现有实现分析

**文件位置**：`packages/core/locale/src/`

| 文件 | 功能 | 状态 |
|------|------|------|
| `types/locale.types.ts` | LocaleConfig, TranslationDictionary 等类型 | ✅ 完整 |
| `client/locale.client.ts` | LocaleManager, LocaleDetector 类 | ✅ 完整 |
| `index.ts` | 统一导出入口 | ✅ 完整 |

**核心类**：

```typescript
// LocaleManager - 完整的 i18n 管理器
export class LocaleManager {
  getConfig(): LocaleConfig
  getCurrentLocale(): string
  getAvailableLocales(): string[]
  setLocale(locale: string): void
  setTranslations(locale, translations): void
  translate(key, options): string  // t() 方法
  formatDate(date, options): string
  formatNumber(number, options): string
  formatCurrency(amount, currency): string
  formatRelativeTime(date, baseDate): string
}

// LocaleDetector - 多源语言检测
export class LocaleDetector {
  static detectFromBrowser(): string | undefined
  static detectFromUrl(url): string | undefined
  static detectFromCookie(cookies): string | undefined
  static detectFromLocalStorage(): string | undefined
  static detectFromHeaders(headers): string | undefined
}
```

---

## 🖥️ 应用层：@vxture/website

### 3.1 当前现状

**已安装的第三方库**（来自 website/package.json）：

```json
{
  "i18next": "^24.0.0",
  "react-i18next": "^15.0.0",
  "i18next-browser-languagedetector": "^8.0.0",
  "i18next-http-backend": "^2.6.0"
}
```

**现有实现**：

| 文件 | 功能 | 状态 |
|------|------|------|
| `stores/i18nStore.ts` | Zustand store，管理 locale 和翻译 | ✅ 存在 |
| `hooks/useLocale.ts` | 包装 i18nStore 的 Hook | ✅ 存在 |
| `hooks/useLocaleOld.ts` | 旧版实现（暗示迁移中） | ⚠️ 待清理 |
| `shared/constants/i18nConfig.ts` | 常量配置 | ✅ 存在 |
| `shared/types/i18n.types.ts` | 类型定义 | ✅ 存在 |
| `public/data/**/*.json` | 翻译资源（zh-CN, en-US） | ✅ 存在 |

**当前架构问题**：
1. 同时存在自定义 store（`i18nStore`）和 react-i18next 依赖
2. 有 `useLocaleOld.ts`，暗示迁移未完成
3. 未看到 i18next 初始化配置
4. 翻译资源在 `public/data/` 而不是标准位置

### 3.2 推荐的应用层架构

**架构图**：

```
portals/website/src/
├── i18n/                      # i18n 配置目录（新建）
│   ├── index.ts               # i18next 初始化
│   └── resources.ts           # 翻译资源导入
├── stores/
│   └── i18nStore.ts           # 保留 Zustand（与 core-locale 集成）
├── hooks/
│   ├── useLocale.ts           # 保留（与 i18next 互操作）
│   └── useTranslation.ts      # react-i18next 的 useTranslation 包装
├── components/
│   └── common/
│       └── I18nSync.tsx       # 与 core-locale 同步
└── app/
    └── layout.tsx             # 集成 i18next Provider
```

**i18next 初始化示例**：

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false,
    },
    // 与 core-locale 的 LocaleConfig 保持一致
    supportedLngs: ['en-US', 'zh-CN', 'ja-JP'],
  });

export default i18n;
```

---

## 🔗 层间集成方案

### 4.1 架构约束（必须遵守）

根据 [portals/CLAUDE.md](d:\MyWebSite\vxture\portals\CLAUDE.md)：

```
portals/*
  ✅ → @vxture/design-system
  ✅ → @vxture/shared
  ❌ → @vxture/core-*  ⚠️ 重要！！！
```

**portal 层禁止直接引用 core-* 包**，包括 `@vxture/core-locale`！

### 4.2 正确的集成方式

由于 portal 层不能直接使用 core-locale，**采用以下方案**：

#### 方案 A：只在应用层使用 react-i18next（推荐）

```
portals/website/
  ├── 使用 react-i18next（无需 core-locale）
  ├── 翻译资源在 public/locales/ 或 public/data/
  └── 格式化直接用 react-i18next 或原生 Intl
```

**优点**：
- 符合层边界约束
- react-i18next 生态成熟
- 无需额外集成工作

**缺点**：
- core-locale 的 LocaleManager 无法直接使用
- 格式化功能需要重复实现

#### 方案 B：通过 BFF 暴露 core-locale 能力

```
bff/website-bff/
  ├── 提供 i18n 相关 API 端点
  ├── 使用 @vxture/core-locale
  └── 返回格式化结果

portals/website/
  ├── 调用 BFF API 获取格式化结果
  └── 本地用 react-i18next 处理翻译
```

**优点**：
- 符合层边界（通过 HTTP）
- 复用 core-locale 的格式化能力

**缺点**：
- 增加网络请求
- 格式化有延迟

#### 方案 C：下沉 core-locale 功能到 shared 层（需评估）

**前提**：core-locale 的功能是否符合 shared 层要求（纯工具、无副作用）

```
packages/shared/
  ├── 新增 i18n 工具（从 core-locale 下沉）
  └── 纯函数，无状态

packages/core/locale/
  ├── 保留服务器端专用的 i18n 功能
  └── 或者废弃（全部下沉到 shared）
```

**优点**：
- portal 层可以使用 shared 层的功能
- 符合架构约束

**缺点**：
- 需要重构现有代码
- 需评估是否符合 shared 层定位

---

## 🎯 推荐方案（当前阶段）

### 5.1 短期方案（立即实施）

**采用方案 A：只在应用层使用 react-i18next**

理由：
1. website 已有完整的 react-i18next 依赖
2. 当前只是营销站点，i18n 需求相对简单
3. 避免层边界违规

**实施步骤**：

1. **完成 react-i18next 初始化**
   - 新建 `src/i18n/index.ts`
   - 配置 LanguageDetector 和 HttpBackend
   - 在 `src/app/layout.tsx` 中集成

2. **清理旧代码**
   - 删除 `src/hooks/useLocaleOld.ts`
   - 保留 `i18nStore`（与 react-i18next 互操作）
   - 统一使用 react-i18next 的 `useTranslation()`

3. **翻译资源整理**
   - 将 `public/data/**/*.json` 移至 `public/locales/{lang}/translation.json`（i18next 标准位置）
   - 或配置 i18next 使用当前路径

### 5.2 中长期方案（按需评估）

如果未来需要跨平台（多 portal、agent-studio）共享 i18n 基础设施：

**采用方案 C：下沉到 shared 层**

实施步骤：
1. 评估 core-locale 中哪些是纯工具、无副作用
2. 将这部分功能下沉到 `@vxture/shared`
3. core-locale 保留服务器端专用功能
4. portal 层通过 shared 层使用 i18n 工具

---

## 📋 关键文件清单

### core-locale 层

| 文件 | 路径 | 说明 |
|------|------|------|
| LocaleManager | `packages/core/locale/src/client/locale.client.ts` | 完整的 i18n 管理器类 |
| LocaleDetector | `packages/core/locale/src/client/locale.client.ts` | 多源语言检测类 |
| 类型定义 | `packages/core/locale/src/types/locale.types.ts` | LocaleConfig, TranslationDictionary 等 |

### website 层

| 文件 | 路径 | 说明 |
|------|------|------|
| i18nStore | `portals/website/src/stores/i18nStore.ts` | Zustand i18n store |
| useLocale | `portals/website/src/hooks/useLocale.ts` | i18n Hook |
| useLocaleOld | `portals/website/src/hooks/useLocaleOld.ts` | 旧版实现（待清理） |
| 翻译资源 | `portals/website/public/data/**/*.json` | zh-CN, en-US 翻译 |
| i18n 常量 | `portals/website/src/shared/constants/i18nConfig.ts` | 配置常量 |

---

## 🔧 第三方库使用说明

### react-i18next 生态

| 库 | 用途 | 状态 |
|----|------|------|
| `i18next` | 核心 i18n 库 | ✅ 已引入 |
| `react-i18next` | React 绑定 | ✅ 已引入 |
| `i18next-browser-languagedetector` | 浏览器语言检测 | ✅ 已引入 |
| `i18next-http-backend` | HTTP 后端加载翻译 | ✅ 已引入 |

**使用示例**：

```tsx
// 组件中使用
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('common.title')}</h1>
      <button onClick={() => i18n.changeLanguage('zh-CN')}>
        中文
      </button>
    </div>
  );
}
```

---

## ✅ 总结与建议

### 当前架构评估

1. **core-locale**：设计良好，功能完整，但 portal 层无法直接使用
2. **website i18n**：已有 react-i18next 依赖，但初始化未完成
3. **迁移状态**：存在 `useLocaleOld.ts`，暗示迁移工作中断

### 行动建议

| 优先级 | 行动 | 说明 |
|--------|------|------|
| 🔴 高 | 完成 react-i18next 初始化 | 建立标准的 i18next 配置 |
| 🔴 高 | 清理 useLocaleOld.ts | 删除旧代码，避免混淆 |
| 🟡 中 | 整理翻译资源位置 | 移至 i18next 标准位置 |
| 🟢 低 | 评估是否需要 shared 层 i18n | 长期规划时考虑 |

### 关键原则

1. **严格遵守层边界**：portal 层**不得**直接引用 `@vxture/core-locale`
2. **优先使用 react-i18next**：已有依赖，生态成熟
3. **core-locale 保留**：供后端层（bff、agent-server）使用
4. **如有跨平台需求**：考虑将纯工具下沉到 shared 层
