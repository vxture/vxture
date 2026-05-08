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

> 详细进度见 → [`docs/context/status.md`](context/status.md)

| 模块 | 状态 |
|------|------|
| auth-bff（JWT 统一签发） | ✅ 运行中 |
| website + console + admin | ✅ 运行中 |
| Vela（智能助手） | ✅ 三端运行中，嵌入 admin / console |
| Ruyin（Agent） | 🟡 server 运行中，studio/bff 建设中 |
| 支付系统 | ⏳ 待接入 |

---

## Docs 目录导航

```
docs/
├── agent.md                ← 本文件，T0 入口
│
├── architecture/           ← 层级结构 / 依赖边界（慢变化，权威参考）
│   └── index.md            ← 从这里开始
│
├── ai/                     ← AI 工作规范（编码规则、注释、审计）
│   └── index.md
│
├── design/                 ← 跨包能力域技术设计（auth / locale / 权限 / 多租户）
│   └── index.md
│
├── packages/               ← 各包实现上下文（迁移自各包 CLAUDE.md，待重构）
│   └── index.md
│
├── product/                ← 产品规格（Vela 规格、Admin 设计、路线图）
│   └── index.md
│
├── standards/              ← 工程规范（Git / Locale / Utils）
│   └── index.md
│
├── context/                ← 当前状态 / 任务进度（快速变化）
│   └── status.md
│
├── deployment/             ← 部署方案（容器 / 环境变量 / 基础设施）
│   └── index.md
│
└── db/                     ← 数据库设计（Schema / 迁移记录）
    └── index.md
```

---

## 任务路由表

在开始任何任务前，按任务类型读取对应文档：

| 任务类型 | 必读文档 |
|---------|---------|
| 理解层级结构 / 依赖规则 | `architecture/index.md` → `architecture/00-overview.md` |
| 修改或新建 BFF | `architecture/10-bff-layer.md` + `packages/bff/{name}.md` |
| 修改 Core 包 | `architecture/05-core-layer.md` + `packages/core/{name}.md` |
| 修改 Service | `architecture/07-service-layer.md` + `packages/services/{name}.md` |
| 新建 Agent（server + studio + bff） | `architecture/11-agent-server.md` + `product/agents/` |
| Vela 功能开发 | `product/agents/vela/spec.md` + `packages/agents/vela-server.md` |
| Auth / JWT / Cookie 相关 | `design/auth.md` + `packages/bff/auth-bff.md` |
| 权限 / RBAC | `design/permissions.md` |
| 多租户逻辑 | `design/tenant.md` + `packages/core/tenant.md` |
| i18n / Locale | `design/locale.md` + `packages/core/locale.md` |
| 数据库 Schema 变更 | `db/index.md` + `packages/core/database.md` |
| 部署 / 环境配置 | `deployment/index.md` |
| 端口分配 | `ai/port-allocation.md` |
| AI 编码规则 | `ai/coding-rules.md` |

---

## 全局规则指针

| 规则类型 | 文件 |
|---------|------|
| 操作范围 / 层边界 / TypeScript / 注释规范 | 根目录 `CLAUDE.md`（G1-G6） |
| 详细编码规则 | `docs/ai/coding-rules.md` |
| 注释格式 | `docs/ai/coding-comments.md` |
| 代码风格 | `docs/ai/coding-style.md` |

---

_版本：1.0.0 | 2026-05-08_
