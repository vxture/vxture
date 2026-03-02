# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📦 Project Overview

Vxture 是一个基于 PNPM Monorepo 架构的现代化企业官网平台，包含：

- **前端** (`packages/web`): Next.js 15 + App Router + React 19 + TypeScript 5.9
- **后端** (`packages/api`): FastAPI 0.119 + Python 3.13 + PostgreSQL

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
pnpm dev      # 前端: http://localhost:3000
pnpm dev:api  # 后端: http://localhost:8000
```

## 🏗️ Architecture

### Frontend Architecture (packages/web)

采用 4 层架构模式：

1. **展示层** - 纯页面渲染，无业务逻辑
   - `src/app/` - App Router 页面和布局
   - `src/components/` - React 组件库

2. **全局能力层** - 状态管理和全局能力
   - `src/contexts/` - 全局状态容器
   - `src/hooks/` - 自定义 Hook (useTheme, useLocale, useAuth)
   - `src/stores/` - Zustand 状态管理
   - `src/services/` - 业务逻辑

3. **内容访问层** - 统一的数据接口
   - `src/clients/` - 内容客户端 (contentClient)
   - `src/hooks/useContent.ts` - 内容获取 Hook

4. **数据源** - 原始数据存储
   - `public/data/` - JSON 本地数据
   - `src/locales/` - 国际化翻译文件

### Backend Architecture (packages/api)

FastAPI 应用结构：

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

## 🛠️ Development Commands

### Important Notes

1. **Build in Development**: Unless necessary, do not build in the development environment. Use `pnpm dev` for development and `pnpm build` only for production.
2. **Port Management**: Always use ports 3000 (frontend) and 8000 (backend). If ports are occupied, clean them first using the port conflict resolution commands below.
3. **UI Confirmation**: If you need to confirm any UI display issues, please ask me instead of testing yourself to avoid getting stuck in a loop.
4. **Backend Status**: Currently, we are focusing on frontend development. The backend is not yet fully finalized and does not need to be processed temporarily.
5. **Git Operations**: Git operations (such as commit, push) require my confirmation.

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

```
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

## 📈 Deployment

### Production Build

```powershell
pnpm build:all
```

### Development Environment

```powershell
# 使用开发环境变量
pnpm dev:full
```

## 📚 References

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
