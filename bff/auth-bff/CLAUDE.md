# CLAUDE.md — @vxture/bff-auth

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/bff-auth` |
| 路径 | `bff/auth-bff/` |
| @layer | `Application` |
| 服务对象 | 所有 Portal / Agent（统一认证入口） |

---

## 职责

**auth-bff 是 Vxture 平台唯一有权签发 JWT 的服务。**

核心职责：
- 邮箱密码登录（运营账号 / 租户账号，通过 `source` 参数区分）
- 手机验证码登录（短信验证码 + 免密登录）
- 第三方 OAuth 授权登录（钉钉 · 飞书 · 企业微信）
- 登出与 token 吊销（Redis refresh token + access token 黑名单）
- access token 续期（基于 refresh token）
- 跨域一次性 token 的生成与验证（用于 vxture.com ↔ ruyin.ai 跨域 SSO）
- 内部签发端点 `POST /auth/internal/sign`（供 admin-bff / ruyin-bff 等委托签发）

---

## 认证架构

```
其他 BFF（website-bff / console-bff / admin-bff / ruyin-bff）
  │
  │  HTTP 透传（login / logout / refresh / internal/sign）
  │  Cookie 转发 + set-cookie 回传
  │
  ▼
auth-bff（唯一 JWT 签发者）
  │
  ├──► @vxture/service-iam（账号管理）
  ├──► @vxture/service-organization（租户管理）
  ├──► @vxture/service-mail（邮件）
  ├──► @vxture/service-sms（短信）
  ├──► Redis（refresh token · blacklist · crossdomain · oauth:state）
  └──► 第三方 OAuth 平台（钉钉 / 飞书 / 企业微信）
```

---

## 目录结构

```
src/
├── routers/            # 路由模块
│   ├── password-auth.router.ts   # POST /auth/login | signup | logout | refresh | internal/sign
│   ├── phone-auth.router.ts      # POST /auth/send-phone-code | login-with-phone
│   ├── oauth.router.ts           # GET  /auth/oauth/{provider}/start | callback
│   ├── crossdomain.router.ts     # GET  /auth/crossdomain/token | POST verify
│   ├── health.router.ts          # GET  /healthz
├── auth/
│   └── auth.service.ts           # JWT 签发 · 验证 · OAuth · 租户初始化
├── redis/
│   └── redis.service.ts          # Redis 操作（refresh · blacklist · crossdomain · oauth:state）
├── middleware/                   # 无需 auth middleware（自身就是认证服务）
├── app.module.ts
└── main.ts
```

---

## 核心接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/auth/login` | POST | 邮箱密码登录，根据 `source` 区分运营/租户账号 |
| `/auth/signup` | POST | 邮箱注册 |
| `/auth/logout` | POST | 登出，吊销 refresh token，jti 入黑名单 |
| `/auth/refresh` | POST | 基于 refresh token 续期 access token |
| `/auth/session` | GET | 获取当前登录态 |
| `/auth/send-phone-code` | POST | 发送手机验证码 |
| `/auth/login-with-phone` | POST | 手机验证码登录 |
| `/auth/internal/sign` | POST | **内部接口**：为其他 BFF 签发 JWT Cookie |
| `/auth/oauth/{provider}/start` | GET | 启动 OAuth 授权跳转 |
| `/auth/oauth/{provider}/callback` | GET | OAuth 回调处理 |
| `/auth/crossdomain/token` | GET | 生成跨域一次性 token（30s TTL） |
| `/auth/crossdomain/verify` | POST | 验证并消费跨域 token（原子 GETDEL） |

---

## 允许的依赖

- `@vxture/core-auth` / `@vxture/core-config` / `@vxture/core-utils` / `@vxture/core-*`
- `@vxture/shared`
- `@vxture/service-iam` / `@vxture/service-organization` / `@vxture/service-mail` / `@vxture/service-sms`
- NestJS / @nestjs/jwt / @nestjs/swagger
- class-validator / class-transformer
- ioredis（Redis 客户端）
- uuid（jti 生成）

## 严格禁止

- 数据库直连（通过 service-* 间接访问）
- `@vxture/ai-sdk`
- `@vxture/design-system` / `platform-*`
- 跨 BFF 导入
- React / Next.js / 浏览器 API

---

## 关键约束

- **所有 JWT 签发**必须通过 `AuthService.signTokenPair()`，租户账号重签走 `reissueTokensForUser()`，运营账号签发走 `issueOperatorTokens()`
- `jti` 必须是随机 UUID（`crypto.randomUUID()`），不得使用可预测值
- access token 有效期从环境变量 `JWT_ACCESS_EXPIRES` 读取，默认 15 分钟
- refresh token 必须存储到 Redis；operator 使用 `refresh:operator:{userId}`，租户端按物理登录面分为 `refresh:tenant:platform:{userId}` 与 `refresh:tenant:ruyin:{userId}`
- refresh / logout / crossdomain / OAuth state 都依赖 Redis；Redis 缺失、查询失败或 refresh token 不匹配时必须 fail-closed，禁止退化成无状态 token
- 登出时 jti 必须写入 Redis 黑名单（TTL = access token 剩余有效期），并写入 `revoked-before:{tenant|operator}:{userId}` 用户级撤销水位
- 跨域 token 必须使用 Redis `GETDEL` 原子操作
- website / console 使用统一租户 Cookie：`vx_tenant_access_token` / `vx_tenant_refresh_token`
- admin 使用独立运营 Cookie：`vx_admin_access_token` / `vx_admin_refresh_token`
- ruyin.ai 与 website / console 属于同一租户逻辑会话，但浏览器 Cookie 必须使用 ruyin.ai 本域 key：`ry_access_token` / `ry_refresh_token`
- 旧的 `vx_*` / `vx_console_*` 只允许迁移期读取和清理，不再作为新写入目标
- logout 必须按安全域隔离：租户端 logout 不清 admin，admin logout 不清租户端；ruyin 需要通过本域 logout 端点清理 `ry_*`
- 所有认证 Cookie 必须设置 `HttpOnly: true`，生产环境 `Secure: true`
- `internal/sign` 端点仅供内部 BFF 调用，不在前端暴露，必须校验 `x-vxture-internal-auth`

---

## 环境变量

```bash
# JWT
JWT_ACCESS_SECRET=        # access token 密钥，≥ 64 字符
JWT_REFRESH_SECRET=       # refresh token 密钥，与 access 不同值
JWT_ACCESS_EXPIRES=900    # access token 有效期（秒）
JWT_REFRESH_EXPIRES=604800 # refresh token 有效期（秒）

# Redis
REDIS_URL=redis://redis:6379

# Internal BFF auth
AUTH_INTERNAL_TOKEN=

# Cookie
COOKIE_DOMAIN_PLATFORM=.vxture.com
COOKIE_DOMAIN_RUYIN=ruyin.ai

# OAuth（阶段一：钉钉）
DINGTALK_APP_KEY=
DINGTALK_APP_SECRET=
DINGTALK_REDIRECT_URI=https://auth.vxture.com/oauth/dingtalk/callback

# OAuth（阶段二：飞书 / 企业微信）
FEISHU_APP_ID= / FEISHU_APP_SECRET= / FEISHU_REDIRECT_URI=
WECOM_CORP_ID= / WECOM_AGENT_SECRET= / WECOM_REDIRECT_URI=
```
