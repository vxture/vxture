# ADR-003: 采用 pnpm workspaces monorepo

**状态**：✅ Accepted
**日期**：2026-02-01

---

## 背景

平台由 35+ 个包组成（portals、agent-studio、bff、agent-server、services、core、shared、design、platform），这些包之间存在大量共享代码需求（类型、工具函数、基础设施原语）。

需要决定代码组织和包管理策略。

## 决策选项

### 选项 A：Polyrepo（独立仓库 + npm 发布）

每个包独立仓库，通过 npm 发布后被消费。

**缺点**：本地开发时每改一个底层包就要发版；版本矩阵管理复杂（`core@1.2.3` 到底和哪个 `service@2.x` 对应）；TypeScript 路径别名无法自动工作，需要 `tsc --build` 链。

### 选项 B：Lerna + npm workspaces

**缺点**：Lerna 已进入维护模式，npm workspaces 的 hoisting 策略容易产生幽灵依赖（ghost dependencies）——即可以引用未在自己 `package.json` 中声明的包。

### 选项 C：Nx monorepo

**缺点**：Nx 有较高的学习和配置成本，它的代码生成器和插件生态是主要价值，但当前团队规模和项目阶段不需要这一复杂度。

### 选项 D：pnpm workspaces + Turborepo

pnpm 原生的 workspace 协议（`workspace:*`），配合 `pnpm-workspace.yaml` 定义包边界；Turborepo 负责任务编排、构建缓存和增量构建。

**优点**：
- 零配置本地包链接，改一个包立即在消费者中生效
- pnpm 的严格 symlink 策略：禁止引用未声明的包（杜绝幽灵依赖）
- Content-addressable store 节省磁盘空间
- Turborepo 的 Pipeline 定义依赖拓扑，自动并行执行无依赖的任务
- Turborepo 远程缓存：CI 构建结果共享，避免重复构建未变更的包

## 决策

采用**选项 D（pnpm workspaces + Turborepo）**，不引入 Nx（学习成本高，生成器能力对当前规模过重）。

- pnpm 负责包管理和本地包链接
- Turborepo 负责构建任务编排（`turbo build`、`turbo test`）和 CI 缓存加速

## 后果

**正面：**
- 修改 `@vxture/shared` 后，所有消费者立即感知，无需发版
- TypeScript project references 和路径别名（`@vxture/*`）自动工作
- 严格的依赖声明：每个包只能使用自己 `package.json` 中显式声明的依赖
- Turborepo 自动识别变更包及其下游，CI 只重新构建受影响的包
- Turborepo 远程缓存（Remote Cache）可显著缩短 CI 时间

**负面：**
- 所有开发者和 CI 必须安装 pnpm（不兼容 npm/yarn 直接安装）
- Turborepo `turbo.json` pipeline 配置需要随包结构变化维护
- 部分 npm 生态工具对 pnpm symlink 有兼容性问题（需要 `.npmrc` 中配置 `node-linker=hoisted` 临时绕过）

---

_决策人：架构组 | 实施于：根目录 `pnpm-workspace.yaml`、`turbo.json`、所有包 `package.json`_
