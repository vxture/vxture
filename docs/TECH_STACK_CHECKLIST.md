
# Vxture 技术栈检查清单

此文件为逐项检查清单，帮助你核验代码库中每个关键技术点是否正确配置与可运行。按顺序执行每项检查，遇到问题把终端输出贴给我，我会协助分析和修复。

## 快速一览

- 前端：Next.js (App Router) + React 19 + TypeScript 5.9
- 样式：Tailwind CSS + PostCSS
- 状态/数据：TanStack Query, Zustand（若使用）；验证：Zod
- 代码质量：ESLint + Prettier + Husky
- 包管理与工作区：pnpm workspaces
- 后端：FastAPI + Uvicorn
- 数据库与缓存：PostgreSQL, Redis（可选）
- CI：GitHub Actions (`.github/workflows/ci.yml`)
- 容器/开发容器：`.devcontainer/Dockerfile`, `.devcontainer/devcontainer.json`
- 启动脚本：`start-dev-frontend.ps1`, `start-dev-backend.ps1`, `scripts/setup-dev.*`

---

## 逐项详检（每项包含：说明 → 证据位置 → 检查点 → 验证命令）

### 1) Node / pnpm / 工作区

- 说明：前端使用 pnpm workspace 管理依赖和脚本。

- 证据位置：`pnpm-workspace.yaml`, 根 `package.json`, `packages/web/package.json`, `packages/api/package.json`。

- 检查点：

  - `pnpm install` 能够在本地成功运行且无错误。

  - workspace scripts 可在子包上运行（如 `pnpm --filter web run dev`）。

- 验证命令：

````powershell
pnpm -v
pnpm install
pnpm --filter web run type-check
pnpm --filter web run lint
````

---

### 2) 前端：Next.js + React + TypeScript

- 说明：使用 Next.js App Router，TypeScript 作为类型系统。

- 证据位置：`packages/web/next.config.js`, `packages/web/tsconfig.json`, `packages/web/src/app/`。

- 检查点：

  - `tsc --noEmit` 无类型错误。

  - Next 构建（`pnpm --filter web build`）成功。

  - dev server 能运行并编译页面（`pnpm --filter web dev`）。

- 验证命令：

````powershell
pnpm --filter web run type-check
pnpm --filter web build
pnpm --filter web dev    # 开发模式，验证页面能加载（另开终端）
````

---

### 3) 样式：TailwindCSS + PostCSS

- 说明：Tailwind v4 及 postcss 配置。

- 证据位置：`packages/web/tailwind.config.js`, `packages/web/postcss.config.js`, `packages/web/src/styles/`。

- 检查点：

  - `postcss.config.js` 中列出的插件存在且已安装（`autoprefixer`, `tailwindcss`, `@tailwindcss/postcss` 等）。

  - 构建时无 "Cannot find module" 的错误。

- 验证命令：

````powershell
# 在根或 workspace 已安装依赖后
pnpm --filter web build
````

---

### 4) 状态管理与数据层（TanStack Query / Zustand / Zod）

- 说明：检查项目是否使用 TanStack Query、Zustand 等；验证持久化/跨路由同步逻辑是否存在明显错误。

- 证据位置：`packages/web/src/stores/`, `packages/web/src/services/`, `packages/web/src/hooks/`。

- 检查点：

  - 查找 `zustand`、`@tanstack/react-query` 的使用；确认 store 初始化逻辑位于客户端组件（`'use client'`）。

  - 语言/主题同步组件是否挂载在根布局（`app/layout.tsx`）以保证跨路由生效。

- 验证命令/方法：手动在浏览器中切换语言/主题并观察 Network/Console；或在代码中搜索关键词：

````powershell
Select-String -Path packages/web/src/** -Pattern "zustand|create" -SimpleMatch
Select-String -Path packages/web/src/** -Pattern "react-query|useQuery" -SimpleMatch
````

---

### 5) 验证库：Zod

- 说明：用于前后端数据校验。

- 证据位置：`packages/web/src/**`、`packages/api/**` 查找 `zod` 引用。

- 检查点：

  - 确保核心数据模型使用 zod 定义并被正确导入。

- 验证命令：

````powershell
Select-String -Path . -Pattern "zod" -CaseSensitive
````

---

### 6) 代码质量：ESLint / Prettier / Husky

- 说明：静态检查与提交钩子。

- 证据位置：根 `.eslintrc`, `.prettierrc`, `package.json` scripts, `.husky/`（若存在）。

- 检查点：

  - 执行 lint 无错误。

  - Husky 钩子存在并正确指向 lint 或 tests（可选）。

- 验证命令：

````powershell
pnpm --filter web run lint
pnpm run lint
````

---

### 7) 后端：FastAPI + Uvicorn

- 说明：后端由 FastAPI 提供 API 服务，使用 Uvicorn 运行。

- 证据位置：`packages/api/app/main.py`, `packages/api/requirements.txt`, `packages/api/start_dev.py`。

- 检查点：

  - 能在本地启动开发服务器并返回 200（如 `uvicorn app.main:app --reload`）。

  - `requirements.txt` 包含 `fastapi`, `uvicorn` 等。

- 验证命令（在 `packages/api` 中，确保 virtualenv 激活）：

````powershell
cd packages/api
python -m venv .venv
. '\\.venv\\Scripts\\Activate.ps1'
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
# 在另一个 shell 请求健康检查
Invoke-WebRequest http://localhost:8000/ -UseBasicParsing
````

---

### 8) 数据库与迁移：PostgreSQL + Alembic

- 说明：后端迁移与数据库连接配置检查。

- 证据位置：`packages/api/alembic/`, `packages/api/app/core`（或 config 文件），`.env` 模板。

- 检查点：

  - `DATABASE_URL` 是否在 `.env` 或环境变量中配置（不要把真实凭证提交到仓库）。

  - Alembic 配置文件存在并能运行 `alembic revision --autogenerate`（如有数据库连接）。

- 验证命令：

````powershell
# 仅在配置好数据库并激活 venv 后运行
cd packages/api
alembic current
alembic upgrade head
````

---

### 9) 缓存/队列：Redis（可选）

- 说明：如果项目用到 Redis，检查应用是否正确读取 `REDIS_URL` 并能连接。

- 证据位置：后端配置文件，`packages/api` 中引用 redis 的代码。

- 验证：用 `redis-cli` 或 `Test-NetConnection` 测试端口。

---

### 10) CI：GitHub Actions

- 说明：验证 `.github/workflows/ci.yml` 是语法正确并包含必要工作（checkout, setup-node, pnpm install, type-check, lint, build/test）。

- 证据位置：`.github/workflows/ci.yml`。

- 检查点：

  - YAML 语法有效（可用 `python -c "import yaml,sys;yaml.safe_load(sys.stdin)" < file` 本地验证）。

  - 工作包含 `on: push,pull_request`、setup-node、pnpm install、type-check、lint。

- 验证命令（本地 YAML 验证）：

````powershell
python - <<'PY'
import sys, yaml
print('YAML OK' if yaml.safe_load(open('.github/workflows/ci.yml')) else 'Empty?')
PY
````

---

### 11) Devcontainer / Dockerfile

- 说明：.devcontainer 用于一致的开发环境。

- 证据位置：`.devcontainer/Dockerfile`, `.devcontainer/devcontainer.json`。

- 检查点：

  - Dockerfile 与 devcontainer.json 路径无误，所需工具（node, pnpm, python）在容器中安装。

- 验证：在有 Docker 的机器上可打开 Remote-Containers 并成功重建。

---

### 12) 启动脚本与 PowerShell 脚本

- 说明：项目提供了 `start-dev-frontend.ps1`, `start-dev-backend.ps1` 等用于后台运行。

- 证据位置：仓库根 `*.ps1`，`scripts/`。

- 检查点：

  - 脚本使用正确的 Python 可执行路径或 venv 激活方式（建议直接使用 venv 的 python 而非在脚本内激活虚拟环境）。

- 验证命令：阅读脚本并在本地执行（注意：先备份或在测试环境运行）。

---

### 13) 其它：LICENSE / README / docs

- 说明：检查 README 和 docs 是否反映当前架构和运行方法。

- 证据位置：`README.md`, `docs/`。

- 检查点：

  - README 中的启动命令与实际脚本一致。

---

## 快速执行（按项自动化的 PowerShell 片段）

下面的脚本会按关键项运行一些基本验证。请在仓库根运行（PowerShell）：

````powershell
# 1. pnpm 安装与前端类型检查
pnpm install
pnpm --filter web run type-check
pnpm --filter web run lint
pnpm --filter web build

# 2. 后端依赖检查（仅列出）
Get-Content packages/api/requirements.txt | Select-Object -First 20

# 3. 列出 CI 与 devcontainer 文件
Get-ChildItem -Path .github\\workflows -File
Get-ChildItem -Path .devcontainer -File
````

---

如果你希望，我可以：

- 将此文件 commit 到本地（现在可以帮你提交），
- 或把每一项变成可执行的脚本，逐项运行并收集输出。

告诉我你接下来想要我做的（例如“提交此文件” / “逐项运行并回报” / “生成更详细的修复建议”）。
