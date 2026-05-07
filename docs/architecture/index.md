# Architecture Documentation Index

**Version**: 1.5.0
**Last Updated**: 2026-05-06
**TypeScript**: 5.9.3
**ECMAScript**: ES2023

## 架构文档（阅读顺序）

### 概览与全局规范

| 文件                       | 内容                                            |
| -------------------------- | ----------------------------------------------- |
| `00-overview.md`           | 平台架构总览 — 层级关系、原则、依赖规则一页总结 |
| `01-monorepo.md`           | Monorepo 结构、工作区配置、各层目录规范         |
| `02-package-boundaries.md` | 各层依赖边界的权威参考                          |
| `03-package-graph.json`    | 机器可读的包依赖图                              |

### 层级文档（依赖链由下至上）

| 文件                  | 内容                                               |
| --------------------- | -------------------------------------------------- |
| `04-shared-layer.md`  | Shared 层 — 工具函数、类型、常量                   |
| `05-core-layer.md`    | Core 层 — 平台基础设施原语                         |
| `06-ai-sdk.md`        | AI SDK — LLM / RAG / Embedding / Workflow 模块架构 |
| `07-service-layer.md` | Service 层 — 共享域服务与晋升生命周期              |
| `08-design-system.md` | Design System — UI 组件、主题、图标、设计令牌      |
| `09-platform-sdk.md`  | Platform SDK — 第三方客户端 SDK 封装（浏览器专用） |
| `10-bff-layer.md`     | BFF 层 — 认证、聚合、路由、响应塑形                |
| `11-agent-server.md`  | Agent Server 层 — Agent 私有后端架构               |

### 横切关注点

| 文件               | 内容                                |
| ------------------ | ----------------------------------- |
| `12-typescript.md` | TypeScript 配置标准与工程规范       |
| `13-tech-stack.md` | 技术栈选型 — 当前基准版本与升级路径 |

## Coding 规范

| 文件                        | 内容            |
| --------------------------- | --------------- |
| `claude-coding-comments.md` | 注释规范        |
| `claude-coding-rules.md`    | AI 编码行为规则 |
| `claude-coding-style.md`    | 代码风格规范    |

## Agent 实例

| 实例  | 前端               | 后端               | BFF           | 状态                                  |
| ----- | ------------------ | ------------------ | ------------- | ------------------------------------- |
| ruyin | agent-studio/ruyin | agent-server/ruyin | bff/ruyin-bff | 🟡 server 运行中，studio/bff 建设中   |
| vela  | agent-studio/vela  | agent-server/vela  | bff/vela-bff  | ✅ 三端运行中（嵌入 admin / console） |

## Changelog

### v1.5.0 — 2026-05-06

- `00-overview.md` v1.3.0：新增「Portal Internal Architecture Notes」附录，记录 website v2.0 Content Registry 系统与路由重构
- `01-monorepo.md` v1.3.0：新增「Appendix A: portals/website Internal Architecture」附录，完整记录 website 路由组、Content Registry、翻译策略、Middleware、内部目录原则
- `index.md` v1.5.0：更新 changelog

### v1.4.0 — 2026-05-03

- 新增 `@vxture/core-mail`：事务邮件包，nodemailer 封装，无 SMTP 时自动 no-op
- `05-core-layer.md` v1.3.0：补充 `core-mail` 包描述、跨依赖约束说明、消费者表格
- `10-bff-layer.md` v1.3.0：新增"事务邮件"章节，记录 Portal BFF fire-and-forget 邮件模式
- `00-overview.md`：ASCII 图和包表格补充 `@vxture/core-mail`
- Agent 实例表补充 Vela（三端运行中，嵌入式部署）

### v1.3.0 — 2026-03-11

- 新增 `13-tech-stack.md`：技术栈选型文档，含当前基准版本与升级路径
- 补充 Agent 实例索引表（ruyin）

### v1.2.0 — 2026-03-10

- 新增 `06-ai-sdk.md`：AI SDK 模块架构专项文档
- 新增 `09-platform-sdk.md`：Platform SDK 专项文档
- 新增 `10-bff-layer.md`：BFF 层专项文档
- 文档重编号：按依赖链底层→高层排列
  - `06-shared-layer.md` → `04-shared-layer.md`
  - `09-agent-server.md` → `11-agent-server.md`
  - `10-typescript.md` → `12-typescript.md`
- `00-overview.md` Document Map 同步更新

### v1.1.0 — 2026-03-10

- `services/` 引入域分组目录结构：`services/{domain}/{name}/`
- 新增 `commerce` 域：`billing`、`subscription`
- 新增 `support` 域：`ticket`
- 包名保持不变：`@vxture/service-{name}`
- `pnpm-workspace.yaml` 通配符从 `services/*` 更新为 `services/*/*`
