# @vxture/bff-admin

> ⚠️ 待大版本重构 | 迁移自 `bff/admin-bff/CLAUDE.md`
> 架构层参考：[`docs/architecture/05-bff-layer.md`](../../architecture/05-bff-layer.md)

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/bff-admin` |
| 路径 | `bff/admin-bff/` |
| @layer | `Application` |
| 服务对象 | `portals/admin` |
| 端口 | 3031 |

## 职责

服务 portals/admin 的 BFF：平台运营后台的认证、租户管理、计费、用户数据聚合。
domain 最多的 BFF（tenant / billing / subscription / ticket / products / users 等）。

## JWT 认证架构（v1.4）

本 BFF **不签发 JWT**。流程：
1. IP + 账号双维度限速 → 滑块验证码 → DB 密码验证
2. 验证通过后委托 `auth-bff POST /auth/internal/sign` 签发 Cookie
3. JWT 验证（auth middleware）保留本地 `JwtService.verify`

## 目录结构

```
src/
├── routers/        # *.router.ts（tenant / billing / subscription / products 等）
├── aggregators/    # *.aggregator.ts
├── middleware/     # auth.middleware.ts / tenant.middleware.ts
├── types/          # *.types.ts
└── index.ts
```

## 依赖约束

**允许：**
- `@vxture/core-auth` / `@vxture/core-tenant` / `@vxture/core-*`
- `@vxture/shared`
- `@vxture/service-billing` / `@vxture/service-subscription` / `@vxture/service-ticket`
- NestJS / class-validator / @nestjs/swagger

**禁止：** `@vxture/ai-sdk` / `design-system` / `platform-*` / 跨 BFF 导入 / 业务逻辑

## 关键约束

通用 BFF 约束见 [bff/index.md](index.md)。Admin-bff 专有：

- 禁止 `any`，响应 DTO 类型明确
- 新增业务域在 `routers/` 新增 `{domain}.router.ts`，不新建 BFF 包
