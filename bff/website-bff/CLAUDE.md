# CLAUDE.md — @vxture/bff-website

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/bff-website` |
| 路径 | `bff/website-bff/` |
| @layer | `Application` |
| 服务对象 | `portals/website` |

---

## 职责

服务 portals/website 的 BFF：认证、租户解析、数据聚合、响应塑形。
主要对接 @vxture/service-* 平台服务，以公开营销站点为主。

### JWT 认证架构（重构 v1.3）

本 BFF **不签发 JWT**。所有认证端点（login / signup / logout / refresh / send-phone-code / login-with-phone）
均通过 HTTP 透传至 `@vxture/bff-auth`，转发 Cookie 和 set-cookie 头。
本 BFF 仅保留 JWT **验证**能力（`JwtService.verify`），供 auth middleware 使用。

---

## 目录结构

```
src/
├── routers/        # *.router.ts
├── aggregators/    # *.aggregator.ts
├── middleware/     # auth.middleware.ts / tenant.middleware.ts
├── types/          # *.types.ts（面向前端 DTO）
└── index.ts
```

---

## 允许的依赖

- `@vxture/core-auth` / `@vxture/core-tenant` / `@vxture/core-*`
- `@vxture/shared`
- `@vxture/service-*`
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
 * @package @vxture/bff-website
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

## 关键约束

- 每个 router 独立 try/catch，错误不冒泡
- middleware 执行顺序：auth → tenant → router
- 响应做字段投影，不透传后端原始结构
- 禁止 any，响应 DTO 类型明确
