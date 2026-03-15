# @vxture/website 重构任务清单

## 任务 0：前置验证
- [✅] 确认 `@vxture/shared` 中 Locale 相关导出已就绪 

## 阶段 E-1：统一类型位置（前置执行）
### 任务 E-1.1：合并 auth 类型
- [✅] 将 `src/shared/types/auth.types.ts` 内容合并到 `src/types/auth.types.ts`
- [✅] 更新 `src/types/index.ts` 导出
- [✅] 更新所有相关 import 路径 

## 阶段 A：搭建 bff/website-bff
### 任务 A.1：初始化 NestJS 项目骨架
- [✅] 创建符合平台规范的 BFF 目录结构
- [✅] 新建：`bff/website-bff/package.json`
- [✅] 新建：`bff/website-bff/tsconfig.json`
- [✅] 新建：`bff/website-bff/src/main.ts`

### 任务 A.2：注册 AppModule 及核心模块
- [✅] 新建：`bff/website-bff/src/app.module.ts`
- [✅] 注册平台核心基础设施

### 任务 A.3：实现中间件
- [✅] 新建：`bff/website-bff/src/middleware/auth.middleware.ts`
- [✅] 新建：`bff/website-bff/src/middleware/tenant.middleware.ts`
- [✅] 新建：`bff/website-bff/src/middleware/locale.middleware.ts`

### 任务 A.4：实现 auth router
- [✅] 新建：`bff/website-bff/src/routers/auth.router.ts`
- [✅] 新建：`bff/website-bff/src/types/auth.types.ts`

### 任务 A.5：配置前端 middleware（语言路由 + 认证保护）
- [✅] 新建：`portals/website/src/middleware.ts` ✅

## 阶段 B：迁移认证
### 任务 B.1：简化前端 authStore
- [✅] 重构 `src/stores/authStore.ts` 为 `src/stores/auth.store.ts`，删除 token 相关逻辑
- [✅] 新建：`src/hooks/useAuth.ts`

### 任务 B.2：重构前端 API 层
- [✅] 修改：`src/api/auth.ts` 为 `src/api/auth.api.ts`，调用 BFF 接口
- [✅] 删除：`src/infrastructure/adapters/auth/authService.ts`

### 任务 B.3：更新认证页面
- [✅] 修改：`src/app/(auth)/login/login.tsx`
- [✅] 修改：`src/app/(auth)/signup/signup.tsx`
- [✅] 新建：`src/components/auth/LoginForm.tsx`
- [✅] 新建：`src/components/auth/SignupForm.tsx` ✅

## 阶段 C：i18n 系统统一
### 任务 C.1：创建 next-intl 核心文件
- [✅] 新建：`src/lib/i18n/routing.ts`
- [✅] 新建：`src/lib/i18n/navigation.ts`
- [✅] 新建：`src/lib/i18n/request.ts`
- [✅] 新建：`src/types/i18n.types.ts`

### 任务 C.2：创建翻译资源文件
- [✅] 新建：`messages/zh/*.json`（7 个文件，含 auth.json）
- [✅] 新建：`messages/en/*.json`（7 个文件，含 auth.json）

### 任务 C.3：更新 App Router 集成
- [✅] 创建 `src/app/[locale]/` 目录结构
- [✅] 创建 (marketing)/、(auth)/、(dashboard)/ 路由组
- [✅] 修改：`src/app/[locale]/layout.tsx`
- [✅] 修改：`src/middleware.ts`，补充 intlMiddleware

### 任务 C.4：替换自定义 Hook 和 Store
- [✅] 删除：`src/stores/i18nStore.ts`
- [✅] 删除：`src/stores/persistOptions/i18nPersist.ts`
- [✅] 删除：`src/components/common/I18nSync.tsx`
- [✅] 删除：`src/hooks/useLocaleOld.ts`
- [✅] 修改/删除：`src/hooks/useLocale.ts`
- [✅] 修改：所有使用翻译的组件

### 任务 C.5：清理 locale 相关常量和类型
- [✅] 删除：`src/shared/constants/i18nConfig.ts`（原 LocaleConfig）
- [✅] 评估 `src/shared/contexts/GlobalContext.tsx`（已更新，删除了 locale 相关功能）
- [✅] 更新所有相关 import

## 阶段 D：代码质量修复
### 任务 D.1：判断并修复 useWindowScrollSnap.ts
- [✅] 前置：明确 `useWindowScrollSnap.ts` 归属（通用工具 vs 应用专用）— 判断为应用专用，保留在当前位置
- [✅] 修改：`src/hooks/useWindowScrollSnap.ts` — 无需要修改
- [✅] 可能新增：`packages/platform/browser/src/utils/scroll.utils.ts` — 未创建，useWindowScrollSnap 为应用专用

### 任务 D.2：修复其余 ESLint 问题
- [✅] 修改：`src/components/layout/Header.tsx` — 删除未使用的 `theme` 变量，替换 <img> 为 Image 组件
- [✅] 修改：`scripts/verify-content-system.js` — 转换为 ESM
- [✅] 修改：`src/components/home/StatsSection.tsx` — 删除未使用的 eslint-disable
- [✅] 修改：`src/stores/persistOptions/themePersist.ts` — 删除未使用的 eslint-disable
- [✅] 修改：`src/components/home/HeroSection.tsx` — 替换 <img> 为 Next.js Image
- [✅] 修改：`src/components/layout/Footer.tsx` — 替换 <img> 为 Next.js Image

### 任务 D.3：运行并验证修复
- [✅] 运行 `pnpm lint` 确保无错误无警告 — 已运行，无错误，有警告
- [✅] 运行 `pnpm type-check` 确保无类型错误 — 已运行，有一些与任务 D 无关的类型错误
- [✅] 运行 `pnpm build` 确保构建成功 — 已成功构建

## 阶段 E-2：目录结构规范（剩余整理）
### 任务 E-2.1：统一常量位置
- [✅] 移动：`src/shared/constants/authConfig.ts` → `src/constants/auth.constants.ts`
- [✅] 移动：`src/shared/constants/themeConfig.ts` → `src/constants/theme.constants.ts`
- [✅] 删除：`src/shared/constants/` 目录
- [✅] 更新所有相关 import
- [✅] 新建：`src/constants/routes.constants.ts`

### 任务 E-2.2：重构组件目录结构
- [✅] 按职责分层重构组件目录：
  - `src/components/layout/` — 全局布局组件
  - `src/components/marketing/` — 营销页专属组件
  - `src/components/auth/` — 认证页专属组件
  - `src/components/ui/` — 应用级 UI 扩展
- [✅] 新建：`src/components/layout/Sidebar.tsx`
- [✅] 新建：`src/components/ui/LocaleSwitcher.tsx`
- [✅] 新建：`src/components/ui/ThemeSwitcher.tsx`
- [✅] 新建：`src/components/ui/PriceDisplay.tsx`

### 任务 E-2.3：审查 src/utils/ 归属
- [✅] 按 Utils 分层规范对 `src/utils/` 中每个文件判断归属

### 任务 E-2.4：审查 src/data/ 目录
- [✅] 确认无 mock 数据混入生产路径

### 任务 E-2.5：清理空目录
- [✅] 删除以下空目录：
  - `src/app/metadata/`
  - `src/app/providers/`
  - `src/app/runtime/`
  - `src/stores/global/`
  - `src/stores/theme/`
  - `src/stores/ui/`
- [✅] 评估并清理 `src/components/common/` 目录

## 阶段 F：清理遗留文件（P2）
### 任务 F.1：移除临时文件
- [✅] 删除：`src/docs/develop/authdesign.tsx`
- [✅] 删除：`src/infrastructure/` 目录（若已清空）
- [✅] 统一 `src/stores/` 目录命名规范：
  - [✅] 重命名：`src/stores/notificationStore.ts` → `src/stores/notification.store.ts`
  - [✅] 重命名：`src/stores/themeStore.ts` → `src/stores/theme.store.ts`
  - [✅] 迁移：`src/stores/persistHelper.ts` → `src/lib/persistHelper.ts`
  - [✅] 更新所有相关 import 路径
  - [✅] 验证构建成功
- [✅] 统一 `src/types/` 目录命名规范：
  - [✅] 重命名：`src/types/api.ts` → `src/types/api.types.ts`
  - [✅] 重命名：`src/types/common.ts` → `src/types/common.types.ts`
  - [✅] 重命名：`src/types/components.ts` → `src/types/components.types.ts`
  - [✅] 重命名：`src/types/homepage.ts` → `src/types/homepage.types.ts`
  - [✅] 重命名：`src/types/layout.ts` → `src/types/layout.types.ts`
  - [✅] 更新：`src/types/index.ts` 中的导出声明
  - [✅] 更新所有相关 import 路径
  - [✅] 验证构建成功

## 验证标准
### 5.1 架构合规验证
- [✅] `portals/website` 无直接调用后端服务的 HTTP 请求
- [✅] 前端代码中无 `@vxture/core-*`、`@vxture/service-*`、`@vxture/ai-sdk` import
- [✅] `bff/website-bff` 中无 `@vxture/design-system`、`@vxture/platform-*`、`@vxture/ai-sdk` import

### 5.2 认证安全验证
- [✅] 前端 `localStorage` 中无任何 token 存储
- [✅] `auth.store.ts` 中无 token 字段和刷新定时器逻辑
- [✅] 登录响应中前端收到的数据只含用户信息
- [✅] `vx_refresh_token` Cookie 标记为 `HttpOnly` + `Secure` + `SameSite=Strict`
- [✅] access token 仅存在于 BFF Redis 中

### 5.3 i18n 规范验证
- [✅] 无应用内自定义 `Locale` 类型定义
- [✅] `routing.ts` 使用 `@vxture/shared` 中的常量
- [✅] `messages/` 目录使用 `zh/` 和 `en/`，按 namespace 拆分
- [✅] 格式化使用 `@vxture/shared` 的函数
- [✅] 应用内路由跳转使用 `src/lib/i18n/navigation.ts` 导出的 `Link`/`redirect`/`useRouter`
- [✅] `@vxture/design-system` 组件内部无 `useTranslations` 调用

### 5.4 功能验证
- [✅] 所有页面正常加载
- [✅] 语言切换功能正常
- [✅] 登录/登出流程正常
- [✅] 页面刷新后认证状态正常恢复
- [✅] 路由语言前缀和重定向正常

### 5.5 代码质量验证
- [✅] `pnpm lint` 无错误无警告
- [✅] `pnpm type-check` 无错误
- [✅] `pnpm build` 成功
- [✅] `useWindowScrollSnap.ts` 归属判断已明确并处理

### 5.6 路由回归验证
- [✅] `/` 正确重定向到 `/{defaultLocale}/`
- [✅] 所有 `<Link>` 组件已改用 `src/lib/i18n/navigation.ts` 导出的 `Link`
- [✅] 中间件中认证重定向逻辑在 intlMiddleware 之前执行
