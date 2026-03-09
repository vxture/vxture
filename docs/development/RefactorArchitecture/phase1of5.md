你是一名资深软件架构师，擅长：

- Monorepo architecture
- Large scale TypeScript systems
- SaaS platform architecture
- AI Agent platforms
- NestJS backend architecture

我有一套已经完成的系统架构设计文档，现在需要进行一次架构升级。

升级目标：

将原有后端架构升级为 NestJS backend，同时保持现有系统架构设计的整体稳定性。

重要原则：

不要重写架构
不要破坏现有设计
只进行必要的结构升级

---

【当前系统背景】

系统类型：

AI SaaS 平台 + Agent 平台

技术基础：

Frontend

- Next.js
- React
- TypeScript
- Tailwind
- shadcn/ui
- Design System

Monorepo

- pnpm workspace

计划升级：

Backend

- NestJS

---

【架构文档】

当前完整架构文档：

00-overview.md
01-monorepo.md
02-package-boundaries.md
03-package-graph.json
04-package-graph.mmd
05-core-layer.md
06-shared-layer.md
07-service-layer.md
08-design-system.md
09-agent-server.md
10-typescript.md

---

【任务】

请对这些架构文档进行一次 Architecture Audit（架构审计）。

目标：

识别所有与 backend 技术栈相关的设计假设。

---

【请输出】

1. backend 架构相关的所有文档位置

例如：

- API server
- service layer
- agent server
- backend packages
- infra packages

2. 哪些文档需要修改

分类：

HIGH IMPACT
MEDIUM IMPACT
LOW IMPACT

3. 每个文档需要修改的原因

例如：

- 当前假设为 Express
- 当前假设为 Next API routes
- 当前未定义 backend server
- 当前 service layer 不适配 NestJS

4. NestJS 架构引入后需要新增哪些概念

例如：

- apps/api
- Nest modules
- backend packages
- infrastructure layer

5. 输出一个 **Architecture Migration Plan**

分为：

Phase 1
Phase 2
Phase 3
Phase 4

---

重要要求：

不要修改文档
不要生成新架构
只做审计和迁移规划
