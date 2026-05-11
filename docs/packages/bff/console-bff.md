# @vxture/bff-console

> 架构层参考：[`docs/architecture/10-bff-layer.md`](../../architecture/10-bff-layer.md)

---

## 包信息

| 项 | 值 |
|----|-----|
| 包名 | `@vxture/bff-console` |
| 路径 | `bff/console-bff/` |
| @layer | `Application` |
| 框架 | NestJS |

## 职责

租户工作台专属 BFF：聚合 console 页面所需数据，委托 auth-bff 完成 JWT 签发。通用约束见 [bff/index.md](index.md)。

middleware 顺序与其他 BFF 不同，加了第三级：`auth → tenant → permission → router`

## 接口列表

| Router | 路径前缀 | 核心职责 |
|--------|---------|---------|
| `auth.router.ts` | `/api/auth` | 登录 / 登出 / refresh（委托 auth-bff） |
| `me.router.ts` | `/api/me` | 当前用户信息、偏好设置 |
| `iam.router.ts` | `/api/iam` | 成员 / 角色 / 权限 CRUD |
| `billing.router.ts` | `/api/billing` | 账单查询 |
| `subscription.router.ts` | `/api/subscription` | 订阅状态、feature 开关查询 |
| `capabilities.router.ts` | `/api/capabilities` | 租户功能能力列表 |
| `tenant-context.router.ts` | `/api/tenant` | 租户上下文信息 |
| `phone-auth.router.ts` | `/api/phone` | 手机号验证码认证 |
| `health.router.ts` | `/health` | 健康检查 |

## 依赖约束

```typescript
✅ @vxture/core-auth / @vxture/core-tenant / @vxture/core-api / @vxture/shared
✅ auth-bff（HTTP internal，JWT 签发委托）
✅ @vxture/service-subscription（feature 开关）
❌ 直接签发 JWT（必须通过 auth-bff）
❌ @vxture/ai-sdk / agent-server/* / portals/*
```
