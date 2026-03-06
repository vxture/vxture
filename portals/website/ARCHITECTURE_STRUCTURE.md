# Vxture Web 官网平台架构设计

> 更新时间: 2026-03-04
> 架构模式: Clean Architecture (四层分离)
> 定位: 企业官网展示平台

---

## 📋 功能规划概览

| 功能模块 | 状态 | 说明 |
|---------|------|------|
| 1. 官网展示 | ✅ 已有 | 首页、关于、产品等页面 |
| 2. 多语言支持 | ✅ 已有 | i18n 国际化 |
| 3. 多主题支持 | ✅ 已有 | 亮/暗色主题切换 |
| 4. 登录与权限验证 | 🔄 规划中 | 登录、登出、简单权限 |
| 5. 消息展示 | ✅ 已有 | 通知提示组件 |

---

## 📐 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │  ← UI 组件、页面、样式
│  (src/presentation + src/app)                               │
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

## 🎯 核心功能模块设计

### 1️⃣ 官网展示功能

#### 页面规划
| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | Hero、特性、解决方案、案例、CTA |
| 关于我们 | `/about` | 公司介绍、团队、历程 |
| 产品 | `/products` | 产品列表、详情 |
| 登录 | `/login` | 登录页面 |
| 注册 | `/signup` | 注册页面 |

#### 数据来源
- JSON 文件: `public/data/pages/{page}/sections/*.{locale}.json`
- 布局数据: `public/data/layout/{header,footer}/**.{locale}.json`

#### 领域模型
```
domain/homepage/
├── hero.model.ts
├── features.model.ts
├── solutions.model.ts
├── cases.model.ts
├── cta.model.ts
├── homepage.aggregate.ts
└── homepage.repository.ts
```

---

### 2️⃣ 多语言支持 (i18n)

#### 支持语言
| 语言 | Locale | 说明 |
|------|--------|------|
| 简体中文 | `zh-CN` | 默认 |
| 英文 | `en-US` | - |

#### 文件结构
```
public/data/
├── layout/
│   ├── header/
│   │   ├── header.zh-CN.json
│   │   └── header.en-US.json
│   └── footer/
│       ├── footer.zh-CN.json
│       └── footer.en-US.json
└── pages/
    └── home/
        └── sections/
            ├── hero.zh-CN.json
            ├── hero.en-US.json
            └── ...
```

#### 类型定义
- [shared/types/i18n.types.ts](src/shared/types/i18n.types.ts) - LocaleType、I18nState
- [shared/constants/i18nConfig.ts](src/shared/constants/i18nConfig.ts) - 语言配置

#### 状态管理
- [stores/i18nStore.ts](src/stores/i18nStore.ts) - 语言全局状态

#### 应用层 Hooks
- [application/hooks/shared/useLocale.ts](src/application/hooks/shared/useLocale.ts)
- [application/hooks/useLocale.ts](src/application/hooks/useLocale.ts)

#### 表现层组件
- `presentation/components/common/I18nSync.tsx` - 客户端语言同步
- `presentation/components/layout/header/LanguageSwitcher.tsx` - 语言切换器

---

### 3️⃣ 多主题支持

#### 支持主题
| 主题 | 说明 |
|------|------|
| `light` | 亮色模式 |
| `dark` | 暗色模式 |
| `system` | 跟随系统 (预留) |

#### 主题系统
```
src/presentation/styles/
├── themes/
│   ├── theme-base.css          # 基础 CSS 变量
│   ├── theme-colors.css        # 颜色定义
│   └── theme-utilities.css     # 主题工具类
└── themes.css                   # 主题入口
```

#### 类型定义
- [shared/types/theme.types.ts](src/shared/types/theme.types.ts) - ThemeType、ThemeState
- [shared/constants/themeConfig.ts](src/shared/constants/themeConfig.ts) - 主题配置

#### 状态管理
- [stores/themeStore.ts](src/stores/themeStore.ts) - 主题全局状态

#### 应用层 Hooks
- `application/hooks/useTheme.ts` (待实现)

#### 表现层组件
- `presentation/components/common/ThemeSync.tsx` - 客户端主题同步
- `presentation/components/layout/header/ThemeSwitcher.tsx` - 主题切换器

---

### 4️⃣ 登录与简单权限验证

#### 功能规划
| 功能 | 状态 | 说明 |
|------|------|------|
| 登录页面 | 🔄 规划 | `/login` |
| 登录逻辑 | 🔄 规划 | 调用后端 API |
| Token 管理 | 🔄 规划 | Access Token + Refresh Token |
| 权限检查 | 🔄 规划 | 简单权限验证 |
| 路由保护 | 🔄 规划 | 认证中间件 |

#### 类型定义
- [shared/types/auth.types.ts](src/shared/types/auth.types.ts) - UserInfo、AuthState
- [shared/constants/authConfig.ts](src/shared/constants/authConfig.ts) - 认证配置

#### 状态管理
- [stores/authStore.ts](src/stores/authStore.ts) - 认证全局状态

#### 领域模型 (待实现)
```
domain/auth/
├── user.model.ts              # 用户实体
├── auth.aggregate.ts          # 认证聚合根
└── auth.repository.ts         # 仓储接口
```

#### 基础设施层 (待实现)
```
infrastructure/
├── adapters/auth/
│   └── authService.ts         # 认证服务适配器
├── repositories/auth/
│   └── AuthRepository.ts      # 仓储实现
└── mappers/auth/
    └── UserMapper.ts          # 用户数据映射
```

#### 应用层 (待实现)
```
application/
├── hooks/auth/
│   ├── useAuth.ts             # 认证聚合 Hook
│   ├── useLogin.ts            # 登录 Hook
│   └── usePermission.ts       # 权限 Hook
└── usecases/auth/
    ├── Login.ts               # 登录用例
    ├── Logout.ts              # 登出用例
    └── RefreshToken.ts        # 刷新 Token 用例
```

#### 表现层 (待实现)
```
presentation/
├── components/auth/
│   ├── LoginForm.tsx          # 登录表单
│   ├── UserMenu.tsx           # 用户菜单
│   └── AuthGuard.tsx          # 路由守卫
└── components/common/
    └── AuthSync.tsx           # 认证状态同步
```

#### 路由规划
```
app/
├── (auth)/
│   ├── layout.tsx             # 认证路由组布局
│   ├── login/
│   │   └── page.tsx           # 登录页
│   └── signup/
│       └── page.tsx           # 注册页
└── (dashboard)/
    ├── layout.tsx             # 需要认证的路由组
    └── page.tsx               # 仪表板
```

---

### 5️⃣ 消息展示功能

#### 消息类型
| 类型 | 说明 | 样式 |
|------|------|------|
| `success` | 成功 | 绿色 |
| `error` | 错误 | 红色 |
| `warning` | 警告 | 橙色 |
| `info` | 信息 | 蓝色 |

#### 状态管理
- [stores/notificationStore.ts](src/stores/notificationStore.ts) - 通知全局状态

#### 类型定义 (内联于 store)
- `Notification` - 通知项
- `NotificationType` - 通知类型

#### 表现层组件
- `presentation/components/common/Notifications.tsx` - 通知列表组件
- `presentation/components/common/NotificationItem.tsx` - 单条通知组件

#### 使用示例
```tsx
const { addNotification } = useNotificationStore();

// 成功消息
addNotification('操作成功', 'success');

// 错误消息
addNotification('操作失败', 'error', 5000);
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
    ├── 🎨 presentation/                 # 第一层：表现层（UI）
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
    │   │   │   │   ├── ThemeSwitcher.tsx
    │   │   │   │   └── LanguageSwitcher.tsx
    │   │   │   └── footer/
    │   │   │       ├── Footer.tsx
    │   │   │       ├── FooterLinks.tsx
    │   │   │       └── SocialLinks.tsx
    │   │   ├── auth/                    # 认证组件
    │   │   │   ├── LoginForm.tsx
    │   │   │   ├── UserMenu.tsx
    │   │   │   └── AuthGuard.tsx
    │   │   ├── common/                  # 通用业务组件
    │   │   │   ├── Notifications.tsx
    │   │   │   ├── NotificationItem.tsx
    │   │   │   ├── ClientSyncAgg.tsx    # 客户端状态同步
    │   │   │   ├── QueryProvider.tsx
    │   │   │   ├── ThemeSync.tsx
    │   │   │   ├── I18nSync.tsx
    │   │   │   ├── AuthSync.tsx
    │   │   │   ├── Icon.tsx
    │   │   │   └── IconMap.tsx
    │   │   └── examples/                # 示例组件
    │   │
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
    │   │   ├── layout.tsx
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   └── signup/
    │   │       └── page.tsx
    │   ├── (main)/                      # 主路由组（公开页面）
    │   │   ├── layout.tsx               # 主布局（包含 Header/Footer）
    │   │   └── page.tsx                 # 首页
    │   ├── about/                       # 关于页
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   ├── products/                    # 产品页
    │   │   └── page.tsx
    │   ├── test/                        # 测试页面（开发用）
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
    │   │   ├── auth/                    # 认证相关 Hooks (待实现)
    │   │   │   ├── index.ts
    │   │   │   ├── useAuth.ts
    │   │   │   ├── useLogin.ts
    │   │   │   └── usePermission.ts
    │   │   ├── shared/                  # 共享 Hooks
    │   │   │   ├── index.ts
    │   │   │   └── useLocale.ts
    │   │   ├── index.ts
    │   │   ├── useContent.ts            # 通用内容加载 Hook
    │   │   ├── useLocale.ts             # 语言切换 Hook
    │   │   └── useTheme.ts              # 主题切换 Hook (待实现)
    │   │
    │   ├── usecases/                    # Use Cases（业务用例）
    │   │   ├── homepage/
    │   │   │   └── GetHomepageContent.ts
    │   │   ├── layout/
    │   │   │   └── GetLayoutContent.ts
    │   │   └── auth/                    # 认证用例 (待实现)
    │   │       ├── Login.ts
    │   │       ├── Logout.ts
    │   │       └── RefreshToken.ts
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
    │   ├── auth/                        # 认证领域模型 (待实现)
    │   │   ├── user.model.ts
    │   │   ├── auth.aggregate.ts
    │   │   └── auth.repository.ts
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
    │   └── index.ts
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
    │   │   ├── layout/
    │   │   │   └── LayoutRepository.ts
    │   │   └── auth/                    # 认证仓储 (待实现)
    │   │       └── AuthRepository.ts
    │   │
    │   ├── mappers/                     # 数据映射器（DTO ↔ Domain）
    │   │   ├── homepage/
    │   │   │   ├── HeroMapper.ts
    │   │   │   ├── FeaturesMapper.ts
    │   │   │   ├── SolutionsMapper.ts
    │   │   │   ├── CasesMapper.ts
    │   │   │   └── CTAMapper.ts
    │   │   ├── layout/
    │   │   │   ├── HeaderMapper.ts
    │   │   │   └── FooterMapper.ts
    │   │   └── auth/                    # 认证映射器 (待实现)
    │   │       └── UserMapper.ts
    │   │
    │   ├── clients/                     # HTTP 客户端
    │   │   ├── contentClient.ts
    │   │   ├── authClient.ts            # 认证客户端 (待实现)
    │   │   └── adapters/
    │   │       └── jsonAdapter.ts
    │   │
    │   ├── cache/                       # 缓存管理
    │   │   ├── index.ts
    │   │   └── CacheManager.ts
    │   │
    │   ├── factory.ts                   # 工厂模式（依赖注入）
    │   └── index.ts
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
    │   │   ├── auth.types.ts            # 认证类型
    │   │   └── notification.types.ts    # 通知类型 (待提取)
    │   │
    │   ├── constants/                   # 常量配置
    │   │   ├── i18nConfig.ts            # 国际化配置
    │   │   ├── themeConfig.ts           # 主题配置
    │   │   ├── authConfig.ts            # 认证配置
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
    └── global.d.ts                      # 全局类型声明
```

---

## 🎯 各层职责说明

### 1️⃣ Presentation Layer（表现层）

**位置**: `src/presentation/` + `src/app/`

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
- `presentation/components/home/HeroSection.tsx` - 首页 Hero 组件
- `presentation/components/layout/header/Header.tsx` - 头部导航
- `presentation/components/common/Notifications.tsx` - 通知组件
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
- `shared/types/i18n.types.ts` - 国际化类型
- `shared/types/theme.types.ts` - 主题类型
- `shared/types/auth.types.ts` - 认证类型
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

## 📦 状态管理总览

| Store | 持久化 | 说明 |
|-------|--------|------|
| `themeStore` | ✅ | 主题状态 |
| `i18nStore` | ✅ | 语言状态 |
| `authStore` | ✅ | 认证状态 |
| `notificationStore` | ❌ | 通知状态（临时） |

---

## ✅ 实施清单

### 官网展示
- [x] 首页 Hero 组件
- [x] 首页 Features 组件
- [x] 首页 Solutions 组件
- [x] 首页 Cases 组件
- [x] 首页 CTA 组件
- [x] Header 布局组件
- [x] Footer 布局组件
- [x] JSON 数据加载

### 多语言支持
- [x] i18n 类型定义
- [x] i18nStore 状态管理
- [x] 语言切换 Hook
- [x] I18nSync 客户端同步
- [x] LanguageSwitcher 组件
- [x] JSON 数据多语言支持

### 多主题支持
- [x] Theme 类型定义
- [x] themeStore 状态管理
- [x] ThemeSync 客户端同步
- [x] ThemeSwitcher 组件
- [x] CSS 主题变量
- [ ] 系统主题跟随

### 登录与权限验证
- [ ] Auth 领域模型
- [ ] Auth 仓储实现
- [ ] AuthService 适配器
- [ ] useAuth Hook
- [ ] LoginForm 组件
- [ ] UserMenu 组件
- [ ] AuthGuard 路由守卫
- [ ] 登录页面 `/login`

### 消息展示
- [x] notificationStore 状态管理
- [x] Notifications 组件
- [x] 四种消息类型（success/error/warning/info）
- [ ] 消息多语言支持

---

## 📚 相关文档

- [领域层文档](./src/domain/README.md)
- [基础设施层文档](./src/infrastructure/README.md)
- [应用层文档](./src/application/README.md)
- [代码风格规范](../CODE_STYLE.md)
- [项目规范](../CLAUDE.md)

---

**最后更新**: 2026-03-04
**维护者**: vxture team
