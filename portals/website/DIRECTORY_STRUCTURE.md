# Vxture 目录结构规范

## portals/website + bff/website-bff

> 版本：1.0.0 | 日期：2026-03-15

---

## portals/website

```
portals/website/
│
├── messages/                          # 翻译资源（next-intl，放根目录）
│   ├── zh/
│   │   ├── common.json                # 通用词：确认、取消、加载中、错误提示…
│   │   ├── nav.json                   # 导航：顶栏、侧栏、面包屑链接文字
│   │   ├── marketing.json             # 营销页：hero、功能介绍、客户证言…
│   │   ├── pricing.json               # 定价页：套餐名称、功能对比、CTA…
│   │   ├── checkout.json              # 下单流程：表单标签、步骤说明…
│   │   ├── legal.json                 # 法律条款：隐私政策、用户协议…
│   │   └── auth.json                  # 认证页：登录、注册、忘记密码…
│   └── en/
│       └── （同上结构）
│
├── public/                            # 静态资源（Next.js 约定）
│   ├── icons/
│   ├── images/
│   └── fonts/
│
├── src/
│   │
│   ├── app/                           # Next.js App Router（路由即文件结构）
│   │   ├── [locale]/                  # next-intl 语言前缀路由
│   │   │   ├── layout.tsx             # 根布局：next-intl Provider、ThemeProvider
│   │   │   ├── page.tsx               # 首页 /
│   │   │   │
│   │   │   ├── (marketing)/           # 路由组：营销页（共享营销布局）
│   │   │   │   ├── layout.tsx         # 营销布局：顶栏 + 底栏
│   │   │   │   ├── pricing/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── about/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── legal/
│   │   │   │       ├── privacy/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── terms/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── (auth)/                # 路由组：认证页（共享认证布局）
│   │   │   │   ├── layout.tsx         # 认证布局：居中卡片，无顶栏底栏
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── signup/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── forgot-password/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── (dashboard)/           # 路由组：登录后页面（受保护路由）
│   │   │       ├── layout.tsx         # Dashboard 布局：侧边栏 + 顶栏
│   │   │       └── dashboard/
│   │   │           └── page.tsx
│   │   │
│   │   └── api/                       # Next.js Route Handlers（仅用于 BFF 代理，不放业务逻辑）
│   │       └── [...path]/
│   │           └── route.ts           # 透传代理到 website-bff（可选，若 BFF 独立部署则不需要）
│   │
│   ├── components/                    # 组件（按职责分层，不按页面分层）
│   │   │
│   │   ├── layout/                    # 布局组件（全局复用）
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── marketing/                 # 营销页专属组件
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeatureSection.tsx
│   │   │   ├── PricingCard.tsx
│   │   │   ├── TestimonialSection.tsx
│   │   │   ├── StatsSection.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── auth/                      # 认证页专属组件
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── ui/                        # 应用级 UI 扩展（基于 design-system 的业务封装）
│   │       ├── LocaleSwitcher.tsx     # 语言切换器（使用 next-intl useLocale）
│   │       ├── ThemeSwitcher.tsx      # 主题切换器
│   │       ├── PriceDisplay.tsx       # 价格展示（使用 @vxture/shared formatCurrency）
│   │       └── index.ts
│   │
│   ├── hooks/                         # 自定义 React Hooks
│   │   ├── useAuth.ts                 # 认证操作（调用 BFF，更新 authStore）
│   │   ├── useScrollSnap.ts           # 滚动吸附（website 专用，若通用则迁移至 platform-browser）
│   │   └── index.ts
│   │
│   ├── stores/                        # Zustand 状态（只存 UI 状态，不存业务数据）
│   │   ├── auth.store.ts              # 用户信息：{ user, isAuthenticated }，无 token
│   │   ├── theme.store.ts             # 主题偏好持久化
│   │   └── index.ts
│   │
│   ├── api/                           # BFF HTTP 调用层（所有请求目标均为 website-bff）
│   │   ├── auth.api.ts                # POST /api/auth/login|logout|me
│   │   ├── pricing.api.ts             # GET  /api/pricing/plans
│   │   └── index.ts
│   │
│   ├── lib/                           # 框架集成配置（非业务，框架胶水代码）
│   │   └── i18n/
│   │       ├── routing.ts             # defineRouting，引用 @vxture/shared 的 SUPPORTED_LOCALES
│   │       ├── navigation.ts          # createNavigation，导出 Link / redirect / useRouter
│   │       └── request.ts             # getRequestConfig，按 namespace 加载 messages/
│   │
│   ├── constants/                     # 应用级常量（不可从 @vxture/shared 引入的 website 专属常量）
│   │   ├── routes.constants.ts        # 路由路径常量：LOGIN_PATH、DASHBOARD_PATH…
│   │   └── index.ts
│   │
│   └── types/                         # 应用级类型（website 专属，不属于平台共享类型）
│       ├── auth.types.ts              # 前端视角的认证类型：AuthUserDto（来自 BFF 响应）
│       ├── i18n.types.ts              # IntlMessages 全局类型声明（next-intl 类型安全）
│       └── index.ts
│
├── middleware.ts                      # Next.js middleware（认证重定向 + next-intl 语言路由）
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json                      # extends ../../tsconfig.base.json
├── package.json
└── .env.local
```

---

### 目录设计说明

**`app/[locale]/` — 语言前缀路由**

所有页面放在 `[locale]` 层级下，next-intl 自动处理 `/zh/pricing`、`/en/pricing` 等路径。
路由组（括号目录）只影响 URL 结构，不影响布局复用。

**`components/` — 按职责分层，不按页面分层**

避免 `components/home/`、`components/pages/` 这类按页面分层的结构——页面组件逻辑边界模糊，随功能增长快速变成垃圾桶。
按职责分：`layout/`（全局布局）、`marketing/`（营销域）、`auth/`（认证域）、`ui/`（业务级 UI 扩展）。
`ui/` 是对 `@vxture/design-system` 的业务封装，不是重复实现，设计系统的基础组件直接从包引入使用。

**`stores/` — 只存 UI 状态**

`auth.store.ts` 只存 `{ user, isAuthenticated }`，不存任何 token。
主题偏好存 `theme.store.ts`，允许 Zustand persist 到 localStorage。
不存服务端数据（服务端数据由 TanStack Query 管理）。

**`api/` — 调用层，不是业务层**

所有函数只做一件事：向 website-bff 发 HTTP 请求并返回结果，不包含任何业务逻辑。
文件按域命名：`auth.api.ts`、`pricing.api.ts`，与 BFF 的 router 模块一一对应。

**`lib/i18n/` — 框架胶水，不是业务代码**

只放 next-intl 的三个配置文件，不放翻译内容，不放业务逻辑。
`routing.ts` 必须引用 `@vxture/shared` 的 `SUPPORTED_LOCALES` 和 `DEFAULT_LOCALE`。
`navigation.ts` 导出类型安全的 `Link`/`redirect`/`useRouter`，应用内统一从此文件引入，不直接用 `next/link`。

**`constants/` — website 专属常量**

只放 `@vxture/shared` 中没有、且是 website 独有的常量（如路由路径）。
语言常量、主题常量统一从 `@vxture/shared` 引入，不在此重复定义。

**`middleware.ts` — 单文件协调两个关注点**

认证重定向判断在前（读 `vx_refresh_token` Cookie），`intlMiddleware` 在后。
两者顺序不能颠倒——next-intl 需要先知道 locale，但认证跳转不依赖 locale。

---

## bff/website-bff

```
bff/website-bff/
│
├── src/
│   │
│   ├── routers/                       # 域路由模块（每域一个文件，独立处理自己的错误）
│   │   ├── auth.router.ts             # POST /auth/login|logout|refresh  GET /auth/me
│   │   ├── pricing.router.ts          # GET  /pricing/plans
│   │   └── index.ts                   # 统一注册所有 router
│   │
│   ├── aggregators/                   # 跨域数据聚合（仅在需要合并多个来源时使用）
│   │   └── checkout.aggregator.ts     # 示例：下单页需要同时拿定价 + 用户订阅状态
│   │
│   ├── middleware/                    # 中间件（执行顺序：auth → tenant → locale → router）
│   │   ├── auth.middleware.ts         # 验证 session Cookie，从 Redis 恢复 access token
│   │   ├── tenant.middleware.ts       # 解析 tenantId，注入租户上下文
│   │   ├── locale.middleware.ts       # resolveLocale，注入 request.locale
│   │   └── index.ts
│   │
│   ├── types/                         # 面向前端的 DTO 类型（BFF 对外契约）
│   │   ├── auth.types.ts              # LoginDto、AuthUserDto、SessionDto
│   │   ├── pricing.types.ts           # PricingPlanDto、PricingFeatureDto
│   │   └── index.ts
│   │
│   ├── app.module.ts                  # 根模块，注册 VxConfigModule + 各 RouterModule
│   └── main.ts                        # 应用入口，bootstrap NestJS
│
├── tsconfig.json                      # extends ../../tsconfig.base.json
├── package.json                       # name: "@vxture/bff-website"
└── .env
```

---

### 目录设计说明

**`routers/` — 一域一文件，错误隔离**

每个 router 文件对应一个业务域，负责：接收请求 → 调用 service 或 agent-server → 响应塑形 → 返回 DTO。
每个 router 自行 try/catch，一个 router 抛异常不影响其他 router。
新增业务域 = 新增一个 `{domain}.router.ts`，不新建 BFF 包。

**`aggregators/` — 按需使用，不滥用**

只在前端某个请求需要同时聚合多个域的数据时才创建。
单域数据直接在 router 中处理，不需要经过 aggregator。

**`middleware/` — 四层职责严格分离**

```
auth.middleware     读 Cookie → 查 Redis → 验 token → 挂载 AuthUser
tenant.middleware   解析 tenantId → 注入 TenantContext
locale.middleware   resolveLocale(request) → 注入 request.locale
```

三个中间件各自只做一件事，不交叉。
BFF 的业务 router 中不重复做认证或 locale 解析，只从上下文取值。

**`types/` — DTO 是 BFF 对前端的契约**

DTO 只包含前端实际需要的字段（字段投影），不透传后端原始数据结构。
前端 `src/types/` 中的类型定义与此处的 DTO 保持一致（BFF 是 source of truth）。

**禁止出现的内容**

```
❌ src/services/        业务逻辑属于 @vxture/service-*，不在 BFF 内实现
❌ src/entities/        ORM 实体属于 service 层，BFF 不直接操作数据库
❌ src/utils/           通用工具从 @vxture/core-utils 引入，不在 BFF 内重复实现
❌ React / 任何浏览器 API
❌ @vxture/design-system / @vxture/platform-* / @vxture/ai-sdk
```

---

## 依赖关系一览

```
portals/website
    ├── @vxture/design-system      UI 基础组件
    ├── @vxture/platform-browser   浏览器工具（scroll 等）
    ├── @vxture/shared             Locale 类型/常量、格式化函数
    └── bff/website-bff            HTTP only，所有 /api/* 请求

bff/website-bff
    ├── @vxture/core-auth          VxJwtClient、JwtAuthGuard
    ├── @vxture/core-config        VxConfigModule（app / redis / auth 域）
    ├── @vxture/core-api           VxHttpClient（调用下游服务）
    ├── @vxture/core-locale        resolveLocale、localizeContent
    ├── @vxture/core-tenant        TenantDetector、TenantManager
    ├── @vxture/core-utils         VxLogger、类型守卫
    └── @vxture/shared             Locale 类型/常量
```

---

## 文件命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| React 组件 | PascalCase `.tsx` | `HeroSection.tsx` |
| React hooks | camelCase `use*.ts` | `useAuth.ts` |
| Store | camelCase `*.store.ts` | `auth.store.ts` |
| API 调用层 | camelCase `*.api.ts` | `auth.api.ts` |
| 类型定义 | `*.types.ts` | `auth.types.ts` |
| 常量 | `*.constants.ts` | `routes.constants.ts` |
| BFF Router | `*.router.ts` | `auth.router.ts` |
| BFF Middleware | `*.middleware.ts` | `auth.middleware.ts` |
| BFF Aggregator | `*.aggregator.ts` | `checkout.aggregator.ts` |
| 桶文件 | `index.ts` | `index.ts` |
