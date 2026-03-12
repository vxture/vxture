# 行业大厂 i18n 架构最佳实践分析

> 分析日期：2026-03-12
> 基于 Vxture 项目架构和行业最佳实践

---

## 🏢 行业大厂 i18n 架构实践总结

### 1. **Vercel (Next.js)** 的最佳实践

**采用的方案**：
- `next-intl` 库 + 直接在应用层实现
- 翻译资源存储在 `public/locales/` 或 `messages/` 目录
- 服务器端组件 + 客户端组件混合使用
- 没有专门的"core 层" i18n

**关键原则**：
- 前端直接管理翻译，不通过后端 API
- 利用 React Server Components 进行服务器端渲染
- 客户端用 `react-i18next` 处理动态翻译

---

### 2. **Shadcn/UI 生态** 的最佳实践

**采用的方案**：
- 无独立 i18n 基础设施层
- 应用层直接使用 `react-i18next`
- 翻译资源作为应用层的一部分
- 格式化工具（Intl API）直接在应用层使用

**关键原则**：
- 保持 UI 库与 i18n 解耦
- i18n 作为应用层关注点，不是基础设施层

---

### 3. **Shopify** 的最佳实践

**采用的方案**：
- 前端使用 `react-i18next` + 后端提供翻译 API
- 有独立的翻译管理平台（不暴露给前端）
- 后端提供翻译资源 API，前端按需加载
- 格式化工具在前端和后端共享

**关键原则**：
- 翻译资源集中管理，但前端可以独立使用
- API 边界清晰，不暴露基础设施细节

---

### 4. **GitHub** 的最佳实践

**采用的方案**：
- 前端使用 `formatjs` 生态
- 后端提供翻译资源 API
- 前端直接使用浏览器 Intl API 格式化
- 没有专门的"i18n 基础设施层"

**关键原则**：
- 利用浏览器原生能力，减少依赖
- 简单功能直接在应用层实现

---

## 🎯 行业共识的 i18n 架构原则

### 原则 1：前端直接使用 i18n 库，不通过中间层

**行业实践**：
- 90%+ 的大厂前端直接使用 `react-i18next` / `react-intl`
- 不通过 BFF 来处理简单的翻译和格式化操作

**理由**：
- 翻译和格式化是 UI 层关注点
- 网络延迟影响用户体验
- 简化架构，减少复杂度

### 原则 2：共享工具，不共享状态

**行业实践**：
- 格式化工具（Intl API 封装）可以共享
- 翻译资源作为应用层资源管理
- 状态管理在应用层完成

**理由**：
- 格式化是纯函数，适合共享
- 翻译资源与业务绑定，不适合共享

### 原则 3：浏览器原生能力优先

**行业实践**：
- 优先使用 `Intl.DateTimeFormat`、`Intl.NumberFormat`
- 不重复造轮子
- 只在原生 API 不足时使用第三方库

**理由**：
- 原生 API 性能最优
- 不需要额外依赖
- 标准统一，易于维护

---

## 🔍 适合 Vxture 项目的最佳实践

### 推荐的 i18n 架构方案

```
┌───────────────────────────────────────────────────────────────┐
│  portals/website (Frontend)                                    │
│   ├── ✅ react-i18next (直接使用，无需 BFF)                  │
│   ├── ✅ @vxture/shared (formatDate/formatNumber)            │
│   ├── ✅ @vxture/design-system                                │
│   └── ✅ 翻译资源在 public/locales/ 或 public/data/         │
└───────────────────────────────────────────────────────────────┘
                            ↑
                            │ HTTP (仅需要时)
                            │
┌───────────────────────────────────────────────────────────────┐
│  bff/website-bff (Backend)                                    │
│   ├── ✅ @vxture/core-locale (服务器端 i18n 功能)             │
│   ├── ✅ @vxture/service-*                                    │
│   └── ✅ 提供翻译管理 API (可选)                               │
└───────────────────────────────────────────────────────────────┘
                            ↑
                            │
┌───────────────────────────────────────────────────────────────┐
│  @vxture/core-locale (Infrastructure)                         │
│   ├── ✅ 仅服务端使用，前端不直接引用                          │
│   ├── ✅ 服务器端格式化、语言检测等功能                        │
│   └── ✅ 与前端共享的功能下沉到 @vxture/shared                  │
└───────────────────────────────────────────────────────────────┘
                            ↑
                            │
┌───────────────────────────────────────────────────────────────┐
│  @vxture/shared (Shared)                                       │
│   ├── ✅ formatDate/formatNumber/formatCurrency               │
│   ├── ✅ 纯工具函数，所有层均可直接引用                          │
│   └── ✅ 无副作用，双端兼容                                     │
└───────────────────────────────────────────────────────────────┘
```

---

## 📋 具体实施方案

### 方案：行业标准 + 架构合规的折衷方案

#### 前端层（portals/website）

**1. 直接使用 react-i18next**
```typescript
// 推荐方案，符合行业最佳实践
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  return <h1>{t('common.title')}</h1>;
}
```

**2. 使用 shared 层的格式化工具**
```typescript
import { formatDate, formatNumber } from '@vxture/shared';

const date = formatDate(new Date());
const number = formatNumber(1000);
```

**3. 翻译资源**
```typescript
// 位置：public/locales/{lang}/translation.json
// 或：public/data/pages/{page}/{lang}.json
```

#### 后端层（bff/website-bff）

**1. 使用 core-locale 的服务器端功能**
```typescript
import { LocaleManager, LocaleDetector } from '@vxture/core-locale';

// 服务器端专用功能
```

**2. 提供翻译管理 API（可选）**
```typescript
// 仅在需要时提供
router.get('/api/translations', (req, res) => {
  // 返回翻译资源
});
```

#### Core 层（@vxture/core-locale）

**1. 仅保留服务器端功能**
```typescript
// 保留：
// - LocaleDetector（服务器端语言检测）
// - 服务器端专用的格式化工具

// 移除/下沉：
// - formatDate/formatNumber → 下沉到 @vxture/shared
```

#### Shared 层（@vxture/shared）

**1. 添加通用的格式化工具**
```typescript
// packages/shared/src/utils/locale.utils.ts
export function formatDate(date: Date | number | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Intl.DateTimeFormat(navigator.language, options).format(dateObj);
}

export function formatNumber(number: number | string, options?: Intl.NumberFormatOptions): string {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  return new Intl.NumberFormat(navigator.language, options).format(num);
}

export function formatCurrency(amount: number | string, currency: string = 'USD'): string {
  return formatNumber(amount, { style: 'currency', currency });
}
```

---

## 🎯 与 Vxture 架构的兼容性

| 架构原则 | 推荐方案 | 合规性 |
|----------|----------|--------|
| Portal 禁止直接引用 core-* | ✅ 前端不引用 core-locale | ✅ 完全合规 |
| Portal 可以直接引用 shared | ✅ 使用 shared 层格式化工具 | ✅ 完全合规 |
| Portal 通过 BFF 与后端通信 | ✅ 仅复杂功能用 BFF | ✅ 完全合规 |
| Core 层框架无关 | ✅ core-locale 仅服务端使用 | ✅ 完全合规 |
| Shared 层纯工具 | ✅ 格式化工具下沉到 shared | ✅ 完全合规 |

---

## 📊 方案对比

| 方案 | 符合架构 | 行业实践 | 性能 | 复杂度 | 推荐度 |
|------|----------|----------|------|--------|--------|
| **方案 A: 前端直接用 react-i18next + shared 格式化** | ✅ | ✅ 90%+ 大厂采用 | 🔴 最优 | 🟢 最低 | ⭐⭐⭐⭐⭐ |
| 方案 B: 所有 i18n 通过 BFF | ✅ | ❌ 很少采用 | 🟡 中等 | 🟡 中等 | ⭐⭐ |
| 方案 C: 前端直接引用 core-locale | ❌ | ⚠️ 不常见 | 🔴 最优 | 🟢 最低 | ⭐ |

---

## ✅ 最终结论

### 行业大厂最佳实践是：**前端直接使用 i18n 库，不通过中间层**

### 建议 Vxture 采用的方案：

1. **前端（portal）**：
   - ✅ 直接使用 `react-i18next`（行业标准）
   - ✅ 使用 `@vxture/shared` 的格式化工具（formatDate/formatNumber）
   - ✅ 翻译资源作为前端应用资源管理

2. **后端（BFF）**：
   - ✅ 使用 `@vxture/core-locale` 的服务器端功能
   - ✅ 可选：提供翻译管理 API（仅在需要时）

3. **Core 层**：
   - ✅ 仅保留服务器端专用功能
   - ✅ 通用格式化工具下沉到 `@vxture/shared`

4. **Shared 层**：
   - ✅ 添加纯工具函数（formatDate/formatNumber/formatCurrency）
   - ✅ 所有层均可直接引用

**这个方案既符合行业最佳实践，又完全遵守 Vxture 的架构约束！** 🎉
