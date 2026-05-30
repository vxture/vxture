# Vxture Git Workflow Specification

> 版本：2.3.0 | 更新：2026-05-31

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

| 前缀        | 用途             | 基分支    | 目标分支                      | 示例                               |
| ----------- | ---------------- | --------- | ----------------------------- | ---------------------------------- |
| `feature/`  | 新功能           | `develop` | `develop`                     | `feature/vela-tool-registry`       |
| `fix/`      | Bug 修复         | `develop` | `develop`                     | `fix/auth-cookie-domain`           |
| `hotfix/`   | 紧急生产修复     | `main`    | `main` + 同等修复回 `develop` | `hotfix/auth-jwt-leak`             |
| `refactor/` | 重构（不改行为） | `develop` | `develop`                     | `refactor/design-token-centralize` |
| `docs/`     | 纯文档变更       | `develop` | `develop`                     | `docs/architecture-restructure`    |
| `chore/`    | 构建 / CI / 依赖 | `develop` | `develop`                     | `chore/pnpm-upgrade`               |

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
        ▼  Promotion → fast-forward（集成测试通过后）
      beta    ←─── 业务 beta 自动更新，公测验证
        │
        ▼  Promotion → fast-forward（公测通过 / 发版窗口）
      main    ←─── 正式镜像构建 + 手动部署 prod
```

**核心目标**：当同一版本已完成晋升时，三大主干必须严格指向同一提交：

```
develop == beta == main
```

该规则用于避免阶段倒挂。禁止出现 `main` 比 `beta` 新、`beta` 比 `develop` 新的状态；版本一致时，三条主干不仅内容一致，commit tip 也必须一致。

**hotfix 路径**：

```
main
 └──▶ hotfix/* ──▶ main  （紧急修复，受控例外）

develop
 └──▶ fix/* ──▶ develop ──▶ beta ──▶ main
      （补同等修复，继续走标准晋升链路）
```

`hotfix/*` 是生产紧急修复例外，不代表允许长期从 `main` 回灌。生产修复完成后，必须用同等修复（cherry-pick 或等价 patch）进入 `develop`，再按 `develop -> beta -> main` 重新恢复三主干一致。

**强制目标分支规则**：

| PR 目标分支 | 允许来源分支                                                | 说明                       |
| ----------- | ----------------------------------------------------------- | -------------------------- |
| `develop`   | `feature/*` / `fix/*` / `refactor/*` / `docs/*` / `chore/*` | 日常开发、修复、文档和维护 |
| `beta`      | `develop`                                                   | 预发晋升                   |
| `main`      | `beta` / `hotfix/*`                                         | 正式发布或紧急生产修复     |

除 `hotfix/*` 紧急生产修复外，任何工作分支都不得直接进入 `main`。

**强制合并 / 晋升方式**：

| PR 目标分支 | 允许合并方式           | GitHub 约束来源                         |
| ----------- | ---------------------- | --------------------------------------- |
| `develop`   | Squash merge           | `protect-develop` ruleset               |
| `beta`      | Fast-forward promotion | Promotion 流程 + `protect-beta` ruleset |
| `main`      | Fast-forward promotion | Promotion 流程 + `protect-main` ruleset |
| 所有 PR     | 必须通过分支流检查     | Repository rulesets + PR Branch Policy  |

GitHub 默认合并按钮不直接等价于 Vxture 的晋升要求：

| 方式                  | 是否用于主干晋升 | 原因                                                                      |
| --------------------- | ---------------- | ------------------------------------------------------------------------- |
| Create a merge commit | 禁止             | 会在目标分支新增 promotion commit，导致 `beta > develop` 或 `main > beta` |
| Squash merge          | 禁止             | 会生成新的 squash commit，内容可一致但历史不一致                          |
| Rebase merge          | 禁止             | 会重写提交 SHA，不能保证 `develop == beta == main`                        |
| Fast-forward          | 必须             | 目标分支指针直接移动到源分支提交，满足三主干同指针                        |

因此，晋升 PR 只能作为评审、CI 和审计入口；实际晋升动作必须由受控 fast-forward promotion 流程完成，不通过 GitHub UI 的普通合并按钮完成。

### 1.4 Fast-forward Promotion 规范

Promotion 是受控分支指针推进，不是代码合并。目标是把下游主干移动到上游主干的同一个 commit。

| 晋升              | 前置条件                       | 目标结果          |
| ----------------- | ------------------------------ | ----------------- |
| `develop -> beta` | `beta` 必须是 `develop` 的祖先 | `beta == develop` |
| `beta -> main`    | `main` 必须是 `beta` 的祖先    | `main == beta`    |

推荐实现方式：

1. 创建晋升 PR，用于记录本次晋升范围、变更摘要、CI 结果和审批意见。
2. PR 通过 required checks 后，不点击普通 merge 按钮。
3. 由受控 promotion workflow 或管理员执行 `git merge --ff-only` / ref fast-forward。
4. 推进完成后，在晋升 PR 或 release 记录中写入源 commit、目标 commit、操作者和时间。
5. 验证 `develop == beta == main` 或当前晋升链路目标相等。

命令语义示例：

```bash
git fetch origin
git switch beta
git merge --ff-only origin/develop
git push origin beta

git switch main
git merge --ff-only origin/beta
git push origin main
```

若 `--ff-only` 失败，说明目标分支已经分叉，禁止继续普通合并。必须先分析分叉原因，必要时走“紧急对齐流程”。

### 1.5 Required Checks 契约

Required status check 名称是 ruleset 与 workflow 的接口契约，不是展示文案。禁止随意修改 job name；如确需修改，必须先更新本规范并完成变更评审。

Vxture 使用稳定聚合门禁名称：

| Check 名称            | 职责                                                     |
| --------------------- | -------------------------------------------------------- |
| `Quality Gate`        | 类型检查、Lint、设计系统护栏、包边界检查的聚合质量门     |
| `Enforce Branch Flow` | PR 来源/目标合法性检查，阻止错误流向、回灌、倒挂风险入口 |
| `Build`               | 构建关键服务，验证产物可生成                             |
| `Test · Coverage`     | 单元测试与覆盖率产物                                     |
| `Audit`               | 关键依赖安全审计                                         |

`Quality Gate` 内部固定包含：

1. Type Check：`pnpm type-check:all`
2. Lint：`pnpm --recursive --if-present lint`
3. Guardrail：`pnpm lint:design`
4. Boundaries：`pnpm lint:boundaries`

推荐 required checks 矩阵：

| 目标分支  | Required checks                                                            |
| --------- | -------------------------------------------------------------------------- |
| `develop` | `Quality Gate`、`Enforce Branch Flow`                                      |
| `beta`    | `Quality Gate`、`Build`、`Test · Coverage`、`Enforce Branch Flow`          |
| `main`    | `Quality Gate`、`Build`、`Test · Coverage`、`Audit`、`Enforce Branch Flow` |

`SonarQube` 暂不作为 required check。待扫描稳定性、外部状态名称和失败处理策略明确后，再单独纳入 ruleset。

---

### 1.6 待执行的独立整改分支（DS 审计后续）

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
   - 晋升 PR：`develop -> beta`、`beta -> main` → **Fast-forward promotion**
   - 紧急修复 PR：`hotfix/* -> main` → **受控例外，完成后补同等修复回 develop**
6. 合并后删除工作分支

**禁止事项**：

- 禁止对晋升 PR 使用 GitHub 普通 merge / squash / rebase 按钮；否则内容可能同步，但 Git 历史不会满足三主干同指针。
- 禁止用本地强推、reset 或直接 push 对齐 `main` / `beta` / `develop`。
- 禁止用 `sync/*`、`main -> beta`、`main -> develop` 或 `beta -> develop` 直接回灌；需要补同等修复时，从 `develop` 创建 `fix/*` 后继续走标准晋升链路。
- 若 UI 显示的合并按钮与目标分支约定不一致，先检查 Repository Rulesets，不要继续合并。

### 3.1 紧急对齐流程

当历史倒挂已经发生，且无法通过 fast-forward 恢复时，允许在获得明确确认后执行一次性紧急对齐。

执行要求：

1. 记录 `develop`、`beta`、`main` 当前 commit。
2. 创建并推送远端备份分支。
3. 临时调整 ruleset，仅开放必要窗口。
4. 使用 `--force-with-lease` 对齐目标分支，禁止无 lease 强推。
5. 立即恢复 ruleset。
6. 验证三主干指向一致。
7. 在变更记录中写明原因、操作者、旧 commit、新 commit、恢复路径。

紧急对齐不是日常晋升方式；每次发生都必须反查流程缺陷并修正文档 / ruleset / workflow。

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
