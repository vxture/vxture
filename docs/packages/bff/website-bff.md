# @vxture/bff-website

> ⚠️ 待大版本重构 | 迁移自 `bff/website-bff/CLAUDE.md`
> 架构层参考：[`docs/architecture/10-bff-layer.md`](../../architecture/10-bff-layer.md)

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/bff-website` |
| 路径 | `bff/website-bff/` |
| @layer | `Application` |
| 服务对象 | `portals/website` |
| 端口 | 3011 |

## JWT 认证架构（v1.3）

本 BFF **不签发 JWT**。所有认证端点（login / signup / logout / refresh / phone 系列）
通过 HTTP 透传至 `@vxture/bff-auth`，转发 Cookie 和 set-cookie 头。
本 BFF 仅保留 JWT **验证**能力（`JwtService.verify`），供 auth middleware 使用。

## 目录结构

```
src/
├── routers/        # *.router.ts
├── aggregators/    # *.aggregator.ts
├── middleware/     # auth.middleware.ts / tenant.middleware.ts
├── types/          # *.types.ts（面向前端 DTO）
└── index.ts
```

## 关键约束

- middleware 执行顺序：auth → tenant → router
- 每个 router 独立 try/catch，错误不冒泡
- 响应做字段投影，不透传后端原始结构
