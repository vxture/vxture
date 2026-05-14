# @vxture/bff-auth

> ⚠️ 待大版本重构 | 迁移自 `bff/auth-bff/AGENTS.md`
> 架构层参考：[`docs/architecture/05-bff-layer.md`](../../architecture/05-bff-layer.md)
> 能力域设计：[`docs/design/auth.md`](../../design/auth.md)

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/bff-auth` |
| 路径 | `bff/auth-bff/` |
| @layer | `Application` |
| 服务对象 | 所有 Portal / Agent（统一认证入口） |

## 核心定位

**auth-bff 是 Vxture 平台唯一有权签发 JWT 的服务。**

其他 BFF 不持有 JWT 签发逻辑，通过 HTTP 调用 `POST /auth/internal/sign` 委托签发。

## 接口契约

### 公开接口

**POST `/auth/login`** — 邮箱密码登录

```typescript
// Request
{ email: string; password: string; source: 'operator' | 'tenant' }

// Response 200
{ userId: string; userType: 'operator' | 'tenant_user'; tenantId?: string }
// 同时设置 HttpOnly Cookie：vx_admin_access_token / vx_tenant_access_token

// Error
{ code: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED'; message: string }
```

**POST `/auth/signup`** — 邮箱注册

```typescript
// Request
{ email: string; password: string; displayName: string }

// Response 201：自动创建 Personal Tenant，返回与 login 相同结构
// Error
{ code: 'EMAIL_ALREADY_EXISTS'; message: string }
```

**POST `/auth/logout`** — 登出

```typescript
// Request：无 body，读取 Cookie 中的 token
// Response 200：{ ok: true }
// 副作用：Redis 黑名单写入 jti，删除 refresh token
```

**POST `/auth/refresh`** — 续期

```typescript
// Request：无 body，读取 Cookie 中的 refresh token
// Response 200：重新签发 access token，写入 Cookie
// Error
{ code: 'REFRESH_TOKEN_EXPIRED' | 'REFRESH_TOKEN_INVALID'; message: string }
```

**GET `/auth/session`** — 获取当前登录态

```typescript
// Response 200
{
  userId: string;
  userType: 'operator' | 'tenant_user';
  tenantId?: string;
  roles: string[];
  expiresAt: number; // Unix timestamp
}
// Response 401（未登录或 token 过期）
{ code: 'UNAUTHORIZED' }
```

**GET `/auth/crossdomain/token`** — 跨域一次性 token

```typescript
// Response 200
{ token: string; expiresAt: number } // 30s TTL
```

**POST `/auth/crossdomain/verify`** — 验证跨域 token

```typescript
// Request
{ token: string; targetDomain: string }

// Response 200：在目标域设置 Cookie，返回用户信息
// Error
{ code: 'TOKEN_EXPIRED' | 'TOKEN_NOT_FOUND'; message: string }
```

### 内部接口（仅限同网络 BFF 调用）

**POST `/auth/internal/sign`**

```typescript
// Header：x-vxture-internal-auth: {AUTH_INTERNAL_TOKEN}（必须）

// Request
{
  userId: string;
  userType: 'operator' | 'tenant_user';
  tenantId?: string;
  cookieName: string;        // e.g. 'ry_access_token'
  cookieDomain: string;      // e.g. 'ruyin.ai'
}

// Response 200
{ jti: string; expiresAt: number }
// 副作用：在 Response 中设置对应的 HttpOnly Cookie

// Error
{ code: 'INVALID_INTERNAL_TOKEN' | 'SIGN_FAILED'; message: string }
```

### OAuth 接口

```
GET  /auth/oauth/{provider}/start     → 302 跳转到第三方授权页
GET  /auth/oauth/{provider}/callback  → 处理回调，签发 JWT，302 跳转到目标页

provider: 'dingtalk' | 'feishu' | 'wecom'
```

### 统一错误响应格式

```typescript
{
  code: string;     // 机器可读错误码
  message: string;  // 人类可读描述（中文）
  requestId?: string;
}
```

## 目录结构

```
src/
├── routers/
│   ├── password-auth.router.ts
│   ├── phone-auth.router.ts
│   ├── oauth.router.ts
│   ├── crossdomain.router.ts
│   └── health.router.ts
├── auth/auth.service.ts
├── redis/redis.service.ts
├── app.module.ts
└── main.ts
```

## 关键约束

- 所有 JWT 签发通过 `AuthService.signTokenPair()`
- `jti` 必须是随机 UUID（`crypto.randomUUID()`）
- refresh token 存 Redis；operator 用 `refresh:operator:{userId}`，租户端按物理登录面分键
- logout 时 jti 写入 Redis 黑名单（TTL = access token 剩余有效期）
- 跨域 token 使用 Redis `GETDEL` 原子操作
- Cookie 命名：
  - 租户端：`vx_tenant_access_token` / `vx_tenant_refresh_token`
  - admin：`vx_admin_access_token` / `vx_admin_refresh_token`
  - ruyin：`ry_access_token` / `ry_refresh_token`
- `internal/sign` 必须校验 `x-vxture-internal-auth` 头
- Redis 不可用时 fail-closed，禁止退化无状态 token

## 环境变量

```bash
JWT_ACCESS_SECRET=        # ≥ 64 字符
JWT_REFRESH_SECRET=       # 与 access 不同值
JWT_ACCESS_EXPIRES=900    # 秒，默认 15 分钟
JWT_REFRESH_EXPIRES=604800
REDIS_URL=redis://redis:6379
AUTH_INTERNAL_TOKEN=
COOKIE_DOMAIN_PLATFORM=.vxture.com
COOKIE_DOMAIN_RUYIN=ruyin.ai
DINGTALK_APP_KEY= / DINGTALK_APP_SECRET= / DINGTALK_REDIRECT_URI=
FEISHU_APP_ID= / FEISHU_APP_SECRET= / FEISHU_REDIRECT_URI=
WECOM_CORP_ID= / WECOM_AGENT_SECRET= / WECOM_REDIRECT_URI=
```
