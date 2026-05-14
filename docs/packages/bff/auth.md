# @vxture/bff-auth

> ⚠️ 待大版本重构 | 迁移自 `bff/auth-bff/CLAUDE.md`
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

## 核心接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/auth/login` | POST | 邮箱密码登录（source 区分运营/租户） |
| `/auth/signup` | POST | 邮箱注册 |
| `/auth/logout` | POST | 登出，吊销 refresh token |
| `/auth/refresh` | POST | 基于 refresh token 续期 |
| `/auth/session` | GET | 获取当前登录态 |
| `/auth/send-phone-code` | POST | 发送手机验证码 |
| `/auth/login-with-phone` | POST | 手机验证码登录 |
| `/auth/internal/sign` | POST | **内部接口**：为其他 BFF 签发 JWT Cookie |
| `/auth/oauth/{provider}/start` | GET | 启动 OAuth 授权跳转 |
| `/auth/oauth/{provider}/callback` | GET | OAuth 回调处理 |
| `/auth/crossdomain/token` | GET | 生成跨域一次性 token（30s TTL） |
| `/auth/crossdomain/verify` | POST | 验证并消费跨域 token（原子 GETDEL） |

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
