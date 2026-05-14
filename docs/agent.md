# Vxture Agent Context

> **读取协议**：这是 AI agent 工作前的 T0 入口文件。
> 每次进入任务前必读，< 150 行，快速定位后按需深入。
> 全局编码规则见根目录 `CLAUDE.md`。

---

## 平台一句话

Vxture 是基于 **pnpm workspace monorepo** 的企业 SaaS 平台（TypeScript 5.9.3 / ES2023），
分两个产品面：**Platform**（运营后台，慢迭代）和 **Agent Studio**（AI 产品，快迭代）。

---

## 两个产品面

| 产品面 | 目录 | 服务对象 | 迭代节奏 |
|--------|------|---------|---------|
| Platform | `portals/website` `portals/admin` `portals/console` | 运营者 / 租户管理员 | 慢 |
| Agent Studio | `agent-studio/*` + `agent-server/*` | 终端用户 | 快 |

---

## 当前实施状态

> 详细进度见 → [`docs/status.md`](status.md)

| 模块 | 状态 |
|------|------|
| auth-bff（JWT 统一签发） | ✅ 运行中 |
| website + console + admin | ✅ 运行中 |
| Vela（智能助手） | ✅ 三端运行中，嵌入 admin / console |
| Ruyin（Agent） | ✅ 三端运行中 |
| 支付系统 | ⏳ 待接入 |

---

## Docs 目录导航

```
docs/
├── agent.md              ← 本文件，T0 入口
├── glossary.md           ← 核心术语表（30 个概念权威定义）
├── status.md             ← 平台实施状态（实时更新）
│
├── architecture/         ← 层级结构 / 依赖边界（权威，慢变化）
├── decisions/            ← 架构决策记录 ADR（记录重大设计的"为什么"）
├── ai/                   ← AI 工作规范：编码规则、注释、代码风格、TypeScript 配置
├── audit/                ← 工程合规审计：规则、CI 门控、检查清单
├── design/               ← 跨包能力域设计（auth / locale / 权限 / 多租户）
├── development/          ← 本地开发：环境搭建、服务启动、常见问题
├── packages/             ← 各包实现上下文（AI 编码时的主要参考）
├── product/              ← 产品规格（Vela / Ruyin / Admin 设计）
├── standards/            ← 工程规范（Git / 测试 / 安全 / Locale / Utils）
├── db/                   ← 数据库 Schema 设计与迁移
└── deployment/           ← 部署方案（基础设施 / 环境变量 / CI-CD）
```

---

## 任务路由表

| 任务类型 | 必读文档 |
|---------|---------|
| 理解层级结构 / 依赖规则 | `architecture/index.md` → `architecture/00-overview.md` |
| 修改或新建 BFF | `architecture/05-bff-layer.md` + `packages/bff/{name}.md` |
| 修改 Core 包 | `architecture/03-core-layer.md` + `packages/core/{name}.md` |
| 修改 Service | `architecture/04-service-layer.md` + `packages/services/{name}.md` |
| 新建 Agent（server + studio + bff） | `architecture/06-agent-server.md` + `product/agents/` |
| Vela 功能开发 | `product/agents/vela/spec.md` + `packages/agents/vela/server.md` |
| Auth / JWT / Cookie 相关 | `design/auth.md` + `packages/bff/auth.md` |
| 权限 / RBAC | `design/permissions.md` |
| 多租户逻辑 | `design/tenant.md` + `packages/core/tenant.md` |
| i18n / Locale | `design/locale.md` + `packages/core/locale.md` |
| 数据库 Schema 变更 | `db/index.md` + `packages/core/database.md` |
| 部署 / 环境配置 | `deployment/index.md` |
| 端口分配 | `ai/port-allocation.md` |
| AI 编码规则 | `ai/01-coding-rules.md` |
| Core 包架构审计 | `audit/checklist-core.md` |
| Design System 合规审计 | `audit/checklist-ds.md` |
| 概念不理解 / 术语查找 | `glossary.md` |
| 为什么这样设计（架构决策） | `decisions/index.md` |
| 本地开发环境启动 | `development/setup.md` |
| 测试策略 / 各层测试规范 | `standards/testing.md` |
| 安全规范 / Secrets 管理 | `standards/security.md` |
| 平台当前进度 | `status.md` |

---

## 全局规则指针

| 规则类型 | 文件 |
|---------|------|
| 操作范围 / 层边界 / TypeScript / 注释规范 | 根目录 `CLAUDE.md`（G1-G6） |
| 详细编码规则 | `docs/ai/01-coding-rules.md` |
| 注释格式 | `docs/ai/03-coding-comments.md` |
| 代码风格 | `docs/ai/02-coding-style.md` |

---

_版本：2.1.0 | 2026-05-14_
