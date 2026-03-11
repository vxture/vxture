# CLAUDE.md — @vxture/service-ticket

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/service-ticket` |
| 路径 | `services/support/ticket/` |
| @layer | `Domain` |
| 所属域 | `support` |

---

## 职责

工单支持业务逻辑：工单创建与查询、工单状态流转、工单分配。
供 BFF 层和 Agent Server 层消费，不直接面向前端。

---

## 目录结构

```
src/
├── module/       # ticket.module.ts — NestJS 模块声明
├── service/      # ticket.service.ts — 业务逻辑
├── repository/   # ticket.repository.ts — Prisma 数据访问
├── dto/          # *.dto.ts — 入参 DTO
├── types/        # ticket.types.ts — 领域类型
└── index.ts      # 单一公共出口
```

---

## 允许的依赖

- `@vxture/core-*`
- `@vxture/shared`
- NestJS（`@nestjs/common` / `@nestjs/core`）
- Prisma（`@prisma/client`）
- `class-validator` + `class-transformer`
- `@nestjs/swagger`

## 禁止的依赖

- `@vxture/service-billing` / `@vxture/service-subscription`（跨 service 隔离）
- `@vxture/ai-sdk` / `design-system` / `platform-*` / `bff-*`
- React / Next.js
- 任何前端包

---

## 文件命名

| 类型 | 规范 |
|------|------|
| NestJS 模块 | `ticket.module.ts` |
| 业务逻辑 | `ticket.service.ts` |
| 数据访问 | `ticket.repository.ts` |
| 入参 DTO | `create-ticket.dto.ts` 等 |
| 领域类型 | `ticket.types.ts` |

---

## 文件头模板

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/service-ticket
 *
 * Description: 详细说明
 *
 * @author AI-Generated
 * @date YYYY-MM-DD
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Domain
 * @category Service | Repository | DTO | Types
 */
```

---

## 分层职责约束

- **service**：包含工单创建、状态流转、分配逻辑，调用 repository，不直接操作 Prisma
- **repository**：封装所有 Prisma 操作，返回领域类型（非 Prisma 原始类型）
- **module**：只做模块声明和 provider 注册
- **dto**：class-validator 装饰器 + @ApiProperty() 标注，不含逻辑

---

## 工单状态流转约束

- 工单状态枚举定义在 `ticket.types.ts`（如 `open` / `in_progress` / `resolved` / `closed`）
- 状态流转规则在 service 层维护，repository 只做持久化
- 不跨 service 查询用户计费状态（由 BFF aggregator 组合）

---

## Barrel Export 规则

```typescript
// src/index.ts
export { TicketModule } from './module/ticket.module'
export { TicketService } from './service/ticket.service'
export type { Ticket, TicketStatus, TicketPriority } from './types/ticket.types'
// 禁止导出 TicketRepository
```

---

## TypeScript

- 禁止 `any`
- Repository 返回类型明确，禁止返回 Prisma 原始类型
- 状态流转方法必须有 `@throws` JSDoc
- 纯类型导入使用 `import type`
