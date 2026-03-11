# Vxture 重构 Phase 总览

**Version**: 1.0.0
**Last Updated**: 2026-03-11

---

## Phase 状态总览

| Phase   | 内容                                                    | 状态      |
| ------- | ------------------------------------------------------- | --------- |
| Phase 0 | Monorepo 骨架 — 目录、package.json、tsconfig、workspace | ✅ 完成   |
| Phase 1 | Shared & Core 层规范化                                  | 🔄 进行中 |
| Phase 2 | Service 层规范化                                        | ⏳ 待执行 |
| Phase 3 | Agent Server 层规范化                                   | ⏳ 待执行 |
| Phase 4 | 现有 BFF 规范化                                         | ⏳ 待执行 |
| Phase 5 | 新 BFF 创建（ruinagent-bff）                            | ⏳ 待执行 |
| Phase 6 | 跨层依赖审计                                            | ⏳ 待执行 |

---

## Phase 0 — Monorepo 骨架 ✅

**目标**：建立完整的 monorepo 工程骨架。

**内容**：

- pnpm-workspace.yaml
- 根 tsconfig.base.json（含所有路径别名）
- 根 tsconfig.json（project references）
- 各层所有包的 package.json（名称、版本、依赖声明）
- 各包的 tsconfig.json / tsconfig.build.json
- 各包的 src/index.ts 空 barrel 占位

---

## Phase 1 — Shared & Core 层规范化

**目标包**：

- `@vxture/shared`
- `@vxture/core-api` / `core-auth` / `core-config` / `core-locale` / `core-tenant` / `core-utils`

**核心工作**：

- 文件结构规范化（按职责分层）
- 文件命名规范化（_.utils.ts / _.types.ts / \*.client.ts 等）
- 注释头补齐（@package / @layer / @category / @author / @date）
- barrel export 统一（src/index.ts 单一出口）
- 依赖约束验证（仅允许 @vxture/shared，framework-agnostic）
- TypeScript 严格模式（禁止 any）

**技术约束**：

- HTTP 客户端：原生 fetch（双端兼容）
- JWT：jsonwebtoken
- 校验：zod（仅 shared 层）
- 工具：dayjs（仅 shared 层）
- 环境变量：原生 process.env
- 国际化格式化：原生 Intl API
- 禁止：NestJS / Next.js / React / Prisma / class-validator / axios

**执行顺序**：
@vxture/shared → core-config → core-utils → core-api → core-auth → core-tenant → core-locale

**检查文件**：`phase1-check.md`

---

## Phase 2 — Service 层规范化

**目标包**：

- `@vxture/service-billing`
- `@vxture/service-subscription`
- `@vxture/service-ticket`

**核心工作**：

- 目录结构规范化（service / repository / types）
- 文件命名规范化（_.service.ts / _.repository.ts / \*.types.ts）
- NestJS Module 结构对齐
- 注释头补齐
- 依赖约束验证（只允许 core-\* / shared）
- 禁止跨 service 导入

**技术约束**：

- 框架：NestJS（Module / Injectable / Controller）
- ORM：Prisma
- 校验：class-validator + class-transformer
- 禁止：ai-sdk / design-system / platform-_ / 跨 service-_ 导入

**检查文件**：`phase2-check.md`

---

## Phase 3 — Agent Server 层规范化

**目标**：`agent-server/ruinagent`

**核心工作**：

- 内部分层规范化（routers / workflows / providers / storage / services / types）
- 所有 AI 调用必须通过 @vxture/ai-sdk，禁止直接集成 provider SDK
- storage 访问封装（禁止 route handler 内联 DB 查询）
- 禁止跨 agent 导入
- 注释头补齐
- 异步任务使用 BullMQ 基础功能

**技术约束**：

- 框架：NestJS
- ORM：Prisma
- AI 调用：@vxture/ai-sdk（统一接口）
- 队列：BullMQ（基础功能）
- 向量：pgvector（通过 Prisma）
- 禁止：直接引用 Doubao SDK / Anthropic SDK / 跨 agent-server 导入

**检查文件**：`phase3-check.md`

---

## Phase 4 — 现有 BFF 规范化

**目标**：

- `bff/website-bff`
- `bff/admin-bff`
- `bff/tenant-bff`

**核心工作**：

- routers / aggregators / middleware / types 分层规范化
- 每个 router 独立错误处理
- auth / tenant middleware 统一（调用 core-auth / core-tenant）
- 响应 DTO 类型化（types/ 目录）
- 禁止业务逻辑进入 BFF
- 注释头补齐

**技术约束**：

- 框架：NestJS
- 认证：Passport.js + JWT
- DTO 校验：class-validator + class-transformer
- API 文档：@nestjs/swagger
- 禁止：ai-sdk / design-system / platform-\* / 跨 BFF 导入 / React / 浏览器 API

**检查文件**：`phase4-check.md`

---

## Phase 5 — 新 BFF 创建（ruinagent-bff）

**目标**：`bff/ruinagent-bff`（从零创建）

**核心工作**：

- 按规范完整创建 Agent BFF 结构
- 对接 agent-server/ruinagent（内部 HTTP / tRPC）
- 对接 @vxture/service-\* 平台能力
- auth / tenant middleware 接入
- 完整 router / aggregator / DTO 定义

**技术约束**：同 Phase 4

**检查文件**：`phase5-check.md`

---

## Phase 6 — 跨层依赖审计

**目标**：全局扫描，修正所有非法依赖。

**核心工作**：

- 前端是否引用了 service-_ / core-_ / ai-sdk
- BFF 是否引用了 design-system / platform-\* / ai-sdk
- service 是否跨 service 导入
- agent-server 是否跨 agent 导入
- shared 是否引用了内部包
- 所有包是否通过 @vxture/\* 别名导入（无相对跨包路径）

**工具**：静态分析 + package.json dependencies 人工审查

**检查文件**：`phase6-check.md`

---

## 通用技术栈参考（各 Phase 共用）

### 前端层（portals / agent-studio）

- Next.js 15 / React 19 / TailwindCSS 4 / shadcn/ui
- Zustand / TanStack Query / react-hook-form + zod

### 后端层（BFF / Service / Agent Server）

- NestJS / Prisma / class-validator + class-transformer
- JWT + Redis（认证）/ BullMQ（队列）/ @nestjs/swagger

### 数据层

- PostgreSQL 16 / Redis 7 / pgvector（向量，早期）

### AI SDK

- @vxture/ai-sdk（统一封装 Doubao + Claude）

### Shared & Core 层专用约束

- 原生 fetch（HTTP，双端兼容）
- jsonwebtoken（JWT 工具）
- zod / dayjs（仅 shared 层）
- 原生 Intl API（国际化格式化）
- 原生 process.env（环境变量）

---

End of document.
