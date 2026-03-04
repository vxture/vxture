# Vxture Monorepo 架构规划

> 更新时间: 2026-03-04
> 架构模式: PNPM Monorepo + 模块化包设计

---

## 📋 业务全景图

根据 [CLAUDE.md](CLAUDE.md)，Vxture 是一个**智能云服务平台**，包含以下核心业务模块：

| 业务模块 | 说明 |
|---------|------|
| 企业官网 | 对外展示、营销页面 |
| 运营平台 | 内部运营、系统管理 |
| 租户平台 | 租户自助服务、控制台 |
| 账户系统 | 用户、认证、SSO |
| 权限管理 | RBAC、权限控制 |
| 订阅授权 | 计费、套餐、授权 |
| 工单系统 | 客服工单、支持 |
| 系统监测 | 监控、告警、日志 |
| 智能体服务 | AI 智能体业务 |
| 大模型接入 | LLM 接入层 |

---

## 🏗️ 包架构设计

### 设计原则

1. **单一职责**: 每个包只负责一个明确的功能域
2. **依赖方向**: 应用 → 共享 → 基础，禁止反向依赖
3. **可独立发布**: 共享包可独立版本发布
4. **边界清晰**: 避免包之间的循环依赖

---

### 最终包结构（7-9 个包）

```
vxture/
├── packages/
│   │
│   ├── 🎨 基础层 (Foundations)
│   ├── foundations/
│   │   ├── tsconfig/          # 共享 TS 配置
│   │   ├── eslint-config/     # 共享 ESLint 配置
│   │   └── tailwind-preset/   # 共享 Tailwind 配置
│   │
│   ├── 🔧 共享核心层 (Shared Core)
│   ├── shared/
│   │   ├── types/              # 共享类型定义
│   │   ├── utils/              # 工具函数库
│   │   └── constants/          # 常量配置
│   │
│   ├── 🎨 UI 组件层 (UI Components)
│   ├── ui/
│   │   ├── design-system/      # 基础设计系统（原 design-system）
│   │   ├── components/         # 业务组件库
│   │   └── composables/        # React Hooks 库
│   │
│   ├── 🌐 业务应用层 (Business Apps)
│   ├── apps/
│   │   ├── website/            # 企业官网（原 web）
│   │   ├── admin-portal/       # 运营平台（新增）
│   │   └── tenant-portal/      # 租户平台（新增）
│   │
│   ├── 🔌 API 服务层 (API Services)
│   ├── services/
│   │   ├── api-gateway/        # API 网关（原 api 拆分）
│   │   ├── account-service/    # 账户服务
│   │   ├── billing-service/    # 订阅计费服务
│   │   └── agent-service/      # 智能体服务
│   │
│   └── 📦  SDK 层 (SDKs)
│   └── sdks/
│       ├── api-client/         # TypeScript API 客户端
│       └── python-sdk/         # Python SDK
│
├── docs/                        # 项目文档
├── tools/                       # 构建工具脚本
└── [root configs]
```

---

## 📦 包详细设计

### 1️⃣ foundations/ - 基础配置层

**职责**: 统一管理开发工具配置

| 包名 | 说明 | 被依赖 |
|------|------|--------|
| `@vxture/tsconfig` | 共享 TypeScript 配置 | 所有 TS 包 |
| `@vxture/eslint-config` | 共享 ESLint 配置 | 所有 TS 包 |
| `@vxture/tailwind-preset` | 共享 Tailwind 预设 | 所有前端包 |

**依赖**: 无

---

### 2️⃣ shared/ - 共享核心层

**职责**: 跨应用共享的纯逻辑、类型、工具

| 包名 | 说明 | 内容 |
|------|------|------|
| `@vxture/shared-types` | 共享类型 | API DTOs、领域类型、通用类型 |
| `@vxture/utils` | 工具函数 | 日期、字符串、验证、格式化 |
| `@vxture/constants` | 常量配置 | 路由、权限码、主题常量 |

**依赖**: 无（仅依赖 TypeScript）

**示例结构**:
```
shared/types/
├── src/
│   ├── auth.types.ts          # 认证相关类型
│   ├── user.types.ts          # 用户相关类型
│   ├── subscription.types.ts  # 订阅相关类型
│   ├── api.types.ts           # API 通用类型
│   └── index.ts
└── package.json
```

---

### 3️⃣ ui/ - UI 组件层

**职责**: 可复用的 React 组件和 Hooks

| 包名 | 说明 | 依赖 |
|------|------|------|
| `@vxture/design-system` | 基础设计系统 | React、react-icons |
| `@vxture/components` | 业务组件库 | design-system、shared-types |
| `@vxture/composables` | React Hooks 库 | zustand、react-query |

#### @vxture/design-system（原 design-system）
**内容**: 原子组件
- Button、Input、Select、Checkbox
- Card、Modal、Dropdown、Tooltip
- Alert、Badge、Progress、Spinner
- Layout（Grid、Flex、Container）

#### @vxture/components（新增）
**内容**: 业务组件
- 认证：LoginForm、SignupForm、UserMenu
- 布局：Header、Footer、Sidebar、Breadcrumb
- 通用：Notifications、ThemeSwitcher、LanguageSwitcher
- 业务：ProductCard、PricingTable、FeatureList

#### @vxture/composables（新增）
**内容**: 可复用 Hooks
- `useTheme()`、`useI18n()`、`useAuth()`
- `useNotification()`、`useLocalStorage()`
- `useDebounce()`、`useToggle()`、`usePrevious()`

---

### 4️⃣ apps/ - 业务应用层

**职责**: 独立的 Next.js 应用

| 包名 | 说明 | 端口 | 依赖 |
|------|------|------|------|
| `@vxture/website` | 企业官网（原 web） | 3000 | design-system、components、composables |
| `@vxture/admin-portal` | 运营平台 | 3001 | design-system、components、composables |
| `@vxture/tenant-portal` | 租户平台 | 3002 | design-system、components、composables |

#### @vxture/website（原 web）
**定位**: 企业官网、营销页面
**页面**:
- `/` - 首页
- `/about` - 关于我们
- `/products` - 产品
- `/pricing` - 定价
- `/login` - 登录
- `/signup` - 注册

**内部架构**: 保持四层 Clean Architecture
```
src/
├── app/                    # Next.js App Router
├── presentation/           # 表现层
├── application/            # 应用层
├── domain/                 # 领域层
├── infrastructure/         # 基础设施层
├── stores/                 # Zustand 状态
└── shared/                 # 应用内共享（可迁移到上层）
```

#### @vxture/admin-portal（新增）
**定位**: 内部运营管理平台
**页面**:
- `/dashboard` - 仪表板
- `/users` - 用户管理
- `/tenants` - 租户管理
- `/subscriptions` - 订阅管理
- `/tickets` - 工单管理
- `/settings` - 系统设置

#### @vxture/tenant-portal（新增）
**定位**: 租户自助服务平台
**页面**:
- `/dashboard` - 租户仪表板
- `/agents` - 智能体管理
- `/billing` - 账单与订阅
- `/members` - 团队成员
- `/settings` - 租户设置

---

### 5️⃣ services/ - API 服务层

**职责**: 后端微服务（Python FastAPI）

| 包名 | 说明 | 端口 |
|------|------|------|
| `@vxture/api-gateway` | API 网关 | 8000 |
| `@vxture/account-service` | 账户服务 | 8001 |
| `@vxture/billing-service` | 订阅计费服务 | 8002 |
| `@vxture/agent-service` | 智能体服务 | 8003 |

**注**: 由原 `api` 包拆分而来，初期可仍为单体服务，逐步拆分。

---

### 6️⃣ sdks/ - SDK 层

**职责**: 封装好的客户端 SDK

| 包名 | 说明 | 语言 | 被依赖 |
|------|------|------|--------|
| `@vxture/api-client` | TypeScript API 客户端 | TS/JS | apps/* |
| `@vxture/python-sdk` | Python SDK | Python | services/* |

---

## 📊 当前 → 目标迁移路径

### Phase 1: 抽离共享层（低风险）

| 当前 | 目标 | 说明 |
|------|------|------|
| `packages/design-system` | `packages/ui/design-system` | 重命名，保持不变 |
| `packages/web/src/shared/*` | `packages/shared/*` | 抽离到独立包 |
| `packages/web/src/stores/*` | `packages/ui/composables` | 通用 Hooks 抽离 |

### Phase 2: 拆分 web 应用（中风险）

| 当前 | 目标 | 说明 |
|------|------|------|
| `packages/web` | `packages/apps/website` | 重命名为 website |
| - | `packages/apps/admin-portal` | 新建运营平台 |
| - | `packages/apps/tenant-portal` | 新建租户平台 |

### Phase 3: 完善 UI 层（中风险）

| 目标 | 说明 |
|------|------|
| `packages/ui/components` | 从 website 抽离业务组件 |
| `packages/ui/composables` | 从 website 抽离通用 Hooks |

### Phase 4: 后端拆分（高风险）

| 当前 | 目标 |
|------|------|
| `packages/api` | `packages/services/api-gateway` |

---

## 🎯 推荐实施策略

### 方案 A: 渐进式迁移（推荐）

**优点**: 风险低、可回滚、不影响现有开发

1. **保持现有 3 个包不变**
2. **新增 `packages/shared/*` 包**，逐步迁移代码
3. **website 继续开发**，新功能依赖 `@vxture/shared`
4. **时机成熟时**再拆分 `admin-portal`、`tenant-portal`

### 方案 B: 一次性重构

**优点**: 一步到位、架构清晰

**缺点**: 风险高、周期长、可能阻塞业务开发

---

## 📁 完整目录树（最终态）

```
vxture/
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
├── CLAUDE.md
├── CODE_STYLE.md
├── MONOREPO_ARCHITECTURE.md
│
├── packages/
│   ├── foundations/
│   │   ├── tsconfig/
│   │   ├── eslint-config/
│   │   └── tailwind-preset/
│   │
│   ├── shared/
│   │   ├── types/
│   │   │   ├── src/
│   │   │   │   ├── auth.types.ts
│   │   │   │   ├── user.types.ts
│   │   │   │   ├── subscription.types.ts
│   │   │   │   ├── i18n.types.ts
│   │   │   │   ├── theme.types.ts
│   │   │   │   └── index.ts
│   │   │   └── package.json
│   │   ├── utils/
│   │   │   ├── src/
│   │   │   │   ├── date.ts
│   │   │   │   ├── string.ts
│   │   │   │   ├── validation.ts
│   │   │   │   └── index.ts
│   │   │   └── package.json
│   │   └── constants/
│   │       ├── src/
│   │       │   ├── routes.ts
│   │       │   ├── permissions.ts
│   │       │   └── index.ts
│   │       └── package.json
│   │
│   ├── ui/
│   │   ├── design-system/
│   │   │   ├── src/
│   │   │   │   ├── components/
│   │   │   │   │   ├── Button/
│   │   │   │   │   ├── Input/
│   │   │   │   │   ├── Card/
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   └── package.json
│   │   ├── components/
│   │   │   ├── src/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   └── UserMenu.tsx
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   └── Footer.tsx
│   │   │   │   ├── common/
│   │   │   │   │   ├── Notifications.tsx
│   │   │   │   │   ├── ThemeSwitcher.tsx
│   │   │   │   │   └── LanguageSwitcher.tsx
│   │   │   │   └── index.ts
│   │   │   └── package.json
│   │   └── composables/
│   │       ├── src/
│   │       │   ├── useTheme.ts
│   │       │   ├── useI18n.ts
│   │       │   ├── useAuth.ts
│   │       │   ├── useNotification.ts
│   │       │   └── index.ts
│   │       └── package.json
│   │
│   ├── apps/
│   │   ├── website/
│   │   │   ├── src/
│   │   │   │   ├── app/
│   │   │   │   ├── presentation/
│   │   │   │   ├── application/
│   │   │   │   ├── domain/
│   │   │   │   ├── infrastructure/
│   │   │   │   └── stores/
│   │   │   ├── public/
│   │   │   └── package.json
│   │   ├── admin-portal/
│   │   │   ├── src/
│   │   │   │   ├── app/
│   │   │   │   ├── presentation/
│   │   │   │   ├── application/
│   │   │   │   ├── domain/
│   │   │   │   └── infrastructure/
│   │   │   └── package.json
│   │   └── tenant-portal/
│   │       ├── src/
│   │       │   ├── app/
│   │       │   ├── presentation/
│   │       │   ├── application/
│   │       │   ├── domain/
│   │       │   └── infrastructure/
│   │       └── package.json
│   │
│   ├── services/
│   │   ├── api-gateway/
│   │   ├── account-service/
│   │   ├── billing-service/
│   │   └── agent-service/
│   │
│   └── sdks/
│       ├── api-client/
│       └── python-sdk/
│
├── docs/
└── tools/
```

---

## 🔗 依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│                      apps/* (website/portal)                 │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
┌──────────────▼──────────┐  ┌───────────▼──────────────┐
│   ui/components         │  │      ui/composables       │
└──────────────┬──────────┘  └───────────┬──────────────┘
               │                          │
┌──────────────▼──────────┐  ┌───────────▼──────────────┐
│  ui/design-system       │  │      sdks/api-client      │
└──────────────┬──────────┘  └───────────┬──────────────┘
               │                          │
└──────────────┴──────────┬───────────────┴──────────────┘
                           │
                ┌──────────▼──────────┐
                │  shared/* (types/    │
                │   utils/constants)   │
                └──────────┬──────────┘
                           │
                ┌──────────▼──────────┐
                │  foundations/*       │
                └─────────────────────┘
```

---

## 📝 总结

| 维度 | 当前（3 包） | 目标（7-9 包） |
|------|-------------|----------------|
| 共享代码 | web 内部 | 独立 shared 包 |
| 组件复用 | 无 | design-system + components |
| Hooks 复用 | 无 | composables 包 |
| 多应用 | 仅 website | website + admin + tenant |
| 后端 | 单体 api | 可拆分为微服务 |
| SDK | 无 | api-client + python-sdk |

---

**最后更新**: 2026-03-04
**维护者**: vxture team
