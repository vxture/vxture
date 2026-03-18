# @vxture/website 目录结构

> 版本：2.0.0 | 日期：2026-03-18
> 基于实际项目结构更新，反映当前实现状态。

---

## portals/website

```
portals/website/
│
├── messages/                              # next-intl 翻译资源（按 locale 分目录）
│   │
│   ├── zh-CN.json                         # root 入口（指针文件，实际内容在子目录）
│   ├── en-US.json                         # root 入口（同上）
│   │
│   ├── zh-CN/
│   │   ├── common/
│   │   │   └── common.json                # ✅ 权威：通用词（确认、取消、加载、错误…）
│   │   ├── common.json                    # ⚠️ 指针文件（遗留，忽略）
│   │   │
│   │   ├── layout/
│   │   │   ├── header.json                # ✅ 权威：顶栏（logo、nav、actions、语言、主题）
│   │   │   └── footer.json                # ✅ 权威：底栏（品牌、社交、栏目、法律、版权）
│   │   ├── layout.json                    # ⚠️ 指针文件（遗留，忽略）
│   │   │
│   │   ├── home/
│   │   │   ├── hero.json                  # 首页 Hero 区块
│   │   │   ├── features.json              # 首页功能介绍区块
│   │   │   ├── solutions.json             # 首页解决方案区块
│   │   │   ├── cases.json                 # 首页案例预览区块
│   │   │   └── cta.json                   # 首页 CTA 区块
│   │   ├── home.json                      # ⚠️ 指针文件（遗留，忽略）
│   │   │
│   │   ├── appcenter.json                 # ✅ 权威：应用广场页（单文件）
│   │   ├── products.json                  # ✅ 权威：产品服务页（单文件）
│   │   ├── solutions.json                 # ✅ 权威：解决方案页（单文件）
│   │   ├── cases.json                     # ✅ 权威：最佳实践页（单文件）
│   │   │
│   │   ├── company/
│   │   │   ├── about.json                 # 关于我们
│   │   │   └── contact.json               # 联系我们
│   │   │
│   │   └── auth/
│   │       └── auth.json                  # ✅ 权威：登录 / 注册页
│   │
│   └── en-US/                             # 结构与 zh-CN 完全对称，省略重复说明
│       ├── common/common.json
│       ├── layout/header.json
│       ├── layout/footer.json
│       ├── home/{hero,features,solutions,cases,cta}.json
│       ├── appcenter.json
│       ├── products.json
│       ├── solutions.json
│       ├── cases.json
│       ├── company/{about,contact}.json
│       └── auth/auth.json
│
├── public/                                # Next.js 静态资源
│   ├── icons/                             # favicon
│   ├── images/
│   │   ├── header/                        # logo（SVG / PNG / white 变体）
│   │   ├── herosection/                   # Hero 背景图 / 海报
│   │   ├── casessection/                  # 案例封面图
│   │   ├── productssection/               # 产品介绍图 / 显示器 mockup
│   │   ├── footer/                        # 微信公众号二维码
│   │   └── common/                        # 通用素材（poster、图标）
│   ├── videos/
│   │   └── herosection/                   # Hero 背景视频（mp4 / webm）
│   └── manifest.json
│
├── scripts/
│   └── verify-content-system.js          # 翻译文件完整性校验脚本
│
├── src/
│   │
│   ├── app/                               # Next.js App Router
│   │   ├── layout.tsx                     # 根布局（html / body，无 Provider）
│   │   ├── globals.css                    # 全局样式 + Tailwind 入口
│   │   ├── metadata.ts                    # 根 metadata 配置
│   │   │
│   │   └── [locale]/                      # next-intl 语言前缀路由
│   │       ├── layout.tsx                 # locale 根布局：NextIntlClientProvider、ThemeSync
│   │       │
│   │       ├── (marketing)/               # 路由组：营销页
│   │       │   ├── (main)/                # 路由子组：带 Header + Footer 的主布局
│   │       │   │   ├── layout.tsx         # 主布局：Header + Footer
│   │       │   │   └── page.tsx           # 首页 /
│   │       │   │
│   │       │   ├── about/                 # /about（关于我们，独立布局，无 Header/Footer）
│   │       │   │   ├── layout.tsx
│   │       │   │   └── page.tsx
│   │       │   │
│   │       │   └── products/              # /products
│   │       │       └── page.tsx
│   │       │
│   │       ├── (auth)/                    # 路由组：认证页
│   │       │   ├── signin/
│   │       │   │   └── page.tsx           # /signin
│   │       │   └── signup/
│   │       │       └── page.tsx           # /signup
│   │       │
│   │       └── cases-pages/               # /cases-pages（案例列表 + 详情）
│   │           ├── page.tsx               # 案例列表
│   │           └── [slug]/
│   │               ├── page.tsx           # 案例详情
│   │               └── metadata.ts        # 动态 metadata
│   │
│   ├── components/                        # 组件（按职责分层）
│   │   ├── index.ts
│   │   │
│   │   ├── layout/                        # 全局布局组件
│   │   │   ├── Header.tsx                 # 顶栏（固定定位、滚动透明度、导航、语言/主题切换）
│   │   │   ├── Footer.tsx                 # 底栏（品牌、导航栏目、法律、版权、ICP）
│   │   │   ├── Sidebar.tsx                # 侧边栏（预留）
│   │   │   └── index.ts
│   │   │
│   │   ├── marketing/                     # 营销页区块组件
│   │   │   ├── HeroSection.tsx            # Hero 区块（视频背景、标题、CTA）
│   │   │   ├── FeaturesSection.tsx        # 功能介绍区块
│   │   │   ├── SolutionSection.tsx        # 解决方案区块
│   │   │   ├── CaseSection.tsx            # 首页案例预览区块
│   │   │   ├── CTASection.tsx             # 行动号召区块
│   │   │   ├── StatsSection.tsx           # 数据统计区块
│   │   │   ├── ProductDetailPartOne.tsx   # 产品介绍区块
│   │   │   ├── TestSection.tsx            # 测试 / 开发用区块
│   │   │   └── index.ts
│   │   │
│   │   ├── cases/                         # 案例页专属组件
│   │   │   ├── CasesPage.tsx              # 案例列表页
│   │   │   └── CaseDetail.tsx             # 案例详情页
│   │   │
│   │   ├── auth/                          # 认证页专属组件
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── ui/                            # 应用级 UI 扩展
│   │       ├── LocaleSwitcher.tsx         # 语言切换器（next-intl useLocale）
│   │       ├── ThemeSwitcher.tsx          # 主题切换器（图标按钮）
│   │       ├── ThemeToggleButton.tsx      # 主题切换按钮（文字变体）
│   │       ├── ThemeSync.tsx              # 主题状态同步（hydration 用）
│   │       ├── PriceDisplay.tsx           # 价格展示（formatCurrency）
│   │       ├── ScrollToButton.tsx         # 滚动锚点按钮
│   │       ├── Notifications.tsx          # 全局通知浮层
│   │       ├── panels/                    # 调试 / 选择面板
│   │       │   ├── SnapChoicePanel.tsx    # 滚动吸附选项面板
│   │       │   ├── SnapDebugPanel.tsx     # 滚动吸附调试面板
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── data/                              # 结构数据（组件配置，不含翻译文本）
│   │   ├── layout/
│   │   │   ├── header.data.ts             # HEADER_DATA：logo、nav、actions、language、theme
│   │   │   └── footer.data.ts             # FOOTER_DATA：brand、social、sections、legal
│   │   ├── home/
│   │   │   ├── home.hero.data.ts          # Hero 区块结构数据
│   │   │   ├── home.features.data.ts      # 功能介绍区块结构数据
│   │   │   ├── home.solutions.data.ts     # 解决方案区块结构数据
│   │   │   ├── home.cases.data.ts         # 首页案例预览结构数据
│   │   │   └── home.cta.data.ts           # CTA 区块结构数据
│   │   └── cases/
│   │       └── cases.data.ts              # 案例列表数据
│   │
│   ├── hooks/                             # 自定义 React Hooks
│   │   ├── useAuth.ts                     # 认证操作（调用 BFF，更新 authStore）
│   │   ├── useWindowScrollSnap.ts         # 窗口滚动吸附（website 专用）
│   │   └── index.ts
│   │
│   ├── stores/                            # Zustand 全局状态（只存 UI 状态）
│   │   ├── auth.store.ts                  # 用户信息：{ user, isAuthenticated }，无 token
│   │   ├── theme.store.ts                 # 主题偏好（isDarkMode），persist 到 localStorage
│   │   ├── notification.store.ts          # 全局通知队列
│   │   ├── persistOptions/                # Zustand persist 配置封装
│   │   │   ├── authPersist.ts
│   │   │   └── themePersist.ts
│   │   └── index.ts（隐式，各 store 独立导出）
│   │
│   ├── api/                               # BFF HTTP 调用层
│   │   ├── auth.api.ts                    # POST /api/auth/login|logout|me
│   │   ├── client.ts                      # axios 实例配置（baseURL、拦截器）
│   │   ├── content.ts                     # 内容接口（预留）
│   │   └── index.ts
│   │
│   ├── lib/                               # 框架胶水代码（非业务）
│   │   ├── i18n/
│   │   │   ├── routing.ts                 # defineRouting（引用 @vxture/shared SUPPORTED_LOCALES）
│   │   │   ├── navigation.ts              # createNavigation（类型安全 Link / redirect / useRouter）
│   │   │   ├── request.ts                 # getRequestConfig：按需加载翻译 namespace
│   │   │   └── index.ts
│   │   ├── translation-loader.ts          # 翻译按需加载工具（getMessages 封装）
│   │   └── persistHelper.ts               # Zustand persist 选项辅助工具
│   │
│   ├── constants/                         # website 专属常量
│   │   ├── routes.constants.ts            # 路由路径常量：SIGNIN_PATH、SIGNUP_PATH…
│   │   ├── auth.constants.ts              # 认证相关常量：Cookie 名、Token 前缀…
│   │   └── index.ts
│   │
│   ├── types/                             # website 专属类型
│   │   ├── api.types.ts                   # API 响应通用类型：ApiResponse、PaginatedResponse
│   │   ├── auth.types.ts                  # 前端视角认证类型：AuthUserDto（来自 BFF 响应）
│   │   ├── common.types.ts                # 通用工具类型
│   │   ├── components.types.ts            # 组件 Props 共享类型
│   │   ├── i18n.types.ts                  # IntlMessages 全局类型声明（next-intl 类型安全）
│   │   ├── theme.types.ts                 # 主题相关类型
│   │   └── index.ts
│   │
│   ├── middleware.ts                      # Next.js Middleware
│   │                                      #   1. 认证重定向（读 vx_refresh_token Cookie）
│   │                                      #   2. next-intl 语言前缀路由
│   │                                      #   3. 写入 x-pathname header（供 request.ts 按需加载）
│   └── global.d.ts                        # 全局类型扩展
│
├── CLAUDE.md                              # AI 编码指南（包级）
├── DIRECTORY_STRUCTURE.md                 # 本文件
├── REVIEW_CHECKLIST.md                    # 代码审查清单
├── next.config.js                         # Next.js 配置（next-intl 插件、webpack alias、图片域名）
├── next-env.d.ts
├── tailwind.config.js
├── postcss.config.cjs
├── tsconfig.json                          # extends ../../tsconfig.base.json
└── package.json                           # name: "@vxture/website"
```

---

## 翻译文件加载策略（request.ts）

### 权威文件 vs 指针文件

`messages/{locale}/` 下存在两类文件：

| 类型 | 示例 | 说明 |
|------|------|------|
| **权威文件** | `common/common.json`、`layout/header.json` | 包含实际翻译内容，`request.ts` 直接加载 |
| **指针文件** | `common.json`、`layout.json`、`home.json` | 遗留重构残留，内容为路径引用字符串，**忽略不加载** |

### 按需加载规则

| 访问路径 | 加载的页面 namespace |
|---|---|
| `/` | `home.*`（hero / features / solutions / cases / cta） |
| `/appcenter*` | `appcenter` |
| `/products*` | `products` |
| `/solutions*` | `solutions` |
| `/cases*` | `cases` |
| `/about*` 或 `/company*` | `company.about`、`company.contact` |
| 其他（signin / signup 等） | 不加载页面 namespace |

**每页始终加载**：root（`zh-CN.json`）、`common/common.json`、`layout/header.json`、`layout/footer.json`

### 静态 import 约束

Turbopack/Webpack 要求 `import()` 路径在编译期可静态分析。
`request.ts` 使用 `loadZhCN` / `loadEnUS` 两个 switch 枚举函数，所有路径均为字面量。

---

## 路由结构说明

```
[locale]/
  (marketing)/
    (main)/layout.tsx      ← Header + Footer（首页、产品页等）
    about/layout.tsx       ← 无 Header/Footer（关于我们独立布局）
  (auth)/                  ← 无 Header/Footer（居中卡片布局）
  cases-pages/             ← 案例列表 + [slug] 详情
```

---

## 目录设计说明

**`data/` — 结构数据与翻译分离**

组件使用 `labelKey` / `altKey` 等字段引用翻译 key，不在 data 文件中硬编码文本。
翻译内容统一在 `messages/` 中维护，data 文件只负责结构、href、图片路径等静态配置。

**`components/` — 按职责分层，不按页面分层**

`layout/`（全局布局）、`marketing/`（营销区块）、`cases/`（案例页）、`auth/`（认证页）、`ui/`（应用级 UI 扩展）。
`ui/` 是对 `@vxture/design-system` 的业务封装，不重复实现基础组件。

**`stores/` — 只存 UI 状态**

`auth.store.ts` 只存 `{ user, isAuthenticated }`，不存任何 token。
`persistOptions/` 集中管理 Zustand persist 配置，避免各 store 重复书写 storage 选项。

**`middleware.ts` — 三个关注点顺序固定**

```
1. 认证重定向（读 Cookie）
2. intlMiddleware（语言前缀路由）
3. response.headers.set('x-pathname', ...)   ← 供 request.ts 按需加载翻译
```

**`lib/i18n/` — 框架胶水，不放业务逻辑**

`routing.ts` 引用 `@vxture/shared` 的 `SUPPORTED_LOCALES` 和 `DEFAULT_LOCALE`，保持语言配置单一来源。
`navigation.ts` 导出类型安全的 `Link` / `redirect` / `useRouter`，应用内统一从此引入。

---

## 依赖关系

```
portals/website
  ├── @vxture/design-system      UI 基础组件
  ├── @vxture/shared             Locale 类型/常量
  ├── @vxture/core-locale        i18n 格式化工具（唯一允许的 core 包）
  └── bff/website-bff            HTTP only，所有 /api/* 请求
```

---

## 文件命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| React 组件 | PascalCase `.tsx` | `HeroSection.tsx` |
| React Hooks | camelCase `use*.ts` | `useAuth.ts` |
| Store | camelCase `*.store.ts` | `auth.store.ts` |
| 结构数据 | camelCase `{page}.{section}.data.ts` | `home.hero.data.ts` |
| API 调用层 | camelCase `*.api.ts` | `auth.api.ts` |
| 类型定义 | `*.types.ts` | `auth.types.ts` |
| 常量 | `*.constants.ts` | `routes.constants.ts` |
| 桶文件 | `index.ts` | `index.ts` |
| 翻译文件 | kebab-case `.json` | `header.json`、`home/hero.json` |
