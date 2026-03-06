# 整体技术架构

## 项目定位

Vxture 是一个人工智能业务的云服务平台，提供智能体服务，包含以下核心系统：

1. **企业官网 (web)** - 当前主要开发的前端应用
2. **运营管理平台** - 提供账号、订阅、工单等运营功能
3. **租户管理平台** - 提供租户管理功能
4. **业务应用平台** - 单独项目，提供具体业务功能
5. **公共 API** - 统一的接口服务

## 架构设计理念

### 核心原则

1. **分层架构**：清晰的层次划分，各层职责明确
2. **依赖倒置**：高层模块不依赖低层模块，都依赖抽象
3. **单一职责**：每个模块只负责一个功能领域
4. **可扩展性**：支持未来业务和技术的发展
5. **可维护性**：代码结构清晰，易于理解和修改

## 系统架构图

```
Vxture 智能云服务平台
┌─────────────────────────────────────────────────────────────┐
│                     用户层 (User Layer)                     │
├─────────────────────────────────────────────────────────────┤
│  企业官网 (web)  │  运营管理平台  │  租户管理平台  │  业务应用平台  │
├─────────────────────────────────────────────────────────────┤
│                     接口层 (API Layer)                      │
├─────────────────────────────────────────────────────────────┤
│              公共 API 网关 (API Gateway)                     │
├─────────────────────────────────────────────────────────────┤
│                  业务逻辑层 (Business Layer)                  │
├─────────────────────────────────────────────────────────────┤
│  用户管理  │  订阅管理  │  工单管理  │  智能体服务  │  数据分析  │
├─────────────────────────────────────────────────────────────┤
│                     数据层 (Data Layer)                      │
├─────────────────────────────────────────────────────────────┤
│  关系型数据库  │  NoSQL 数据库  │  文件存储  │  缓存  │  消息队列  │
└─────────────────────────────────────────────────────────────┘
```

## 前端架构 (packages/web)

### 技术栈

```
Next.js 15.5.6 + App Router + React 19.2 + TypeScript 5.9.3
├── 🎨 样式系统
│   ├── TailwindCSS 4.1.14 - 原子化样式系统
│   ├── SCSS/Sass 1.93.2 - 复杂样式和动画
│   └── PostCSS 8.5.6 - CSS 后处理
├── 🧠 状态管理
│   ├── Zustand 5.0.8 - 轻量级状态管理
│   ├── TanStack Query 5.90.5 - 服务器状态管理
│   └── React Context - 全局状态共享
├── 🔧 开发工具
│   ├── TypeScript 5.9.3 - 类型安全
│   ├── ESLint 9.37.0 + Prettier 3.6.2 - 代码规范
│   ├── Stylelint 16.25.0 - 样式规范
│   └── Husky 9.1.7 + lint-staged 16.2.4 - Git 工作流
├── 🎯 工具库
│   ├── Zod 4.1.12 - 运行时类型验证
│   └── TailwindCSS Animate 1.0.7 - CSS 动画
```

### 架构层次 (Clean Architecture)

```
packages/web/src/
│
├── app/                    # Framework Shell Layer (Next.js App Router)
├── presentation/           # UI Layer (React Components)
├── application/            # Use Case Layer (Business Orchestration)
├── domain/                 # Domain Layer (Business Models)
├── infrastructure/         # Infrastructure Layer (Data Sources)
├── stores/                 # Client State Layer (Zustand Stores)
└── shared/                 # Shared Utilities (Types, Constants, Utils)
```

### 各层职责

#### 1. app/ - 框架壳层

**职责：**
- 路由定义 (`page.tsx`)
- 布局定义 (`layout.tsx`)
- 全局提供者挂载 (`QueryProvider`, `ThemeProvider`)
- 元数据绑定 (SEO metadata)
- 服务器/客户端边界控制 (`'use client'`, `'use server'`)

**规则：**
- 禁止包含业务逻辑
- 禁止直接访问基础设施
- 禁止实现数据获取逻辑
- 只从 `presentation/` 层导入

#### 2. presentation/ - UI 层

**职责：**
- 页面组件 (HomePage, AboutPage)
- 区块组件 (HeroSection, FeaturesSection)
- 布局组件 (Header, Footer)
- UI 交互逻辑 (事件处理、表单验证)
- 纯渲染逻辑

**依赖：**
- `application/` (hooks, use cases)
- `shared/` (types, constants, utils)
- `stores/` (global state)

**禁止：**
- 直接访问 `infrastructure/`
- 直接访问 `domain/`
- 直接执行数据获取 (使用 `application/` 层的 hooks)
- 包含业务编排逻辑

#### 3. application/ - 应用层

**职责：**
- 用例实现 (GetHomepageContent, GetLayoutContent)
- 应用钩子 (useHomepage, useHeader)
- 数据组合 (合并多个领域实体)
- 数据转换 (DTO → ViewModel)
- 环境逻辑 (客户端/服务器数据获取)
- SEO 组装 (元数据生成)
- 多源协调 (JSON 回退 → API)

**依赖：**
- `domain/` (models, repository interfaces)
- `infrastructure/` (repository implementations, adapters)
- `shared/` (types, constants, utils)

**禁止：**
- 包含 UI 组件
- 渲染 JSX
- 依赖 `presentation/` 层
- 依赖 `app/` 层

#### 4. domain/ - 领域层

**职责：**
- 模型定义 (entities, value objects)
- 类型定义 (domain-specific types)
- 聚合根 (业务实体组合)
- 仓库契约 (接口定义，无实现)
- 领域规则 (验证、业务逻辑)
- 领域异常 (ContentLoadError, ContentNotFoundError)

**特点：**
- 纯 TypeScript 逻辑
- 无框架代码 (React, Next.js)
- 无 `fetch`，无 HTTP 调用
- 无 UI 代码
- 无外部 SDK 依赖

#### 5. infrastructure/ - 基础设施层

**职责：**
- JSON 适配器 (读取 `public/data/`)
- API 客户端 (HTTP 请求)
- CMS 连接器 (未来: Strapi, Contentful)
- 仓库实现 (实现 `domain/` 接口)
- 第三方 SDK 包装器 (分析、跟踪)
- 缓存实现 (React Query, 自定义缓存)
- 映射器 (DTO ↔ Domain Model 转换)

**依赖：**
- `domain/` (实现仓库接口)
- `shared/` (types, constants, utils)

**禁止：**
- 依赖 `application/`
- 依赖 `presentation/`
- 依赖 `app/`
- 包含业务逻辑 (只包含技术实现)

#### 6. stores/ - 客户端状态层

**职责：**
- UI 状态管理 (主题、语言、模态框可见性)
- 客户端同步状态 (主题同步、i18n 同步)
- 临时状态 (通知、吐司)
- 用户偏好 (持久化到 localStorage)

**规则：**
- 禁止包含领域逻辑
- 禁止数据持久化职责 (使用 `infrastructure/` 进行 API 调用)
- 只包含 UI 相关状态
- 使用 Zustand 进行状态管理

#### 7. shared/ - 共享工具层

**职责：**
- 常量定义 (i18nConfig, themeConfig)
- 工具函数 (纯函数: `formatDate`, `debounce`)
- 共享类型 (跨层 TypeScript 类型)
- 上下文定义 (React Context 模板)
- 主题定义 (颜色映射、字体配置)

**规则：**
- 禁止包含业务逻辑
- 禁止包含用例逻辑
- 禁止包含基础设施逻辑
- 只包含纯函数
- 无其他层依赖

## 后端架构 (packages/api)

### 技术栈

```
FastAPI 0.119.0 + Uvicorn 0.37.0 + Python 3.13.7
├── 🗄️ 数据层
│   ├── PostgreSQL 13+ - 主数据库
│   ├── Redis 5.2.1+ - 缓存和会话存储
│   ├── Alembic 1.17.0+ - 数据库迁移
│   └── Psycopg 3.2.3+ - PostgreSQL 适配器
├── 🔐 安全认证
│   ├── JWT + OAuth2 - 身份认证
│   ├── Python-JOSE - JWT 处理
│   ├── Passlib 1.7.4+ + Bcrypt 5.0.0+ - 密码加密
│   └── Python-multipart - 文件上传
├── 🔧 核心依赖
│   ├── Pydantic 2.12.3+ - 数据验证和设置
│   ├── Pydantic-settings 2.11.0+ - 配置管理
│   ├── Python-dotenv - 环境变量管理
│   ├── HTTPx - HTTP 客户端
│   ├── Aiofiles 25.1.0+ - 异步文件操作
│   └── Uvicorn[standard] 0.37.0+ - ASGI 服务器
├── 🧪 测试工具
│   ├── Pytest 8.3.4+ - 测试框架
│   └── Pytest-asyncio 0.25.0+ - 异步测试
```

### 架构层次

```
packages/api/
├── app/
│   ├── main.py          # FastAPI 应用入口
│   ├── models/          # 数据模型
│   ├── routes/          # API 路由
│   └── core/            # 核心配置
├── start_dev.py         # 开发服务器启动
└── requirements.txt     # Python 依赖
```

### 各层职责

#### 1. routes/ - 路由层

**职责：**
- API 端点定义
- 请求参数验证
- 响应格式化
- 异常处理

**特点：**
- 与前端交互的入口点
- 数据转换和验证
- 错误处理和响应格式化

#### 2. models/ - 数据模型层

**职责：**
- 数据库模型定义
- 数据验证模型
- 业务实体定义

**特点：**
- 使用 SQLAlchemy ORM
- 支持异步操作
- 与数据库表结构对应

#### 3. core/ - 核心配置层

**职责：**
- 应用配置
- 安全配置
- 数据库配置
- 依赖注入

**特点：**
- 集中管理应用配置
- 支持多环境配置
- 提供依赖注入容器

## 部署架构

### 开发环境

```
本地开发环境
├── 前端 (localhost:3000) - Next.js 开发服务器
├── 后端 (localhost:8000) - FastAPI 开发服务器
├── 数据库 - PostgreSQL/Redis (可选)
└── 工具链 - PNPM, Python 虚拟环境
```

### 生产环境

```
生产部署架构
┌─────────────────────────────────────────────────────────────┐
│                     负载均衡器 (Load Balancer)                │
├─────────────────────────────────────────────────────────────┤
│  前端 (CDN + 静态资源)  │  后端 API 服务器集群  │  定时任务服务  │
├─────────────────────────────────────────────────────────────┤
│                     数据存储层 (Data Storage)                  │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL 主从集群  │  Redis 缓存集群  │  文件存储 (OSS)  │
├─────────────────────────────────────────────────────────────┤
│                     监控和日志 (Monitoring)                   │
├─────────────────────────────────────────────────────────────┤
│  应用性能监控  │  系统监控  │  日志管理  │  错误跟踪  │
└─────────────────────────────────────────────────────────────┘
```

## 安全架构

### 认证与授权

1. **JWT 认证**：用于 API 访问控制
2. **OAuth2**：支持第三方登录
3. **RBAC 权限模型**：基于角色的访问控制
4. **API 密钥管理**：用于服务间通信

### 数据安全

1. **数据加密**：传输加密 (HTTPS)，存储加密
2. **输入验证**：严格的参数验证和过滤
3. **防止 SQL 注入**：使用参数化查询
4. **防止 XSS 攻击**：输出转义和内容安全策略

## 架构优势

### 1. 可扩展性

- 模块化架构支持功能扩展
- 分层设计降低耦合度
- 清晰的接口定义便于组件替换

### 2. 可维护性

- 各层职责明确，代码结构清晰
- 单一职责原则提高代码可读性
- 依赖注入简化测试和维护

### 3. 性能优化

- 前端静态资源优化和缓存
- 后端异步处理和数据库优化
- CDN 加速和负载均衡

### 4. 开发效率

- 统一的技术栈和开发流程
- 代码复用和组件库
- 自动化测试和部署流程

## 未来架构规划

### 1. 微服务化

将各业务功能拆分为独立的微服务，提高系统的可扩展性和容错性。

### 2. 事件驱动架构

引入消息队列，实现异步处理和系统解耦。

### 3. 容器化部署

使用 Docker 和 Kubernetes 实现自动化部署和资源管理。

### 4. 人工智能集成

集成机器学习和自然语言处理技术，提供更智能的服务。

## 总结

Vxture 平台的架构设计遵循了现代软件架构的最佳实践，结合了分层架构、依赖倒置和单一职责原则。这种设计确保了系统的可扩展性、可维护性和性能优化，为未来业务和技术的发展奠定了基础。
