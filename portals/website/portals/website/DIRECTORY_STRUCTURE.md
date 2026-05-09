# @vxture/website 目录结构

> 版本：2.1.0 | 日期：2026-05-06
> 反映完整重构后的项目结构与架构设计。

---

## portals/website

```
portals/website/
│
├── messages/                              # next-intl 翻译资源（按 locale 分目录）
│   ├── zh-CN.json                         # root 入口（指针文件，实际内容在子目录）
│   ├── en-US.json                         # root 入口（同上）
│   │
│   ├── zh-CN/
│   │   ├── common/
│   │   │   └── common.json                # ✅ 权威：通用词（确认、取消、加载、错误…）
│   │   ├── common.json                    # ⚠️ 指针文件（遗留，忽略）
│   │   ├── layout/
│   │   │   ├── header.json                # ✅ 权威：顶栏（logo、nav、actions、语言、主题）
│   │   │   └── footer.json                # ✅ 权威：底栏（品牌、社交、栏目、法律、版权）
│   │   ├── layout.json                    # ⚠️ 指针文件（遗留，忽略）
│   │   ├── home/
│   │   │   ├── hero.json                  # 首页 Hero 区块
│   │   │   ├── features.json              # 首页功能介绍区块
│   │   │   ├── solutions.json             # 首页解决方案区块
│   │   │   ├── cases.json                 # 首页案例预览区块
│   │   │   └── cta.json                   # 首页 CTA 区块
│   │   ├── home.json                      # ⚠️ 指针文件（遗留，忽略）
│   │   ├── appcenter.json                 # ✅ 权威：应用广场页（单文件）
│   │   ├── products.json                  # ✅ 权威：产品服务页（单文件）
│   │   ├── solutions.json                 # ✅ 权威：解决方案页（单文件）
│   │   ├── cases.json                     # ✅ 权威：案例库页（列表 + 详情）
│   │   ├── legal.json                     # 🆕 法律政策页（列表 + 详情文档）
│   │   ├── company/
│   │   │   ├── about.json                 # 关于我们
│   │   │   └── contact.json               # 联系我们
│   │   └── auth/
│   │       └── auth.json                  # ✅ 权威：登录 / 注册页
│   │
│   └── en-US/                             # 结构与 zh-CN 完全对称
│       ├── common/common.json
│       ├── layout/header.json
│       ├── layout/footer.json
│       ├── home/{hero,features,solutions,cases,cta}.json
│       ├── appcenter.json
│       ├── products.json
│       ├── solutions.json
│       ├── cases.json
│       ├── legal.json
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
│   └── verify-content-system.js           # 🆕 翻译文件完整性校验脚本
│
├── src/
│   │
│   ├── app/                               # Next.js App Router
│   │   ├── layout.tsx                     # 根布局（html / body，无 Provider）
│   │   ├── globals.css                    # 全局样式 + Tailwind 入口
│   │   ├── metadata.ts                    # 根 metadata 配置
│   │   │
│   │   └── [locale]/                      # next-intl 语言前缀路由
│   │       ├── layout.tsx                 # 🆕 locale 根布局：NextIntlClientProvider + AuthSessionBootstrap + Notifications
│   │       │
│   │       ├── (public)/                  # 🆕 全站公开页共享父布局
│   │       │   ├── layout.tsx             # ⭐ Header + Footer 唯一实例
│   │       │   ├── (landing)/             # 保留（future use）
│   │       │   └── (docs)/                # 保留（future use）
│   │       │
│   │       ├── (marketing)/               # 路由组：营销页（当前带 Header+Footer，TODO：未来移入 (public)）
│   │       │   ├── layout.tsx             # 透传布局（Header/Footer 待删除 TODO）
│   │       │   ├── (main)/                # 首页
│   │       │   │   ├── layout.tsx         # 透传布局
│   │       │   │   └── page.tsx           # 🏠 首页（Hero+Features+Solutions+Cases+CTA+ScrollSnap）
│   │       │   ├── about/                 # /about（关于我们）
│   │       │   │   ├── layout.tsx         # 透传布局
│   │       │   │   └── page.tsx           # AboutUsPage（使用 AnimatedHeroBg）
│   │       │   ├── products/              # /products（产品服务）
│   │       │   │   ├── layout.tsx         # 透传布局
│   │       │   │   └── page.tsx           # ProductDetailPartOne
│   │       │   ├── solutions/             # /solutions（解决方案）
│   │       │   │   ├── layout.tsx         # 透传布局
│   │       │   │   └── page.tsx           # EmergencySolutionPage
│   │       │   ├── appcenter/             # /appcenter（应用市场）
│   │       │   │   ├── layout.tsx         # 透传布局
│   │       │   │   └── page.tsx           # AgentMarketplacePage
│   │       │   └── cases/                 # /cases（案例库）
│   │       │       ├── layout.tsx         # 透传布局
│   │       │       ├── page.tsx           # 🆕 CasesPage（列表 + 筛选搜索）
│   │       │       └── [slug]/
│   │       │           ├── page.tsx       # 🆕 CaseDetail（案例详情）
│   │       │           └── metadata.ts    # 动态 metadata
│   │       │
│   │       ├── (content)/                 # 🆕 Content Registry 路由组
│   │       │   ├── layout.tsx             # 透传布局（Header/Footer 待删除 TODO）
│   │       │   └── [...slug]/
│   │       │       └── page.tsx           # ⭐ 通配内容路由（legal / blog / stub）
│   │       │
│   │       └── (auth)/                    # 路由组：认证页（无 Header/Footer，居中卡片布局）
│   │           ├── signin/                # /signin（LoginForm）
│   │           │   └── page.tsx
│   │           ├── signup/                # /signup（SignupForm）
│   │           │   └── page.tsx
│   │           ├── login/                 # /login（signin 别名）
│   │           │   └── page.tsx
│   │           ├── register/              # /register（signup 别名）
│   │           │   └── page.tsx
│   │           ├── reset-password/        # /reset-password（ResetPasswordForm）
│   │           │   └── page.tsx
│   │           └── verify/                # /verify（VerifyForm 租户类型选择）
│   │               └── page.tsx
│   │
│   ├── components/                        # 组件（按职责分层）
│   │   ├── index.ts                       # 🆕 统一导出
│   │   │
│   │   ├── layout/                        # 全局布局组件
│   │   │   ├── Header.tsx                 # 顶栏（固定定位、导航、语言/主题切换、用户菜单）
│   │   │   ├── Footer.tsx                 # 底栏（品牌、导航、社交、法律、ICP）
│   │   │   ├── Sidebar.tsx                # 侧边栏（预留）
│   │   │   └── index.ts                   # 🆕 统一导出
│   │   │
│   │   ├── marketing/                     # 营销页区块组件
│   │   │   ├── HeroSection.tsx            # Hero 区块（视频/图片背景、CTA、滚动指示）
│   │   │   ├── AnimatedHeroBg.tsx         # 🆕 动态 Hero 背景（节点连线 + 网格 + 扫描光效）
│   │   │   ├── FeaturesSection.tsx        # 功能介绍区块（3 卡片，memo 优化）
│   │   │   ├── SolutionSection.tsx        # 解决方案轮播区块
│   │   │   ├── CaseSection.tsx            # 首页案例预览区块（3 列卡片）
│   │   │   ├── CTASection.tsx             # 行动号召区块
│   │   │   ├── StatsSection.tsx           # 数据统计区块（未在首页使用）
│   │   │   ├── ProductDetailPartOne.tsx   # 产品介绍页
│   │   │   ├── EmergencySolutionPage.tsx  # 紧急解决方案页
│   │   │   ├── BestPracticePage.tsx       # 原有案例列表页
│   │   │   ├── AgentMarketplacePage.tsx   # 应用市场页
│   │   │   ├── AboutUsPage.tsx            # 关于我们页（使用 AnimatedHeroBg）
│   │   │   ├── FooterPlaceholderPage.tsx  # "开发中"占位页
│   │   │   ├── ThemedHeroImage.tsx        # 主题感知 Hero 图片
│   │   │   ├── TestSection.tsx            # 测试 / 开发用区块
│   │   │   └── index.ts                   # 🆕 统一导出
│   │   │
│   │   ├── cases/                         # 🆕 案例页专属组件
│   │   │   ├── CasesPage.tsx              # 🆕 案例库列表页（分类筛选 + 搜索）
│   │   │   └── CaseDetail.tsx             # 🆕 案例详情页
│   │   │
│   │   ├── auth/                          # 认证页专属组件
│   │   │   ├── AuthChrome.tsx             # AuthHeader + AuthFooter
│   │   │   ├── AuthSessionBootstrap.tsx   # 🆕 登录态恢复引导（挂载时调用 restoreSession）
│   │   │   ├── LoginForm.tsx              # 登录表单（密码/手机/OAuth/滑块验证）
│   │   │   ├── SignupForm.tsx             # 注册表单
│   │   │   ├── ResetPasswordForm.tsx      # 密码重置表单（Suspense 包裹）
│   │   │   ├── VerifyForm.tsx             # 租户类型选择（个人/企业）
│   │   │   ├── SliderCaptcha.tsx          # 🆕 滑块验证码
│   │   │   └── index.ts                   # 🆕 统一导出
│   │   │
│   │   └── ui/                            # 应用级 UI 扩展
│   │       ├── LocaleSwitcher.tsx         # 语言切换器
│   │       ├── ThemeSwitcher.tsx          # 主题切换器（图标按钮）
│   │       ├── FullscreenSwitcher.tsx     # 🆕 全屏切换
│   │       ├── DensitySwitcher.tsx        # 🆕 密度切换
│   │       ├── PreferencesPanel.tsx       # 🆕 偏好设置面板
│   │       ├── PriceDisplay.tsx           # 价格展示
│   │       ├── ScrollToButton.tsx         # 滚动到顶按钮
│   │       ├── Notifications.tsx          # 全局通知浮层
│   │       ├── panels/
│   │       │   ├── SnapChoicePanel.tsx    # 滚动吸附选项面板
│   │       │   ├── SnapDebugPanel.tsx     # 滚动吸附调试面板
│   │       │   └── index.ts
│   │       └── index.ts                   # 🆕 统一导出
│   │
│   ├── data/                              # 结构数据（组件配置，不含翻译文本）
│   │   ├── layout/
│   │   │   ├── header.data.ts             # HEADER_DATA：logo、nav、actions
│   │   │   └── footer.data.ts             # FOOTER_DATA：brand、social、sections、legal
│   │   ├── home/
│   │   │   ├── home.hero.data.ts          # Hero 区块配置
│   │   │   ├── home.features.data.ts      # 功能介绍区块配置
│   │   │   ├── home.solutions.data.ts     # 解决方案区块配置
│   │   │   ├── home.cases.data.ts         # 首页案例预览配置
│   │   │   └── home.cta.data.ts           # CTA 区块配置
│   │   ├── cases/
│   │   │   └── cases.data.ts              # 🆕 案例库结构数据（6 条案例）
│   │   ├── theme/
│   │   │   └── theme.data.ts              # 🆕 主题数据
│   │   └── user/
│   │       └── mock-user-preferences.ts   # 🆕 用户偏好 mock
│   │
│   ├── hooks/                             # 自定义 React Hooks
│   │   ├── useAuth.ts                     # 认证操作（调用 BFF，更新 authStore）
│   │   ├── useWindowScrollSnap.ts         # 窗口滚动吸附（website 专用）
│   │   └── index.ts                       # 🆕 统一导出
│   │
│   ├── stores/                            # Zustand 全局状态（只存 UI 状态）
│   │   ├── auth.store.ts                  # 用户信息：{ user, isAuthenticated }，无 token
│   │   ├── theme.store.ts                 # 主题偏好（persist 到 localStorage）
│   │   ├── notification.store.ts          # 全局通知队列
│   │   ├── persistOptions/
│   │   │   ├── authPersist.ts             # Auth persist 配置
│   │   │   └── themePersist.ts            # Theme persist 配置
│   │
│   ├── api/                               # BFF HTTP 调用层
│   │   ├── auth.api.ts                    # POST /api/auth/login|signup|logout|me 等
│   │   ├── client.ts                      # axios 实例配置（baseURL、拦截器）
│   │   ├── content.ts                     # 内容接口（预留）
│   │   └── index.ts                       # 🆕 统一导出
│   │
│   ├── lib/                               # 框架胶水代码（非业务）
│   │   ├── i18n/
│   │   │   ├── routing.ts                 # defineRouting（引用 @vxture/shared SUPPORTED_LOCALES）
│   │   │   ├── navigation.ts              # createNavigation（类型安全 Link / redirect / useRouter）
│   │   │   ├── request.ts                 # getRequestConfig：按需加载翻译 namespace
│   │   │   └── index.ts
│   │   ├── content/                       # 🆕 Content Registry 系统
│   │   │   ├── types.ts                   # ContentSection / ContentEntry / ContentLoader 类型
│   │   │   ├── registry.ts                # CONTENT_REGISTRY 主配置表 + 工具函数
│   │   │   ├── index.ts                   # 统一导出
│   │   │   └── loaders/
│   │   │       ├── legal.loader.ts        # Legal 内容加载器 + static params
│   │   │       ├── blog.loader.ts         # Blog 占位加载器
│   │   │       └── stub.loader.ts         # 占位 Loader 工厂（通用占位页）
│   │   ├── console-entry.ts               # 控制台入口（预留）
│   │   ├── translation-loader.ts          # 翻译按需加载工具
│   │   └── persistHelper.ts               # Zustand persist 选项辅助
│   │
│   ├── constants/                         # 🆕 website 专属常量
│   │   ├── auth.constants.ts              # 认证相关常量
│   │   ├── routes.constants.ts            # 路由路径常量
│   │   └── index.ts                       # 统一导出
│   │
│   ├── types/                             # website 专属类型
│   │   ├── api.types.ts                   # API 响应通用类型
│   │   ├── auth.types.ts                  # 前端视角认证类型（AuthUserDto）
│   │   ├── common.types.ts                # 通用工具类型
│   │   ├── components.types.ts            # 组件 Props 共享类型
│   │   ├── i18n.types.ts                  # IntlMessages 全局类型声明
│   │   ├── theme.types.ts                 # 主题相关类型
│   │   └── index.ts                       # 统一导出
│   │
│   ├── middleware.ts                      # 🆕 重构 Next.js Middleware
│   │                                      #   1. 认证重定向（读 vx_tenant_refresh_token Cookie）
│   │                                      #   2. next-intl 语言前缀路由
│   │                                      #   3. 写入 x-pathname header
│   └── global.d.ts                        # 全局类型扩展
│
├── CLAUDE.md                              # AI 编码指南（包级）
├── DIRECTORY_STRUCTURE.md                 # 本文件
├── next.config.js                         # Next.js 配置（next-intl 插件、webpack alias、图片域名）
├── next-env.d.ts
├── tailwind.config.js
├── postcss.config.cjs
├── tsconfig.json                          # extends ../../tsconfig.base.json
└── package.json                           # name: "@vxture/website"
```

---

## 路由结构图

```
[locale]/
│
├── (public)/layout.tsx           ← ⭐ Header + Footer 唯一实例（所有公开页共享）
│   ├── (landing)/                ← 保留
│   └── (docs)/                   ← 保留
│
├── (marketing)/layout.tsx        ← 透传布局（TODO：未来移入 (public)）
│   ├── (main)/page.tsx           ← 首页（Hero+Features+Solutions+Cases+CTA+ScrollSnap）
│   ├── about/page.tsx            ← 关于我们（全屏页面 + AnimatedHeroBg）
│   ├── products/page.tsx         ← 产品服务
│   ├── solutions/page.tsx        ← 解决方案
│   ├── appcenter/page.tsx        ← 应用市场
│   └── cases/
│       ├── page.tsx              ← 🆕 案例列表（筛选 + 搜索）
│       └── [slug]/page.tsx       ← 🆕 案例详情
│
├── (content)/layout.tsx          ← 透传布局（TODO：未来移入 (public)）
│   └── [...slug]/page.tsx        ← ⭐ Content Registry 通配路由
│       ├── /legal                → legal-index（政策列表）
│       ├── /legal/{policy}       → legal-detail（政策详情）
│       ├── /blog                 → blog-index（占位）
│       ├── /faq                  → stub（占位）
│       ├── /support              → stub（占位）
│       ├── /insights             → stub（占位）
│       ├── /careers              → stub（占位）
│       ├── /certifications       → stub（占位）
│       ├── /contact              → stub（占位）
│       └── /changelog            → stub（占位）
│
└── (auth)/                       ← 居中卡片布局，无 Header/Footer
    ├── signin/                   ← 登录（LoginForm）
    ├── signup/                   ← 注册（SignupForm）
    ├── login/                    ← 登录别名
    ├── register/                 ← 注册别名
    ├── reset-password/           ← 密码重置（ResetPasswordForm）
    └── verify/                   ← 租户类型选择（VerifyForm）
```

---

## Content Registry 系统详解

Content Registry 是本次重构的核心创新，通过 `[...slug]` 通配路由统一接管所有内容类页面。

### 架构三要素

```
路由层                Registry 层                数据源层
[...slug]/page.tsx  ──→  CONTENT_REGISTRY  ──→  Loader 函数
                        │                        ├── legal.loader.ts
                        │                        ├── blog.loader.ts
                        │                        └── stub.loader.ts
                        │
                    返回 ContentEntry
                        │
                    渲染函数分发
                        ├── renderLegalIndex()
                        ├── renderLegalDetail()
                        ├── renderBlogIndex()
                        └── renderStub()
```

### URL ↦ Entry Type 映射

| URL | ContentSection | Entry Type | 数据源 | 渲染方式 |
|-----|---------------|------------|--------|----------|
| `/legal` | `legal` | `legal-index` | `translations('legal')` | 政策卡片列表 |
| `/legal/terms` | `legal` | `legal-detail` | `translations('legal.policies.terms')` | 政策详情文档 |
| `/legal/privacy` | `legal` | `legal-detail` | `translations('legal.policies.privacy')` | 同上 |
| `/legal/copyright` | `legal` | `legal-detail` | `translations('legal.policies.copyright')` | 同上 |
| `/legal/brand` | `legal` | `legal-detail` | `translations('legal.policies.brand')` | 同上 |
| `/legal/cookies` | `legal` | `legal-detail` | `translations('legal.policies.cookies')` | 同上 |
| `/blog` | `blog` | `blog-index` | — | 占位 "Under Development" |
| `/faq` | `faq` | `stub` | — | 占位 "Under Development" |
| `/support` | `support` | `stub` | — | 同上 |
| `/insights` | `insights` | `stub` | — | 同上 |
| `/careers` | `careers` | `stub` | — | 同上 |
| `/certifications` | `certifications` | `stub` | — | 同上 |
| `/contact` | `contact` | `stub` | — | 同上 |
| `/changelog` | `changelog` | `stub` | — | 同上 |

### 扩展示例

新增一个 CMS 驱动的内容区段只需三步：

```typescript
// 1. types.ts — 在 ContentSection 追加 key
export type ContentSection = 'legal' | 'blog' | 'faq' | ... | 'my-new-section';

// 2. 实现 ContentLoader
async function myLoader(slug: string[], locale: string): Promise<ContentEntry | null> {
  if (slug.length === 0) return { type: 'my-type', layout: 'prose', /* ... */ };
  return null;
}

// 3. registry.ts — 注册
export const CONTENT_REGISTRY: Record<ContentSection, ContentSectionConfig> = {
  // ... 现有配置
  'my-new-section': { loader: myLoader },
};
```

---

## 翻译文件加载策略

### 权威文件 vs 指针文件

`messages/{locale}/` 下存在两类文件：

| 类型 | 示例 | 说明 |
|------|------|------|
| **权威文件** | `common/common.json`、`layout/header.json` | 包含实际翻译内容，`request.ts` 直接加载 |
| **指针文件** | `common.json`、`layout.json`、`home.json` | 遗留重构残留，内容为路径引用字符串，**忽略不加载** |

### 页面 namespace 映射表

| 访问路径 | 加载的 namespace |
|---|---|
| `/` | `home.*`（hero / features / solutions / cases / cta） |
| `/appcenter*` | `appcenter` |
| `/products*` | `products` |
| `/solutions*` | `solutions` |
| `/cases*` | `cases` |
| `/legal*` | `legal` |
| `/about*` 或 `/company*` | `company.about`、`company.contact` |
| 其他（signin / signup 等） | 不加载页面 namespace |

**每页始终加载**：`root`（`zh-CN.json`）、`common/common.json`、`layout/header.json`、`layout/footer.json`

### 静态 import 约束

Turbopack/Webpack 要求 `import()` 路径在编译期可静态分析。
`request.ts` 使用 `loadZhCN` / `loadEnUS` 两个 switch 枚举函数，所有路径均为字面量。

---

## 目录设计原则

### `data/` — 结构数据与翻译分离

组件使用 `labelKey` / `altKey` 等字段引用翻译 key，不在 data 文件中硬编码文本。
翻译内容统一在 `messages/` 中维护，data 文件只负责结构、href、图片路径等静态配置。

### `components/` — 按职责分层，不按页面分层

```
layout/       ← 全局布局（Header、Footer、Sidebar）
marketing/    ← 营销页区块组件
cases/        ← 🆕 案例页专属组件
auth/         ← 认证页专属组件
feedback/     ← 通知、反馈等语义业务组件
```

应用层不再建立 `ui/` 或 `primitives/` 基础组件目录。基础控件、可复用布局、外壳、认证模板必须优先使用 `@vxture/design-system`；如果 DS 能力不足，先补充 DS，再在应用中组合使用。

### `stores/` — 只存 UI 状态

- `auth.store.ts` 只存 `{ user, isAuthenticated }`，不存任何 token
- `persistOptions/` 集中管理 Zustand persist 配置

### `lib/content/` — Content Registry

Content Registry 是路由层与内容层的解耦中间层。今天从 next-intl 翻译文件读取，未来可替换为 CMS API 或 MDX 文件系统，路由层和 registry 配置不变。

### `lib/i18n/` — 框架胶水，不放业务逻辑

- `routing.ts` 引用 `@vxture/shared` 的 `SUPPORTED_LOCALES` 和 `DEFAULT_LOCALE`
- `navigation.ts` 导出类型安全的 `Link` / `redirect` / `useRouter`

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

## Middleware 三个关注点

`middleware.ts` 执行顺序（固定）：

```
1. 认证重定向 — 读取 vx_tenant_refresh_token Cookie，保护 /dashboard
2. intlMiddleware — next-intl 语言前缀路由
3. response.headers.set('x-pathname', ...) — 供 request.ts 按需加载翻译
```

注意：不在 middleware 层拦截"已登录用户访问登录页"——由客户端 `AuthSessionBootstrap` 处理。

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

---

## 重构变更记录

### v2.1.0 — 2026-05-06 (本文档版本)

- 完整反映项目重构后的目录结构

### v2.0.0 — 2026-05-06 (代码重构)

- **新增 `(public)/layout.tsx`** — 全站公开页共享父布局，Header + Footer 实例唯一
- **新增 `(content)/` 路由组** — Content Registry 系统，`[...slug]` 通配路由接管所有内容页
- **新增 `lib/content/`** — Content Registry 核心：types、registry、loaders（legal / blog / stub）
- **新增 `(marketing)/cases/[slug]/`** — 案例详情页从 `cases-pages/` 迁移至此
- **新增 `AnimatedHeroBg.tsx`** — 营销页 Hero 动态背景（节点连线动画，支持暗/亮主题）
- **新增 `AuthSessionBootstrap.tsx`** — 客户端登录态恢复引导（挂载时调用 restoreSession）
- **新增 `SliderCaptcha.tsx`** — 滑块验证码组件
- **新增 `cases/` 组件目录** — CasesPage（列表）+ CaseDetail（详情），带分类筛选和搜索
- **新增 `constants/` 目录** — 认证常量、路由常量
- **新增 `ui/panels/`** — 调试面板组件目录
- **新增 UI 组件** — FullscreenSwitcher、DensitySwitcher、PreferencesPanel
- **新增 `data/cases/cases.data.ts`** — 6 条案例的结构数据
- **新增 `scripts/verify-content-system.js`** — 翻译文件完整性校验脚本
- **移除 `(footer-links)/` 路由组** — 被 Content Registry 替代
- **移除 `(marketing)/legal/[policy]/` 路由** — 被 Content Registry legal loader 替代
- **移除 `(marketing)/cases-pages/`** — 迁移至 `(marketing)/cases/[slug]/`
- **重构 `middleware.ts`** — 统一认证重定向 + intl + x-pathname
- **重构 `request.ts`** — 新增 `legal` namespace 支持
- **重构组件导出** — 各组件目录统一通过 `index.ts` 导出
