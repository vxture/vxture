# Copilot Instructions for vxture

目标：让 AI 编码助手快速上手 `vxture` 项目并能给出高质量、可执行的代码改动建议。

## 简要架构（大局观）

这是一个使用 **PNPM Monorepo** 架构的现代化 Web 平台：

- **前端（Next.js 15+）**: `packages/web/`，使用 App Router。主要入口：`packages/web/src/app/page.tsx`
- **后端（FastAPI）**: `packages/api/`，主入口：`packages/api/app/main.py`
- **包管理**: PNPM workspaces，根目录统一管理依赖

## 常见开发工作流

### 启动服务

```bash
# 在项目根目录，启动前端开发服务器
pnpm dev
# 或指定包
pnpm --filter web dev

# 启动后端 API 服务器
pnpm dev:api
# 或直接在包目录
cd packages/api
python -m uvicorn app.main:app --reload
```

### 开发工具

```bash
pnpm type-check    # 前端类型检查
pnpm lint          # 代码检查（所有包）
pnpm build         # 构建前端
```

### Python 环境管理

```powershell
cd packages/api
python -m venv .venv
.\.venv\Scripts\Activate
pip install -r requirements.txt
```

## 项目特有约定

- **API 响应格式**: 所有 API 响应通过 `ApiResponseHandler`（文件：`packages/web/src/lib/utils/apiResponse.ts`）封装，确保统一响应格式
- **组件约定**: 客户端组件需在文件顶部声明 `'use client'`；默认为服务器组件
- **架构边界**: 聊天/智能体功能已从本仓库移除；如需实现，应在独立服务中维护并通过 HTTP API 集成
- **类型定义**: 统一放在 `packages/web/src/types/` 目录

## 关键文件路径

### 前端核心

- `packages/web/src/app/layout.tsx` - 根布局
- `packages/web/src/app/page.tsx` - 首页
- `packages/web/src/lib/utils/apiResponse.ts` - API 响应处理器
- `packages/web/src/types/index.ts` - 类型定义

### 后端核心

- `packages/api/app/main.py` - FastAPI 应用入口
- `packages/api/requirements.txt` - Python 依赖

### 配置文件

- `package.json` - PNPM workspace 根配置
- `pnpm-workspace.yaml` - 工作区包配置
- `packages/web/next.config.js` - Next.js 配置

## 调试提示

- 后端运行失败时，确保在 `packages/api` 目录安装了 `requirements.txt` 中的依赖
- 前端类型错误时，检查 `packages/web/src/types/` 中的类型定义
- 跨包依赖问题时，检查 `pnpm-workspace.yaml` 配置

如有疑问，搜索项目中 `ApiResponseHandler`、`packages/web` 等关键字查看现有用例。
