# CLAUDE.md — @vxture/service-billing

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/service-billing` |
| 路径 | `services/commerce/billing/` |
| @layer | `Domain` |
| 所属域 | `commerce` |

---

## 职责

计费核心业务逻辑：账单记录管理、计费状态跟踪、用量统计。
供 BFF 层和 Agent Server 层消费，不直接面向前端。

---

## 目录结构

```
src/
├── module/       # billing.module.ts — NestJS 模块声明
├── service/      # billing.service.ts — 业务逻辑
├── repository/   # billing.repository.ts — Prisma 数据访问
├── dto/          # *.dto.ts — 入参 DTO
├── types/        # billing.types.ts — 领域类型
└── index.ts      # 单一公共出口
```

---

## 允许的依赖

- `@vxture/core-*`
- `@vxture/shared`
- NestJS（`@nestjs/common` / `@nestjs/core`）
- Prisma（`@prisma/client`）
- `class-validator` + `class-transformer`
- `@nestjs/swagger`（DTO 标注）

## 禁止的依赖

- `@vxture/service-subscription` / `@vxture/service-ticket`（跨 service 隔离）
- `@vxture/ai-sdk` / `design-system` / `platform-*` / `bff-*`
- React / Next.js
- 任何前端包

---

## 文件命名

| 类型 | 规范 |
|------|------|
| NestJS 模块 | `billing.module.ts` |
| 业务逻辑 | `billing.service.ts` |
| 数据访问 | `billing.repository.ts` |
| 入参 DTO | `create-billing.dto.ts` 等 |
| 领域类型 | `billing.types.ts` |

---

## 文件头模板

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/service-billing
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

- **service**：只含业务逻辑，调用 repository，不直接操作 Prisma
- **repository**：封装所有 Prisma 操作，返回领域类型（非 Prisma 原始类型）
- **module**：只做模块声明和 provider 注册
- **dto**：class-validator 装饰器 + @ApiProperty() 标注，不含逻辑

---

## Barrel Export 规则

```typescript
// src/index.ts — 只导出外部需要的内容
export { BillingModule } from './module/billing.module'
export { BillingService } from './service/billing.service'
export type { BillingRecord, BillingStatus } from './types/billing.types'
// 禁止导出 BillingRepository（内部实现细节）
```

---

## TypeScript

- 禁止 `any`
- Repository 方法返回类型必须明确，禁止返回 Prisma 原始类型
- DTO 字段必须有类型注解和 class-validator 装饰器
- 纯类型导入使用 `import type`
