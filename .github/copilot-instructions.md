# Copilot Instructions for vxture

让 AI 编码助手快速上手 `vxture` 项目并给出高质量、可执行的代码改动建议。

## 项目架构（大局观）

**PNPM Monorepo** 架构的现代化 Web 平台，专注于企业官网和账户系统：

- **前端（Next.js 15）**: `packages/web/`，使用 App Router + TailwindCSS + TanStack Query
- **后端（FastAPI）**: `packages/api/`，支持 JWT 认证 + PostgreSQL + Redis
- **包管理**: PNPM workspaces，根目录统一依赖管理
- **开发环境**: Node.js 18+ + Python 3.11+ + Windows PowerShell

## 核心开发工作流

### 启动开发服务

```powershell
# 在项目根目录
pnpm dev          # 前端 (localhost:3000)
pnpm dev:api      # 后端 (localhost:8000)

# 或使用 PowerShell 一键启动脚本
.\start-dev.ps1   # 同时启动前后端，记录进程 PID
```

### 开发工具命令

```powershell
pnpm type-check   # TypeScript 类型检查
pnpm lint         # 所有包代码检查
pnpm build        # 构建前端
pnpm clean        # 清理构建文件
```

### Python 后端环境

```powershell
cd packages/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 项目特有约定

### 组件开发模式

- **客户端组件**: 需在文件顶部声明 `'use client'`（如 `HeroSection.tsx`）
- **服务器组件**: 默认模式，用于静态内容和 SEO
- **组件结构**: 按功能分组 `components/home/`、`components/layout/`

### 样式策略

- **TailwindCSS**: 布局、间距、响应式设计、快速原型
- **SCSS**: 复杂动画、嵌套选择器、全局样式（项目支持但优先 Tailwind）
- **主题色彩**: 使用 `tailwind.config.js` 中的 `primary` 和 `gray` 色彩系统

### 架构约束

- **AI 功能边界**: 聊天/智能体功能已移除，如需扩展应独立服务实现
- **API 通信**: 后端 CORS 配置支持前端开发，生产环境需调整
- **环境配置**: 复制 `.env.local.template` 为 `.env.local` 进行本地配置

## 关键文件路径

### 前端核心文件

- `packages/web/src/app/page.tsx` - 首页（组合各 Section 组件）
- `packages/web/src/app/layout.tsx` - 根布局（Header + Footer 结构）
- `packages/web/src/components/home/` - 首页各功能区组件
- `packages/web/tailwind.config.js` - 主题配色和设计系统

### 后端核心文件

- `packages/api/app/main.py` - FastAPI 应用入口和 CORS 配置
- `packages/api/start_dev.py` - 开发环境启动脚本
- `packages/api/requirements.txt` - Python 依赖声明

### 配置文件

- `package.json` + `pnpm-workspace.yaml` - Monorepo 包管理
- `packages/web/next.config.js` - Next.js 配置（typed routes + API URL）

## 常见开发问题

### 启动问题

- **后端启动失败**: 检查 Python 虚拟环境是否激活和依赖安装
- **端口冲突**: 使用 `.\stop-dev.ps1` 停止进程或检查 `.vxture_pids.json`
- **CORS 错误**: 确认后端 `main.py` 中的 CORS 配置包含前端地址

### 前端开发

- **类型错误**: 项目使用严格 TypeScript，检查组件 props 类型定义
- **样式问题**: 优先使用 Tailwind，复杂样式可参考 `HeroSection.tsx` 模式
- **客户端状态**: 使用 TanStack Query 管理服务器状态

查看 `docs/DEVELOPMENT_GUIDE.md` 和 `docs/TECH_STACK.md` 了解详细开发指南。
