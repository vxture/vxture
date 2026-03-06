# Vxture Monorepo 架构规划

> 创建人: Stone Smoker
> 创建时间: 2026-03-06

---

## 1. 仓库规划

### 1.1 项目概述

Vxture 是一个**大模型和智能体服务平台**，采用 PNPM Monorepo 架构进行统一管理。

### 1.2 设计原则

1. **分层清晰**: 门户应用与业务应用分离，共享与实现分离
2. **依赖单向**: 应用 → 共享 → 基础，禁止反向依赖
3. **高内聚低耦合**: 每个包职责单一，边界清晰
4. **可演进**: 支持从单体到微服务的渐进式演进

---

## 2. 包规划

### 2.1 包分类与职责

```
vxture/
├── packages/
│   ├── portals/        # 门户应用（通用、面向所有用户）
│   ├── business/      # 业务级应用（业务聚焦、面向特定用户）
│   ├── services/      # 后端服务（统一归集）
│   ├── design-system/ # 设计系统
│   └── shared/        # 共享包
└── docs/              # 项目文档
```

### 2.2 包总览

| 分类     | 包名                     | 说明                 | 端口 | 状态      |
| -------- | ------------------------ | -------------------- | ---- | --------- |
| portals  | `@vxture/website`        | 企业官网             | 3000 | ✅ 已实现 |
| portals  | `@vxture/admin`          | 运营管理平台         | 3001 | ⏳ 待开发 |
| portals  | `@vxture/tenant`         | 租户管理平台         | 3002 | ⏳ 待开发 |
| business | `@vxture/ruinagent`      | RuinAgent 智能体应用 | -    | ⏳ 待开发 |
| services | `@vxture/gateway`        | API 网关/公共服务    | 8000 | ✅ 已实现 |
| services | `@vxture/auth`           | 认证服务             | 8001 | ⏳ 待开发 |
| services | `@vxture/billing`        | 计费服务             | 8002 | ⏳ 待开发 |
| services | `@vxture/workers`        | 异步任务处理         | 8003 | ⏳ 待开发 |
| -        | `@vxture/design-system`  | 设计系统             | -    | ✅ 已实现 |
| shared   | `@vxture/shared-types`   | TypeScript 类型      | -    | ✅ 已实现 |
| shared   | `@vxture/shared-utils`   | 工具函数             | -    | ✅ 已实现 |
| shared   | `@vxture/shared-constants` | 常量定义             | -    | ✅ 已实现 |

### 2.3 包详细说明

#### 2.3.1 packages/portals/ - 门户应用

**定位**: 通用门户应用，面向所有用户提供基础服务

| 包名              | 说明         | 端口 |
| ----------------- | ------------ | ---- |
| `@vxture/website` | 企业官网     | 3000 |
| `@vxture/admin`   | 运营管理平台 | 3001 |
| `@vxture/tenant`  | 租户管理平台 | 3002 |

**website 应用内部架构**（Clean Architecture）:

```
packages/portals/website/
├── public/              # 静态数据（*.json）
└── src/
    ├── app/             # App Router 路由页面
    ├── presentation/    # 视图层：组件、页面、UI 渲染
    ├── application/     # 应用层：业务逻辑、用例
    ├── domain/          # 领域层：核心业务模型与规则
    ├── infrastructure/  # 基础设施层：API、存储、外部服务
    ├── stores/          # Zustand 全局状态
    └── core/            # 应用核心配置（contexts、theme 等）
```

#### 2.3.2 packages/business/ - 业务级应用

**定位**: 业务聚焦型应用，面向特定用户群提供专业服务

| 包名                | 说明                 | 端口 |
| ------------------- | -------------------- | ---- |
| `@vxture/ruinagent` | RuinAgent 智能体应用 |      |

#### 2.3.3 packages/services/ - 后端服务

**定位**: 统一的后端服务层，包含 API 网关和业务微服务

| 子包              | 说明              | 端口 |
| ----------------- | ----------------- | ---- |
| `@vxture/gateway`     | API 网关/公共服务 | 8000 |
| `@vxture/auth`    | 认证服务          | 8001 |
| `@vxture/billing` | 计费服务          | 8002 |
| `@vxture/workers` | 异步任务处理      | 8003 |

**api 服务内部结构**:

```
packages/services/gateway/
├── app/
│   ├── main.py           # 应用入口
│   ├── models/           # 数据模型
│   ├── routes/           # API 路由
│   └── core/             # 核心配置、中间件
├── start_dev.py          # 开发启动脚本
└── requirements.txt      # 依赖声明
```

#### 2.3.4 packages/design-system/ - 设计系统

**定位**: 统一的 UI 组件库和设计规范

**内容**:

- 原子组件：Button、Input、Select、Checkbox 等
- 布局组件：Card、Modal、Dropdown、Tooltip 等
- 反馈组件：Alert、Badge、Progress、Spinner 等
- 布局系统：Grid、Flex、Container

#### 2.3.5 packages/shared/ - 共享包

**定位**: 跨应用共享的纯逻辑、类型、工具

| 子包                     | 说明            | 内容                         |
| ------------------------ | --------------- | ---------------------------- |
| `@vxture/shared-types`   | TypeScript 类型 | API DTOs、领域类型、通用类型 |
| `@vxture/shared-utils`   | 工具函数        | 日期、字符串、验证、格式化   |
| `@vxture/shared-constants` | 常量定义        | 路由、权限码、主题常量       |

---

## 3. 目录规划

### 3.1 完整目录树

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
│   ├── portals/
│   │   ├── website/
│   │   │   ├── public/
│   │   │   │   └── data/*.json
│   │   │   └── src/
│   │   │       ├── app/
│   │   │       ├── presentation/
│   │   │       ├── application/
│   │   │       ├── domain/
│   │   │       ├── infrastructure/
│   │   │       ├── stores/
│   │   │       └── core/
│   │   ├── admin/
│   │   └── tenant/
│   │
│   ├── business/
│   │   └── ruinagent/
│   │
│   ├── services/
│   │   ├── gateway/
│   │   │   ├── app/
│   │   │   │   ├── main.py
│   │   │   │   ├── models/
│   │   │   │   ├── routes/
│   │   │   │   └── core/
│   │   │   ├── start_dev.py
│   │   │   └── requirements.txt
│   │   ├── auth/
│   │   ├── billing/
│   │   └── workers/
│   │
│   ├── design-system/
│   │   └── src/
│   │       ├── components/
│   │       │   ├── Button/
│   │       │   ├── Input/
│   │       │   ├── Card/
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   └── shared/
│       ├── types/
│       │   └── src/
│       │       ├── auth.types.ts
│       │       ├── user.types.ts
│       │       ├── api.types.ts
│       │       └── index.ts
│       ├── utils/
│       │   └── src/
│       │       ├── date.ts
│       │       ├── string.ts
│       │       ├── validation.ts
│       │       └── index.ts
│       └── constants/
│           └── src/
│               ├── routes.ts
│               ├── permissions.ts
│               └── index.ts
│
├── docs/
│   ├── MONOREPO_ARCHITECTURE.md
│   ├── CLAUDE.md
│   └── CODE_STYLE.md
│
└── [自动生成目录 - 禁止修改]
    ├── node_modules/
    ├── dist/
    ├── build/
    └── .git/
```

### 3.2 目录命名规范

| 目录类型 | 命名规范   | 示例                             |
| -------- | ---------- | -------------------------------- |
| 包目录   | kebab-case | `design-system`、`ruinagent`     |
| 源码目录 | kebab-case | `presentation`、`infrastructure` |
| 组件目录 | PascalCase | `Button/`、`UserProfile/`        |
| 工具目录 | kebab-case | `date-helpers/`                  |

### 3.3 文件命名规范

| 文件类型        | 命名规范    | 示例                                 |
| --------------- | ----------- | ------------------------------------ |
| React 组件      | PascalCase  | `Button.tsx`、`LoginForm.tsx`        |
| TypeScript 工具 | kebab-case  | `date-utils.ts`、`string-helpers.ts` |
| 类型定义        | \*.types.ts | `auth.types.ts`、`user.types.ts`     |
| 测试文件        | \*.test.ts  | `date-utils.test.ts`                 |

---

**最后更新**: 2026-03-06
