# Vxture 平台

> 现代化企业官网平台 - Next.js 15 + FastAPI + PostgreSQL

基于 PNPM Monorepo 架构的全栈 Web 平台，专注于企业官网展示和用户账户系统。
<!-- Quick badges: setup / contribute / runtimes / devcontainer -->
[![setup-ready](https://img.shields.io/badge/setup-ready-brightgreen)](docs/SETUP_QUICK.md)
[![contribs-welcome](https://img.shields.io/badge/Contributions-welcome-brightgreen)](docs/SETUP_QUICK.md#contributing)
[![node](https://img.shields.io/badge/node-18.x-green)](https://nodejs.org/)
[![python](https://img.shields.io/badge/python-3.11-blue)](https://python.org/)
[![devcontainer](https://img.shields.io/badge/devcontainer-enabled-blue)](.devcontainer/)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://python.org/)
[![PNPM](https://img.shields.io/badge/PNPM-8.15%2B-orange.svg)](https://pnpm.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 功能特性

- **🏢 企业官网**: 响应式设计，SEO 优化，现代化 UI/UX
- **👤 账户系统**: 用户注册、登录、个人中心管理
- **🔐 权限管理**: 基于角色的访问控制 (RBAC)
- **💳 订阅授权**: 应用授权和业务订阅管理
- **🚀 高性能**: 服务端渲染 + 客户端优化
- **🔒 安全可靠**: JWT 认证 + OAuth2 + 数据加密

## 🏗️ 技术架构

### 前端 (`packages/web`)

```text
Next.js 15 + App Router + TypeScript
├── TailwindCSS - 样式系统和响应式设计
├── TanStack Query - 服务器状态管理
├── Zod - 运行时类型验证
└── ESLint + Prettier - 代码质量工具
```

### 后端 (`packages/api`)

```text
FastAPI + Uvicorn + Python 3.11+
├── PostgreSQL - 主数据库
├── Redis - 缓存和会话存储
├── JWT + OAuth2 - 身份认证
├── Pydantic - 数据验证
└── Alembic - 数据库迁移
```

### 开发工具链

```text
PNPM Workspace - Monorepo 包管理
├── GitHub Actions - CI/CD 自动化
├── Docker - 容器化部署
├── cSpell - 拼写检查
└── Husky + lint-staged - Git 工作流
```

## 🚀 快速开始

### 环境要求

- **Node.js** 18.17.0+
- **Python** 3.11+
- **PNPM** 8.15.0+
- **PostgreSQL** 13+ (可选，开发环境可用 SQLite)
- **Redis** 6+ (可选，开发环境可禁用)

### 一键启动

```powershell
# 克隆仓库
git clone https://github.com/your-org/vxture.git
cd vxture

# 安装依赖
pnpm install

# 配置环境变量
cp .env.local.template .env.local
# 编辑 .env.local 填写必要配置

# 启动完整开发环境（推荐）
.\start-dev.ps1

# 或分别启动前后端
pnpm dev      # 前端: http://localhost:3000
pnpm dev:api  # 后端: http://localhost:8000
```

### 手动配置后端

```powershell
# 进入后端目录
cd packages/api

# 创建 Python 虚拟环境
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 安装 Python 依赖
pip install -r requirements.txt

# 运行数据库迁移（如果使用 PostgreSQL）
alembic upgrade head

# 启动后端服务
python start_dev.py
```

## 📂 项目结构

```text
vxture/
├── 📁 packages/
│   ├── 📁 web/                   # Next.js 前端应用
│   │   ├── 📁 src/
│   │   │   ├── 📁 app/          # App Router 页面和布局
│   │   │   │   ├── page.tsx     # 首页
│   │   │   │   └── layout.tsx   # 根布局
│   │   │   └── 📁 components/   # React 组件库
│   │   │       ├── 📁 home/     # 首页组件
│   │   │       └── 📁 layout/   # 布局组件
│   │   ├── tailwind.config.js   # TailwindCSS 配置
│   │   ├── next.config.js       # Next.js 配置
│   │   └── package.json
│   └── 📁 api/                   # FastAPI 后端应用
│       ├── 📁 app/
│       │   ├── main.py          # FastAPI 应用入口
│       │   ├── 📁 models/       # 数据模型
│       │   ├── 📁 routes/       # API 路由
│       │   └── 📁 core/         # 核心配置
│       ├── start_dev.py         # 开发服务器启动
│       ├── requirements.txt     # Python 依赖
│       └── package.json
├── 📁 .github/
│   ├── copilot-instructions.md  # AI 开发助手指南
│   └── 📁 workflows/            # GitHub Actions
├── 📁 docs/                     # 项目文档
├── start-dev.ps1               # Windows 开发启动脚本
├── stop-dev.ps1                # Windows 开发停止脚本
├── package.json                # Monorepo 根配置
├── pnpm-workspace.yaml         # PNPM 工作区配置
└── cspell.json                 # 拼写检查配置
```

## 🛠️ 开发工作流

### 常用开发命令

```powershell
# 🚀 开发环境
pnpm dev          # 启动前端开发服务器
pnpm dev:api      # 启动后端 API 服务器
pnpm start        # 同时启动前后端（等同于 .\start-dev.ps1）

# 🏗️ 构建部署
pnpm build        # 构建前端生产版本
pnpm build:all    # 构建所有包
pnpm preview      # 预览生产构建

# 🔍 代码质量
pnpm lint         # 检查所有包的代码规范
pnpm lint:fix     # 自动修复代码问题
pnpm type-check   # TypeScript 类型检查
pnpm format       # 代码格式化

# 🧪 测试
pnpm test         # 运行所有测试
pnpm test:watch   # 监听模式运行测试
pnpm test:coverage # 生成测试覆盖率报告

# 🧹 清理维护
pnpm clean        # 清理构建文件
pnpm reset        # 完全重置项目（清理 + 重新安装）
pnpm health       # 环境健康检查
```

### 数据库操作

```powershell
# 数据库迁移
pnpm db:migrate   # 执行数据库迁移
pnpm db:reset     # 重置数据库
pnpm db:seed      # 填充测试数据
```

## 🌐 环境配置

### 环境变量配置

项目提供 `.env.local.template` 模板文件，包含所有必要的环境变量说明：

```powershell
# 复制环境变量模板
cp .env.local.template .env.local

# 编辑配置文件，填写真实值
notepad .env.local
```

### 关键环境变量

```env
# 🌐 应用配置
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# 🗄️ 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/vxture
REDIS_URL=redis://localhost:6379

# 🔐 安全配置
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 运行时管理（推荐）

为保证团队机器之间的一致性，推荐使用运行时版本管理工具来锁定 Node 与 Python 版本：

- Node / pnpm: 推荐使用 Volta（跨平台、轻量且对 pnpm 支持良好）。示例：

```powershell
# 安装 Volta (Windows PowerShell)
iwr https://get.volta.sh -UseBasicParsing | iex
# 安装指定 Node 版本与 pnpm
volta install node@18
volta install pnpm
```

- 也可使用 nvm（Linux / macOS）或 asdf，根据团队偏好选择一致的工具。

- Python: 使用虚拟环境（venv）或 pip-tools（pip-compile）管理依赖：

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

项目仓库包含辅助脚本：

- `scripts/setup-dev.ps1` — Windows 一键初始化（会安装 Volta、Node、pnpm、创建 Python venv 并安装依赖、调用扩展安装脚本）
- `scripts/setup-dev.sh`  — Unix-like 系统的对应脚本

建议团队在 PR 模板或贡献指南中声明使用的管理工具与 Node/Python 精确版本，以便 CI 和开发机器一致。

## 💡 开发约定

### 组件开发模式

- **🖥️ 服务器组件**: 默认模式，用于静态内容和 SEO
- **💻 客户端组件**: 需要交互的组件，文件顶部声明 `'use client'`
- **📁 组件组织**: 按功能分组 (`components/home/`, `components/layout/`)

```tsx
// 客户端组件示例
'use client'

import { useState } from 'react'

export default function InteractiveButton() {
  const [count, setCount] = useState(0)
  // ...
}
```

### 样式开发策略

**🎨 TailwindCSS 优先**（90% 的样式需求）

```tsx
<div className="bg-primary-500 text-white p-4 rounded-lg shadow-lg">
  <h1 className="text-2xl font-bold mb-2">标题</h1>
</div>
```

**🎭 SCSS 补充**（复杂动画和主题）

```scss
.hero-animation {
  @apply transition-all duration-500;

  &:hover {
    transform: translateY(-4px) scale(1.02);
  }
}
```

### API 通信模式

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

## 🔧 故障排除

### 常见问题

#### **🚨 后端启动失败**

```powershell
# 检查 Python 环境
python --version  # 确保 3.11+
pip list          # 查看已安装包

# 重新创建虚拟环境
cd packages/api
rm -rf .venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

#### **🚨 前端构建错误**

```powershell
# 清理缓存重新安装
pnpm clean
pnpm reset
pnpm dev
```

#### **🚨 端口冲突**

```powershell
# 停止所有开发进程
.\stop-dev.ps1

# 或手动检查端口
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

## 🤖 AI 开发支持

本项目包含完整的 AI 编程助手配置：

- **📋 `.github/copilot-instructions.md`**: GitHub Copilot 专用指南
- **🔧 开发工作流**: 自动化脚本和环境检查
- **📚 项目约定**: 编码规范和最佳实践

AI 助手可以帮助你：

- 快速生成符合项目约定的组件
- 自动处理 TypeScript 类型定义
- 提供项目特定的代码建议

## 📈 部署指南

### 开发环境部署

```powershell
# 构建所有包
pnpm build:all

# 预览生产版本
pnpm preview
```

### 生产环境部署

详细部署指南请参考 `docs/DEPLOYMENT.md`

## 🤝 贡献指南

1. **Fork** 本仓库
2. **创建特性分支**: `git checkout -b feature/amazing-feature`
3. **提交更改**: `git commit -m 'feat: add amazing feature'`
4. **推送分支**: `git push origin feature/amazing-feature`
5. **创建 Pull Request**

### 提交规范

使用 [Conventional Commits](https://conventionalcommits.org/) 规范：

```text
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式
refactor: 重构代码
test: 测试相关
chore: 构建或工具更新
```

## 📚 文档资源

- 📖 **[开发指南](docs/DEVELOPMENT_GUIDE.md)**: 详细开发说明
- 🏗️ **[技术架构](docs/TECH_STACK.md)**: 架构设计文档
- 🚀 **[部署指南](docs/DEPLOYMENT.md)**: 生产环境部署
- 🎨 **[设计系统](docs/DESIGN_SYSTEM.md)**: UI/UX 设计规范

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) - 详情请查看 LICENSE 文件

---

<!-- markdownlint-disable MD033 -->
<p align="center">

<strong>[⭐ 给个 Star](../../stargazers) • [🐛 报告问题](../../issues) • [💡 功能建议](../../issues)</strong>

Made with ❤️ by <a href="https://github.com/your-org">vxture team</a>

</p>
<!-- markdownlint-enable MD033 -->
