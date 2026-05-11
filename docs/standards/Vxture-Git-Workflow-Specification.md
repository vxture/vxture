# Vxture Git Workflow Specification

> 版本：1.1.0 | 更新：2026-05-11

---

## 1. 分支策略

| 分支前缀 | 用途 | 示例 |
|----------|------|------|
| `main` | 生产分支，始终保持可部署状态 | — |
| `feature/` | 新功能开发 | `feature/vela-tool-registry` |
| `fix/` | Bug 修复 | `fix/auth-cookie-domain` |
| `refactor/` | 重构（不改行为） | `refactor/design-token-centralize` |
| `docs/` | 纯文档变更 | `docs/architecture-restructure` |
| `chore/` | 构建、CI、依赖等工程类 | `chore/pnpm-upgrade` |

**规则**：
- 所有开发在独立分支进行，禁止直接推送到 `main`
- 分支名使用小写 kebab-case，描述具体内容

---

## 2. Commit 规范

日常开发使用 **Conventional Commits** 格式：

```
<type>(<scope>): <description>
```

| type | 含义 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 重构（不影响外部行为） |
| `docs` | 纯文档变更 |
| `chore` | 构建、CI、依赖升级等 |
| `test` | 测试相关 |
| `style` | 代码格式（不影响逻辑） |

`scope` 使用包短名（不带 `@vxture/` 前缀）或目录名：

```
feat(vela-bff): add CallerContext middleware
fix(core-auth): handle expired refresh token edge case
refactor(design): centralize tenant settings styles
docs(architecture): remove duplicate dependency rules
chore(deps): upgrade pnpm to 10.x
```

**规则**：
- description 使用中文或英文均可，但保持全 PR 一致
- 禁止无意义的 commit 描述（如 `update`、`fix bug`、`wip`）

---

## 3. PR 流程

1. 从 `main` 创建功能分支
2. 开发完成后发起 PR，目标分支为 `main`
3. PR 标题遵循 Conventional Commits 格式
4. PR 描述说明：变更内容、测试方式、相关 issue / 设计文档
5. 合并方式：**Squash merge**（保持 main 历史整洁）
6. 合并后删除功能分支

---

## 4. Release Tag 规范

正式发布时为对应包打 Tag：

### Tag 格式

```
shortname@Vx.y.yyMMdd.nn
```

| 字段 | 说明 |
|------|------|
| `shortname` | 包短名（不带 `@vxture/` 前缀） |
| `Vx.y` | semver 版本号（来自 `package.json`） |
| `yyMMdd` | 发布日期（年月日） |
| `nn` | 当日序号（`01`、`02`...） |

**示例**：`core-tenant@V1.0.0.260314.01`

### 发布流程

1. 确认代码已合并到 `main` 且测试通过
2. 更新 `package.json` 版本号
3. 提交版本号变更（commit message：`chore(shortname): release Vx.y`）
4. 打 Tag 并推送：`git tag shortname@Vx.y.yyMMdd.nn && git push origin --tags`

---

## 5. 版本号规则（SemVer）

| 类型 | 规则 |
|------|------|
| Patch `x.y.Z` | Bug 修复、向后兼容的小改动 |
| Minor `x.Y.0` | 新增功能、向后兼容 |
| Major `X.0.0` | 破坏性变更（接口不兼容） |

**monorepo 包独立版本**：每个包独立维护版本号，不做全仓库统一版本。
