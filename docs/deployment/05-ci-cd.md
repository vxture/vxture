# CI/CD 流水线

> 更新：2026-05-10

---

## 工作流总览

| 文件 | 触发条件 | 运行环境 | 用途 |
|------|---------|---------|------|
| `.github/workflows/ci.yml` | PR / push to main | ubuntu-latest | 类型检查 · Lint · 边界校验 |
| `.github/workflows/build.yml` | PR / push to main | windows-latest | SonarQube 代码质量扫描 |

两个工作流**并行运行**，相互独立。

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
- `--if-present`：lint 步骤跳过没有 lint 脚本的包（如 admin-bff T13 待补）
- `cancel-in-progress: true`：同一分支新推送取消旧运行，节省 runner 分钟数

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

## 构建缓存策略

当前使用 `actions/setup-node@v4` 的内置 pnpm 缓存（`cache: 'pnpm'`），缓存 key 基于 `pnpm-lock.yaml` 哈希。

后续若引入 Turborepo，可在此处补充 `.turbo` 缓存配置。

---

## SonarQube（build.yml）

SonarQube 扫描使用平台 Secrets：

```
SONAR_TOKEN
SONAR_HOST_URL
SONAR_PROJECT_KEY
SONAR_PROJECT_NAME
SONAR_PROJECT_VERSION
```

需在 GitHub 仓库 Settings → Secrets and variables → Actions 中配置。

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
- `.github/workflows/ci.yml` — CI 工作流
- `docs/architecture/02-package-boundaries.md` — 层边界规范（dep-cruiser 规则的原始来源）
