# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📦 Project Overview

Vxture 是一个基于 PNPM Monorepo 架构的人工智能业务云服务平台，提供智能体服务，包含：

- **前端** (`packages/web`): Next.js 15 + App Router + React 19 + TypeScript 5.9 + TailwindCSS 4
- **后端** (`packages/api`): FastAPI 0.119 + Python 3.13 + PostgreSQL + Redis
- **智能体服务**: 提供人工智能业务的核心服务

## 🚀 Quick Start

### Environment Requirements

- Node.js 22+
- Python 3.13+
- PNPM 10+
- PostgreSQL 13+ (optional for development)
- Redis 6+ (optional for development)

### Startup Commands

```powershell
# 克隆仓库
git clone https://github.com/stonesmoker/vxture.git
cd vxture

# 安装依赖
pnpm install

# 配置环境变量
cp .env.local.template .env.local

# 启动完整开发环境（推荐）
.\start-dev.ps1

# 或分别启动前后端
pnpm dev      # 前端: http://localhost:3000 (严格使用此端口)
pnpm dev:api  # 后端: http://localhost:8000 (严格使用此端口)
```

## 🏗️ Architecture

### System Architecture

Vxture 智能云服务平台采用分层架构模式：

```text
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

### Frontend Architecture (packages/web)

采用 **Clean Architecture (整洁架构)** 模式，分为 7 层：

1. **框架壳层** (`src/app/`) - App Router 页面和布局
   - 路由定义和布局管理
   - 全局提供者挂载
   - 元数据绑定和 SEO 优化
   - 服务器/客户端边界控制

2. **展示层** (`src/presentation/`) - UI 组件和页面渲染
   - 页面组件 (HomePage, AboutPage)
   - 区块组件 (HeroSection, FeaturesSection)
   - 布局组件 (Header, Footer)
   - 纯渲染逻辑，无业务逻辑

3. **应用层** (`src/application/`) - 应用业务逻辑
   - 用例实现 (GetHomepageContent, GetLayoutContent)
   - 应用钩子 (useHomepage, useHeader)
   - 数据组合和转换 (DTO → ViewModel)
   - 环境逻辑和 SEO 组装

4. **领域层** (`src/domain/`) - 核心业务逻辑
   - 实体 (entities) 和值对象 (value objects) 定义
   - 仓库契约 (接口定义，无实现)
   - 领域规则和验证逻辑
   - 领域异常处理

5. **基础设施层** (`src/infrastructure/`) - 外部系统访问
   - JSON 适配器 (读取 `public/data/`)
   - API 客户端 (HTTP 请求)
   - CMS 连接器 (未来: Strapi, Contentful)
   - 仓库实现和第三方 SDK 包装器

6. **客户端状态层** (`src/stores/`) - 状态管理
   - Zustand 状态管理
   - UI 状态管理 (主题、语言、模态框可见性)
   - 客户端同步状态和用户偏好

7. **共享工具层** (`src/shared/`) - 公用工具和常量
   - 常量定义 (i18nConfig, themeConfig)
   - 工具函数 (formatDate, debounce)
   - 共享类型和上下文定义
   - 主题定义和颜色映射

### Backend Architecture (packages/api)

FastAPI 应用结构：

```text
packages/api/
├── app/
│   ├── main.py          # FastAPI 应用入口
│   ├── models/          # 数据模型
│   ├── routes/          # API 路由
│   └── core/            # 核心配置
├── start_dev.py         # 开发服务器启动
└── requirements.txt     # Python 依赖
```

## 🛠️ Development Commands

### Important Notes

1. **Build in Development**: Unless necessary, do not build in the development environment. Use `pnpm dev` for development and `pnpm build` only for production.
2. **Port Management**: 严格使用端口 3000（前端）和 8000（后端）。如果端口被占用，请先使用下面的端口冲突解决命令清理。**绝对禁止使用其他端口**。
3. **UI Confirmation**: 如果需要确认任何 UI 显示问题，请直接询问我，而不是使用 Puppeteer 或其他工具自行测试，以避免陷入循环。
4. **Backend Status**: 目前我们专注于前端开发。后端尚未完全确定，暂时不需要处理。
5. **Git Operations**: Git 操作（如 commit、push）需要我的确认。

### Frontend Commands

```powershell
pnpm dev          # 启动前端开发服务器 (http://localhost:3000)
pnpm build        # 构建前端生产版本
pnpm preview      # 预览生产构建
pnpm lint         # 检查前端代码规范
pnpm lint:fix     # 自动修复前端代码问题
pnpm type-check   # TypeScript 类型检查
```

### Backend Commands

```powershell
pnpm dev:api      # 启动后端 API 服务器 (http://localhost:8000)
pnpm build:api    # 构建后端应用
pnpm lint:api     # 检查后端代码规范
pnpm test:api     # 运行后端测试
```

### Full Stack Commands

```powershell
pnpm start        # 同时启动前后端
pnpm build:all    # 构建所有包
pnpm lint         # 检查所有包的代码规范
pnpm test         # 运行所有测试
```

### Database Commands

```powershell
pnpm db:migrate   # 执行数据库迁移
pnpm db:reset     # 重置数据库
pnpm db:seed      # 填充测试数据
```

### Maintenance Commands

```powershell
pnpm clean        # 清理构建文件
pnpm clean:cache  # 清理缓存和依赖
pnpm reset        # 完全重置项目
pnpm health       # 环境健康检查
```

## 🎨 Development Conventions

### Component Development

- **服务器组件**: 默认模式，用于静态内容和 SEO
- **客户端组件**: 需要交互的组件，文件顶部声明 `'use client'`

```tsx
// 客户端组件示例
'use client'

import { useState } from 'react'

export default function InteractiveButton() {
  const [count, setCount] = useState(0)
  // ...
}
```

### Styling Strategy

**TailwindCSS 优先**（主要样式方案）

```tsx
<div className="bg-primary-500 text-white p-4 rounded-lg shadow-lg">
  <h1 className="text-2xl font-bold mb-2">标题</h1>
</div>
```

**SCSS 补充**（复杂动画和主题）

```scss
.hero-animation {
  @apply transition-all duration-500;

  &:hover {
    transform: translateY(-4px) scale(1.02);
  }
}
```

### State Management

使用 Zustand 进行全局状态管理：

```tsx
import { useThemeStore } from '@/stores/themeStore'

function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  return <button onClick={toggleTheme}>{theme}</button>
}
```

### API Communication

使用 TanStack Query 管理服务器状态：

```tsx
import { useQuery } from '@tanstack/react-query'

function UserProfile() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => fetch('/api/user/profile').then(res => res.json())
  })

  // ...
}
```

## 📊 Data Management

### Content System

使用 contentClient 统一获取内容：

```tsx
import { useContent } from '@/hooks/useContent'

function HeroSection() {
  const { data: heroData, isLoading } = useContent('hero')

  if (isLoading) return <div>Loading...</div>

  return (
    <section>
      <h1>{heroData.title}</h1>
      <p>{heroData.description}</p>
    </section>
  )
}
```

### i18n System

翻译文件结构：

```text
src/locales/
├── zh-CN/
│   └── common.json
└── en-US/
    └── common.json
```

使用方式：

```tsx
import { useLocale } from '@/hooks'
import { useTranslation } from '@/services/i18nService'

function Header() {
  const { locale } = useLocale()
  const { t } = useTranslation()

  return (
    <header>
      <span>{t('header.title')}</span>
    </header>
  )
}
```

### 智能体服务

智能体服务是平台的核心功能，提供人工智能业务能力：

```tsx
import { useQuery } from '@tanstack/react-query'

function IntelligentAgentService() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['intelligent-agents'],
    queryFn: () => fetch('/api/agents').then(res => res.json())
  })

  if (isLoading) return <div>Loading agents...</div>

  return (
    <div>
      <h2>智能体服务</h2>
      <ul>
        {agents.map(agent => (
          <li key={agent.id}>{agent.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

## 🔍 Troubleshooting

### Common Issues

#### Frontend Build Error

```powershell
# 清理缓存重新安装
pnpm clean
pnpm reset
pnpm dev
```

#### Port Conflict

```powershell
# 停止所有开发进程
.\stop-dev.ps1

# 或手动检查端口
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

#### Backend Startup Failure

```powershell
# 检查 Python 环境
python --version
pip list

# 重新创建虚拟环境
cd packages/api
rm -rf .venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 🚀 Key Features

### 核心功能特性

- **🏢 企业官网**: 响应式设计，SEO 优化，现代化 UI/UX
- **👤 账户系统**: 用户注册、登录、个人中心管理
- **🔐 权限管理**: 基于角色的访问控制 (RBAC)
- **💳 订阅授权**: 应用授权和业务订阅管理
- **🚀 高性能**: 服务端渲染 + 客户端优化
- **🔒 安全可靠**: JWT 认证 + OAuth2 + 数据加密
- **🤖 智能体服务**: 提供人工智能业务的核心服务
- **📊 数据分析**: 实时数据分析和可视化
- **📞 工单系统**: 客户支持和工单管理

## 🔒 Security Architecture

### 认证与授权

1. **JWT 认证**: 用于 API 访问控制
2. **OAuth2**: 支持第三方登录
3. **RBAC 权限模型**: 基于角色的访问控制
4. **API 密钥管理**: 用于服务间通信

### 数据安全

1. **数据加密**: 传输加密 (HTTPS)，存储加密
2. **输入验证**: 严格的参数验证和过滤
3. **防止 SQL 注入**: 使用参数化查询
4. **防止 XSS 攻击**: 输出转义和内容安全策略

## 📈 Deployment Architecture

### Development Environment

```text
本地开发环境
├── 前端 (localhost:3000) - Next.js 开发服务器
├── 后端 (localhost:8000) - FastAPI 开发服务器
├── 数据库 - PostgreSQL/Redis (可选)
└── 工具链 - PNPM, Python 虚拟环境
```

### Production Environment

```text
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

### Deployment Commands

```powershell
# 生产构建
pnpm build:all

# 预览生产版本
pnpm preview

# 开发环境
pnpm dev:full
```

## 🏆 Architecture Advantages

### 可扩展性

- 模块化架构支持功能扩展
- 分层设计降低耦合度
- 清晰的接口定义便于组件替换

### 可维护性

- 各层职责明确，代码结构清晰
- 单一职责原则提高代码可读性
- 依赖注入简化测试和维护

### 性能优化

- 前端静态资源优化和缓存
- 后端异步处理和数据库优化
- CDN 加速和负载均衡

## 🌟 Future Planning

### 1. 微服务化

将各业务功能拆分为独立的微服务，提高系统的可扩展性和容错性。

### 2. 事件驱动架构

引入消息队列，实现异步处理和系统解耦。

### 3. 容器化部署

使用 Docker 和 Kubernetes 实现自动化部署和资源管理。

### 4. 人工智能集成

集成机器学习和自然语言处理技术，提供更智能的服务。

## 📚 References

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
