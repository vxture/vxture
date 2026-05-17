# CI/CD 流水线

> 更新：2026-05-17

---

## 分支触发矩阵

| 触发事件         | CI  | SonarQube | 镜像构建                | worker-01 自动部署 | worker-02 部署 |
| ---------------- | --- | --------- | ----------------------- | ------------------ | -------------- |
| 任意 PR          | ✅  | ✅        | —                       | —                  | —              |
| `develop` push   | ✅  | ✅        | —                       | —                  | —              |
| `beta` push      | ✅  | ✅        | ✅ `:beta` + `:sha-*`   | —                  | 手动 SSH       |
| `main` push      | ✅  | ✅        | ✅ `:latest` + `:sha-*` | ✅ 自动            | 手动 SSH       |
| git tag `v*.*.*` | —   | —         | ✅ semver 标签          | —                  | —              |

> **worker-02 暂无自动化部署 workflow。** prod / beta 均为 Tailscale SSH 手动执行 `docker compose pull && up -d`，待业务稳定后再接入 `workflow_dispatch`。

---

## 工作流文件总览

| 文件                   | 触发条件                           | 运行环境      | 用途                                         |
| ---------------------- | ---------------------------------- | ------------- | -------------------------------------------- |
| `ci.yml`               | PR / push to main · beta · develop | ubuntu-latest | 类型检查 · Lint · 边界校验                   |
| `docker.yml`           | push to main / beta；git tag `v*`  | ubuntu-latest | 构建所有服务镜像，按分支/tag 打标，推送 GHCR |
| `deploy-worker-01.yml` | `docker.yml` 成功后（仅 main）     | ubuntu-latest | SSH worker-01，pull 最新镜像并滚动重启       |
| `sonar.yml`            | PR / push to main · beta · develop | ubuntu-latest | SonarQube 代码质量扫描                       |

CI 和 SonarQube 并行运行，互不依赖。`docker.yml` 独立触发（不依赖 CI），`deploy-worker-01.yml` 在 `docker.yml` 完成后自动触发。

---

## CI 工作流（ci.yml）

对三个主干分支（`main` / `beta` / `develop`）的 PR 和 push 均触发。

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

---

## dep-cruiser 包边界检测

**配置文件：** `.depcruiserc.cjs`（CommonJS，项目根目录）

```bash
pnpm lint:boundaries
```

### 禁止规则一览

| 规则名                         | from                                    | to（禁止引用）                                                     | 说明                         |
| ------------------------------ | --------------------------------------- | ------------------------------------------------------------------ | ---------------------------- |
| `no-portal-to-backend`         | `portals/` `agent-studio/` `business/`  | `packages/core/` `packages/ai/` `services/` `bff/` `agent-server/` | 门户层只能通过 HTTP 调用 BFF |
| `no-service-to-upper`          | `services/`                             | `bff/` `portals/` `agent-studio/` `business/`                      | Service 层不可向上           |
| `no-agent-server-to-portal`    | `agent-server/`                         | `portals/` `agent-studio/` `business/` `bff/`                      | Agent Server 不可向上        |
| `no-core-to-upper`             | `packages/core/`                        | `services/` `bff/` `portals/` `packages/ai/`                       | Core 层只能引用 shared       |
| `no-ai-sdk-to-upper`           | `packages/ai/`                          | `services/` `bff/` `portals/`                                      | AI SDK 基础设施，不可向上    |
| `no-shared-to-upper`           | `packages/shared/`                      | 所有业务包                                                         | Shared 必须零内部依赖        |
| `no-infra-package-to-business` | `packages/design/` `packages/platform/` | `services/` `bff/` `portals/`                                      | 工具包不可引用业务层         |

违反任意规则 → `error` 级别 → CI 失败。

```bash
# 本地运行
pnpm lint:boundaries

# 仅检查某个目录
npx depcruise portals --config .depcruiserc.cjs

# 输出可视化依赖图（需要 graphviz）
npx depcruise portals --config .depcruiserc.cjs --output-type dot | dot -T svg > dep-graph.svg
```

---

## Docker 构建工作流（docker.yml）

push 到 `main` 或 `beta`，或推送 `v*.*.*` 格式 tag 时触发。

### 标签策略

| 触发条件         | 打出的镜像标签                                        |
| ---------------- | ----------------------------------------------------- |
| push `main`      | `:latest` · `:sha-<short>`                            |
| push `beta`      | `:beta` · `:sha-<short>`                              |
| git tag `v1.2.3` | `:1.2.3` · `:1.2` · `:1` · `:latest` · `:sha-<short>` |

使用 `docker/metadata-action` + `docker/build-push-action`，标签由 `type=raw` / `type=semver` / `type=sha` 组合自动生成。

### 构建矩阵（13 个服务，并行构建）

| 类别         | 服务                                       | 镜像名                              | Dockerfile                                       |
| ------------ | ------------------------------------------ | ----------------------------------- | ------------------------------------------------ |
| 门户         | website / console / admin                  | `ghcr.io/vxture/{name}`             | `Dockerfile.nextjs`                              |
| 平台 BFF     | gateway / auth / website / console / admin | `ghcr.io/vxture/bff-{name}`         | `Dockerfile.gateway` / `Dockerfile.nestjs`       |
| 业务 BFF     | vela / ruyin                               | `ghcr.io/vxture/bff-{name}`         | `Dockerfile.nestjs`                              |
| Agent Server | vela / ruyin                               | `ghcr.io/vxture/agent-{name}`       | `Dockerfile.nestjs-prisma` / `Dockerfile.nestjs` |
| 共享服务     | ai-gateway                                 | `ghcr.io/vxture/service-ai-gateway` | `Dockerfile.nestjs-prisma`                       |

**平台层与业务层同时构建**：push `beta` 时，所有 13 个服务均构建 `:beta` 镜像，但只有业务层（vela / ruyin / ai-gateway）实际部署到 worker-02 beta 容器；平台层 `:beta` 镜像构建但不部署（worker-01 无 beta 环境）。

### GHA 缓存

每个服务使用独立 `scope`（`cache-from/cache-to: type=gha,scope=${{ matrix.name }}`），互不干扰，同一服务跨 push 复用 Docker 层缓存。

---

## worker-01 部署工作流（deploy-worker-01.yml）

`docker.yml` 在 `main` 分支成功完成后自动触发（`workflow_run` + `branches: [main]`）。

```
docker.yml 完成（main）
  → deploy-worker-01.yml 触发
    → SSH worker-01（Tailscale）
      → git -C /srv/vxture/repo pull    ← 同步最新 compose 配置
        → docker compose pull           ← 拉取 :latest 镜像
          → docker compose up -d        ← 滚动重启
            → docker compose ps         ← 输出状态确认
```

### GitHub Secrets 配置

| Secret 名                      | 说明                                           |
| ------------------------------ | ---------------------------------------------- |
| `WORKER01_HOST`                | worker-01 Tailscale IP（100.100.197.42）       |
| `WORKER01_USER`                | SSH 用户名（ubuntu）                           |
| `WORKER01_SSH_KEY`             | worker-01 部署专用 SSH 私钥                    |
| `WORKER01_GHCR_USERNAME`       | GHCR 登录用户名（可选，拉私有镜像用）          |
| `WORKER01_GHCR_TOKEN`          | GHCR 读取 token（可选）                        |
| `SONAR_TOKEN`                  | SonarQube 扫描凭证                             |
| `CF_TURNSTILE_TENANT_SITE_KEY` | Cloudflare Turnstile key（Next.js 构建时注入） |

> 部署专用 SSH Key 建议单独生成（`ssh-keygen -t ed25519 -C "deploy-worker-01"`），仅授权执行 `docker compose` 命令，不与开发者个人 Key 共用。

---

## SonarQube（sonar.yml）

与 CI 并行运行，不阻塞镜像构建。触发条件：PR + push to main / beta / develop。

---

## 本地 Git Hooks（Husky）

| Hook         | 执行内容                                                   |
| ------------ | ---------------------------------------------------------- |
| `pre-commit` | `lint-staged`（prettier + eslint 仅对暂存文件）            |
| `pre-push`   | **分支保护**：阻止直接 push 到 `main` / `beta` / `develop` |

Husky 在 `pnpm install` 后由 `prepare` 脚本自动安装（`.husky/` 随代码提交到仓库）。

### 分支保护（pre-push hook）

```bash
# 错误示例：直接在 develop 上 push
git push origin develop
# ✗  Direct push to 'develop' is not allowed.
#    Create a feature/fix branch and open a Pull Request.

# 正确做法：从工作分支 push
git push origin feature/my-feature
# → 正常 push，无拦截

# 紧急绕过（慎用）
git push --no-verify
```

### 与 GitHub Ruleset 的关系

GitHub Branch Rulesets 已配置（`protect-main` / `protect-beta` / `protect-develop`），但因仓库为私有 + 组织免费计划，**Ruleset 当前不生效**。Husky pre-push hook 作为等效的本地执行层，效果一致。升级到 GitHub Team 后，GitHub 侧自动接管，Husky hook 保留作为双重保障。

---

## 参考文档

- `.github/workflows/` — 所有工作流文件
- `.depcruiserc.cjs` — dep-cruiser 规则配置
- `docs/deployment/03-containers.md` — Dockerfile 模板和构建顺序
- `docs/architecture/02-package-boundaries.md` — 层边界规范（dep-cruiser 规则的原始来源）
- `docs/standards/git-workflow.md` — 分支策略与版本晋升流程
