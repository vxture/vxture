# CI/CD 流水线

> 更新：2026-05-14

---

## 总览

| 文件 | 触发条件 | 运行环境 | 用途 |
|------|---------|---------|------|
| `.github/workflows/ci.yml` | PR / push to main | ubuntu-latest | 类型检查 · Lint · 边界校验 |
| `.github/workflows/build.yml` | push to main（merge） | ubuntu-latest | 构建 Docker 镜像，推送 GHCR |
| `.github/workflows/sonar.yml` | PR / push to main | windows-latest | SonarQube 代码质量扫描 |
| `.github/workflows/deploy.yml` | 手动触发（workflow_dispatch） | ubuntu-latest | SSH 进服务器，滚动重启指定服务 |

CI（`ci.yml`）和 SonarQube（`sonar.yml`）并行运行；镜像构建（`build.yml`）在 CI 通过后触发；部署（`deploy.yml`）手动触发。

---

## CI 工作流（ci.yml）

```
checkout
  → pnpm install --frozen-lockfile
    → build:backend-deps          ← shared + core-* .d.ts 是 type-check 前提
      → type-check:all            ← pnpm --recursive type-check
        → lint                    ← pnpm --recursive --if-present lint
          → lint:design           ← Design System guardrail 脚本
            → lint:boundaries     ← dep-cruiser 包边界检测
```

所有步骤**顺序执行**；任一失败即中止，PR 不可合并。

### 关键设计决策

- `--frozen-lockfile`：CI 强制使用 lockfile，防止依赖漂移
- `--if-present`：lint 步骤跳过没有 lint 脚本的包
- `cancel-in-progress: true`：同一分支新推送取消旧运行，节省 runner 分钟数
- **Turborepo 构建缓存**：`build:backend-deps` 和 `type-check:all` 利用 Turborepo 本地缓存；CI 使用 `actions/cache` 持久化 `.turbo` 目录，cache key 基于 `pnpm-lock.yaml` 哈希，命中率高的包不重复构建

```yaml
# Turborepo 缓存配置片段（ci.yml）
- name: Cache Turborepo
  uses: actions/cache@v4
  with:
    path: .turbo
    key: turbo-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}
    restore-keys: |
      turbo-${{ runner.os }}-
```

---

## dep-cruiser 包边界检测

**配置文件：** `.depcruiserc.cjs`（CommonJS，项目根目录）

**运行命令：**
```bash
pnpm lint:boundaries
```

等价于：
```bash
depcruise portals agent-studio agent-server business bff services \
  packages/core packages/shared packages/ai packages/design packages/platform \
  --config .depcruiserc.cjs
```

### 禁止规则一览

| 规则名 | from | to（禁止引用） | 说明 |
|--------|------|--------------|------|
| `no-portal-to-backend` | `portals/` `agent-studio/` `business/` | `packages/core/` `packages/ai/` `services/` `bff/` `agent-server/` | 门户层只能通过 HTTP 调用 BFF |
| `no-service-to-upper` | `services/` | `bff/` `portals/` `agent-studio/` `business/` | Service 层不可向上 |
| `no-agent-server-to-portal` | `agent-server/` | `portals/` `agent-studio/` `business/` `bff/` | Agent Server 不可向上 |
| `no-core-to-upper` | `packages/core/` | `services/` `bff/` `portals/` `packages/ai/` | Core 层只能引用 shared |
| `no-ai-sdk-to-upper` | `packages/ai/` | `services/` `bff/` `portals/` | AI SDK 基础设施，不可向上 |
| `no-shared-to-upper` | `packages/shared/` | 所有业务包 | Shared 必须零内部依赖 |
| `no-infra-package-to-business` | `packages/design/` `packages/platform/` | `services/` `bff/` `portals/` | 工具包不可引用业务层 |

违反任意规则 → `error` 级别 → CI 失败。

### 本地运行

```bash
# 检查所有边界
pnpm lint:boundaries

# 仅检查某个目录
npx depcruise portals --config .depcruiserc.cjs

# 输出可视化依赖图（需要 graphviz）
npx depcruise portals --config .depcruiserc.cjs --output-type dot | dot -T svg > dep-graph.svg
```

---

## 镜像构建工作流（build.yml）

merge 到 main 分支后自动触发，构建受影响服务的 Docker 镜像并推送到 GHCR。

### GitHub Container Registry 前置配置

```bash
# 1. 在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：
GHCR_TOKEN    # 有 write:packages 权限的 PAT（或使用 GITHUB_TOKEN）

# 2. 在仓库 Packages 中将镜像设为 private（默认）或按需设为 internal
```

### 工作流结构

```yaml
# .github/workflows/build.yml
name: Build and Push

on:
  push:
    branches: [main]

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      website: ${{ steps.filter.outputs.website }}
      console: ${{ steps.filter.outputs.console }}
      admin: ${{ steps.filter.outputs.admin }}
      auth-bff: ${{ steps.filter.outputs.auth-bff }}
      gateway-bff: ${{ steps.filter.outputs.gateway-bff }}
      website-bff: ${{ steps.filter.outputs.website-bff }}
      console-bff: ${{ steps.filter.outputs.console-bff }}
      admin-bff: ${{ steps.filter.outputs.admin-bff }}
      ai-gateway: ${{ steps.filter.outputs.ai-gateway }}
      vela-bff: ${{ steps.filter.outputs.vela-bff }}
      vela-server: ${{ steps.filter.outputs.vela-server }}
      ruyin-bff: ${{ steps.filter.outputs.ruyin-bff }}
      ruyin-server: ${{ steps.filter.outputs.ruyin-server }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            website:
              - 'portals/website/**'
              - 'packages/shared/**'
              - 'packages/core/**'
              - 'packages/design/**'
            # ... 其他服务路径过滤

  build:
    needs: changes
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    strategy:
      matrix:
        include:
          - service: website
            image: ghcr.io/vxture/website
            dockerfile: portals/website/Dockerfile
            changed: ${{ needs.changes.outputs.website }}
          - service: auth-bff
            image: ghcr.io/vxture/bff-auth
            dockerfile: bff/auth-bff/Dockerfile
            changed: ${{ needs.changes.outputs.auth-bff }}
          # ... 其余服务
    steps:
      - if: matrix.changed == 'true'
        uses: actions/checkout@v4

      - if: matrix.changed == 'true'
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - if: matrix.changed == 'true'
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ${{ matrix.dockerfile }}
          push: true
          tags: |
            ${{ matrix.image }}:latest
            ${{ matrix.image }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

**关键设计：**
- `dorny/paths-filter`：仅构建有变更的服务，节省构建时间
- `docker/build-push-action` 的 `cache-from/cache-to: type=gha`：利用 GitHub Actions 缓存加速 Docker 层复用
- 同时推送 `latest` 和 SHA tag：Compose 文件引用 `latest` 滚动更新，SHA tag 保留版本历史供回滚

---

## 部署工作流（deploy.yml）

手动触发，支持选择目标节点（worker-01 / worker-02）和服务。**不自动部署**——生产部署必须有人工确认。

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  workflow_dispatch:
    inputs:
      node:
        description: '目标节点'
        required: true
        type: choice
        options: [worker-01, worker-02]
      service:
        description: '服务名（all = 全部重启）'
        required: true
        default: 'all'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production    # 需要在 GitHub Environments 中配置 reviewer 审批
    steps:
      - name: Deploy to worker-01
        if: inputs.node == 'worker-01'
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.WORKER01_TAILSCALE_IP }}    # 100.100.197.42
          username: ubuntu
          key: ${{ secrets.WORKER01_SSH_KEY }}
          script: |
            cd /deploy/worker-01
            docker compose -f compose.platform.yml pull
            if [ "${{ inputs.service }}" = "all" ]; then
              docker compose -f compose.platform.yml up -d
            else
              docker compose -f compose.platform.yml up -d --no-deps ${{ inputs.service }}
            fi
            docker system prune -f --filter "until=24h"

      - name: Deploy to worker-02
        if: inputs.node == 'worker-02'
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.WORKER02_TAILSCALE_IP }}    # 100.76.219.48
          username: ubuntu
          key: ${{ secrets.WORKER02_SSH_KEY }}
          script: |
            cd /deploy/worker-02
            if [ "${{ inputs.service }}" = "all" ]; then
              docker compose -f compose.vela.prod.yml pull && \
              docker compose -f compose.vela.prod.yml up -d
              docker compose -f compose.ruyin.prod.yml pull && \
              docker compose -f compose.ruyin.prod.yml up -d
            else
              # 由调用者指定具体 compose 文件和服务
              echo "请通过 worker-02 Tailscale SSH 手动部署指定服务"
            fi
```

### GitHub Secrets 配置

| Secret 名 | 说明 |
|-----------|------|
| `WORKER01_TAILSCALE_IP` | worker-01 Tailscale IP（100.100.197.42） |
| `WORKER01_SSH_KEY` | worker-01 部署专用 SSH 私钥 |
| `WORKER02_TAILSCALE_IP` | worker-02 Tailscale IP（100.76.219.48） |
| `WORKER02_SSH_KEY` | worker-02 部署专用 SSH 私钥 |
| `GHCR_TOKEN` | GHCR write:packages 权限（可用 GITHUB_TOKEN 替代） |
| `SONAR_TOKEN` | SonarQube 扫描凭证 |
| `SONAR_HOST_URL` | SonarQube 地址 |

> 部署专用 SSH Key 建议单独生成（`ssh-keygen -t ed25519 -C "deploy"`），不与开发者个人 Key 共用，仅授权 `ubuntu` 用户执行 docker compose 命令。

---

## SonarQube（sonar.yml）

SonarQube 扫描与 CI 并行运行：

```yaml
# .github/workflows/sonar.yml
env:
  SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
  SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
  SONAR_PROJECT_KEY: ${{ secrets.SONAR_PROJECT_KEY }}
```

需在 GitHub 仓库 Settings → Secrets and variables → Actions 中配置上述变量。

---

## 本地 Git Hooks（Husky）

| Hook | 执行内容 |
|------|---------|
| `pre-commit` | `lint-staged`（prettier + eslint 仅对暂存文件） |
| `pre-push` | `pnpm health`（type-check + lint + lint:design）|

Husky 在 `pnpm install` 后由 `prepare` 脚本自动安装。

---

## 参考文档

- `.depcruiserc.cjs` — dep-cruiser 规则配置
- `.github/workflows/` — 所有工作流文件
- `docs/deployment/03-containers.md` — Dockerfile 模板和构建顺序
- `docs/architecture/02-package-boundaries.md` — 层边界规范（dep-cruiser 规则的原始来源）
