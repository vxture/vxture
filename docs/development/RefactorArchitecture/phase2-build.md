# Phase 2 AI Prompt — Service 层规范化

你是 Vxture Monorepo 的重构执行专家。现在执行 Phase 2：Service 层规范化。

## 目标包

- @vxture/service-billing （services/commerce/billing/）
- @vxture/service-subscription （services/commerce/subscription/）
- @vxture/service-ticket （services/support/ticket/）

---

## 技术栈约束

### 允许使用

| 用途     | 选型                                       |
| -------- | ------------------------------------------ |
| 框架     | NestJS（Module / Injectable / Controller） |
| ORM      | Prisma                                     |
| DTO 校验 | class-validator + class-transformer        |
| 数据库   | PostgreSQL（通过 Prisma）                  |
| 缓存     | Redis（ioredis）                           |
| 工具     | @vxture/shared / @vxture/core-\*           |

### 严格禁止

- 跨 service-\* 导入（service 之间绝对隔离）
- @vxture/ai-sdk
- @vxture/design-system / platform-\*
- @vxture/bff-\*
- 任何前端包（React / Next.js）
- 直接 HTTP 路由处理（属于 BFF 层）
- 跨域业务编排（属于 BFF aggregator）

---

## 规范要求

### 1. 目录结构

每个 service 包的 src/ 目录：

```
src/
├── module/           # NestJS 模块定义（*.module.ts）
├── service/          # 业务逻辑（*.service.ts）
├── repository/       # 数据访问层（*.repository.ts）
├── dto/              # 入参 DTO（*.dto.ts）
├── types/            # 领域类型（*.types.ts）
└── index.ts          # 单一公共出口
```

### 2. 文件命名

| 类型        | 规范             | 示例                  |
| ----------- | ---------------- | --------------------- |
| NestJS 模块 | \*.module.ts     | billing.module.ts     |
| 业务逻辑    | \*.service.ts    | billing.service.ts    |
| 数据访问    | \*.repository.ts | billing.repository.ts |
| 入参 DTO    | \*.dto.ts        | create-billing.dto.ts |
| 领域类型    | \*.types.ts      | billing.types.ts      |

禁止：helpers.ts / misc.ts / utils.ts 等泛名

### 3. 文件头注释（每个文件必须）

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/service-[name]
 *
 * Description: 详细功能说明
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Domain
 * @category Service | Repository | DTO | Types
 */
```

- 注释语言：中文
- 超过 80 行必须加 Section 分隔注释：

```typescript
// ============================================================================
// Types
// ============================================================================
```

### 4. 函数注释

所有 export 函数 / 方法必须有完整 JSDoc：

```typescript
/**
 * 函数功能描述
 *
 * @param param - 参数说明
 * @returns 返回值说明
 * @throws {ErrorType} 何时抛出此错误
 */
```

### 5. 分层职责规范

**module/\*.module.ts**

- 声明 NestJS Module
- 注册 providers（Service / Repository）
- 导出供外部消费的 Service

**service/\*.service.ts**

- 包含业务逻辑和领域规则
- 调用 repository 获取数据
- 不包含直接 DB 操作
- 不包含 HTTP 路由逻辑

**repository/\*.repository.ts**

- 所有 Prisma 操作封装在此
- 返回领域类型，不返回 Prisma 原始类型
- route handler 和 service 禁止内联 DB 查询

**dto/\*.dto.ts**

- 使用 class-validator 装饰器
- 所有字段有类型约束和校验规则
- 使用 @ApiProperty() 标注（@nestjs/swagger）

**types/\*.types.ts**

- 纯 TypeScript interface / type
- 领域模型定义
- 禁止包含任何逻辑

### 6. Barrel Export

- 只通过 src/index.ts 对外暴露
- 只导出 Service 类和必要的 Types / DTO
- 禁止导出 Repository（内部实现细节）
- 禁止深路径导入

```typescript
// src/index.ts 示例
export { BillingModule } from './module/billing.module';
export { BillingService } from './service/billing.service';
export type { BillingRecord, BillingStatus } from './types/billing.types';
```

### 7. 依赖约束

- 只允许依赖 @vxture/core-\* 和 @vxture/shared
- 服务之间绝对隔离，禁止跨 service-\* 导入
- 跨域编排逻辑放入 BFF aggregator，不放 service

### 8. TypeScript

- 严格模式，禁止 any，用 unknown 代替
- 纯类型导入使用 import type
- Repository 返回类型必须明确，禁止返回 Prisma 原始类型

---

## 各包职责说明

### @vxture/service-billing

计费核心逻辑：

- 账单记录查询与管理
- 计费状态跟踪
- 用量统计

### @vxture/service-subscription

订阅管理逻辑：

- 订阅计划查询
- 订阅状态管理
- 功能权限校验（feature gating）

### @vxture/service-ticket

工单支持逻辑：

- 工单创建与查询
- 工单状态流转
- 工单分配

---

## 执行方式

1. 执行顺序：
   service-billing → service-subscription → service-ticket

2. 每个包输出：
   - 完整 src/ 目录结构
   - 每个文件的完整内容
   - 更新后的 src/index.ts

3. 已有代码处理原则：
   - 合并规范，不覆盖已有逻辑
   - 只补齐缺失的规范项
   - 有冲突时说明原因，给出建议

---

End of Phase 2 Prompt.
