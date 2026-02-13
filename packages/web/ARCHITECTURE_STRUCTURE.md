# vxture Web 四层架构目录结构

> 更新时间: 2026-02-13
> 架构模式: Clean Architecture (四层分离)

---

## 📐 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │  ← UI 组件、页面、样式
│  (src/Presentation + src/app)                                │
└────────────────────┬────────────────────────────────────────┘
                     │ 调用
┌────────────────────▼────────────────────────────────────────┐
│                   Application Layer                          │  ← Hooks、Use Cases、SEO
│  (src/application)                                           │
└────────────────────┬────────────────────────────────────────┘
                     │ 调用
┌────────────────────▼────────────────────────────────────────┐
│                     Domain Layer                             │  ← 业务模型、聚合根、仓储接口
│  (src/domain)                                                │
└────────────────────┬────────────────────────────────────────┘
                     │ 实现
┌────────────────────▼────────────────────────────────────────┐
│                 Infrastructure Layer                         │  ← 适配器、仓储实现、HTTP客户端
│  (src/infrastructure)                                        │
└─────────────────────────────────────────────────────────────┘

                     ┌─────────────────┐
                     │   Shared Layer   │  ← 跨层共享：类型、常量、工具
                     │   (src/shared)   │
                     └─────────────────┘

                     ┌─────────────────┐
                     │  Stores Layer    │  ← Zustand 全局状态（跨层使用）
                     │   (src/stores)   │
                     └─────────────────┘
```

---

## 📁 完整目录结构

```
packages/web/
├── public/                              # 静态资源
│   └── data/                            # 📦 JSON 数据文件（内容数据源）
│       ├── layout/
│       │   ├── footer/
│       │   │   ├── footer.zh-CN.json
│       │   │   └── footer.en-US.json
│       │   └── header/
│       │       ├── header.zh-CN.json
│       │       └── header.en-US.json
│       └── pages/
│           └── home/
│               └── sections/
│                   ├── hero.{locale}.json
│                   ├── features.{locale}.json
│                   ├── solutions.{locale}.json
│                   ├── cases.{locale}.json
│                   └── cta.{locale}.json
│
└── src/
    │
    ├── 🎨 Presentation/                 # 第一层：表现层（UI）
    │   ├── components/                  # React 组件
    │   │   ├── home/                    # 首页组件
    │   │   │   ├── HeroSection.tsx
    │   │   │   ├── FeaturesSection.tsx
    │   │   │   ├── SolutionsSection.tsx
    │   │   │   ├── CasesSection.tsx
    │   │   │   └── CTASection.tsx
    │   │   ├── layout/                  # 布局组件
    │   │   │   ├── header/
    │   │   │   │   ├── Header.tsx
    │   │   │   │   ├── Logo.tsx
    │   │   │   │   ├── Navigation.tsx
    │   │   │   │   └── ThemeSwitcher.tsx
    │   │   │   └── footer/
    │   │   │       ├── Footer.tsx
    │   │   │       ├── FooterLinks.tsx
    │   │   │       └── SocialLinks.tsx
    │   │   ├── about/                   # 关于页组件
    │   │   ├── products/                # 产品页组件
    │   │   ├── common/                  # 通用业务组件
    │   │   │   ├── Notifications.tsx
    │   │   │   ├── ClientSyncAgg.tsx    # 客户端状态同步
    │   │   │   ├── QueryProvider.tsx
    │   │   │   ├── ThemeSync.tsx
    │   │   │   ├── I18nSync.tsx
    │   │   │   ├── AuthSync.tsx
    │   │   │   ├── Icon.tsx
    │   │   │   └── IconMap.tsx
    │   │   └── examples/                # 示例组件
    │   │       └── ContentUsageExamples.tsx
    │   │
    │   ├── pages/                       # 页面级组件（已废弃，迁移到 app/）
    │   ├── sections/                    # 独立 Section 组件
    │   ├── providers/                   # Context Providers
    │   └── styles/                      # 样式文件
    │       ├── globals.css              # 全局样式
    │       ├── base/                    # 基础样式
    │       ├── components/              # 组件样式
    │       ├── themes/                  # 主题样式
    │       └── utilities/               # 工具类样式
    │
    ├── 🚀 app/                          # Next.js App Router（路由层）
    │   ├── (auth)/                      # 认证路由组
    │   │   ├── login/
    │   │   │   └── login.tsx
    │   │   └── signup/
    │   │       └── signup.tsx
    │   ├── (main)/                      # 主路由组
    │   │   ├── layout.tsx               # 主布局（包含 Header/Footer）
    │   │   └── page.tsx                 # 首页
    │   ├── about/                       # 关于页
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   ├── products/                    # 产品页
    │   │   └── page.tsx
    │   ├── test/                        # 测试页面（开发用）
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── localtest/
    │   │   ├── pagetest/
    │   │   ├── phase1/
    │   │   ├── styles-demo1/
    │   │   ├── styles-demo2/
    │   │   └── theme-system/
    │   ├── layout.tsx                   # 根布局（SSR）
    │   ├── globals.css                  # 全局样式入口
    │   ├── icon.tsx                     # 网站图标
    │   └── apple-icon.tsx               # Apple 图标
    │
    ├── 🔧 application/                  # 第二层：应用层（业务逻辑编排）
    │   ├── hooks/                       # 自定义 Hooks（连接 UI 和 Domain）
    │   │   ├── homepage/                # 首页相关 Hooks
    │   │   │   ├── index.ts
    │   │   │   ├── useHomepage.ts       # 聚合 Hook
    │   │   │   ├── useHero.ts
    │   │   │   ├── useFeatures.ts
    │   │   │   ├── useSolutions.ts
    │   │   │   ├── useCases.ts
    │   │   │   └── useCTA.ts
    │   │   ├── layout/                  # 布局相关 Hooks
    │   │   │   ├── index.ts
    │   │   │   ├── useLayout.ts         # 聚合 Hook
    │   │   │   ├── useHeader.ts
    │   │   │   └── useFooter.ts
    │   │   ├── shared/                  # 共享 Hooks
    │   │   │   ├── index.ts
    │   │   │   └── useLocale.ts
    │   │   ├── index.ts
    │   │   ├── useContent.ts            # 通用内容加载 Hook
    │   │   ├── useLocale.ts             # 语言切换 Hook
    │   │   ├── useScrollSnap.ts         # 滚动吸附 Hook
    │   │   └── useWindowScrollSnap.ts
    │   │
    │   ├── usecases/                    # Use Cases（业务用例）
    │   │   ├── homepage/
    │   │   │   └── GetHomepageContent.ts
    │   │   └── layout/
    │   │       └── GetLayoutContent.ts
    │   │
    │   ├── providers/                   # 应用级 Providers
    │   ├── seo/                         # SEO 相关逻辑
    │   │   └── index.ts
    │   └── index.ts
    │
    ├── 🏛️ domain/                       # 第三层：领域层（核心业务模型）
    │   ├── homepage/                    # 首页领域模型
    │   │   ├── hero.model.ts            # Hero 实体
    │   │   ├── features.model.ts        # Features 实体
    │   │   ├── solutions.model.ts       # Solutions 实体
    │   │   ├── cases.model.ts           # Cases 实体
    │   │   ├── cta.model.ts             # CTA 实体
    │   │   ├── homepage.aggregate.ts    # Homepage 聚合根
    │   │   └── homepage.repository.ts   # 仓储接口
    │   │
    │   ├── layout/                      # 布局领域模型
    │   │   ├── header.model.ts
    │   │   ├── footer.model.ts
    │   │   ├── layout.aggregate.ts      # Layout 聚合根
    │   │   └── layout.repository.ts     # 仓储接口
    │   │
    │   ├── article/                     # 文章领域模型（预留）
    │   │
    │   ├── shared/                      # 领域共享
    │   │   ├── exceptions/              # 领域异常
    │   │   │   ├── index.ts
    │   │   │   ├── content-load.error.ts
    │   │   │   └── content-not-found.error.ts
    │   │   ├── repositories/            # 仓储基类
    │   │   ├── types/                   # 领域类型
    │   │   └── valueObjects/            # 值对象
    │   │
    │   ├── index.ts
    │   ├── README.md                    # 领域层文档
    │   ├── REFACTOR_GUIDE.md
    │   ├── REFACTOR_STATUS.md
    │   └── REFACTOR_COMPLETE.md
    │
    ├── 🔌 infrastructure/               # 第四层：基础设施层（技术实现）
    │   ├── adapters/                    # 适配器（外部服务接口）
    │   │   ├── content/
    │   │   │   └── contentService.ts    # 内容服务适配器
    │   │   ├── i18n/
    │   │   │   └── i18nService.ts       # 国际化服务适配器
    │   │   ├── theme/
    │   │   │   └── themeService.ts      # 主题服务适配器
    │   │   ├── auth/
    │   │   │   └── authService.ts       # 认证服务适配器
    │   │   ├── json/
    │   │   │   ├── index.ts
    │   │   │   └── JsonAdapter.ts       # JSON 数据适配器
    │   │   ├── http/                    # HTTP 适配器
    │   │   ├── storage/                 # 存储适配器
    │   │   └── index.ts
    │   │
    │   ├── repositories/                # 仓储实现（实现 domain 的接口）
    │   │   ├── homepage/
    │   │   │   └── HomepageRepository.ts
    │   │   └── layout/
    │   │       └── LayoutRepository.ts
    │   │
    │   ├── mappers/                     # 数据映射器（DTO ↔ Domain）
    │   │   ├── homepage/
    │   │   │   ├── HeroMapper.ts
    │   │   │   ├── FeaturesMapper.ts
    │   │   │   ├── SolutionsMapper.ts
    │   │   │   ├── CasesMapper.ts
    │   │   │   └── CTAMapper.ts
    │   │   └── layout/
    │   │       ├── HeaderMapper.ts
    │   │       └── FooterMapper.ts
    │   │
    │   ├── clients/                     # HTTP 客户端
    │   │   ├── contentClient.ts
    │   │   └── adapters/
    │   │       └── jsonAdapter.ts
    │   │
    │   ├── cache/                       # 缓存管理
    │   │   ├── index.ts
    │   │   └── CacheManager.ts
    │   │
    │   ├── factory.ts                   # 工厂模式（依赖注入）
    │   ├── index.ts
    │   ├── README.md                    # 基础设施层文档
    │   ├── IMPLEMENTATION_PLAN.md
    │   └── IMPLEMENTATION_COMPLETE.md
    │
    ├── 🔄 stores/                       # Zustand 全局状态（跨层共享）
    │   ├── themeStore.ts                # 主题状态
    │   ├── i18nStore.ts                 # 国际化状态
    │   ├── authStore.ts                 # 认证状态
    │   ├── notificationStore.ts         # 通知状态
    │   ├── persistHelper.ts             # 持久化助手
    │   └── persistOptions/              # 持久化配置
    │       ├── themePersist.ts
    │       ├── i18nPersist.ts
    │       └── authPersist.ts
    │
    ├── 🌐 shared/                       # 共享层（跨层使用）
    │   ├── types/                       # TypeScript 类型定义
    │   │   ├── content.types.ts         # 内容类型
    │   │   ├── i18n.types.ts            # 国际化类型
    │   │   ├── theme.types.ts           # 主题类型
    │   │   └── auth.types.ts            # 认证类型
    │   │
    │   ├── constants/                   # 常量配置
    │   │   ├── i18nConfig.ts            # 国际化配置
    │   │   ├── themeConfig.ts           # 主题配置
    │   │   ├── authConfig.ts            # 认证配置
    │   │   └── icon.tokens.ts           # 图标配置
    │   │
    │   ├── utils/                       # 工具函数
    │   │   └── scroll.ts                # 滚动工具
    │   │
    │   ├── theme/                       # 主题配置
    │   │   └── colorMap.ts              # 颜色映射
    │   │
    │   └── contexts/                    # React Context
    │       └── GlobalContext.tsx
    │
    ├── config/                          # 配置文件（已废弃，迁移到 shared/constants）
    │
    └── global.d.ts                      # 全局类型声明
```

---

## 🎯 各层职责说明

### 1️⃣ Presentation Layer（表现层）

**位置**: `src/Presentation/` + `src/app/`

**职责**:
- ✅ **UI 渲染**: React 组件、页面、布局
- ✅ **用户交互**: 事件处理、表单输入
- ✅ **样式管理**: CSS、Tailwind、主题样式
- ✅ **路由管理**: Next.js App Router

**依赖关系**:
- ⬇️ 调用 `Application Layer` 的 Hooks
- ⬇️ 读取 `Stores` 的状态
- ⬇️ 使用 `Shared` 的类型和常量

**关键文件**:
- `Presentation/components/home/HeroSection.tsx` - 首页 Hero 组件
- `Presentation/components/layout/header/Header.tsx` - 头部导航
- `app/(main)/layout.tsx` - 主布局（包含 Header/Footer）
- `app/(main)/page.tsx` - 首页路由

**规则**:
- ❌ 不直接调用 `Infrastructure` 或 `Domain`
- ❌ 不包含业务逻辑（仅 UI 逻辑）
- ✅ 通过 Hooks 获取数据
- ✅ 使用 `'use client'` 标记客户端组件

---

### 2️⃣ Application Layer（应用层）

**位置**: `src/application/`

**职责**:
- ✅ **业务编排**: 协调多个 Domain 实体
- ✅ **Hooks 封装**: 连接 UI 和 Domain
- ✅ **Use Cases**: 业务用例实现
- ✅ **SEO 逻辑**: 元数据生成

**依赖关系**:
- ⬇️ 调用 `Domain Layer` 的仓储接口
- ⬇️ 调用 `Infrastructure Layer` 的适配器
- ⬆️ 被 `Presentation Layer` 调用

**关键文件**:
- `application/hooks/homepage/useHomepage.ts` - 首页聚合 Hook
- `application/hooks/layout/useLayout.ts` - 布局聚合 Hook
- `application/hooks/useContent.ts` - 通用内容加载 Hook
- `application/usecases/homepage/GetHomepageContent.ts` - 首页用例

**规则**:
- ❌ 不包含 UI 代码
- ❌ 不直接操作数据源（通过 Infrastructure）
- ✅ 封装业务逻辑
- ✅ 返回 Domain 模型

---

### 3️⃣ Domain Layer（领域层）

**位置**: `src/domain/`

**职责**:
- ✅ **业务模型**: 实体、聚合根、值对象
- ✅ **业务规则**: 领域逻辑、验证
- ✅ **仓储接口**: 定义数据访问契约（不实现）
- ✅ **领域异常**: 业务错误定义

**依赖关系**:
- ❌ 不依赖任何外层
- ⬆️ 被 `Application Layer` 调用
- ⬆️ 被 `Infrastructure Layer` 实现

**关键文件**:
- `domain/homepage/homepage.aggregate.ts` - 首页聚合根
- `domain/homepage/homepage.repository.ts` - 首页仓储接口
- `domain/homepage/hero.model.ts` - Hero 实体
- `domain/shared/exceptions/content-load.error.ts` - 内容加载异常

**规则**:
- ❌ 不依赖 UI 框架（React/Next.js）
- ❌ 不依赖外部库（axios/fetch）
- ✅ 纯 TypeScript 类/接口
- ✅ 包含核心业务逻辑

---

### 4️⃣ Infrastructure Layer（基础设施层）

**位置**: `src/infrastructure/`

**职责**:
- ✅ **仓储实现**: 实现 Domain 的仓储接口
- ✅ **适配器**: 对接外部服务（HTTP、JSON、LocalStorage）
- ✅ **数据映射**: DTO ↔ Domain Model
- ✅ **缓存管理**: 数据缓存策略
- ✅ **HTTP 客户端**: API 请求封装

**依赖关系**:
- ⬇️ 实现 `Domain Layer` 的接口
- ⬆️ 被 `Application Layer` 调用

**关键文件**:
- `infrastructure/repositories/homepage/HomepageRepository.ts` - 首页仓储实现
- `infrastructure/adapters/content/contentService.ts` - 内容服务适配器
- `infrastructure/adapters/json/JsonAdapter.ts` - JSON 数据适配器
- `infrastructure/mappers/homepage/HeroMapper.ts` - Hero 数据映射器
- `infrastructure/cache/CacheManager.ts` - 缓存管理器

**规则**:
- ✅ 对接外部服务
- ✅ 实现 Domain 接口
- ✅ 处理数据转换
- ❌ 不包含业务逻辑

---

### 5️⃣ Shared Layer（共享层）

**位置**: `src/shared/`

**职责**:
- ✅ **类型定义**: 跨层共享的 TypeScript 类型
- ✅ **常量配置**: 全局常量、配置
- ✅ **工具函数**: 纯函数工具
- ✅ **主题配置**: 颜色、字体等

**依赖关系**:
- ❌ 不依赖任何层
- ⬆️ 被所有层使用

**关键文件**:
- `shared/types/content.types.ts` - 内容类型定义
- `shared/constants/i18nConfig.ts` - 国际化配置
- `shared/utils/scroll.ts` - 滚动工具函数
- `shared/theme/colorMap.ts` - 颜色映射

**规则**:
- ✅ 纯函数、纯类型
- ❌ 不包含业务逻辑
- ❌ 不依赖任何层

---

### 6️⃣ Stores Layer（状态层）

**位置**: `src/stores/`

**职责**:
- ✅ **全局状态**: Zustand 状态管理
- ✅ **状态持久化**: LocalStorage 同步
- ✅ **状态订阅**: 跨组件状态共享

**依赖关系**:
- ⬆️ 被所有层使用（主要是 Presentation 和 Application）

**关键文件**:
- `stores/themeStore.ts` - 主题状态
- `stores/i18nStore.ts` - 国际化状态
- `stores/authStore.ts` - 认证状态
- `stores/notificationStore.ts` - 通知状态

**规则**:
- ✅ 只存储状态，不包含业务逻辑
- ✅ 使用 Zustand 管理
- ✅ 支持持久化

---

## 🔄 数据流向

```
用户操作
   ↓
[Presentation] 组件触发事件
   ↓
[Application] Hook 调用 Use Case
   ↓
[Domain] 仓储接口定义契约
   ↓
[Infrastructure] 仓储实现 → 调用适配器 → 获取数据
   ↓
[Infrastructure] Mapper 转换 DTO → Domain Model
   ↓
[Application] Hook 返回 Domain Model
   ↓
[Presentation] 组件渲染数据
```

---

## 📦 数据源配置

### JSON 数据文件位置
```
public/data/
├── layout/
│   ├── footer/
│   │   ├── footer.zh-CN.json
│   │   └── footer.en-US.json
│   └── header/
│       ├── header.zh-CN.json
│       └── header.en-US.json
└── pages/
    └── home/
        └── sections/
            ├── hero.zh-CN.json
            ├── hero.en-US.json
            ├── features.zh-CN.json
            ├── features.en-US.json
            ├── solutions.zh-CN.json
            ├── solutions.en-US.json
            ├── cases.zh-CN.json
            ├── cases.en-US.json
            ├── cta.zh-CN.json
            └── cta.en-US.json
```

### 数据加载流程
1. **Presentation** 组件调用 `useHomepage()` Hook
2. **Application** Hook 调用 `GetHomepageContent` Use Case
3. **Use Case** 调用 `HomepageRepository.getContent()`
4. **Infrastructure** Repository 调用 `JsonAdapter.loadContent()`
5. **JsonAdapter** 读取 `public/data/pages/home/sections/*.json`
6. **Mapper** 将 JSON 转换为 Domain Model
7. **Hook** 返回 Domain Model 给组件

---

## ✅ 架构优势

1. **关注点分离**: 每层职责清晰，易于维护
2. **可测试性**: Domain 层独立，易于单元测试
3. **可扩展性**: 新增功能只需添加对应层的文件
4. **技术无关性**: Domain 层不依赖框架，易于迁移
5. **依赖倒置**: 高层不依赖低层，通过接口通信

---

## 🚨 常见问题

### Q1: 为什么有 `Presentation/` 和 `app/` 两个目录？
**A**:
- `app/` 是 Next.js App Router 的路由层（必须）
- `Presentation/` 存放可复用的 React 组件
- `app/` 中的页面组件调用 `Presentation/` 中的组件

### Q2: Stores 属于哪一层？
**A**: Stores 是跨层共享的全局状态，不属于四层架构的任何一层，但主要被 Presentation 和 Application 使用。

### Q3: 为什么 Domain 不依赖任何外层？
**A**: 这是 Clean Architecture 的核心原则，保证领域逻辑的纯粹性和可测试性。

### Q4: 如何新增一个页面？
**A**:
1. 在 `domain/` 创建领域模型
2. 在 `infrastructure/` 实现仓储和适配器
3. 在 `application/` 创建 Hooks 和 Use Cases
4. 在 `Presentation/` 创建组件
5. 在 `app/` 创建路由页面

---

## 📚 相关文档

- [领域层文档](./src/domain/README.md)
- [基础设施层文档](./src/infrastructure/README.md)
- [应用层文档](./src/application/README.md)
- [目录结构调整方案](./DIRECTORY_STRUCTURE.md)

---

**最后更新**: 2026-02-13
**维护者**: vxture team
