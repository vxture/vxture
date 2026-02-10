# 项目架构分层分析

## 你提议的架构模型

```
┌──────────────────────────┐
│        展示层 (UI)        │  ← 纯页面、无业务
│  Pages / Layout / Theme  │
├──────────────────────────┤
│     全局能力层 (Core)     │  ← i18n / theme / auth
│  Locale / Theme / Auth   │
├──────────────────────────┤
│    内容访问层 (Content)  │  ← 仿 API
│  contentClient           │
├──────────────────────────┤
│    内容源 (Data)         │  ← JSON / API
│  json / strapi / api     │
└──────────────────────────┘
```

---

## 架构分析 ✅

### 优势

#### 1️⃣ **清晰的责任分离**

- **展示层** - 100% 专注渲染，无数据获取逻辑
- **能力层** - 全局状态管理集中
- **访问层** - 统一的数据接口（屏蔽数据源差异）
- **数据源** - 支持多种存储方案，易于切换

**对标**：Clean Architecture / Hexagonal Architecture ✅

#### 2️⃣ **数据源无关性（核心价值）**

```
当前问题：
  Component → HeroSection.tsx 写死 data = [...]

分层后：
  HeroSection.tsx → useContent('hero')
  useContent() → contentClient.getContent('hero')
  contentClient → adapter (JSON/API/Strapi)

优势：
  - 切换数据源只修改 contentClient
  - 组件代码完全不需改动
  - 支持渐进式迁移：JSON → API → Strapi
```

#### 3️⃣ **缓存和性能优化空间**

```
contentClient 可以实现：
  - 请求去重（同时多个组件请求同一内容）
  - 浏览器缓存策略
  - React Query 集成
  - CDN 友好
```

#### 4️⃣ **测试友好**

```
Mock contentClient 即可测试所有页面组件
不需依赖真实数据源
```

---

## 映射到当前项目

### Layer 1: 展示层 (UI) 📄

```
packages/web/src/
├── app/                           ← Pages
│   ├── (main)/page.tsx           ← 路由页面
│   ├── products/page.tsx
│   ├── about/page.tsx
│   └── layout.tsx                ← 全局 Layout
│
└── components/
    ├── home/
    │   ├── HeroSection.tsx       ← 仅渲染
    │   ├── FeaturesSection.tsx   ← 仅渲染
    │   └── ProductsSection.tsx   ← 仅渲染
    ├── layout/
    │   ├── Header.tsx            ← 仅渲染
    │   └── Footer.tsx            ← 仅渲染
    └── products/
        └── ProductGrid.tsx       ← 仅渲染
```

**职责**：

- ✅ 接收数据通过 props
- ✅ 调用 useContent() Hook 获取数据
- ✅ 100% 关注 UI 渲染
- ❌ 不涉及数据加载逻辑
- ❌ 不涉及存储访问

---

### Layer 2: 全局能力层 (Core) 🔧

```
packages/web/src/
├── contexts/
│   └── GlobalContext.tsx         ← 全局状态容器
│
├── hooks/
│   ├── useTheme()                ← 主题能力
│   ├── useLocale()               ← 国际化能力
│   └── useAuth()                 ← 认证能力
│
├── stores/
│   ├── themeStore.ts             ← 主题状态（Zustand）
│   ├── i18nStore.ts              ← 国际化状态
│   └── authStore.ts              ← 认证状态
│
└── services/
    ├── themeService.ts           ← 主题逻辑
    ├── i18nService.ts            ← 翻译加载
    └── authService.ts            ← 认证逻辑
```

**职责**：

- ✅ 管理全局状态（主题/语言/用户）
- ✅ 暴露能力 Hook（useTheme/useLocale/useAuth）
- ✅ 持久化到 localStorage
- ❌ 不处理页面级数据
- ❌ 不处理 API 请求

**关键改进**：

```typescript
// 当前（混乱）
import { i18nStore } from '@/stores';
const { locale, translations } = i18nStore(); // ❌ 翻译混在里面

// 改进后（清晰）
import { useLocale } from '@/hooks';
const { locale, setLocale } = useLocale(); // ✅ 只有状态
const t = useI18n(); // ✅ 翻译从 i18nService
```

---

### Layer 3: 内容访问层 (Content Client) 🔌

```
packages/web/src/
├── clients/                      # 🆕 新建
│   └── contentClient.ts          # 核心接口
│
├── hooks/
│   └── useContent.ts             # 🆕 新增
│       (使用 contentClient)
│
└── types/
    └── content.types.ts          # 数据类型定义
```

**contentClient.ts 的实现**：

```typescript
// src/clients/contentClient.ts

export const contentClient = {
  // 获取内容（自动选择数据源）
  async getContent(key: string, locale: string) {
    // 1. 尝试缓存
    const cached = this.cache.get(`${key}:${locale}`);
    if (cached) return cached;

    // 2. 尝试 API
    try {
      const data = await this.fetchFromAPI(key, locale);
      this.cache.set(`${key}:${locale}`, data);
      return data;
    } catch {
      // 3. 降级到 JSON
      const data = await this.fetchFromJSON(key, locale);
      this.cache.set(`${key}:${locale}`, data);
      return data;
    }
  },

  // 数据源 1: API
  async fetchFromAPI(key: string, locale: string) {
    const res = await fetch(`/api/content/${key}/${locale}`);
    return res.json();
  },

  // 数据源 2: JSON 文件
  async fetchFromJSON(key: string, locale: string) {
    const res = await fetch(`/data/${key}.${locale}.json`);
    return res.json();
  },
};

// useContent Hook
export function useContent(key: string) {
  const locale = useLocale(); // 从全局能力层获取
  const query = useQuery(['content', key, locale], () => contentClient.getContent(key, locale));
  return query;
}
```

**职责**：

- ✅ 统一的内容获取接口
- ✅ 处理缓存策略
- ✅ 处理错误降级
- ✅ 支持多数据源适配
- ❌ 不涉及具体数据结构
- ❌ 不涉及业务逻辑

---

### Layer 4: 内容源 (Data) 📦

```
packages/web/
├── public/data/                  # 🆕 JSON 本地数据
│   ├── hero.zh-CN.json
│   ├── hero.en-US.json
│   ├── features.zh-CN.json
│   ├── features.en-US.json
│   ├── products.zh-CN.json
│   ├── products.en-US.json
│   ├── cases.zh-CN.json
│   ├── cases.en-US.json
│   ├── cta.zh-CN.json
│   └── cta.en-US.json
│
packages/api/                     # 后端 API（Week 3+）
├── routes/
│   └── content.py                # /api/content/{key}/{locale}
└── ...

# 或者 Strapi CMS（Week 4+）
```

**职责**：

- ✅ 提供原始数据
- ✅ 支持多种格式（JSON / GraphQL / REST）
- ❌ 不涉及缓存
- ❌ 不涉及适配

---

## 对比：现在 vs 改进后

### 现在（混乱）

```
HeroSection.tsx
  ↓ (直接)
  const data = [
    { title: "...", desc: "..." },
    ...
  ]

问题：
❌ 内容和代码混杂
❌ 修改内容需要改代码
❌ 无法切换数据源
❌ 无缓存策略
❌ i18n 翻译混在 store 里
```

### 改进后（清晰）

```
HeroSection.tsx
  ↓ (useContent Hook)
  const { data } = useContent('hero')

useContent('hero')
  ↓ (contentClient)
  contentClient.getContent('hero', 'zh-CN')

contentClient
  ↓ (智能选择)
  ├─ /api/content/hero/zh-CN (API - Week 3+)
  ├─ /data/hero.zh-CN.json (JSON - Week 1)
  └─ cache (缓存)

优势：
✅ 内容和代码分离
✅ 修改内容不需改代码
✅ 支持渐进式数据源切换
✅ 完整的缓存策略
✅ i18n 精确分离
```

---

## 实施路线图

### Week 1：建立基础架构

```
✅ Layer 2 (能力层) 清理
  - i18nStore: 移除翻译，只保留 locale 状态
  - themeStore: 添加 'system' 主题
  - 暴露 useTheme/useLocale/useAuth Hook

✅ Layer 4 (数据源) 准备
  - 创建 public/data/*.json 文件
  - 创建 src/locales/*.json 翻译文件

✅ Layer 3 (访问层) 实现
  - 创建 src/clients/contentClient.ts
  - 创建 src/hooks/useContent.ts (集成 React Query)

✅ Layer 1 (展示层) 改造
  - HeroSection.tsx: 使用 useContent('hero')
  - FeaturesSection.tsx: 使用 useContent('features')
  - ProductsSection.tsx: 使用 useContent('products')
  - ...等所有内容类组件
```

### Week 2：优化和工具化

```
- 创建 contentClient 的 TypeScript 类型
- 添加 React Query 的错误处理
- 创建 Mock contentClient 用于测试
- 可选：集成 i18next
```

### Week 3：API 集成

```
- packages/api 实现 /api/content/{key}/{locale}
- contentClient 支持 API 优先降级 JSON
- 性能监控和缓存验证
```

### Week 4+：CMS 集成（可选）

```
- 部署 Strapi CMS
- contentClient 支持 Strapi 数据源
- 内容管理界面
```

---

## 对标业界最佳实践

| 架构           | 你的分层               | 对标                      |
| -------------- | ---------------------- | ------------------------- |
| **责任明确**   | 4 层分离               | ✅ Clean Architecture     |
| **数据源无关** | contentClient          | ✅ Adapter Pattern        |
| **渐进式迁移** | JSON → API → Strapi    | ✅ Strangler Fig Pattern  |
| **状态管理**   | Zustand + Context      | ✅ Redux/Zustand 最佳实践 |
| **缓存策略**   | React Query + 本地缓存 | ✅ SWR/React Query 标准   |
| **易于测试**   | Mock contentClient     | ✅ Dependency Injection   |

---

## 核心优势总结

### 1. **渐进式迁移无痛** 🚀

```
Week 1:  JSON 文件              (快速原型)
Week 3:  JSON + 后端 API        (弹性架构)
Week 4:  API + Strapi CMS       (完整方案)

代码改动：0 行（只改 contentClient）
```

### 2. **高度可维护性** 🔧

```
修改英文翻译：   src/locales/en-US/common.json
修改首页内容：   public/data/hero.en-US.json
修改主题颜色：   src/stores/themeStore.ts
修改页面样式：   src/components/home/HeroSection.tsx

各司其职，互不影响
```

### 3. **完全的缓存控制** ⚡

```
- 浏览器缓存（public/data 配置 max-age）
- 内存缓存（React Query）
- 服务端缓存（API 层，Week 3+）

性能可控
```

### 4. **团队协作友好** 👥

```
前端工程师：   维护 Layer 1 & 2
数据工程师：   维护 Layer 3 & 4
内容编辑：     维护 Layer 4 (JSON/CMS)

职责清晰，流程标准化
```

---

## 建议

### ✅ 强烈推荐

1. **采用这个 4 层架构**
2. **Week 1 完成 Layer 2-4 的基础搭建**
3. **Layer 1 开始使用 useContent() 而不是硬编码**

### ⚠️ 注意事项

1. **contentClient 必须处理离线场景**（缓存为王）
2. **数据结构需提前定义**（TypeScript 类型）
3. **考虑 i18n 和 content 数据的版本管理**

### 📋 可选增强

1. **创建数据版本系统**（支持 AB 测试）
2. **集成 CMS 后台**（Week 4+）
3. **性能监控和分析**（记录缓存命中率）

---

## 文件夹结构对应

```typescript
// Layer 1: 展示层
src/app/*                  // Pages
src/components/*           // Components

// Layer 2: 能力层
src/contexts/              // 全局状态容器
src/hooks/useTheme()       // 主题能力
src/hooks/useLocale()      // 国际化能力
src/stores/                // Zustand 状态
src/services/              // 业务逻辑

// Layer 3: 访问层
src/clients/               // 🆕 数据访问客户端
src/hooks/useContent()     // 🆕 内容获取

// Layer 4: 数据源
public/data/               // 🆕 JSON 数据
packages/api/              // 后端 API（Week 3+）
```

---

## 最后的评价

你提议的 4 层分层架构 **完全符合现代前端最佳实践**，特别是：

1. **清晰度** ⭐⭐⭐⭐⭐ - 一目了然
2. **可扩展性** ⭐⭐⭐⭐⭐ - 支持多数据源
3. **可维护性** ⭐⭐⭐⭐⭐ - 职责明确
4. **易于测试** ⭐⭐⭐⭐⭐ - Mock 友好
5. **渐进式迁移** ⭐⭐⭐⭐⭐ - 无痛切换

**建议立即采用这个架构** 🎯
