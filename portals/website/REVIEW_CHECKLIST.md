# website + website-bff 重构检查清单

> 供 AI 逐项检查使用。每项检查完成后标记 ✅ PASS / ❌ FAIL / ⚠️ WARN。
> FAIL 和 WARN 须在结果后附上具体文件路径和问题描述。

---

## 检查方式说明

执行每一项检查时：

1. 定位到涉及的文件或目录
2. 对照标准逐条核实
3. 给出明确结论，不允许「基本符合」「大致正确」等模糊表述
4. FAIL 项必须列出：文件路径 + 违规代码行 + 违规原因

---

# 第一部分：portals/website

---

## A. 架构边界

> 核心原则：前端只与 BFF 通信，绝对不直接访问后端服务或平台包。

**A-01** 搜索 `src/` 下所有文件，确认无 `@vxture/core-*` 的 import。

**A-02** 搜索 `src/` 下所有文件，确认无 `@vxture/service-*` 的 import。

**A-03** 搜索 `src/` 下所有文件，确认无 `@vxture/ai-sdk` 的 import。

**A-04** 搜索 `src/api/` 下所有文件，确认每个函数的请求目标均为 `/api/*`（BFF 接口），不含任何指向后端服务的 baseURL 或完整 URL。

**A-05** 确认 `src/api/` 中的函数不包含任何业务逻辑，只做 HTTP 调用和结果返回（无条件判断、无数据转换、无副作用）。

**A-06** 确认 `package.json` 的 `dependencies` 中无 `@vxture/core-*`、`@vxture/service-*`、`@vxture/ai-sdk`。

---

## B. 认证安全

> 核心原则：前端完全不持有 token，认证状态只存用户信息。

**B-01** 搜索整个 `src/` 目录，确认无任何与 token 相关的 `localStorage.setItem` 调用（搜索关键词：`token`、`accessToken`、`refreshToken`、`jwt`）。

**B-02** 搜索整个 `src/` 目录，确认无任何与 token 相关的 `localStorage.getItem` 调用。

**B-03** 打开 `src/stores/auth.store.ts`，确认 state interface 中不含以下字段：`token`、`accessToken`、`refreshToken`、`tokenExpiry`、`expiresIn`。

**B-04** 打开 `src/stores/auth.store.ts`，确认不含定时器逻辑（无 `setInterval`、`setTimeout`、`clearInterval`、`clearTimeout`）。

**B-05** 打开 `src/stores/auth.store.ts`，确认 Zustand persist 的持久化白名单只包含 `user` 和 `isAuthenticated`，不包含任何 token 字段。

**B-06** 打开 `src/hooks/useAuth.ts`，确认 `login()` 函数：只调用 BFF 接口、收到响应后调用 store setter、不做任何 token 存储操作。

**B-07** 打开 `src/hooks/useAuth.ts`，确认 `logout()` 函数：只调用 BFF 接口、完成后调用 store clear 方法、不清除 token 相关 localStorage。

**B-08** 打开认证相关页面（`login/page.tsx` 或 `LoginForm.tsx`），确认表单字段使用 `email`（不是 `username`），与 BFF `LoginDto` 保持一致。

**B-09** 搜索 `src/` 下所有文件，确认无 `document.cookie` 的读写操作（cookie 只由 BFF 设置，前端不操作）。

---

## C. i18n 规范

> 核心原则：Locale 类型唯一来源 `@vxture/shared`，格式化函数来自 `@vxture/shared`，翻译文案来自 `next-intl`。

**C-01** 搜索 `src/` 下所有文件，确认无本地定义的 `Locale` 类型或 `type Locale = ...`（唯一来源是 `@vxture/shared`）。

**C-02** 搜索 `src/` 下所有文件，确认无本地定义的 `SUPPORTED_LOCALES` 或 `DEFAULT_LOCALE` 常量。

**C-03** 打开 `src/lib/i18n/routing.ts`，确认 `locales` 和 `defaultLocale` 来自 `@vxture/shared` 的 `SUPPORTED_LOCALES` 和 `DEFAULT_LOCALE`，不是硬编码字符串。

**C-04** 打开 `src/lib/i18n/navigation.ts`，确认文件存在，且导出了 `Link`、`redirect`、`useRouter`、`usePathname`。

**C-05** 搜索 `src/` 下所有 `.tsx` 和 `.ts` 文件，确认无 `import ... from 'next/link'` 的直接引用（统一从 `src/lib/i18n/navigation.ts` 引入 `Link`）。

**C-06** 搜索 `src/` 下所有文件，确认无直接从 `next/navigation` 引入 `useRouter`、`usePathname`（统一从 `src/lib/i18n/navigation.ts` 引入）。

**C-07** 检查 `messages/` 目录结构：顶层目录必须是 `zh/` 和 `en/`，不得是 `zh-CN/` 或 `en-US/`。

**C-08** 检查 `messages/zh/` 和 `messages/en/` 下的文件，确认翻译按 namespace 拆分为多个 JSON 文件（`common.json`、`nav.json` 等），不是单一的 `zh.json`。

**C-09** 检查 `messages/zh/` 和 `messages/en/` 下的 namespace 文件是否一一对应，无缺失。

**C-10** 搜索 `src/` 下所有文件，确认货币、日期、数字格式化使用 `@vxture/shared` 的 `formatCurrency`、`formatDate`、`formatNumber`，不使用 `next-intl` 的 `useFormatter`。

**C-11** 搜索 `src/` 下所有文件，确认无残留的 `i18nStore`、`useLocaleOld`、`I18nSync` 相关 import 或引用。

**C-12** 搜索 `src/` 下所有文件，确认 `useLocale` 只从 `next-intl` 引入，无来自自定义 hook 的版本。

**C-13** 打开 `src/lib/i18n/request.ts`，确认 messages 按 namespace 分别动态加载，不是一次性整包加载。

---

## D. 目录结构

> 核心原则：按职责分层，文件放在正确的目录，命名符合规范。

**D-01** 确认 `src/components/` 下只存在规范目录：`layout/`、`marketing/`、`auth/`、`ui/`，不存在 `common/`、`home/`、`panels/` 等旧目录。

**D-02** 确认 `src/stores/` 下不存在空目录（`global/`、`theme/`、`ui/`）。

**D-03** 确认 `src/app/` 下不存在空占位目录（`metadata/`、`providers/`、`runtime/`）。

**D-04** 确认不存在 `src/shared/` 目录（旧的 `shared/types/`、`shared/constants/`、`shared/contexts/` 均已迁移或删除）。

**D-05** 确认不存在 `src/infrastructure/` 目录（临时适配器层已删除）。

**D-06** 检查所有 React 组件文件，确认使用 PascalCase 命名（`HeroSection.tsx`），无 `heroSection.tsx` 或 `hero-section.tsx`。

**D-07** 检查所有 hooks 文件，确认使用 `use` 前缀 + camelCase 命名（`useAuth.ts`）。

**D-08** 检查所有 store 文件，确认使用 `*.store.ts` 命名（`auth.store.ts`）。

**D-09** 检查所有 API 调用层文件，确认使用 `*.api.ts` 命名（`auth.api.ts`）。

**D-10** 检查所有类型定义文件，确认使用 `*.types.ts` 命名（`auth.types.ts`）。

**D-11** 检查所有常量文件，确认使用 `*.constants.ts` 命名（`routes.constants.ts`）。

**D-12** 确认 `src/constants/` 中不存在 locale、theme 相关常量定义（这些必须从 `@vxture/shared` 引入）。

---

## E. 路由与 Middleware

> 核心原则：所有页面在 `[locale]` 层级下，middleware 认证判断在 intl 之前。

**E-01** 确认 `src/app/[locale]/` 目录存在，且所有页面路由均在此目录层级下。

**E-02** 确认 `src/app/` 根层级下无 `page.tsx`（首页必须在 `[locale]/page.tsx`）。

**E-03** 打开 `middleware.ts`，确认认证重定向逻辑（读取 `vx_refresh_token` Cookie）在 `intlMiddleware` 调用之前执行。

**E-04** 打开 `middleware.ts`，确认 `matcher` 正确排除了 `api`、`_next`、静态资源路径。

**E-05** 确认受保护路由（如 `/dashboard`）在 middleware 中有对应的保护规则，未登录时会重定向到登录页。

**E-06** 确认已登录用户访问登录页时，middleware 正确重定向到首页或 dashboard。

---

## F. 组件规范

> 核心原则：组件只关心 UI，不直接调用后端，不持有全局副作用。

**F-01** 搜索 `src/components/` 下所有文件，确认无 `@vxture/core-*`、`@vxture/service-*`、`@vxture/ai-sdk` 的 import。

**F-02** 搜索 `src/components/` 下所有文件，确认设计系统基础组件（`Button`、`Input`、`Dialog` 等）直接从 `@vxture/design-system` 引入，不在应用内重复实现。

**F-03** 搜索 `src/components/` 下所有文件，确认无 `<img>` 标签，图片统一使用 `next/image` 的 `<Image>` 组件。

**F-04** 搜索 `src/components/` 下所有文件，确认无 `@phosphor-icons/react` 的直接 import（图标通过 `@vxture/design-system` 的 `<Icon>` 组件使用）。

**F-05** 检查所有使用翻译的组件，确认使用 `useTranslations(namespace)` from `next-intl`，无已删除的自定义 `t()` 函数残留。

**F-06** 检查 `src/components/ui/` 下的格式化展示组件（如 `PriceDisplay`），确认使用 `useLocale()` from `next-intl` + `formatCurrency` from `@vxture/shared` 的组合，不使用 `next-intl` 格式化 API。

---

## G. TypeScript 规范

> 核心原则：严格模式，无 any，import type 用于纯类型导入。

**G-01** 打开 `tsconfig.json`，确认 `"extends": "../../tsconfig.base.json"`，不在本地重复定义 `strict`、`target` 等编译选项。

**G-02** 搜索 `src/` 下所有文件，确认无 `: any` 或 `as any`。

**G-03** 搜索 `src/` 下所有文件，确认无 `// @ts-ignore` 或 `// @ts-expect-error`（若存在须有书面注释说明原因）。

**G-04** 搜索 `src/` 下所有文件，确认纯类型导入使用 `import type`。

**G-05** 搜索 `src/` 下所有文件，确认无跨包相对路径 import（如 `../../../packages/shared/src`），所有跨包引用使用 `@vxture/*` workspace alias。

**G-06** 确认 `src/types/i18n.types.ts` 存在，且包含 `IntlMessages` 全局类型声明。

---

## H. 代码质量

> 核心原则：lint 零警告，无遗留文件，无调试代码。

**H-01** 运行 `pnpm lint`，确认输出无任何 error 和 warning。

**H-02** 运行 `pnpm type-check`，确认输出无任何类型错误。

**H-03** 运行 `pnpm build`，确认构建成功，无编译错误。

**H-04** 搜索 `src/` 下所有文件，确认无裸露的 `console.log`、`console.warn`、`console.error` 调用。

**H-05** 确认以下遗留文件已全部删除：
- `src/hooks/useLocaleOld.ts`
- `src/stores/i18nStore.ts`
- `src/stores/persistOptions/i18nPersist.ts`
- `src/components/common/I18nSync.tsx`
- `src/infrastructure/adapters/auth/authService.ts`
- `src/docs/develop/authdesign.tsx`

**H-06** 搜索 `src/` 下所有文件，确认无 `eslint-disable` 注释（lint 问题须从根本修复，不允许压制）。

**H-07** 检查 `src/data/` 目录（若存在），确认无 mock 数据文件被生产代码 import。

---

## I. 功能验证（需浏览器运行）

**I-01** 访问 `/`，确认正确重定向到 `/{defaultLocale}/`（即 `/zh/`）。

**I-02** 访问 `/en/`，确认页面正常加载，文案为英文。

**I-03** 切换语言，确认 URL 前缀变化，文案实时切换，无全量刷新。

**I-04** 未登录访问受保护路由（如 `/zh/dashboard`），确认被重定向到登录页。

**I-05** 完成登录流程，确认 DevTools → Cookies 中存在 `vx_refresh_token`，且标记为 `HttpOnly`。

**I-06** 完成登录流程，确认 DevTools → Local Storage 中无任何 token 相关 key。

**I-07** 登录后刷新页面，确认用户信息正常恢复，不需要重新登录。

**I-08** 执行登出，确认 `vx_refresh_token` Cookie 被清除，页面跳转到登录页。

**I-09** 已登录状态访问 `/zh/login`，确认被重定向到首页或 dashboard。

---

---

# 第二部分：bff/website-bff

---

## J. 架构边界

> 核心原则：BFF 只做接收、转发、塑形，不实现业务逻辑，不引入前端依赖。

**J-01** 搜索 `src/` 下所有文件，确认无 `@vxture/design-system` 的 import。

**J-02** 搜索 `src/` 下所有文件，确认无 `@vxture/platform-*` 的 import。

**J-03** 搜索 `src/` 下所有文件，确认无 `@vxture/ai-sdk` 的 import。

**J-04** 搜索 `src/` 下所有文件，确认无其他 BFF 包的 import（如 `@vxture/bff-admin`、`@vxture/bff-tenant`），BFF 之间不互相调用。

**J-05** 搜索 `src/` 下所有文件，确认无 React、`react-dom`、`next`、任何前端框架的 import。

**J-06** 搜索 `src/` 下所有文件，确认无 `window`、`document`、`localStorage`、`navigator` 等浏览器 API 的使用。

**J-07** 打开 `package.json`，确认 `dependencies` 中存在且仅限以下平台包：`@vxture/core-auth`、`@vxture/core-config`、`@vxture/core-api`、`@vxture/core-locale`、`@vxture/core-tenant`、`@vxture/core-utils`、`@vxture/shared`。

**J-08** 确认 `src/` 下不存在 `services/` 目录（业务逻辑属于 `@vxture/service-*`，BFF 不自己实现）。

**J-09** 确认 `src/` 下不存在 `entities/` 目录（ORM 实体属于 service 层，BFF 不直接操作数据库）。

**J-10** 确认 `src/` 下不存在 `utils/` 目录（通用工具从 `@vxture/core-utils` 引入，不在 BFF 内重复实现）。

---

## K. 认证实现

> 核心原则：session 由 BFF 全权管理，access token 不下发给前端。

**K-01** 打开 `src/middleware/auth.middleware.ts`，确认从 Cookie 读取 `vx_refresh_token`（不是从 `Authorization` header 读取，前端不持有 token）。

**K-02** 打开 `src/middleware/auth.middleware.ts`，确认使用 Redis 查询 access token（key 格式 `session:{userId}`），不在 Cookie 或请求中直接读取 access token。

**K-03** 打开 `src/middleware/auth.middleware.ts`，确认调用 `VxJwtClient.verifyAccessToken()` 验证 token 有效性，不自行实现 JWT 解析逻辑。

**K-04** 打开 `src/middleware/auth.middleware.ts`，确认 token 验证失败时清除 Cookie 并返回 401，不进入 router 处理。

**K-05** 打开 `src/routers/auth.router.ts`，确认 `POST /auth/login` 路由标记了 `@Public()`，不需要认证即可访问。

**K-06** 打开 `src/routers/auth.router.ts`，确认登录成功后的响应体中**不包含** `accessToken` 或 `refreshToken` 字段，只返回用户信息 DTO（`id`、`name`、`email`、`role`）。

**K-07** 打开 `src/routers/auth.router.ts`，确认登录成功后通过 `res.cookie()` 设置 `vx_refresh_token`，Cookie 选项包含 `httpOnly: true`、`secure: true`、`sameSite: 'strict'`。

**K-08** 打开 `src/routers/auth.router.ts`，确认登录成功后将 access token 存入 Redis（`SET session:{userId} {accessToken} EX {expiresIn}`），不存入 Cookie 或响应体。

**K-09** 打开 `src/routers/auth.router.ts`，确认 `POST /auth/logout` 实现：从 Redis 删除 `session:{userId}`，并清除 `vx_refresh_token` Cookie（`res.clearCookie`）。

**K-10** 打开 `src/routers/auth.router.ts`，确认 `POST /auth/refresh` 实现：读取 Cookie 中的 refresh token，验证后签发新 access token 并更新 Redis，不将新 token 下发给前端。

---

## L. 中间件规范

> 核心原则：三个中间件各司其职，执行顺序固定，不交叉处理。

**L-01** 打开 `src/app.module.ts` 或中间件注册文件，确认中间件执行顺序为：`auth → tenant → locale → router`。

**L-02** 打开 `src/middleware/auth.middleware.ts`，确认只处理认证逻辑，不包含租户解析或 locale 解析代码。

**L-03** 打开 `src/middleware/tenant.middleware.ts`，确认使用 `TenantDetector.detectFromHeaders()` 解析 tenantId，调用 `TenantManager.setTenantContext()` 注入上下文，不包含认证或 locale 逻辑。

**L-04** 打开 `src/middleware/locale.middleware.ts`，确认使用 `resolveLocale(request)` from `@vxture/core-locale` 解析 locale，将结果注入请求上下文，不包含认证或租户逻辑。

**L-05** 搜索 `src/routers/` 下所有文件，确认路由处理器中无重复的认证验证逻辑（不在 router 里再次验证 token）。

**L-06** 搜索 `src/routers/` 下所有文件，确认路由处理器中无重复的 locale 解析逻辑（不在 router 里再次调用 `resolveLocale`，只从上下文取值）。

---

## M. Router 规范

> 核心原则：一域一文件，独立错误处理，响应塑形，不透传原始数据。

**M-01** 检查 `src/routers/` 下所有 router 文件，确认每个文件只处理一个业务域（auth、pricing 等），无大杂烩 router。

**M-02** 检查 `src/routers/` 下所有 router 文件，确认每个路由处理器有独立的 try/catch，错误不向上冒泡影响其他 router。

**M-03** 检查 `src/routers/` 下所有 router 文件，确认错误响应格式统一（标准化的状态码 + 错误码 + 消息），不将内部错误栈直接暴露给前端。

**M-04** 检查 `src/types/` 下所有 DTO，确认每个 DTO 只包含前端实际需要的字段，不是后端原始数据结构的直接复制。

**M-05** 检查 `src/types/` 下所有 DTO，确认响应 DTO 使用 interface 定义，请求 DTO（有校验需求的）使用 class + class-validator 装饰器定义。

**M-06** 搜索 `src/routers/` 下所有文件，确认需要多语言内容的接口使用 `localizeContent()` from `@vxture/core-locale`，不自行实现内容本地化逻辑。

---

## N. 平台包使用规范

> 核心原则：正确使用各平台包的 API，不重复实现已有能力。

**N-01** 搜索 `src/` 下所有文件，确认配置读取统一通过 `VxConfigService` 注入（`@vxture/core-config`），不直接读取 `process.env`。

**N-02** 搜索 `src/` 下所有文件，确认 HTTP 下游调用统一使用 `VxHttpClient`（`@vxture/core-api`），不直接使用 `axios` 或 `fetch`。

**N-03** 搜索 `src/` 下所有文件，确认 JWT 操作统一使用 `VxJwtClient`（`@vxture/core-auth`），不直接使用 `jsonwebtoken` 或 `@nestjs/jwt` 的 `JwtService`。

**N-04** 搜索 `src/` 下所有文件，确认日志输出统一使用 `VxLogger` 或 `logger`（`@vxture/core-utils`），不直接使用 `console.log`。

**N-05** 搜索 `src/` 下所有文件，确认 locale 解析统一使用 `resolveLocale`（`@vxture/core-locale`），不自行解析 `Accept-Language` header。

**N-06** 搜索 `src/` 下所有文件，确认 `Locale` 类型从 `@vxture/shared` 或 `@vxture/core-locale`（re-export）引入，无本地重复定义。

---

## O. 目录结构与命名

> 核心原则：结构极简，命名统一，禁止出现规范外目录。

**O-01** 确认 `src/` 下只存在规范目录：`routers/`、`aggregators/`（可选）、`middleware/`、`types/`，无其他自创目录。

**O-02** 检查所有 router 文件，确认使用 `*.router.ts` 命名（`auth.router.ts`）。

**O-03** 检查所有 middleware 文件，确认使用 `*.middleware.ts` 命名（`auth.middleware.ts`）。

**O-04** 检查所有 aggregator 文件（若存在），确认使用 `*.aggregator.ts` 命名。

**O-05** 检查所有类型定义文件，确认使用 `*.types.ts` 命名（`auth.types.ts`）。

**O-06** 打开 `package.json`，确认 `name` 字段为 `@vxture/bff-website`。

**O-07** 打开 `tsconfig.json`，确认 `"extends": "../../tsconfig.base.json"`，包含 `"emitDecoratorMetadata": true` 和 `"experimentalDecorators": true`（NestJS 装饰器必需）。

---

## P. TypeScript 规范

> 与前端一致的严格 TypeScript 要求。

**P-01** 搜索 `src/` 下所有文件，确认无 `: any` 或 `as any`。

**P-02** 搜索 `src/` 下所有文件，确认无 `// @ts-ignore` 或 `// @ts-expect-error`（若存在须有书面注释说明原因）。

**P-03** 搜索 `src/` 下所有文件，确认纯类型导入使用 `import type`。

**P-04** 搜索 `src/` 下所有文件，确认无跨包相对路径 import，所有跨包引用使用 `@vxture/*` workspace alias。

---

## Q. 代码质量

**Q-01** 运行 `pnpm lint`，确认输出无任何 error 和 warning。

**Q-02** 运行 `pnpm type-check`，确认输出无任何类型错误。

**Q-03** 运行 `pnpm build`，确认构建成功，无编译错误。

**Q-04** 搜索 `src/` 下所有文件，确认无裸露的 `console.log`、`console.warn`、`console.error` 调用（统一使用 `VxLogger`）。

**Q-05** 搜索 `src/` 下所有文件，确认无 `eslint-disable` 注释。

---

## R. 集成验证（需配合前端联调）

**R-01** 启动 website-bff，访问 Swagger 文档（`/api/docs`），确认 `POST /auth/login`、`POST /auth/logout`、`POST /auth/refresh`、`GET /auth/me` 四个接口均正确注册。

**R-02** 使用 Postman 或 curl 调用 `POST /auth/login`（正确凭据），确认：响应体只含用户信息字段，响应 header 中 `Set-Cookie` 包含 `vx_refresh_token=...; HttpOnly; Secure; SameSite=Strict`。

**R-03** 使用 Postman 调用 `POST /auth/login`（错误凭据），确认返回 401，响应体格式为标准错误结构（`{ success: false, code: '...', message: '...' }`）。

**R-04** 使用 Postman 调用任意需要认证的接口（不携带 Cookie），确认返回 401。

**R-05** 完成前后端联调，确认完整登录流程端到端通畅：前端登录 → BFF 处理 → Cookie 设置 → 后续请求自动携带 → BFF 正确转发到下游。

**R-06** 确认 Redis 中在登录后存在 `session:{userId}` key，执行登出后该 key 被删除。

---

---

# 检查结果汇总模板

```
## 检查结果汇总

检查时间：
项目：portals/website + bff/website-bff

### 统计

#### portals/website（A–I，共 65 项）
- PASS：
- FAIL：
- WARN：

#### bff/website-bff（J–R，共 51 项）
- PASS：
- FAIL：
- WARN：

#### 总计（116 项）
- PASS：
- FAIL：
- WARN：

---

### FAIL 项明细
| 编号 | 所属端 | 文件路径 | 违规描述 | 修复建议 |
|------|--------|---------|---------|---------|
|      |        |         |         |         |

### WARN 项明细
| 编号 | 所属端 | 文件路径 | 问题描述 | 建议 |
|------|--------|---------|---------|------|
|      |        |         |         |      |

---

### 结论
- [ ] 可以合并（所有 FAIL 项已修复）
- [ ] 需要修复后重新检查（存在 FAIL 项）

### 高风险未解决项（FAIL 中属于架构违规或安全问题的）
（列出 A、B、J、K 分组中的所有 FAIL 项，这些项目优先修复）
```
