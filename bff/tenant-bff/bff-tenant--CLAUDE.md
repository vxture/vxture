# CLAUDE.md — @vxture/bff-tenant

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/bff-tenant` |
| 路径 | `bff/tenant-bff/` |
| @layer | `Application` |
| 服务对象 | `portals/tenant` |

---

## 职责

服务 portals/tenant 的 BFF：租户管理员视角的用户管理、订阅查询、工单等数据聚合。
租户侧权限范围受限，所有数据严格限定在当前 tenantId 下。

---

## 目录结构

```
src/
├── routers/        # *.router.ts（user / subscription / ticket 等）
├── aggregators/    # *.aggregator.ts
├── middleware/     # auth.middleware.ts / tenant.middleware.ts
├── types/          # *.types.ts
└── index.ts
```

---

## 允许的依赖

- `@vxture/core-auth` / `@vxture/core-tenant` / `@vxture/core-*`
- `@vxture/shared`
- `@vxture/service-subscription` / `@vxture/service-ticket`
- NestJS / Passport.js / class-validator / @nestjs/swagger

## 严格禁止

- `@vxture/ai-sdk`
- `@vxture/design-system` / `platform-*`
- 跨 BFF 导入
- React / Next.js / 浏览器 API
- 业务逻辑（属于 service 层）

---

## 文件头模板

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/bff-tenant
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
 * @layer Application
 * @category Router | Aggregator | Middleware | Types
 */
```

---

## 租户隔离约束

- 所有数据查询必须携带 tenantId（来自 tenant middleware）
- 禁止跨租户数据访问
- tenantId 由 @vxture/core-tenant 统一解析，不在 router 中自行解析

---

## 关键约束

- 每个 router 独立 try/catch，错误不冒泡
- middleware 执行顺序：auth → tenant → router
- 响应做字段投影，不透传后端原始结构
- 禁止 any，响应 DTO 类型明确
