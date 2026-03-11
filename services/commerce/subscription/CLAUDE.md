# CLAUDE.md — @vxture/service-subscription

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/service-subscription` |
| 路径 | `services/commerce/subscription/` |
| @layer | `Domain` |
| 所属域 | `commerce` |

---

## 职责

订阅管理业务逻辑：订阅计划查询、订阅状态管理、功能权限校验（feature gating）。
供 BFF 层和 Agent Server 层消费，不直接面向前端。

---

## 目录结构

```
src/
├── module/       # subscription.module.ts — NestJS 模块声明
├── service/      # subscription.service.ts — 业务逻辑
├── repository/   # subscription.repository.ts — Prisma 数据访问
├── dto/          # *.dto.ts — 入参 DTO
├── types/        # subscription.types.ts — 领域类型
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

- `@vxture/service-billing` / `@vxture/service-ticket`（跨 service 隔离）
- `@vxture/ai-sdk` / `design-system` / `platform-*` / `bff-*`
- React / Next.js
- 任何前端包

---

## 文件命名

| 类型 | 规范 |
|------|------|
| NestJS 模块 | `subscription.module.ts` |
| 业务逻辑 | `subscription.service.ts` |
| 数据访问 | `subscription.repository.ts` |
| 入参 DTO | `create-subscription.dto.ts` 等 |
| 领域类型 | `subscription.types.ts` |

---

## 文件头模板

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/service-subscription
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

- **service**：包含订阅状态管理和 feature gating 逻辑，调用 repository，不直接操作 Prisma
- **repository**：封装所有 Prisma 操作，返回领域类型（非 Prisma 原始类型）
- **module**：只做模块声明和 provider 注册
- **dto**：class-validator 装饰器 + @ApiProperty() 标注，不含逻辑

---

## Feature Gating 约束

- `hasFeature(tenantId, feature)` 是核心方法，返回 `boolean`
- feature 列表用枚举定义在 `subscription.types.ts`
- 不跨 service 查询计费数据（billing 数据由 BFF aggregator 组合）

---

## Barrel Export 规则

```typescript
// src/index.ts
export { SubscriptionModule } from './module/subscription.module'
export { SubscriptionService } from './service/subscription.service'
export type { SubscriptionPlan, SubscriptionStatus, PlatformFeature } from './types/subscription.types'
// 禁止导出 SubscriptionRepository
```

---

## TypeScript

- 禁止 `any`
- Repository 返回类型明确，禁止返回 Prisma 原始类型
- 纯类型导入使用 `import type`
