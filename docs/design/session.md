---
title: Session 管理设计
category: design
updated: 2026-05-10
---

# Session 管理设计

## 核心约定

- JWT 由 **auth-bff 独家签发**，任何其他 BFF 禁止自行生成 Token
- Access Token（短周期）+ Refresh Token（长周期）双 Token 机制
- Token 通过 **HttpOnly Cookie** 传输，前端不能读取，防 XSS

---

## Cookie 命名规范

| Cookie 名称               | 域            | 用途                   |
| ------------------------- | ------------- | ---------------------- |
| `vx_tenant_access_token`  | `.vxture.com` | 租户用户 Access Token  |
| `vx_tenant_refresh_token` | `.vxture.com` | 租户用户 Refresh Token |
| `ry_access_token`         | `.ruyin.ai`   | Ruyin 域 Access Token  |
| `ry_refresh_token`        | `.ruyin.ai`   | Ruyin 域 Refresh Token |

`vx_tenant_*` 同时用于 website 和 console，两个门户共享同一套 Cookie（同域）。

常量定义：`packages/shared/shared/src/constants/auth.constants.ts` → `TENANT_COOKIE_KEYS` / `RUYIN_COOKIE_KEYS`

---

## LoginSource 与 Token 类型

```typescript
type LoginSource = "website" | "console" | "admin" | "ruyin";
```

| LoginSource | Token 类型    | Cookie 域     |
| ----------- | ------------- | ------------- |
| `website`   | `tenant_user` | `.vxture.com` |
| `console`   | `tenant_user` | `.vxture.com` |
| `admin`     | `operator`    | `.vxture.com` |
| `ruyin`     | `tenant_user` | `.ruyin.ai`   |

代码入口：`bff/auth-bff/src/auth/auth.service.ts`

---

## Redis 存储结构

`bff/auth-bff/src/redis/redis.service.ts` 使用以下键模式（含可配置前缀）：

| 键模式                                     | 用途                              | TTL                 |
| ------------------------------------------ | --------------------------------- | ------------------- |
| `{prefix}refresh:tenant:platform:{userId}` | 租户 Refresh Token（.vxture.com） | Refresh TTL         |
| `{prefix}refresh:tenant:ruyin:{userId}`    | 租户 Refresh Token（ruyin.ai）    | Refresh TTL         |
| `{prefix}refresh:operator:{userId}`        | 运营 Refresh Token                | Refresh TTL         |
| `{prefix}blacklist:{jti}`                  | 已吊销 Access Token（jti 索引）   | Access TTL 剩余时长 |
| `{prefix}crossdomain:{token}`              | 跨域一次性令牌                    | 30s                 |
| `{prefix}oauth:state:{state}`              | OAuth CSRF 防重放 state           | 10min               |

---

## Token 续期流程

```
浏览器携带 Refresh Token Cookie
  ↓
POST /api/auth/refresh → auth-bff
  ↓
1. 验证 Refresh Token 签名
2. 查 Redis 确认 refresh 键存在（防重放）
3. 签发新 Access Token
4. 可选：滚动续期（rotating refresh）
  ↓
Set-Cookie: 新 Access Token（HttpOnly）
```

---

## 登出与 Token 吊销

```
POST /api/auth/logout
  ↓
1. 读取当前 Access Token jti
2. Redis SET blacklist:{jti}（TTL = Token 剩余有效期）
3. Redis DEL refresh:tenant:platform:{userId}（或对应类型）
4. 清除所有 Cookie（Set-Cookie: expires=past）
```

单设备登出只删该 userId 对应的 refresh 键；多设备全退出需按 userId 前缀批量删除。

---

## 跨域 SSO（vxture.com ↔ ruyin.ai）

两个根域之间无法共享 Cookie，通过**一次性令牌中转**实现：

```
1. 用户在 vxture.com 已登录
2. 点击跳转 ruyin.ai
   ↓
3. auth-bff 生成 crossdomain token（随机字符串）
   Redis SET crossdomain:{token} → userId（TTL 30s）
   ↓
4. 重定向到 ruyin.ai?sso_token={token}
   ↓
5. ruyin.ai 前端携带 sso_token 调 auth-bff
   Redis GETDEL crossdomain:{token}（原子操作，只能消费一次）
   ↓
6. 签发 ry_access_token / ry_refresh_token，Set-Cookie
```

TTL 30s + GETDEL 原子操作确保令牌单次有效，防止重放。

---

## 参考文档

- `docs/design/auth.md` — 完整认证体系设计
- `docs/packages/bff/auth.md` — auth-bff 关键约束
- `packages/shared/shared/src/constants/auth.constants.ts` — Cookie 常量定义
