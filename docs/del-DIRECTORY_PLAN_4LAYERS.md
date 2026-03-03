# 基于 4 层架构的完整目录规划

## 架构分层对应

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: 展示层 (UI)                              │
│  src/app/ + src/components/                         │
│  职责：纯页面、纯组件、无业务逻辑                    │
└─────────────────────────────────────────────────────┘
           ↓ 使用 useContent/useTheme/useLocale/useAuth
┌─────────────────────────────────────────────────────┐
│  Layer 2: 全局能力层 (Core)                        │
│  src/stores/ + src/hooks/ + src/services/          │
│  职责：i18n/theme/auth 全局状态和能力              │
└─────────────────────────────────────────────────────┘
           ↓ 调用
┌─────────────────────────────────────────────────────┐
│  Layer 3: 内容访问层 (Content Client)             │
│  src/clients/                                       │
│  职责：统一的数据获取接口，屏蔽数据源差异            │
└─────────────────────────────────────────────────────┘
           ↓ 调用
┌─────────────────────────────────────────────────────┐
│  Layer 4: 数据源 (Data)                            │
│  public/data/ + packages/api/ + Strapi             │
│  职责：原始数据存储和提供                           │
└─────────────────────────────────────────────────────┘
```

---

## 完整目录规划

### 📦 packages/web/

```
packages/web/
│
├── 📁 public/                                  # 静态资源和数据
│   ├── 📁 data/                                # 🆕 Layer 4 数据源 - JSON 内容
│   │   ├── hero.zh-CN.json
│   │   ├── hero.en-US.json
│   │   ├── features.zh-CN.json
│   │   ├── features.en-US.json
│   │   ├── products.zh-CN.json
│   │   ├── products.en-US.json
│   │   ├── cases.zh-CN.json
│   │   ├── cases.en-US.json
│   │   ├── cta.zh-CN.json
│   │   ├── cta.en-US.json
│   │   ├── about.zh-CN.json
│   │   ├── about.en-US.json
│   │   └── index.json                        # 数据索引和版本
│   │
│   ├── 📁 images/                             # 图片资源
│   ├── 📁 icons/                              # 图标资源
│   ├── 📁 videos/                             # 视频资源
│   └── manifest.json
│
├── 📁 src/
│   │
│   ├── 📁 app/                                # ⭐️ Layer 1 展示层 - Pages
│   │   ├── 📁 (auth)/                         # 认证路由组
│   │   │   ├── 📁 login/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── 📁 (main)/                         # 主路由组
│   │   │   └── page.tsx                       # 首页
│   │   │
│   │   ├── 📁 about/
│   │   │   └── page.tsx
│   │   ├── 📁 products/
│   │   │   └── page.tsx
│   │   ├── 📁 helloworld/
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 test/                           # 测试页面
│   │   │   ├── 📁 localtest/
│   │   │   ├── 📁 pagetest/
│   │   │   ├── 📁 phase1/
│   │   │   ├── 📁 styles-demo1/
│   │   │   ├── 📁 styles-demo2/
│   │   │   └── 📁 theme-system/
│   │   ├── 📁 twtest/
│   │   │
│   │   ├── layout.tsx                        # 根 Layout
│   │   ├── globals.css                       # 全局样式
│   │   ├── icon.tsx                          # 网站 Icon
│   │   └── apple-icon.tsx                    # Apple Icon
│   │
│   ├── 📁 components/                         # ⭐️ Layer 1 展示层 - Components
│   │   ├── 📁 home/
│   │   │   ├── HeroSection.tsx                # ✏️ 修改：使用 useContent('hero')
│   │   │   ├── FeaturesSection.tsx            # ✏️ 修改：使用 useContent('features')
│   │   │   ├── ProductsSection.tsx            # ✏️ 修改：使用 useContent('products')
│   │   │   ├── CasesSection.tsx               # ✏️ 修改：使用 useContent('cases')
│   │   │   ├── CTASection.tsx                 # ✏️ 修改：使用 useContent('cta')
│   │   │   └── index.tsx
│   │   │
│   │   ├── 📁 about/
│   │   │   ├── AboutHero.tsx                  # ✏️ 修改：使用 useContent('about')
│   │   │   └── index.tsx
│   │   │
│   │   ├── 📁 products/
│   │   │   ├── ProductGrid.tsx                # ✏️ 修改：使用 useContent('products')
│   │   │   └── index.tsx
│   │   │
│   │   ├── 📁 layout/
│   │   │   ├── Header.tsx                     # ✏️ 修改：使用 useLocale()
│   │   │   ├── Footer.tsx                     # ✏️ 修改：使用 useLocale()
│   │   │   ├── Sidebar.tsx
│   │   │   └── index.tsx
│   │   │
│   │   ├── 📁 common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   │
│   │   └── 📁 aboutus/
│   │       └── ...
│   │
│   ├── 📁 stores/                             # ⭐️ Layer 2 能力层 - 状态管理
│   │   ├── themeStore.ts                      # ✏️ 修改：支持 'system' 主题
│   │   ├── i18nStore.ts                       # ✏️ 修改：只保留 locale 状态，移除翻译数据
│   │   ├── authStore.ts
│   │   ├── notificationStore.ts
│   │   ├── persistHelper.ts
│   │   └── 📁 persistOptions/
│   │       ├── themeAdapters.ts
│   │       ├── i18nAdapters.ts
│   │       └── authAdapters.ts
│   │
│   ├── 📁 hooks/                              # ⭐️ Layer 2 能力层 - React Hooks
│   │   ├── 🆕 useTheme.ts                     # 新增：主题 Hook
│   │   ├── 🆕 useLocale.ts                    # 新增：国际化 Hook
│   │   ├── 🆕 useAuth.ts                      # 新增：认证 Hook
│   │   ├── 🆕 useContent.ts                   # 新增：内容 Hook（Layer 3 入口）
│   │   │
│   │   ├── useScrollSnap.js
│   │   ├── useScrollSnap.ts
│   │   └── useWindowScrollSnap.ts
│   │
│   ├── 📁 services/                           # ⭐️ Layer 2 能力层 - 业务逻辑
│   │   ├── authService.ts
│   │   ├── i18nService.ts                     # ✏️ 修改：加载 src/locales/*.json
│   │   ├── themeService.ts                    # ✏️ 修改：支持系统主题检测
│   │   └── versionService.ts                  # 🆕 新增：版本和缓存管理
│   │
│   ├── 📁 locales/                            # 🆕 Layer 4 数据源 - 翻译文件
│   │   ├── 📁 zh-CN/
│   │   │   ├── common.json                    # 通用翻译
│   │   │   ├── nav.json                       # 导航翻译
│   │   │   ├── home.json                      # 首页翻译
│   │   │   ├── products.json                  # 产品页翻译
│   │   │   ├── about.json                     # 关于页翻译
│   │   │   ├── footer.json                    # 页脚翻译
│   │   │   └── errors.json                    # 错误信息
│   │   │
│   │   ├── 📁 en-US/
│   │   │   ├── common.json
│   │   │   ├── nav.json
│   │   │   ├── home.json
│   │   │   ├── products.json
│   │   │   ├── about.json
│   │   │   ├── footer.json
│   │   │   └── errors.json
│   │   │
│   │   └── index.ts                           # 导出所有翻译
│   │
│   ├── 📁 clients/                            # ⭐️ Layer 3 访问层 - 🆕 新增
│   │   ├── contentClient.ts                   # 核心：统一的内容获取接口
│   │   ├── i18nClient.ts                      # 翻译数据获取
│   │   ├── 📁 adapters/
│   │   │   ├── jsonAdapter.ts                 # JSON 数据源适配器
│   │   │   ├── apiAdapter.ts                  # API 数据源适配器（Week 3+）
│   │   │   └── strapiAdapter.ts               # Strapi 数据源适配器（Week 4+）
│   │   └── cache.ts                           # 缓存管理
│   │
│   ├── 📁 types/                              # 类型定义
│   │   ├── auth.types.ts
│   │   ├── i18n.types.ts
│   │   ├── theme.types.ts
│   │   ├── 🆕 content.types.ts                # 新增：内容数据类型
│   │   ├── 🆕 client.types.ts                 # 新增：客户端接口类型
│   │   └── index.ts                           # 统一导出
│   │
│   ├── 📁 constants/
│   │   ├── authConfig.ts
│   │   ├── i18nConfig.ts                      # ✏️ 修改：只保留语言列表
│   │   ├── themeConfig.ts                     # ✏️ 修改：添加系统主题配置
│   │   ├── 🆕 contentConfig.ts                # 新增：内容配置
│   │   └── 🆕 cacheConfig.ts                  # 新增：缓存策略配置
│   │
│   ├── 📁 contexts/
│   │   └── GlobalContext.tsx                  # 全局上下文容器
│   │
│   ├── 📁 styles/                             # 样式文件
│   │   ├── 📁 base/
│   │   ├── 📁 components/
│   │   ├── 📁 themes/
│   │   ├── 📁 utilities/
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── debug-dark.css
│   │   ├── force-dark.css
│   │   ├── themes.css
│   │   └── utilities.css
│   │
│   ├── 📁 theme/
│   │   ├── colorMap.ts
│   │   └── 🆕 themeDefinitions.ts            # 新增：主题定义
│   │
│   ├── 📁 utils/
│   │   ├── scroll.ts
│   │   ├── 🆕 dataLoader.ts                   # 新增：数据加载工具
│   │   ├── 🆕 cacheTTL.ts                     # 新增：缓存过期管理
│   │   └── 🆕 errorHandler.ts                 # 新增：错误处理
│   │
│   └── global.d.ts
│
├── next.config.js
├── tsconfig.json
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── ... 其他配置文件
```

---

## 🔄 数据流向图

### Layer 1 → Layer 2 → Layer 3 → Layer 4

```typescript
// ===== Layer 1: 展示层 =====
// src/components/home/HeroSection.tsx
export function HeroSection() {
  const locale = useLocale()           // ← Layer 2 hook
  const theme = useTheme()             // ← Layer 2 hook
  const { data, isLoading } = useContent('hero')  // ← Layer 3 hook

  return (
    <div className={theme.isDark ? 'dark' : 'light'}>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  )
}

// ===== Layer 2: 能力层 =====
// src/hooks/useContent.ts
export function useContent(key: string) {
  const locale = useLocale()
  const query = useQuery(
    ['content', key, locale],
    () => contentClient.getContent(key, locale)  // ← Layer 3 client
  )
  return query
}

// src/hooks/useLocale.ts
export function useLocale() {
  const store = i18nStore()            // ← Zustand store
  return {
    locale: store.locale,
    setLocale: store.setLocale,
    t: (key: string) => i18nClient.translate(key, store.locale)
  }
}

// ===== Layer 3: 访问层 =====
// src/clients/contentClient.ts
export const contentClient = {
  async getContent(key: string, locale: string) {
    // 尝试缓存
    const cached = cache.get(`content:${key}:${locale}`)
    if (cached) return cached

    // 尝试 API（Week 3+）
    try {
      const data = await apiAdapter.fetch(key, locale)
      cache.set(`content:${key}:${locale}`, data)
      return data
    } catch {
      // 降级到 JSON（Week 1）
      const data = await jsonAdapter.fetch(key, locale)
      cache.set(`content:${key}:${locale}`, data)
      return data
    }
  }
}

// ===== Layer 4: 数据源 =====
// src/clients/adapters/jsonAdapter.ts
export const jsonAdapter = {
  async fetch(key: string, locale: string) {
    const res = await fetch(`/data/${key}.${locale}.json`)  // ← public/data/
    return res.json()
  }
}

// public/data/hero.zh-CN.json
{
  "title": "欢迎来到我们的网站",
  "description": "这是一个现代化的网站",
  "cta": "开始探索"
}
```

---

## 📋 变更清单

### 🆕 需要新增的文件

| 路径                               | 类型 | 说明                      |
| ---------------------------------- | ---- | ------------------------- |
| `public/data/*.json`               | 数据 | 页面内容（Layer 4）       |
| `src/locales/{zh-CN,en-US}/*.json` | 数据 | 翻译文件（Layer 4）       |
| `src/clients/`                     | 代码 | 数据访问层（Layer 3）     |
| `src/hooks/useContent.ts`          | 代码 | 内容 Hook（Layer 3 入口） |
| `src/hooks/useTheme.ts`            | 代码 | 主题 Hook（Layer 2）      |
| `src/hooks/useLocale.ts`           | 代码 | 国际化 Hook（Layer 2）    |
| `src/hooks/useAuth.ts`             | 代码 | 认证 Hook（Layer 2）      |
| `src/types/content.types.ts`       | 代码 | 内容类型（Layer 3）       |
| `src/types/client.types.ts`        | 代码 | 客户端接口（Layer 3）     |
| `src/constants/contentConfig.ts`   | 代码 | 内容配置（Layer 2）       |
| `src/constants/cacheConfig.ts`     | 代码 | 缓存配置（Layer 3）       |

### ✏️ 需要修改的文件

| 路径                                      | 变更 | 说明                                   |
| ----------------------------------------- | ---- | -------------------------------------- |
| `src/stores/i18nStore.ts`                 | 简化 | 移除翻译数据，只保留 locale 状态       |
| `src/stores/themeStore.ts`                | 增强 | 支持 'system' 主题 + 媒体查询          |
| `src/services/i18nService.ts`             | 改造 | 加载 `src/locales/*.json` 而不是 Store |
| `src/services/themeService.ts`            | 改造 | 支持 OS 主题检测                       |
| `src/constants/i18nConfig.ts`             | 简化 | 只保留语言列表                         |
| `src/constants/themeConfig.ts`            | 增强 | 添加系统主题配置                       |
| `src/components/home/HeroSection.tsx`     | 改造 | 使用 `useContent('hero')`              |
| `src/components/home/FeaturesSection.tsx` | 改造 | 使用 `useContent('features')`          |
| `src/components/home/ProductsSection.tsx` | 改造 | 使用 `useContent('products')`          |
| 其他内容组件                              | 改造 | 统一使用 `useContent()`                |

### ❌ 可以删除的文件

| 路径             | 原因                                      |
| ---------------- | ----------------------------------------- |
| `src/content/`   | 已用新的 Layer 4 数据源替代               |
| 硬编码的数据定义 | 已迁移到 `public/data/` 和 `src/locales/` |

---

## 🎯 实施步骤（Week 1）

### Phase 1: 准备数据源（Layer 4）

```bash
# 1. 创建目录结构
mkdir -p public/data
mkdir -p src/locales/{zh-CN,en-US}
mkdir -p src/clients/adapters

# 2. 创建 JSON 数据文件
# public/data/hero.zh-CN.json
# public/data/hero.en-US.json
# ... (所有内容数据)

# 3. 创建翻译文件
# src/locales/zh-CN/common.json
# src/locales/en-US/common.json
# ... (所有翻译)
```

### Phase 2: 实现访问层（Layer 3）

```bash
# 4. 创建 clients/
# src/clients/contentClient.ts
# src/clients/i18nClient.ts
# src/clients/cache.ts
# src/clients/adapters/jsonAdapter.ts

# 5. 创建类型定义
# src/types/content.types.ts
# src/types/client.types.ts
```

### Phase 3: 完善能力层（Layer 2）

```bash
# 6. 创建或改造 hooks/
# src/hooks/useTheme.ts (新增)
# src/hooks/useLocale.ts (新增)
# src/hooks/useAuth.ts (新增)
# src/hooks/useContent.ts (新增)

# 7. 改造 stores/
# src/stores/i18nStore.ts (简化)
# src/stores/themeStore.ts (增强)

# 8. 改造 services/
# src/services/i18nService.ts
# src/services/themeService.ts
```

### Phase 4: 改造展示层（Layer 1）

```bash
# 9. 改造所有内容组件
# src/components/home/HeroSection.tsx
# src/components/home/FeaturesSection.tsx
# ... (所有使用内容的组件)

# 10. 改造 layout 组件
# src/components/layout/Header.tsx
# src/components/layout/Footer.tsx
```

### Phase 5: 验证和提交

```bash
# 11. 类型检查
pnpm type-check

# 12. 开发服务器测试
pnpm dev

# 13. 功能测试
# - 语言切换
# - 主题切换（包括 'system' 主题）
# - 内容加载
# - 缓存验证

# 14. 提交
git add .
git commit -m "feat: implement 4-layer architecture for content management"
```

---

## 📊 目录对比

### 现在 → 改进后

```
❌ 现在（混乱）
src/
├── app/ (Pages)
├── components/ (Components - 混入硬编码数据)
├── stores/ (State - 翻译混在里面)
├── services/ (Services - 职责不清)
└── ...

✅ 改进后（清晰）
src/
├── app/ (Layer 1: Pages 纯展示)
├── components/ (Layer 1: Components 纯展示)
├── stores/ (Layer 2: 状态管理 - 清晰职责)
├── hooks/ (Layer 2: 能力 Hook)
├── services/ (Layer 2: 业务逻辑)
├── clients/ (Layer 3: 数据访问客户端 - 新增)
├── locales/ (Layer 4: 翻译数据 - 新增)
├── types/ (类型定义)
└── constants/ (配置)

public/
└── data/ (Layer 4: 页面内容 JSON - 新增)
```

---

## ✨ 核心特点

1. **清晰的分层** - 每层职责明确，互不侵入
2. **数据源无关** - 通过 contentClient 屏蔽数据源差异
3. **渐进式迁移** - JSON → API → Strapi 无痛过渡
4. **完整的缓存** - 浏览器 + 内存 + 服务端三层
5. **易于测试** - Mock contentClient 即可测试所有组件
6. **团队友好** - 各角色职责明确，流程标准化

---

## 🚀 周计划

| 周      | 任务                    | 完成度                 |
| ------- | ----------------------- | ---------------------- |
| Week 1  | 实现 Layer 2-4 基础架构 | Phase 1-5              |
| Week 2  | 完成所有组件改造        | Layer 1 全面改造       |
| Week 3  | API 集成                | contentClient 支持 API |
| Week 4+ | CMS 部署                | 完整的内容管理系统     |

---

## 📌 关键提示

- ✅ 这个结构**完全符合 Clean Architecture**
- ✅ **支持团队协作** - 前端/数据/内容工程师各司其职
- ✅ **支持 CI/CD** - 数据和代码分离便于自动化
- ✅ **支持版本管理** - 可以维护数据版本历史
- ⚠️ **类型安全必不可少** - 数据源变更时 TypeScript 会自动检测
