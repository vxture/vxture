# Vxture 平台

官网和账户系统平台，采用现代化的 PNPM Monorepo 架构，前后端分离设计。

## 🎯 项目目标

- **官网展示**: 企业官网和产品展示
- **账户系统**: 用户注册、登录、个人中心
- **权限管理**: 用户权限和角色管理
- **订阅授权**: 管理各个应用的用户和业务订阅授权

## 🏗️ 技术栈 (简化版)

### 前端 (packages/web)

- **框架**: Next.js 15 + React 18 + TypeScript
- **样式**: TailwindCSS
- **状态管理**: TanStack Query
- **数据验证**: Zod
- **代码规范**: ESLint + Prettier

### 后端 (packages/api)

- **框架**: FastAPI + Uvicorn
- **数据库**: PostgreSQL + Redis
- **认证**: JWT + OAuth2
- **数据验证**: Pydantic
- **数据库迁移**: Alembic

### 工具链

- **包管理**: PNPM Workspace
- **开发环境**: Python 3.13+, Node.js 18+
- **部署**: Docker + 云服务
- **代码质量**: ESLint, Prettier, cSpell
- **CI/CD**: GitHub Actions

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装所有包依赖
pnpm install
```

### 2. 前端开发

```bash
# 启动前端开发服务器
pnpm dev
# 或者
pnpm --filter web dev
```

### 3. 后端开发

```bash
# 启动后端 API 服务器
pnpm dev:api
# 或者
cd packages/api
python -m uvicorn app.main:app --reload
```

## 📂 项目结构

```text
vxture/
├── package.json              # PNPM 工作区根配置
├── pnpm-workspace.yaml       # 工作区包配置
├── pnpm-lock.yaml           # 锁定文件
├── .github/
│   ├── copilot-instructions.md  # AI 开发指南
│   └── workflows/ci.yml         # CI/CD 配置
├── packages/
│   ├── web/                  # Next.js 前端
│   │   ├── src/
│   │   │   ├── app/         # App Router 页面
│   │   │   └── components/  # React 组件
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
│   └── api/                  # FastAPI 后端
│       ├── app/
│       │   └── main.py      # FastAPI 入口
│       ├── scripts/
│       ├── requirements.txt
│       └── package.json
├── docs/                     # 项目文档
├── cspell.json              # 拼写检查配置
└── README.md
```

## 🛠️ 开发命令

```bash
# 开发
pnpm dev          # 启动前端
pnpm dev:api      # 启动后端

# 构建
pnpm build        # 构建前端

# 代码检查
pnpm lint         # 检查所有包
pnpm type-check   # 类型检查

# 清理
pnpm clean        # 清理构建文件
```

## 🌐 环境配置

### 环境变量模板与本地配置

- **模板**: 仓库中已提供 `.env.local.template`，包含前后端常见的环境变量与注释。请复制并重命名为 `.env.local` 用于本地开发。

- **生成本地 `.env.local`（建议）**:

```powershell
# 在项目根目录运行（Windows PowerShell）
cp .env.local.template .env.local
# 然后用编辑器填写真实值，或者使用 sed/PowerShell 替换敏感值
```

- **提示**: 不要将 `.env.local` 提交到版本库；模板 `.env.local.template` 用于共享配置示例和说明。

### 后端示例（仅供参考）

```env
DATABASE_URL=postgresql://user:password@localhost/vxture
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
```

## 📝 开发注意事项

- 确保 Python 3.13+ 和 Node.js 18+ 已安装
- 后端需要 PostgreSQL 和 Redis 服务
- 使用 PNPM 作为包管理器
- 代码提交前请运行 `pnpm lint` 检查
- 查看 `.github/copilot-instructions.md` 了解 AI 开发指导

## 🔧 AI 开发支持

本项目包含 `.github/copilot-instructions.md` 文件，为 AI 编码助手提供项目特定的指导，包括：

- 架构概览和开发工作流
- 关键文件路径和约定
- 常见开发任务的最佳实践

## 💼 项目说明

本仓库专注于平台与官方网站功能。若需扩展或集成，请在独立仓库维护并通过 API 对接。

## 样式指南

### 何时使用 SCSS

- 复杂动画和过渡效果
- 需要嵌套选择器的复杂组件
- 全局样式和重置
- 主题相关的颜色方案
- 需要 SCSS 函数和混合的场景

### 何时使用 Tailwind

- 布局和间距调整
- 简单的颜色应用
- 响应式设计调整
- 快速原型设计
- 小型 UI 调整

## 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -m 'feat: xxx'`)
4. 推送到分支 (`git push origin feature/xxx`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)
