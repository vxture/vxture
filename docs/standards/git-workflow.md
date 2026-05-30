# Vxture Git Workflow Specification

> 版本：2.1.0 | 更新：2026-05-30

---

## 1. 分支体系

### 1.1 主干分支（长期存在，受保护，禁止直接 push）

| 分支      | 对应环境     | 说明                                                                        |
| --------- | ------------ | --------------------------------------------------------------------------- |
| `main`    | 生产（prod） | 平台全量 prod + 所有业务 prod；合并触发正式镜像构建，手动 deploy            |
| `beta`    | 公测（beta） | 业务板块 beta / 试用版本；合并触发 beta 镜像构建，自动部署到 worker-02 beta |
| `develop` | 开发集成     | 日常开发集成主线；仅触发 CI，不构建镜像，不部署                             |

**平台层（worker-01）**：只有 prod，仅跟随 `main` 发布。`beta` / `develop` 分支不触发平台层部署。

**业务层（worker-02）**：维持 prod + beta 双环境：

- `main` 合并 → 构建 `:latest` / `:sha` 镜像 → 手动部署各业务 prod 容器
- `beta` 合并 → 构建 `:beta` 镜像 → 自动部署各业务 beta 容器

**CI 触发**：三个主干分支的 PR 以及 push 均触发 CI（type-check · lint · dep-cruiser）。

---

### 1.2 工作分支（短期，任务完成即删除）

| 前缀        | 用途             | 基分支    | 目标分支            | 示例                               |
| ----------- | ---------------- | --------- | ------------------- | ---------------------------------- |
| `feature/`  | 新功能           | `develop` | `develop`           | `feature/vela-tool-registry`       |
| `fix/`      | Bug 修复         | `develop` | `develop`           | `fix/auth-cookie-domain`           |
| `hotfix/`   | 紧急生产修复     | `main`    | `main` → back-merge | `hotfix/auth-jwt-leak`             |
| `refactor/` | 重构（不改行为） | `develop` | `develop`           | `refactor/design-token-centralize` |
| `docs/`     | 纯文档变更       | `develop` | `develop`           | `docs/architecture-restructure`    |
| `chore/`    | 构建 / CI / 依赖 | `develop` | `develop`           | `chore/pnpm-upgrade`               |

**规则**：

- 所有工作分支必须从 `develop` 创建（`hotfix/` 例外，从 `main` 创建）
- 禁止直接推送到 `main` / `beta` / `develop`
- 分支名使用小写 kebab-case，描述具体内容
- 普通工作分支禁止直接 PR 到 `beta` 或 `main`

---

### 1.3 版本晋升流程

```
feature/* / fix/* / refactor/* / docs/* / chore/*
        │
        ▼  PR → squash merge
    develop   ←─── 日常集成，CI 验证
        │
        ▼  PR → merge commit（集成测试通过后）
      beta    ←─── 业务 beta 自动更新，公测验证
        │
        ▼  PR → merge commit（公测通过 / 发版窗口）
      main    ←─── 正式镜像构建 + 手动部署 prod
```

**hotfix 路径**：

```
main
 ├──▶ hotfix/* ──▶ main  （紧急修复，squash merge）
 │                  │
 │                  ▼ back-merge（merge commit，保持三支同步）
 │                 beta
 │                  │
 │                  ▼
└──────────────── develop
```

**强制目标分支规则**：

| PR 目标分支 | 允许来源分支                                                | 说明                       |
| ----------- | ----------------------------------------------------------- | -------------------------- |
| `develop`   | `feature/*` / `fix/*` / `refactor/*` / `docs/*` / `chore/*` | 日常开发、修复、文档和维护 |
| `beta`      | `develop`                                                   | 预发晋升                   |
| `main`      | `beta` / `hotfix/*`                                         | 正式发布或紧急生产修复     |

除 `hotfix/*` 紧急生产修复外，任何工作分支都不得直接进入 `main`。

---

### 1.4 待执行的独立整改分支（DS 审计后续）

以下分支均从 `develop` 创建，完成后 PR 回 `develop`：

| 分支                               | 内容                                                                 | 优先级 |
| ---------------------------------- | -------------------------------------------------------------------- | ------ |
| `fix/ds-context-split`             | density / theme context 拆分；DensityProvider 反模式重构             | P2     |
| `feature/ds-button-danger-variant` | DS Button 增加正式 `variant="danger"` 扩展点，清理 admin CSS 补丁    | P2     |
| `fix/ds-layout-tokens`             | 布局组件 gap / padding 间距 token 设计对齐；FullscreenContainer 重构 | P2     |
| `refactor/portal-rsc-pages`        | website 落地页 / admin 首页改为 Server Component                     | P2     |
| `refactor/portal-shared-ui`        | ActionButton / EmptyState 提取到共享包                               | P3     |
| `fix/admin-token-dark-mode`        | admin `--tenant-*` scale token 语义化；补充 gray-950 CSS 变量        | P3     |

---

## 2. Commit 规范

日常开发使用 **Conventional Commits** 格式：

```
<type>(<scope>): <description>
```

| type       | 含义                   |
| ---------- | ---------------------- |
| `feat`     | 新功能                 |
| `fix`      | Bug 修复               |
| `refactor` | 重构（不影响外部行为） |
| `perf`     | 性能优化               |
| `docs`     | 纯文档变更             |
| `chore`    | 构建、CI、依赖升级等   |
| `test`     | 测试相关               |
| `style`    | 代码格式（不影响逻辑） |

`scope` 使用包短名（不带 `@vxture/` 前缀）或目录名：

```
feat(vela-bff): add CallerContext middleware
fix(core-auth): handle expired refresh token edge case
refactor(design): centralize tenant settings styles
perf(ds): wrap hook callbacks with useCallback for stability
docs(architecture): remove duplicate dependency rules
chore(deps): upgrade pnpm to 10.x
```

**规则**：

- description 使用中文或英文均可，但保持全 PR 一致
- 禁止无意义的 commit 描述（如 `update`、`fix bug`、`wip`）

---

## 3. PR 流程

1. 从目标基分支（通常是 `develop`）创建工作分支
2. 开发完成后发起 PR，目标分支按 §1.3 晋升流程确定
3. PR 标题遵循 Conventional Commits 格式
4. PR 描述说明：变更内容、测试方式、相关 issue / 设计文档
5. 合并方式按 PR 类型选择：
   - 工作 PR：`feature/*` / `fix/*` / `docs/*` / `chore/*` / `refactor/*` → **Squash merge**
   - 晋升 PR：`develop -> beta`、`beta -> main` → **Create a merge commit**
   - 回灌 PR：`main -> beta`、`main -> develop`、`beta -> develop` → **Create a merge commit**
6. 合并后删除工作分支

**禁止事项**：

- 禁止对晋升 PR 和回灌 PR 使用 Squash merge；否则内容可能同步，但 Git 历史不会包含源分支提交，三条主干会再次分叉。
- 禁止用本地强推、reset 或直接 push 对齐 `main` / `beta` / `develop`。
- 若 UI 只显示 Squash merge，先检查 Repository Rulesets 是否允许 `merge`，不要继续合并。

---

## 4. Release Tag 规范

正式发布时在 `main` 对应提交上打 Tag：

### Tag 格式

```
shortname@Vx.y.yyMMdd.nn
```

| 字段        | 说明                                 |
| ----------- | ------------------------------------ |
| `shortname` | 包短名（不带 `@vxture/` 前缀）       |
| `Vx.y`      | semver 版本号（来自 `package.json`） |
| `yyMMdd`    | 发布日期（年月日）                   |
| `nn`        | 当日序号（`01`、`02`...）            |

**示例**：`core-tenant@V1.0.0.260314.01`

### 发布流程

1. 确认代码已合并到 `main` 且 CI 全绿
2. 更新 `package.json` 版本号
3. 提交版本号变更（commit message：`chore(shortname): release Vx.y`）
4. 打 Tag 并推送：`git tag shortname@Vx.y.yyMMdd.nn && git push origin --tags`

---

## 5. 版本号规则（SemVer）

| 类型          | 规则                       |
| ------------- | -------------------------- |
| Patch `x.y.Z` | Bug 修复、向后兼容的小改动 |
| Minor `x.Y.0` | 新增功能、向后兼容         |
| Major `X.0.0` | 破坏性变更（接口不兼容）   |

**monorepo 包独立版本**：每个包独立维护版本号，不做全仓库统一版本。
