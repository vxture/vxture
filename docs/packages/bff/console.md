# @vxture/bff-console

> 架构层参考：[`docs/architecture/05-bff-layer.md`](../../architecture/05-bff-layer.md)

---

## 包信息

| 项 | 值 |
|----|-----|
| 包名 | `@vxture/bff-console` |
| 路径 | `bff/console-bff/` |
| @layer | `Application` |
| 框架 | NestJS |
| 端口 | 3021 |

## 职责

租户工作台专属 BFF：聚合 console 页面所需数据，委托 auth-bff 完成 JWT 签发。
middleware 顺序：`auth → tenant → permission → router`（比其他 BFF 多一级 `permission`）。

通用约束见 [bff/index.md](index.md)。

---

## 接口契约

> 所有接口均需携带 Cookie `vx_tenant_access_token`（GET /health 除外）。
> 错误响应格式统一：`{ code: string; message: string; requestId?: string }`

### `/api/auth` — 认证（代理至 auth-bff）

所有 auth 接口由 console-bff 透传到 auth-bff，Set-Cookie 头原样转发。

**POST `/api/auth/login`** — 密码登录

```typescript
// Request
{ identifier: string; password: string; turnstileToken?: string }
// source 字段由 BFF 固定填充为 'console'

// Response 200（auth-bff 返回，Set-Cookie 原样透传）
{ userId: string; userType: 'tenant_user'; tenantId?: string }
// Error
{ code: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED'; message: string }
```

**POST `/api/auth/login-with-phone`** — 手机验证码登录

```typescript
// Request
{ phone: string; code: string; turnstileToken?: string }

// Response 200（同 login，Set-Cookie 透传）
```

**POST `/api/auth/send-phone-code`** — 发送手机验证码

```typescript
// Request
{ phone: string; turnstileToken?: string }
// Response 200（透传 auth-bff 响应，无 Cookie）
```

**POST `/api/auth/logout`** — 登出

```typescript
// Request：无 body
// Response 200：auth-bff 返回，清除 Cookie
{ ok: true }
```

**POST `/api/auth/refresh`** — 续期

```typescript
// Request：无 body，读取 Cookie
// Response 200：重新写入 Cookie
```

**POST `/api/auth/tenant/switch`** — 切换租户

```typescript
// Request
{ tenantId: string }
// Response 200：重新签发 Cookie（新 tenantId 写入 JWT）
```

**GET `/api/auth/session`** — 会话状态（本地，不代理）

```typescript
// Response 200
{ status: 'active'; userId: string }
// Response 401
{ code: 'UNAUTHORIZED' }
```

---

### `/api/me` — 当前用户

所有接口需 auth middleware 挂载 `req.user`。

**GET `/api/me`** — 当前账号基本信息

```typescript
// Response 200：账号 + 当前租户成员信息聚合
```

**GET `/api/me/profile`** — 当前用户资料

**GET `/api/me/organization`** — 当前租户组织资料（需租户上下文）

**PUT `/api/me/profile`** — 更新用户资料

```typescript
// Request：UpdateProfileDto（displayName 等字段）
// Response 200：更新后的 profile
```

**PUT `/api/me/password`** — 修改密码

```typescript
// Request
{ currentPassword: string; nextPassword: string }
// Response 200
{ status: 'ok' }
```

---

### `/api/iam` — 成员与角色管理（需租户上下文）

**GET `/api/iam/summary`** — IAM 统计概览

```typescript
// Response 200
{ members: number; activeMembers: number; primaryOwners: number; roles: number }
```

**GET `/api/iam/members`** — 成员列表

**GET `/api/iam/members/:memberId`** — 成员详情

**POST `/api/iam/members`** — 创建成员

**POST `/api/iam/members/invite`** — 邀请成员（发送邀请邮件）

**PUT `/api/iam/members/:memberId`** — 更新成员信息

**POST `/api/iam/members/:memberId/disable`** — 禁用成员

**POST `/api/iam/members/:memberId/reset-password`** — 重置成员密码

```typescript
// Request
{ nextPassword: string }
// Response 200
{ status: 'ok' }
```

**DELETE `/api/iam/members/:memberId`** — 移除成员

```typescript
// Response 200
{ status: 'ok' }
```

**GET `/api/iam/roles`** — 租户角色列表

**GET `/api/iam/permissions`** — 租户权限列表

**POST `/api/iam/roles`** — 创建角色

**PUT `/api/iam/roles/:roleId`** — 更新角色

**DELETE `/api/iam/roles/:roleId`** — 删除角色

```typescript
// Response 200
{ status: 'ok' }
// Error 404：{ code: 'NOT_FOUND'; message: 'Role not found' }
```

---

### `/api/billing` — 账单查询（需租户上下文）

**GET `/api/billing/invoices`** — 发票列表

```typescript
// Query
{ limit?: string }  // 默认 20，最大 100

// Response 200：Invoice[]
```

**GET `/api/billing/overview`** — 账单概览统计

```typescript
// Response 200：BillingStats
// 含：发票总数、已付数量、待付数量、逾期数量、总收入、活跃订阅数
```

---

### `/api/subscription` — 订阅管理（需租户上下文）

**GET `/api/subscription/my`** — 当前租户所有订阅

```typescript
// Response 200：Subscription[]
```

**POST `/api/subscription/actions`** — 执行订阅变更

```typescript
// Request
{
  subscriptionId: string;
  action: 'upgrade' | 'pause' | 'resume' | 'cancel';
  planId?: string;    // upgrade 必填
  reason?: string;    // pause / cancel 可选
  immediate?: boolean; // cancel 时是否立即生效，默认 false
}

// Response 200：Subscription（变更后的订阅）
// 副作用：操作成功后向账号邮箱发送确认邮件（失败不阻断主流程）
// Error 400：subscriptionId 为空 / 无效操作类型 / upgrade 缺少 planId
// Error 401：无权操作该订阅（tenantId 不匹配）
```

---

### `/api/capabilities` — 租户能力列表

**GET `/api/capabilities`** — 获取当前租户可用功能能力

```typescript
// Response 200：string[]（能力 code 列表，由 permission middleware 注入）
```

---

### `/api/tenant-context` — 租户上下文

**GET `/api/tenant-context`** — 当前租户信息

```typescript
// Response 200：TenantContext（从 JWT + DB 解析，由 middleware 注入）
```

**GET `/api/tenant-context/options`** — 当前账号可访问的所有租户

```typescript
// Response 200：TenantContextOption[]（切换租户下拉列表用）
```

---

### `/health` — 健康检查

**GET `/health`** — 无鉴权

```typescript
// Response 200
{ status: 'ok' }
```

---

## 依赖约束

```typescript
✅ @vxture/core-auth / @vxture/core-tenant / @vxture/core-api / @vxture/shared
✅ @vxture/core-mail（subscription 操作后发邮件）
✅ @vxture/service-subscription（feature 开关 / 订阅操作）
✅ @vxture/service-billing（账单查询）
✅ auth-bff（HTTP internal，JWT 签发委托）
❌ 直接签发 JWT
❌ @vxture/ai-sdk / agent-server/* / portals/*
```
