# @vxture/website + website-bff 重构计划

> 版本：2.0.0 | 日期：2026-03-15

---

## 零、认证方案决策

### 推荐方案：BFF 托管 Session，前端无 Token

**当前问题**：`portals/website` 直接调用后端 API，将 JWT token 存于 `localStorage`，存在两个根本问题：

1. **架构违规**：前端必须通过 BFF 通信，不得绕过 BFF 直连后端
2. **安全风险**：`localStorage` 存储 token 面临 XSS 攻击风险

**推荐方案**：

```
portals/website（前端）
    │  HTTP，携带 HttpOnly Cookie（浏览器自动附带）
    ▼
bff/website-bff（NestJS）  ← 持有并管理 access token + refresh token
    │  Authorization: Bearer <access_token>（BFF 自动附加）
    ▼
后端服务（@vxture/service-* / @vxture/core-auth）
```

**具体机制**：

1. 前端 `POST /api/auth/login`，仅携带 `{ email, password }`，不接触任何 token
2. BFF 调用后端认证服务，通过 `VxJwtClient.signTokenPair()` 获取 `{ accessToken, refreshToken, expiresIn }`
3. BFF 将 refresh token 写入 **`HttpOnly` + `Secure` + `SameSite=Strict` Cookie**（key：`vx_refresh_token`）
4. BFF 将 access token 存入 **Redis**（key：`session:{userId}`，TTL 与 token 一致），不下发给前端
5. 后续所有前端请求到达 BFF 后，由 BFF 从 Redis 取出 access token，自动附加 `Authorization` header 转发下游
6. Token 刷新逻辑完全在 BFF 内处理，前端不感知

**前端 authStore 重构后职责**（仅用于 UI 渲染）：

```ts
// 只保存界面渲染所需的用户信息，不存任何 token
interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  isAuthenticated: boolean;
  // 移除：token、refreshToken、tokenExpiry、刷新定时器
}
```

---

## 一、现状分析

### 1.1 当前技术栈

**portals/website：**

| 类别 | 版本 |
|------|------|
| Next.js (App Router) | 15.5.6 |
| React | 19.2.0 |
| next-intl | 4.8.3 |
| Zustand | 5.0.8 |
| TypeScript | 5.9.3 |
| ESLint | 9.39.3（flat config）|

**bff/website-bff（待搭建）：**

| 类别 | 选型 / 来源 |
|------|------------|
| 框架 | NestJS 11.x |
| 认证基础设施 | `@vxture/core-auth`（`VxJwtClient`、`JwtAuthGuard`、`RolesGuard`）|
| 配置管理 | `@vxture/core-config`（`VxConfigModule.register({ domains: ['app', 'redis', 'auth'] })`）|
| HTTP 客户端 | `@vxture/core-api`（`VxHttpModule`、`VxHttpClient`，调用下游服务）|
| Locale 解析 | `@vxture/core-locale`（`resolveLocale`、`localizeContent`）|
| 租户上下文 | `@vxture/core-tenant`（`TenantDetector`、`TenantManager`）|
| 日志工具 | `@vxture/core-utils`（`VxLogger`、`logger`、类型守卫）|
| Session 存储 | Redis（通过 `@vxture/core-config` redis 域配置）|
| DTO 校验 | class-validator + class-transformer |
| API 文档 | @nestjs/swagger |

### 1.2 当前目录结构（portals/website）

```
src/
├── app/                        # Next.js App Router
├── components/
│   ├── common/                 # 含 I18nSync.tsx ⚠️ 待删除
│   ├── home/                   # 含 HeroSection.tsx ⚠️ <img> 违规
│   ├── layout/                 # 含 Header.tsx ⚠️ 未使用变量；Footer.tsx ⚠️ <img> 违规
│   └── panels/
├── hooks/
│   ├── useLocale.ts            # ⚠️ 包装 i18nStore，待替换为 next-intl API
│   ├── useLocaleOld.ts         # ⚠️ 遗留文件，待删除
│   └── useWindowScrollSnap.ts  # ⚠️ 13 个依赖警告，归属待判断（见问题 5）
├── stores/
│   ├── i18nStore.ts            # ⚠️ 自实现 i18n，待删除
│   ├── authStore.ts            # ⚠️ 含 token 刷新逻辑，待大幅简化
│   └── persistOptions/
│       ├── i18nPersist.ts      # ⚠️ 待删除
│       └── themePersist.ts     # ⚠️ 含未使用 eslint-disable
├── api/
│   └── auth.ts                 # ⚠️ 直连后端（架构违规），改为调用 BFF
├── infrastructure/
│   └── adapters/auth/
│       └── authService.ts      # ⚠️ 临时适配器，待删除
├── shared/
│   ├── constants/              # ⚠️ LocaleConfig.ts 须改从 @vxture/shared 引入
│   ├── contexts/               # GlobalContext.tsx — 含 i18n 状态，阶段 C 后评估裁剪
│   └── types/                  # ⚠️ 与 src/types/ 重复
├── data/                       # ⚠️ 待审查，确认无 mock 数据混入生产路径
├── types/                      # ⚠️ 与 src/shared/types/ 重复
└── utils/                      # ⚠️ 待审查，归属须符合 Utils 分层规范
```

---

### 1.3 主要问题识别

#### 问题 1：架构违规 — 前端绕过 BFF 直连后端 ⚠️ 最高优先级

`src/api/auth.ts` 直接调用后端服务，`authStore` 在前端持有并管理 JWT token（含刷新定时器逻辑）。

违规规则：
- 前端必须通过 BFF 通信，禁止直接访问 `@vxture/service-*` 或后端服务
- `localStorage` 存 token 存在 XSS 安全风险

修复：搭建 `bff/website-bff`，`src/api/` 所有调用目标改为 BFF 接口。

---

#### 问题 2：i18n 双重实现 ⚠️ 高优先级

现状：
- `src/stores/i18nStore.ts` — 自实现翻译 store
- `src/hooks/useLocale.ts` — 包装 i18nStore
- `src/components/common/I18nSync.tsx` — 手动同步 HTML lang 属性
- next-intl 已配置但未充分使用
- `useLocaleOld.ts` 未清理

违规规则（Locale 分层规范）：
- `Locale` 类型全平台唯一来源为 `@vxture/shared`，禁止应用内重复定义
- `SUPPORTED_LOCALES` / `DEFAULT_LOCALE` 须从 `@vxture/shared` 引入（已确认存在）
- next-intl `routing.ts` 须引用 `@vxture/shared` 中的枚举常量
- 格式化（货币/日期/数字）须使用 `@vxture/shared` 的 `formatCurrency`/`formatDate`/`formatNumber`，不走 next-intl 格式化 API
- `messages/` 目录须按 `zh/` + `en/` 分 namespace 组织，不是单一 `zh.json`

---

#### 问题 3：认证架构混乱 ⚠️ 高优先级

- `api/auth.ts` → `authService.ts` → `authStore` 多层抽象，职责不清
- `authStore` 含 token 刷新定时器等不属于前端的业务逻辑
- `login.tsx` 中 `email` vs `username` 字段不匹配
- `authService.ts` 标记为"临时"但长期存在

---

#### 问题 4：代码质量问题 ⚠️ 中优先级

| 文件 | 问题 |
|------|------|
| `useWindowScrollSnap.ts` | 13 个 React Hook 依赖警告（见问题 5）|
| `Header.tsx` | 未使用的 `theme` 变量 |
| `authService.ts` | 未使用变量、`any` 类型（随文件删除一并解决）|
| `verify-content-system.js` | 使用 `require()` 而非 ESM（改前需确认 `package.json` 中 `"type"` 字段）|
| `StatsSection.tsx`、`themePersist.ts` | 未使用的 eslint-disable 指令 |
| `HeroSection.tsx`（2处）、`Footer.tsx`（1处）| `<img>` 未使用 Next.js `<Image>` |

---

#### 问题 5：`useWindowScrollSnap.ts` 归属判断（任务 D.1 前须明确）

按 Utils 分层规范，依赖 `window`/`document` 的 scroll 工具应归属 `@vxture/platform-browser`。
已确认 `@vxture/platform-browser` 当前只有 `resetWindowScrollTop`，可以扩展。

**执行任务 D.1 前在此处打 ✅ 标记**：

- [ ] **通用滚动行为封装** → 将滚动逻辑迁移至 `@vxture/platform-browser`，应用内 hook 改为 import 使用
- [ ] **website 专用业务逻辑**（如首页滚动吸附特效）→ 留在应用内，用 `useCallback`/`useMemo` 稳定引用或拆分 hook 解决 13 个依赖警告

**注意**：13 个依赖警告通常意味着 hook 设计本身有问题，需修复设计，不允许用 `// eslint-disable` 压制。

---

#### 问题 6：目录结构不规范 ⚠️ 中优先级

- `src/shared/types/` 与 `src/types/` — 类型定义分散在两处
- `src/shared/constants/LocaleConfig.ts` — 须改为从 `@vxture/shared` 引入
- `src/utils/` — 待审查归属（纯函数 → 确认是否与 `@vxture/core-utils` 重复；浏览器 API → `@vxture/platform-browser`；应用专属 → 留应用内，命名改为 `*.utils.ts`）
- `src/data/` — 待确认无 mock 数据混入生产路径
- `src/shared/contexts/GlobalContext.tsx` — 若含 i18n 状态，阶段 C 完成后评估裁剪
- 空目录：`app/metadata/`、`app/providers/`、`app/runtime/`、`stores/global/`、`stores/theme/`、`stores/ui/`

---

#### 问题 7：遗留文件

- `src/hooks/useLocaleOld.ts`
- `src/infrastructure/adapters/auth/authService.ts`
- `src/stores/persistOptions/i18nPersist.ts`
- `src/docs/develop/authdesign.tsx`
- 各空目录内 `.gitkeep` 文件

---

## 二、重构目标

1. 搭建 `bff/website-bff`（NestJS），承接所有前端后端通信，消除架构违规
2. 实现 BFF HttpOnly Cookie Session 认证方案，前端完全不持有 token
3. 统一 i18n，接入 next-intl，Locale 常量唯一来源 `@vxture/shared`
4. 修复全部 ESLint 警告和错误
5. 规范目录结构，符合 Utils 分层规范和 Locale 分层规范
6. 清理全部遗留文件和临时代码

---

## 三、优先级

| 级别 | 内容 |
|------|------|
| **P0（必须完成）** | 任务 0 前置验证；阶段 A website-bff 搭建；阶段 B 认证迁移 |
| **P1（应该完成）** | 阶段 C i18n 统一；阶段 D 代码质量修复；阶段 E 目录结构规范 |
| **P2（可选完成）** | 阶段 F 遗留清理 |

---

## 四、详细重构计划

### 执行顺序总览

```
任务 0    前置验证（确认 @vxture/shared 导出就绪）
  ↓
阶段 E-1  统一类型位置（先清场，避免后续重复修改）
  ↓
阶段 A    搭建 bff/website-bff（NestJS 骨架 + 认证基础设施）
  ↓
阶段 B    迁移认证（前端对接 BFF，删除 authService 适配器）
  ↓
阶段 C    i18n 统一（路由稳定后进行，与阶段 A.6 middleware 协作）
  ↓
阶段 D    代码质量修复（相对独立，可分批提交）
  ↓
阶段 E-2  目录结构规范（剩余整理工作）
  ↓
阶段 F    遗留清理
```

---

### 任务 0：前置验证

**目标**：确认 `@vxture/shared` 中 Locale 相关导出已就绪。

根据 `@vxture/shared` README，以下导出**已确认存在**：

```ts
SUPPORTED_LOCALES  // ['zh', 'en'] as const
DEFAULT_LOCALE     // 'zh'
type Locale        // 'zh' | 'en'
formatCurrency(amount: number, locale: Locale): string
formatDate(date: Date, locale: Locale): string
formatNumber(number: number, locale: Locale): string
```

✅ 无需补充，直接进入阶段 E-1。

**影响文件**：无

---

### 阶段 E-1：统一类型位置（前置执行）

**目标**：在阶段 B 认证重构开始前先整合类型目录，避免同一文件被修改两次。

#### 任务 E-1.1：合并 auth 类型

**操作**：
- 将 `src/shared/types/auth.types.ts` 内容合并到 `src/types/auth.types.ts`
- 更新 `src/types/index.ts` 导出
- 更新所有相关 import 路径

**影响文件**：
- 合并：`src/shared/types/auth.types.ts` → `src/types/auth.types.ts`
- 修改：`src/types/index.ts`
- 修改：所有从 `src/shared/types` 引入 auth 类型的文件

---

### 阶段 A：搭建 bff/website-bff

#### 任务 A.1：初始化 NestJS 项目骨架

**目标**：创建符合平台规范的 BFF 目录结构。

**操作**：

```
bff/website-bff/
├── package.json           # name: "@vxture/bff-website"
├── tsconfig.json          # extends: "../../tsconfig.base.json"
└── src/
    ├── routers/           # 域路由模块（每域一个文件）
    ├── aggregators/       # 跨域数据聚合
    ├── middleware/        # 中间件
    ├── types/             # 面向前端的 DTO 类型
    ├── app.module.ts      # 根模块
    └── main.ts            # 应用入口
```

`tsconfig.json`：
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

`package.json` 核心依赖：
```json
{
  "name": "@vxture/bff-website",
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/swagger": "^11.0.0",
    "@vxture/core-auth": "workspace:*",
    "@vxture/core-config": "workspace:*",
    "@vxture/core-api": "workspace:*",
    "@vxture/core-locale": "workspace:*",
    "@vxture/core-tenant": "workspace:*",
    "@vxture/core-utils": "workspace:*",
    "@vxture/shared": "workspace:*",
    "cookie-parser": "^1.4.7",
    "ioredis": "^5.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "reflect-metadata": "^0.2.0"
  }
}
```

**影响文件**：
- 新建：`bff/website-bff/package.json`
- 新建：`bff/website-bff/tsconfig.json`
- 新建：`bff/website-bff/src/main.ts`

---

#### 任务 A.2：注册 AppModule 及核心模块

**目标**：注册平台核心基础设施。

`src/app.module.ts`：
```ts
import { Module } from '@nestjs/common';
import { VxConfigModule } from '@vxture/core-config';

@Module({
  imports: [
    VxConfigModule.register({
      domains: ['app', 'redis', 'auth'],
    }),
    // 后续任务逐步注册：AuthModule、RouterModules
  ],
})
export class AppModule {}
```

**影响文件**：
- 新建：`bff/website-bff/src/app.module.ts`

---

#### 任务 A.3：实现中间件

**目标**：实现认证、租户、locale 三个中间件，执行顺序：`auth → tenant → locale → router`。

**`src/middleware/auth.middleware.ts`** 职责：
1. 从 Cookie 读取 `vx_refresh_token`，判断 session 是否存在
2. 从 Redis 读取对应 access token（key：`session:{userId}`）
3. 调用 `VxJwtClient.verifyAccessToken()` 验证有效性
4. 有效则将 `AuthUser`（`userId`、`email`、`role`、`permissions`）挂载至请求上下文
5. 无效则清除 Cookie，返回 401
6. 标记 `@Public()` 的路由跳过验证

**`src/middleware/tenant.middleware.ts`** 职责：
1. 调用 `TenantDetector.detectFromHeaders()` 从请求 header 解析 `tenantId`
2. 调用 `TenantManager.setTenantContext()` 注入租户上下文
3. 所有路由处理器通过上下文获取 `tenantId`，无需重复解析

**`src/middleware/locale.middleware.ts`** 职责：
1. 调用 `resolveLocale(request)` 解析 locale（优先级：Cookie `NEXT_LOCALE` → `Accept-Language` → `DEFAULT_LOCALE`）
2. 将解析结果注入请求上下文（`request.locale`）
3. 需要多语言响应的路由中调用 `localizeContent()` 按 locale 取值

**影响文件**：
- 新建：`bff/website-bff/src/middleware/auth.middleware.ts`
- 新建：`bff/website-bff/src/middleware/tenant.middleware.ts`
- 新建：`bff/website-bff/src/middleware/locale.middleware.ts`

---

#### 任务 A.4：实现 auth router

**目标**：实现前端认证接口，完成 BFF Session 方案核心逻辑。

`src/routers/auth.router.ts` 接口设计：

| Method | Path | 描述 | 认证要求 |
|--------|------|------|----------|
| `POST` | `/api/auth/login` | 登录，设置 HttpOnly Cookie | `@Public()` |
| `POST` | `/api/auth/logout` | 登出，清除 Cookie + Redis | 需认证 |
| `POST` | `/api/auth/refresh` | 刷新 token（BFF 内部处理）| Cookie |
| `GET`  | `/api/auth/me` | 返回当前用户信息 DTO | 需认证 |

登录流程核心逻辑：
```ts
// POST /api/auth/login
// 1. 验证 LoginDto（email: string, password: string）
// 2. 调用 VxHttpClient 请求后端认证服务获取 token pair
// 3. 将 accessToken 存入 Redis：
//    SET session:{userId} {accessToken} EX {expiresIn}
// 4. 将 refreshToken 写入 HttpOnly Cookie：
//    res.cookie('vx_refresh_token', refreshToken, {
//      httpOnly: true,
//      secure: true,
//      sameSite: 'strict',
//      maxAge: 7 * 24 * 60 * 60 * 1000,
//      path: '/',
//    })
// 5. 返回用户信息 DTO（不含任何 token）
```

`src/types/auth.types.ts` DTO 定义：
```ts
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// 返回给前端的用户信息（authStore 存储此结构）
export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: string;
}
```

**影响文件**：
- 新建：`bff/website-bff/src/routers/auth.router.ts`
- 新建：`bff/website-bff/src/types/auth.types.ts`

---

#### 任务 A.5：配置前端 middleware（语言路由 + 认证保护）

**目标**：在 `portals/website/src/middleware.ts` 中协调 next-intl 语言检测与认证重定向，两者共存于同一文件。

`portals/website/src/middleware.ts` 实现要点：
```ts
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const isProtectedRoute = request.nextUrl.pathname.includes('/dashboard');
  const hasSession = request.cookies.has('vx_refresh_token');

  // 认证重定向（在 intl 处理之前）
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 交给 next-intl 处理语言前缀路由
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

**注意**：此文件在阶段 A 创建基础结构，阶段 C.3 时补充 intlMiddleware 的完整集成。两个阶段共同维护同一文件，需注意顺序不能颠倒：认证判断在前，intlMiddleware 在后。

**影响文件**：
- 新建：`portals/website/src/middleware.ts`

---

### 阶段 B：迁移认证

#### 任务 B.1：简化前端 authStore

**目标**：删除所有 token 相关逻辑，只保留 UI 所需状态。

重构 `src/stores/authStore.ts`：
- **删除**：`token`、`refreshToken`、`tokenExpiry` 字段
- **删除**：`refreshTokenAction` 方法及定时器逻辑
- **删除**：所有 token 相关 `localStorage` 操作
- **保留**：`user`（`{ id, name, email, role }`）、`isAuthenticated`
- **保留**：Zustand persist（仅持久化 `user` 和 `isAuthenticated`，用于页面刷新后恢复 UI 状态）
- **简化** `login` / `logout`：只做状态赋值，不做 API 调用

新建 `src/hooks/useAuth.ts`，承接从 authStore 移出的业务调用逻辑：
```ts
// 职责：调用 BFF auth 接口，完成后更新 authStore 状态
export function useAuth() {
  const { setUser, clearUser } = useAuthStore();

  const login = async (email: string, password: string) => {
    // 调用 POST /api/auth/login（BFF 接口）
    // 成功后收到 AuthUserDto，调用 setUser() 更新 store
  };

  const logout = async () => {
    // 调用 POST /api/auth/logout（BFF 接口）
    // 完成后调用 clearUser() 清除 store
  };

  return { login, logout };
}
```

**影响文件**：
- 修改：`src/stores/authStore.ts`
- 新建：`src/hooks/useAuth.ts`

---

#### 任务 B.2：重构前端 API 层

**目标**：将 `src/api/auth.ts` 调用目标改为 BFF 接口，移除直连后端逻辑和临时适配器。

重构 `src/api/auth.ts`：
- **删除**：直接调用后端服务的 baseURL 配置
- **删除**：token 存取 `localStorage` 操作
- **改为**：调用 BFF 接口（`/api/auth/login`、`/api/auth/logout`、`/api/auth/me`）
- **统一**：登录字段使用 `email`，与 BFF `LoginDto` 对齐

删除 `src/infrastructure/adapters/auth/authService.ts`。

**影响文件**：
- 修改：`src/api/auth.ts`
- 删除：`src/infrastructure/adapters/auth/authService.ts`

---

#### 任务 B.3：更新认证页面

**目标**：修复登录/注册页面字段问题，对接 `useAuth` hook。

**操作**：
- 修复 `src/app/(auth)/login/login.tsx`：统一使用 `email` 字段，改用 `useAuth().login()`
- 修复 `src/app/(auth)/signup/signup.tsx`：字段与 BFF DTO 对齐

**影响文件**：
- 修改：`src/app/(auth)/login/login.tsx`
- 修改：`src/app/(auth)/signup/signup.tsx`

---

### 阶段 C：i18n 系统统一

> **前置条件**：阶段 A.5 中 `src/middleware.ts` 已创建，阶段 C.3 在其基础上补充完整 intlMiddleware 集成。

#### 任务 C.1：创建 next-intl 核心文件

**目标**：按 Locale 分层规范建立标准 i18n 结构。

`src/lib/i18n/routing.ts`：
```ts
import { defineRouting } from 'next-intl/routing';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@vxture/shared';

export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,   // ['zh', 'en']
  defaultLocale: DEFAULT_LOCALE, // 'zh'
});
```

`src/lib/i18n/navigation.ts`：
```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, useRouter, usePathname } = createNavigation(routing);
// 应用内所有路由跳转和 Link 组件统一从此文件引入
```

`src/lib/i18n/request.ts`：
```ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? routing.defaultLocale;
  const messages = {
    common:    (await import(`../../../messages/${locale}/common.json`)).default,
    nav:       (await import(`../../../messages/${locale}/nav.json`)).default,
    marketing: (await import(`../../../messages/${locale}/marketing.json`)).default,
    pricing:   (await import(`../../../messages/${locale}/pricing.json`)).default,
    checkout:  (await import(`../../../messages/${locale}/checkout.json`)).default,
    legal:     (await import(`../../../messages/${locale}/legal.json`)).default,
  };
  return { locale, messages };
});
```

`src/types/i18n.types.ts`（类型安全配置）：
```ts
import zh from '../../messages/zh';
type Messages = typeof zh;
declare global {
  interface IntlMessages extends Messages {}
}
```

**影响文件**：
- 新建：`src/lib/i18n/routing.ts`
- 新建：`src/lib/i18n/navigation.ts`
- 新建：`src/lib/i18n/request.ts`
- 新建：`src/types/i18n.types.ts`

---

#### 任务 C.2：创建翻译资源文件

**目标**：按 Locale 分层规范建立翻译文件目录，迁移现有翻译内容。

**目录结构**（放在项目根目录 `messages/`）：
```
messages/
├── zh/
│   ├── common.json     # 通用词（确认、取消、加载中…）
│   ├── nav.json        # 导航
│   ├── marketing.json  # 营销页
│   ├── pricing.json    # 定价页
│   ├── checkout.json   # 下单流程
│   └── legal.json      # 法律条款
└── en/
    └── （同上结构）
```

**重要**：locale 标识符使用 `zh` / `en`，与 `@vxture/shared` 中 `SUPPORTED_LOCALES = ['zh', 'en']` 严格对齐，不使用 `zh-CN` / `en-US`。

**操作**：将 `i18nStore` 中现有翻译内容迁移到对应 namespace JSON 文件。

**影响文件**：
- 新建：`messages/zh/*.json`（6 个文件）
- 新建：`messages/en/*.json`（6 个文件）

---

#### 任务 C.3：更新 App Router 集成

**目标**：正确集成 next-intl 到 App Router，补完 middleware。

**操作**：
- 创建 `src/app/[locale]/` 目录结构，将现有页面移入 `[locale]` 层级
- 更新 `src/app/[locale]/layout.tsx`，接入 next-intl Provider
- 更新 `src/middleware.ts`（补充阶段 A.5 创建的文件），确认 intlMiddleware 集成完整

**影响文件**：
- 新建/调整：`src/app/[locale]/` 目录结构
- 修改：`src/app/[locale]/layout.tsx`
- 修改：`src/middleware.ts`（补充 intlMiddleware）

---

#### 任务 C.4：替换自定义 Hook 和 Store

**目标**：用 next-intl API 替换自定义实现，格式化函数改用 `@vxture/shared`。

**前端 i18n API 正确用法**：
```ts
// 翻译文案 → next-intl
import { useTranslations } from 'next-intl';
const t = useTranslations('marketing');
<h1>{t('hero.title')}</h1>

// 获取当前 locale → next-intl
import { useLocale } from 'next-intl';
const locale = useLocale();

// 格式化（货币/日期/数字）→ @vxture/shared，不通过 next-intl 格式化 API
import { formatCurrency } from '@vxture/shared';
<span>{formatCurrency(amount, locale)}</span>

// 路由跳转 → src/lib/i18n/navigation.ts
import { Link, useRouter } from '@/lib/i18n/navigation';
```

**删除操作**：
- 删除：`src/stores/i18nStore.ts`
- 删除：`src/stores/persistOptions/i18nPersist.ts`
- 删除：`src/components/common/I18nSync.tsx`
- 删除：`src/hooks/useLocaleOld.ts`
- 修改/删除：`src/hooks/useLocale.ts`（改为直接使用 `useLocale` from `next-intl`，或删除后调用方直接引入）
- 修改：所有使用旧 `t()` 的组件，改为 `useTranslations(namespace)`

**影响文件**：
- 删除：上述 4 个文件
- 修改/删除：`src/hooks/useLocale.ts`
- 修改：所有使用翻译的组件

---

#### 任务 C.5：清理 locale 相关常量和类型

**操作**：
- 删除 `src/shared/constants/LocaleConfig.ts`（统一从 `@vxture/shared` 引入）
- 评估 `src/shared/contexts/GlobalContext.tsx`：若含 i18n 状态则裁剪，next-intl Provider 已接管
- 更新所有相关 import

**影响文件**：
- 删除：`src/shared/constants/LocaleConfig.ts`
- 修改（评估后）：`src/shared/contexts/GlobalContext.tsx`
- 修改：所有相关 import

---

### 阶段 D：代码质量修复

#### 任务 D.1：判断并修复 useWindowScrollSnap.ts

**前置**：在问题 5 处打 ✅ 标记，明确归属后再执行。

**若为通用工具（迁移路径）**：
- 在 `@vxture/platform-browser` 的 `src/utils/` 中新增 scroll 工具函数（扩展现有包）
- 应用内 hook 改为 import 后调用

**若为 website 专用（留应用内路径）**：
- 用 `useCallback`/`useMemo` 稳定函数引用，或将 hook 拆分为职责更单一的小 hook
- 不允许用 `// eslint-disable` 压制警告

**影响文件**：
- 修改：`src/hooks/useWindowScrollSnap.ts`
- 可能新增：`packages/platform/browser/src/utils/scroll.utils.ts`

---

#### 任务 D.2：修复其余 ESLint 问题

**操作逐项**：

1. **`Header.tsx`**：删除未使用的 `theme` 变量

2. **`verify-content-system.js`**：
   - 先检查 `package.json` 中 `"type"` 字段
   - 若为 `"module"` → 直接转为 `import`/`export` 语法
   - 若无 `"type"` → 重命名为 `.mjs` 后使用 ESM

3. **未使用的 eslint-disable 指令**：
   - `src/components/home/StatsSection.tsx` — 删除对应指令
   - `src/stores/persistOptions/themePersist.ts` — 删除对应指令

4. **`<img>` 替换为 Next.js `<Image>`**：
   - `src/components/home/HeroSection.tsx`（2 处）
   - `src/components/layout/Footer.tsx`（1 处）

**影响文件**：
- 修改：`src/components/layout/Header.tsx`
- 修改：`scripts/verify-content-system.js`（或重命名 `.mjs`）
- 修改：`src/components/home/StatsSection.tsx`
- 修改：`src/stores/persistOptions/themePersist.ts`
- 修改：`src/components/home/HeroSection.tsx`
- 修改：`src/components/layout/Footer.tsx`

---

#### 任务 D.3：运行并验证修复

```bash
pnpm lint          # 确保无错误无警告
pnpm type-check    # 确保无类型错误
pnpm build         # 确保构建成功
```

---

### 阶段 E-2：目录结构规范（剩余整理）

#### 任务 E-2.1：统一常量位置

**操作**：
- 将 `src/shared/constants/authConfig.ts` → `src/constants/auth.constants.ts`
- 将 `src/shared/constants/themeConfig.ts` → `src/constants/theme.constants.ts`
- 删除 `src/shared/constants/` 目录（`LocaleConfig.ts` 已在阶段 C.5 删除）
- 更新所有相关 import

**影响文件**：
- 移动：`src/shared/constants/authConfig.ts` → `src/constants/auth.constants.ts`
- 移动：`src/shared/constants/themeConfig.ts` → `src/constants/theme.constants.ts`
- 删除：`src/shared/constants/` 目录
- 修改：所有相关 import

---

#### 任务 E-2.2：审查 src/utils/ 归属

**目标**：按 Utils 分层规范对 `src/utils/` 中每个文件判断归属。

判断流程：
- **纯函数** → 确认是否与 `@vxture/core-utils` 中已有函数重复；重复则删除，改从包引入
- **依赖 `window`/`document`** → 迁移至 `@vxture/platform-browser`
- **website 专属工具** → 留应用内，文件命名改为 `*.utils.ts`

**操作**：执行前补充每个文件的归属判断清单，再逐一处理。

---

#### 任务 E-2.3：审查 src/data/ 目录

**目标**：确认无 mock 数据混入生产路径。

**操作**：
- 检查 `src/data/` 下所有文件，确认是否在生产代码中被 import
- 生产代码中的 mock 数据 import 须改为通过 BFF 接口获取
- 仅用于测试/开发的文件标注清楚，不得进入生产构建

---

#### 任务 E-2.4：清理空目录

**操作**：删除以下仅含 `.gitkeep` 的空目录：
- `src/app/metadata/`
- `src/app/providers/`
- `src/app/runtime/`
- `src/stores/global/`
- `src/stores/theme/`
- `src/stores/ui/`

---

### 阶段 F：清理遗留文件（P2）

#### 任务 F.1：移除临时文件

**操作**：
- 删除 `src/docs/develop/authdesign.tsx`（若需保留，移至项目根目录 `docs/` 下）
- 确认 `src/infrastructure/` 目录已清空（adapters 已在阶段 B.2 删除），清空后删除目录

**影响文件**：
- 删除：`src/docs/develop/authdesign.tsx`
- 删除：`src/infrastructure/` 目录（若已清空）

---

## 五、验证标准

### 5.1 架构合规验证
- [ ] `portals/website` 无直接调用后端服务的 HTTP 请求，所有请求目标均为 BFF 接口（`/api/*`）
- [ ] 前端代码中无 `@vxture/core-*`、`@vxture/service-*`、`@vxture/ai-sdk` import
- [ ] `bff/website-bff` 中无 `@vxture/design-system`、`@vxture/platform-*`、`@vxture/ai-sdk` import

### 5.2 认证安全验证
- [ ] 前端 `localStorage` 中无任何 token 存储
- [ ] `authStore` 中无 token 字段和刷新定时器逻辑
- [ ] 登录响应中前端收到的数据只含用户信息（id、name、email、role），不含 token
- [ ] `vx_refresh_token` Cookie 标记为 `HttpOnly` + `Secure` + `SameSite=Strict`
- [ ] access token 仅存在于 BFF Redis 中，不出现在任何 HTTP 响应体

### 5.3 i18n 规范验证
- [ ] 无应用内自定义 `Locale` 类型定义，全部来源于 `@vxture/shared`
- [ ] `routing.ts` 使用 `@vxture/shared` 中的 `SUPPORTED_LOCALES` 和 `DEFAULT_LOCALE`
- [ ] `messages/` 目录使用 `zh/` 和 `en/`（非 `zh-CN` / `en-US`），按 namespace 拆分
- [ ] 格式化（货币/日期/数字）使用 `@vxture/shared` 的函数，不使用 next-intl 格式化 API
- [ ] `navigation.ts` 已创建，应用内路由跳转使用其导出的 `Link`/`redirect`/`useRouter`
- [ ] `@vxture/design-system` 组件内部无 `useTranslations` 调用（只接收翻译好的字符串作为 props）

### 5.4 功能验证
- [ ] 所有页面正常加载
- [ ] 语言切换功能正常（`zh` ↔ `en`）
- [ ] 登录/登出流程正常
- [ ] 页面刷新后认证状态（用户信息）正常恢复
- [ ] 路由语言前缀（`/zh/`、`/en/`）和重定向正常

### 5.5 代码质量验证
- [ ] `pnpm lint` 无错误无警告
- [ ] `pnpm type-check` 无错误
- [ ] `pnpm build` 成功
- [ ] `useWindowScrollSnap.ts` 归属判断已明确并处理

### 5.6 路由回归验证
- [ ] `/` 正确重定向到 `/{defaultLocale}/`
- [ ] 所有 `<Link>` 组件已改用 `src/lib/i18n/navigation.ts` 导出的 `Link`
- [ ] 中间件中认证重定向逻辑在 intlMiddleware 之前执行，两者不互相干扰

---

## 六、风险评估

### 6.1 高风险项

| 风险 | 描述 | 缓解措施 |
|------|------|----------|
| i18n 路由变更 | 引入 `[locale]` 后所有路径结构变化，影响现有链接和 SEO | 确保中间件重定向正确；测试所有路由；全局搜索 hardcoded 路径 |
| 认证方案迁移 | 从前端 localStorage token 切换到 BFF Cookie Session，登录流程全面变化 | 充分测试登录/登出/刷新/页面刷新场景；保留回滚方案 |
| middleware 协调 | next-intl 和认证重定向共存于同一 middleware 文件 | 认证判断在前，intlMiddleware 在后；阶段 A.5 和阶段 C.3 协同维护同一文件 |

### 6.2 中风险项

| 风险 | 描述 | 缓解措施 |
|------|------|----------|
| 目录结构重构 | import 路径批量变更 | 使用 IDE 重构功能，确保所有 import 更新正确 |
| messages locale 标识符 | 从 `zh-CN` 改为 `zh` | 全局搜索 `zh-CN` / `en-US` 确保无遗漏 |

### 6.3 低风险项

- ESLint 修复：大部分为孤立的警告修复，影响面小
- 遗留文件清理：删除不再使用的文件

---

## 七、回滚计划

| 阶段 | 回滚方案 |
|------|----------|
| 认证方案变更（阶段 B）| 恢复 `authStore` 原有 token 逻辑，恢复 `src/api/auth.ts` 直连后端 |
| i18n 变更（阶段 C）| 恢复使用自定义 i18nStore，删除 `[locale]` 路由结构 |
| 目录结构重构（阶段 E）| 使用 `git revert` 恢复原目录结构 |
| BFF 搭建（阶段 A）| `bff/website-bff` 为新增目录，回滚直接删除即可 |

---

## 八、技术债记录（本次不修，后续跟进）

| 编号 | 描述 | 影响层 | 建议优先级 |
|------|------|--------|-----------|
| TD-01 | `src/utils/` 中可能存在与 `@vxture/core-utils` 重复的纯函数实现（如 `debounce`、`formatDate`）| 维护成本 | P2 |
| TD-02 | BFF Session 方案中 access token 存 Redis，高并发下可评估引入本地 LRU 内存缓存作为一级缓存，减少 Redis 读压力 | 性能 | P3 |
| TD-03 | `src/shared/contexts/GlobalContext.tsx` 阶段 C 后需评估是否仍有存在必要，可能可以完全删除 | 代码整洁 | P2 |

---

_文档结束_