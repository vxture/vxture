# @vxture/core-locale

> **面向开发人员/AI 的使用文档**
> 本文档详细说明 @vxture/core-locale 包的功能、API 和使用方法，包含完整的导入方式、类型说明和代码示例。

## 包概述

@vxture/core-locale 是 Vxture 平台的**服务端语言解析和内容本地化工具**，提供以下能力：
- 服务端 Locale 解析（从请求头、Cookie 等）
- 内容本地化查找（多语言内容按语言返回）
- 重新导出 @vxture/shared 的语言类型，方便使用

## 安装和导入

```bash
# 通过 pnpm 安装（monorepo）
pnpm add @vxture/core-locale

# 导入方式（统一入口）
import {
  // 类型（重新导出 @vxture/shared）
  type Locale,

  // 语言常量（重新导出）
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,

  // 服务端工具
  resolveLocale,
  localizeContent,
} from '@vxture/core-locale';
```

## 核心功能和方法

### 1. 语言解析（服务端）

#### 从请求解析语言

```typescript
// 在 BFF 或服务端使用
import { resolveLocale } from '@vxture/core-locale';

export async function handler(request: Request) {
  // 解析语言（支持多种来源）
  const locale = resolveLocale(request);
  
  // 使用解析到的语言获取数据
  const data = await fetchData(locale);
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Language': locale,
    },
  });
}
```

#### 解析规则（优先级）

```typescript
// 1. Cookie 中的 NEXT_LOCALE
// 2. Accept-Language Header（匹配 SUPPORTED_LOCALES）
// 3. 回退到 DEFAULT_LOCALE
```

### 2. 内容本地化

#### 多语言内容查找

```typescript
import { localizeContent } from '@vxture/core-locale';

const product = {
  id: '123',
  name: {
    zh: '专业版订阅',
    en: 'Pro Subscription'
  },
  description: {
    zh: '包含所有高级功能',
    en: 'Includes all premium features'
  },
  price: 99
};

// 按语言获取名称
const name = localizeContent(product.name, 'en'); // 'Pro Subscription'

// 按语言获取描述
const description = localizeContent(product.description, 'zh'); // '包含所有高级功能'

// 不匹配时回退到默认语言
const fallback = localizeContent(product.name, 'ja'); // '专业版订阅'
```

#### 翻译内容类型安全

```typescript
import type { Locale } from '@vxture/core-locale';

interface Product {
  id: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  price: number;
}

const product: Product = {
  id: '123',
  name: { zh: '产品', en: 'Product' },
  description: { zh: '详细描述', en: 'Detailed description' },
  price: 100
};
```

## 使用场景示例

### 在 BFF 中使用

```typescript
import { resolveLocale, localizeContent } from '@vxture/core-locale';
import { fetchProduct } from './api';

export async function GET(request: Request) {
  const locale = resolveLocale(request);
  
  const product = await fetchProduct();
  
  // 本地化返回数据
  const localizedProduct = {
    ...product,
    name: localizeContent(product.name, locale),
    description: localizeContent(product.description, locale),
    features: product.features.map(feature => ({
      ...feature,
      name: localizeContent(feature.name, locale),
      description: localizeContent(feature.description, locale)
    }))
  };
  
  return Response.json(localizedProduct);
}
```

### 在服务端渲染中使用

```typescript
import { resolveLocale } from '@vxture/core-locale';

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    metadataBase: new URL('https://vxture.com'),
    title: localizeContent({
      zh: '首页',
      en: 'Home'
    }, params.locale as any),
    description: localizeContent({
      zh: 'Vxture 智能平台',
      en: 'Vxture Intelligent Platform'
    }, params.locale as any)
  };
}

export default function Page({ params }: { params: { locale: string } }) {
  const content = localizeContent({
    zh: '欢迎使用 Vxture',
    en: 'Welcome to Vxture'
  }, params.locale as any);
  
  return <div>{content}</div>;
}
```

## 脚本命令

```bash
# 类型检查
pnpm type-check

# Lint 检查
pnpm lint

# 无构建命令（直接使用源代码）
```

## 依赖和边界

### 允许的依赖

✅ **@vxture/shared** - 语言类型和常量

✅ **原生 Intl API** - 格式化工具

### 禁止的依赖

❌ **其他 core-* 包**（core 包之间不得互相依赖）

❌ **service-*、ai-sdk、bff-* 等业务包**

❌ **NestJS / Next.js / React**

❌ **i18next / react-i18next**（属于上层应用）

❌ **浏览器专用 API**（window、document、localStorage）

---

## 与其他包的关系

### 和 @vxture/shared 的关系

```typescript
// @vxture/shared（基础）
import { type Locale, SUPPORTED_LOCALES } from '@vxture/shared';

// @vxture/core-locale（服务端）
import { resolveLocale, localizeContent } from '@vxture/core-locale';

// core-locale 重新导出 shared 的类型
import { type Locale, SUPPORTED_LOCALES } from '@vxture/core-locale';
```

### 和 @vxture/design-system 的关系

❌ 禁止直接依赖设计系统，因为是基础 core 包

✅ 设计系统可以依赖 core-locale 的工具函数

## 版本历史

### 1.0.0
- 初始版本
- 包含 resolveLocale 和 localizeContent
- 重新导出 @vxture/shared 的类型
