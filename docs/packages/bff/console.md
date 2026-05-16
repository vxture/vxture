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
| 服务对象 | `portals/console` |

---

## 核心定位

console-bff 是租户工作台（`portals/console`）的专属 BFF，负责：

- **认证代理**：所有认证端点透传至 auth-bff，Set-Cookie 原样转发（同 website-bff 模式）。**本 BFF 不签发 JWT，只 verify。**
- **租户数据聚合**：成员管理、角色权限、账单、订阅、用户 Profile
- **AI 模型管理**：运营人员（`platform.model.manage` 能力）管理模型定义与租户授权，代理至 AI Gateway 服务

### 中间件顺序

```
auth → tenant → permission → router
```

比其他 portal BFF 多一级 `permission` middleware，负责将当前账号的能力集（Capability[]）注入 `req.capabilities`，供路由层做精细鉴权。

---

## 接口契约

> 所有接口（公开路径除外）需携带 Cookie `vx_tenant_access_token`。
> 统一错误响应格式：`{ message: string; statusCode: number }`

### `/api/auth` — 认证（代理至 auth-bff）

公开路径（无需认证）：`/api/auth/login`、`/api/auth/logout`、`/api/auth/refresh`、`/api/auth/send-phone-code`、`/api/auth/login-with-phone`、`/api/auth/forgot-password`、`/api/auth/reset-password`

**POST `/api/auth/reset-password`** — 重置密码

```typescript
// Request body
{ token: string; newPassword: string }

// Response 200
{ status: 'ok' }
// Response 400 — token 无效或已过期
```

---

**POST `/api/auth/login`** — 密码登录

```typescript
// Request body（BFF 固定注入 source='console'）
{ identifier: string; password: string; turnstileToken?: string }

// Response 200（Set-Cookie 透传：vx_tenant_access_token / vx_tenant_refresh_token）
// 同 auth-bff AuthUserDto 格式
```

**POST `/api/auth/logout`** — 登出

```typescript
// Response 200（清除 Cookie）
{ status: 'logged_out' }
```

**POST `/api/auth/refresh`** — 续期

```typescript
// Response 200（更新 Cookie）
{ status: 'refreshed' }
```

**POST `/api/auth/tenant/switch`** — 切换租户

```typescript
// Request body
{ tenantId: string }
// BFF 固定注入 source='console'

// Response 200（重新签发包含新 tenantId 的 JWT，更新 Cookie）
```

**POST `/api/auth/forgot-password`** — 发送密码重置邮件

```typescript
// Request body
{ email: string }
// BFF 固定注入 source='console'，重置链接指向 CONSOLE_BASE_URL/reset-password

// Response 200 — 始终成功（防枚举）
{ status: 'ok' }
```

**POST `/api/auth/send-phone-code`** — 发送手机验证码（代理至 auth-bff）

**POST `/api/auth/login-with-phone`** — 手机验证码登录（代理至 auth-bff）

**GET `/api/auth/session`** — 会话状态（本地，依赖 auth middleware）

```typescript
// Response 200
{ status: 'active'; userId: string }
// Response 401
```

---

### `/api/me` — 当前用户

**GET `/api/me`** — 当前账号基本信息 + 租户成员信息聚合

**GET `/api/me/profile`** — 完整用户 Profile

**PUT `/api/me/profile`** — 更新 Profile

**PUT `/api/me/password`** — 修改密码

```typescript
// Request body
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
// Request body
{ nextPassword: string }
```

**DELETE `/api/iam/members/:memberId`** — 移除成员

**GET `/api/iam/roles`** — 租户角色列表

**GET `/api/iam/permissions`** — 租户权限列表

**POST `/api/iam/roles`** — 创建角色

**PUT `/api/iam/roles/:roleId`** — 更新角色

**DELETE `/api/iam/roles/:roleId`** — 删除角色

---

### `/api/subscription` — 订阅管理（需租户上下文）

**GET `/api/subscription/my`** — 当前租户所有订阅

**POST `/api/subscription/actions`** — 执行订阅变更

```typescript
// Request body
{
  subscriptionId: string;
  action: 'upgrade' | 'pause' | 'resume' | 'cancel';
  planId?: string;      // upgrade 必填
  reason?: string;      // pause / cancel 可选
  immediate?: boolean;  // cancel 是否立即生效，默认 false
}
// Response 200：变更后的 Subscription
// 副作用：成功后向账号邮箱发送确认邮件（失败不阻断主流程）
// Error 400 / 401
```

---

### `/api/billing` — 账单查询（需租户上下文）

**GET `/api/billing/invoices`** — 发票列表

```typescript
// Query: ?limit=20（默认 20，最大 100）
// Response 200：Invoice[]
```

**GET `/api/billing/overview`** — 账单概览统计

```typescript
// Response 200：BillingStats（发票总数、已付/待付/逾期数量、总收入、活跃订阅数）
```

---

### `/api/capabilities` — 租户能力列表

**GET `/api/capabilities`** — 获取当前 session 可用能力

```typescript
// Response 200：string[]
// 由 permission middleware 在请求上下文中预先填充
// 示例：['platform.model.manage', 'tenant.user.manage', ...]
```

---

### `/api/tenant-context` — 租户上下文

**GET `/api/tenant-context`** — 当前租户信息（从 JWT + DB 解析）

**GET `/api/tenant-context/options`** — 当前账号可访问的所有租户（切换租户下拉列表）

---

### `/api/ai-gateway` — AI 模型与授权管理

**所有端点要求 `platform.model.manage` 能力。** 普通租户账号访问时返回 `403`。
本域所有请求均代理至 `AI_GATEWAY_URL`（ai-gateway 服务内部地址）。

---

**GET `/api/ai-gateway/models`** — AI 模型列表

```typescript
// Query: ?includeInactive=true|false（默认 true）
// Response 200：AiModelRecord[]

interface AiModelRecord {
  id: string;
  providerId: string | null;
  modelCode: string;           // 如 'gpt-4o'
  modelName: string;           // 如 'GPT-4o'
  provider: string;            // 如 'openai'
  endpointUrl: string;
  protocol: string;            // 如 'openai'
  capabilities: string[];      // 如 ['chat', 'vision']
  apiKeyEnvVar: string;        // 服务端读取 API Key 的环境变量名
  isActive: boolean;
  config: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
```

**POST `/api/ai-gateway/models`** — 创建 AI 模型

```typescript
// Request body
{
  modelCode: string;
  modelName: string;
  provider: string;
  endpointUrl: string;
  protocol: string;
  capabilities: string[];
  apiKeyEnvVar: string;
  providerId?: string | null;
  config?: Record<string, unknown> | null;
}
// Response 201：AiModelRecord
```

**PUT `/api/ai-gateway/models/:id`** — 更新 AI 模型

```typescript
// Request body（所有字段可选）
{
  modelCode?: string;
  modelName?: string;
  provider?: string;
  endpointUrl?: string;
  protocol?: string;
  capabilities?: string[];
  apiKeyEnvVar?: string;
  providerId?: string | null;
  config?: Record<string, unknown> | null;
  isActive?: boolean;
}
// Response 200：AiModelRecord（更新后）
```

**POST `/api/ai-gateway/models/:id/activate`** — 激活模型

```typescript
// Response 200：AiModelRecord（isActive: true）
```

**POST `/api/ai-gateway/models/:id/deactivate`** — 停用模型

```typescript
// Response 200：AiModelRecord（isActive: false）
```

---

**GET `/api/ai-gateway/grants`** — AI 模型授权列表

```typescript
// Query: ?modelId=xxx（可选，按模型过滤）
// Response 200：AiModelGrantRecord[]

interface AiModelGrantRecord {
  id: string;
  modelId: string;
  tenantId: string;
  agentId: string | null;     // null 表示租户级别授权（不限 agent）
  priority: number;
  reason: string | null;
  expiresAt: string | null;   // ISO 时间戳，null 表示永不过期
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**POST `/api/ai-gateway/grants`** — 创建授权

```typescript
// Request body
{
  modelId: string;
  tenantId: string;
  agentId?: string | null;
  priority?: number | null;   // 默认 0
  reason?: string | null;
  expiresAt?: string | null;  // ISO 时间戳
  isActive?: boolean;         // 默认 true
}
// Response 201：AiModelGrantRecord
```

**PUT `/api/ai-gateway/grants/:id`** — 更新授权

```typescript
// Request body（所有字段可选）
{
  agentId?: string | null;
  priority?: number | null;
  reason?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
}
// Response 200：AiModelGrantRecord（更新后）
```

**POST `/api/ai-gateway/grants/:id/activate`** — 激活授权

```typescript
// Response 200：AiModelGrantRecord（isActive: true）
```

**DELETE `/api/ai-gateway/grants/:id`** — 删除/停用授权

```typescript
// Response 200：AiModelGrantRecord（删除确认或最终状态）
// 注意：前端 setAiModelGrantActive(id, false) 调用此接口
```

---

### `/health` — 健康检查

```
GET /health  →  { status: 'ok' }   无鉴权
```

---

## 目录结构

```
bff/console-bff/src/
├── routers/
│   ├── auth.router.ts           ← 认证代理（login / logout / refresh /
│   │                               tenant/switch / forgot-password / session）
│   ├── phone-auth.router.ts     ← 手机验证码代理
│   ├── ai-gateway.router.ts     ← AI 模型 / 授权 CRUD（代理至 AI Gateway）
│   ├── me.router.ts             ← 当前用户 Profile
│   ├── iam.router.ts            ← 成员 / 角色 / 权限管理
│   ├── subscription.router.ts   ← 订阅操作
│   ├── billing.router.ts        ← 账单查询
│   ├── capabilities.router.ts   ← 能力列表
│   ├── tenant-context.router.ts ← 租户上下文
│   └── health.router.ts
├── aggregators/
│   └── session.aggregator.ts
├── auth/
│   └── auth.service.ts          ← JWT verify + 当前用户查询
├── middleware/
│   ├── auth.middleware.ts        ← 公开路径白名单 + Cookie 解析
│   ├── tenant.middleware.ts      ← tenantId 解析
│   └── permission.middleware.ts  ← capabilities 注入（req.capabilities）
├── types/
│   └── console.types.ts          ← AiModelRecord / AiModelGrantRecord / Capability 等
├── app.module.ts
└── main.ts
```

---

## 权限约束

`platform.model.manage` 能力的含义：

- 由 permission middleware 从数据库动态加载并注入 `req.capabilities`
- 代表运营人员身份，拥有跨租户管理 AI 模型和授权的权限
- 普通租户账号不会拥有此能力
- `ai-gateway.router.ts` 中的 `requireModelManageCapability()` 在每个端点入口处校验

---

## 环境变量

```bash
NODE_ENV=production
CONSOLE_BFF_PORT=3021

# JWT（验证用，与 auth-bff 共用同一 JWT_SECRET）
JWT_SECRET=

# 上游服务（内部地址）
AUTH_BFF_URL=http://vx-auth-bff:3090
AI_GATEWAY_URL=http://vx-ai-gateway:8000   # AI Gateway 服务内部地址

# 数据库 / Redis
DATABASE_URL=
REDIS_URL=

# CORS
ALLOWED_ORIGIN=https://console.vxture.com
```

---

## 依赖约束

```
✅ @vxture/core-auth          — JWT verify + token 吊销检查
✅ @vxture/core-config
✅ @vxture/core-mail          — 订阅操作后发邮件通知
✅ @vxture/service-iam        — 账号 / 成员 / 角色查询
✅ @vxture/service-organization
✅ @vxture/service-billing
✅ @vxture/service-subscription
✅ auth-bff（HTTP 代理）       — 认证操作委托
✅ ai-gateway（HTTP 代理）     — AI 模型 / 授权管理
❌ JWT 签发                    — 严禁
❌ @vxture/ai-sdk / agent-server/*
❌ @vxture/design-system / platform-*
```
