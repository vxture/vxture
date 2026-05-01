# Vxture 认证与账号体系概要设计

**版本**: 1.1.0
**日期**: 2026-04-28
**范围**: 账号隔离 · 跨域登录 · SSO · 第三方授权登录 · PLG 租户模型 · 代码审查规范

> 本文档只描述功能、流程与设计意图，不包含具体数据库 DDL。数据库表结构以实际已建表为准。

---

## 1. 账号体系总览

Vxture 维护两套完全独立的账号体系，共用同一个 PostgreSQL 数据库，通过不同的表和 JWT 类型隔离。

| 维度 | 运营账号 | 租户账号 |
|------|----------|----------|
| 使用产品 | admin.vxture.com | console.vxture.com · ruyin.ai · agent |
| tenant_id | 无（管理所有租户） | 必填（只能访问自己租户） |
| JWT userType | `operator` | `tenant_user` |
| 角色 | `super_admin` · `admin` | `owner` · `admin` · `member` |
| 登录方式 | 邮箱密码 | 邮箱密码 · 钉钉 · 飞书 · 企业微信 |

**隔离原则**：同一邮箱可同时存在于两套账号体系，互不冲突，两个身份完全独立。运营账号不能登录任何租户产品，租户账号不能登录运营后台。

---

## 2. 租户模型（PLG 增长路径）

### 租户类型

| 类型 | 说明 | 典型来源 |
|------|------|----------|
| `personal` | 个人租户，只有自己一个成员 | 第三方账号首次授权登录自动创建 |
| `enterprise` | 企业租户，可邀请多个成员 | 个人租户升级 或 企业直接购买 |

### 用户与租户的关系

一个用户可以同时属于多个租户（个人租户 + 若干企业租户），通过租户成员关系表维护多对多关系。每个成员在每个租户内有独立的角色。

### PLG 增长路径

```
第三方账号授权登录（钉钉 / 飞书等）
  ↓
系统自动创建个人租户（plan: trial）
  ↓
用户免费试用，数据归属个人租户
  ↓
          ┌──────────────────────────────┐
          ↓                              ↓
    继续个人使用                     升级企业订阅
    升级个人 Pro 计划                新建企业租户
    个人租户长期保留                  可选：将试用数据迁移到企业租户
                                     邀请同事加入
                                     绑定企业的钉钉 / 飞书 corp_id
```

### 多租户切换

用户登录后系统查询其所属的所有租户。若只属于一个租户直接进入；若属于多个租户，前端展示租户切换器，用户选择后签发携带对应 `tenantId` 的 JWT。

---

## 3. 第三方授权登录

### 支持平台与优先级

| 优先级 | 平台 | 阶段 |
|--------|------|------|
| P0 | 钉钉（DingTalk） | 阶段一，优先实现 |
| P1 | 飞书（Lark） | 阶段二 |
| P2 | 企业微信（WeCom） | 阶段二 |

### 前置工作（一次性，每个平台各做一次）

去各平台开放平台**注册开发者账号，创建自建应用**。自建应用无需平台审核，配置完成即可使用。

| 平台 | 注册地址 | 需要配置的内容 |
|------|---------|--------------|
| 钉钉 | open.dingtalk.com | 回调域名白名单 · 申请个人信息读取权限 |
| 飞书 | open.feishu.cn | 重定向 URL 白名单 · 申请用户基本信息权限 |
| 企业微信 | work.weixin.qq.com/api | 可信域名 · OAuth 回调域 |

回调地址统一设置为：

```
https://auth.vxture.com/oauth/dingtalk/callback
https://auth.vxture.com/oauth/feishu/callback
https://auth.vxture.com/oauth/wecom/callback
```

用户用**个人账号**扫码或点击授权即可登录，无需企业管理员介入，体验与 GitHub 登录第三方网站完全一致。

### 授权登录完整流程（以钉钉为例）

```
① 用户点击"钉钉登录"
   前端跳转至钉钉授权页
   携带参数：app_id · redirect_uri · state（随机值，防 CSRF）

② 用户在钉钉授权页同意授权
   钉钉带着 code 跳回 auth.vxture.com/oauth/dingtalk/callback

③ auth-bff 服务端处理（用户不可见）
   用 code 换取钉钉 access token
   用 token 调用钉钉接口获取用户信息
   获得：open_id · union_id · 姓名 · 头像 · 手机号

④ auth-bff 查询 OAuth 关联表（provider=dingtalk, open_id=xxx）
   → 找到记录：取出关联的租户用户 ID，走正常登录流程
   → 未找到记录：自动注册（在同一事务内完成）
       创建租户用户记录（姓名、头像来自钉钉）
       创建个人租户记录（type: personal, plan: trial）
       创建租户成员关系（role: owner）
       创建 OAuth 关联记录（provider: dingtalk, open_id, union_id）

⑤ 查询该用户所属的所有租户
   → 只有一个租户：签发 JWT（含 tenantId），跳回原页面，登录完成
   → 多个租户：跳转租户选择页，选择后再签发 JWT
```

飞书、企业微信流程完全相同，只是调用接口和字段名称不同，可复用同一套 OAuth 处理框架。

### OAuth 关联表的作用

维护"第三方平台账号"与"Vxture 租户账号"的映射关系。核心字段：

- `provider`：平台标识（dingtalk / feishu / wecom）
- `open_id`：该平台下该用户的唯一 ID
- `union_id`：同企业跨应用的唯一 ID（为后续企业订阅阶段打通通讯录做准备）

一个 Vxture 账号可绑定多个平台，任意一个平台登录均可进入同一个账号。

---

## 4. JWT 设计

### 运营人员 JWT Payload

```json
{
  "sub": "operator_user_id",
  "userType": "operator",
  "role": "admin",
  "tenantId": null,
  "jti": "随机 UUID，用于黑名单吊销",
  "iat": "签发时间",
  "exp": "过期时间"
}
```

### 租户用户 JWT Payload

```json
{
  "sub": "tenant_user_id",
  "userType": "tenant_user",
  "role": "member",
  "tenantId": "当前所选租户 ID",
  "jti": "随机 UUID，用于黑名单吊销",
  "iat": "签发时间",
  "exp": "过期时间"
}
```

### Token 策略

| Token | 有效期 | 存储位置 | 说明 |
|-------|--------|----------|------|
| access token | 15 分钟 | HttpOnly Cookie | 无状态，BFF 直接验证签名 |
| refresh token | 7 天 | Redis + HttpOnly Cookie | 有状态，支持主动吊销 |

### Redis Key 规范

```
refresh:operator:{userId}       → 运营人员 refresh token
refresh:tenant:{userId}         → 租户用户 refresh token
blacklist:{jti}                 → 已吊销的 access token（TTL = 剩余有效期）
crossdomain:{oneTimeToken}      → 跨域一次性 token（TTL = 30 秒）
oauth:state:{state}             → OAuth 授权流程防 CSRF 的 state 值（TTL = 10 分钟）
```

---

## 5. 域名与产品映射

```
admin.vxture.com    →  admin portal    →  admin-bff    运营账号专用
console.vxture.com  →  console portal  →  console-bff  租户账号专用
ruyin.ai            →  ruyin-agent     →  ruyin-bff    租户账号专用
auth.vxture.com     →  统一认证服务     →  auth-bff     两套账号统一入口
```

### Cookie Domain 规划

```
.vxture.com   →  admin · console · auth 共享同一 Cookie
ruyin.ai      →  ruyin 独立 Cookie domain，与 vxture.com 完全隔离
```

---

## 6. 统一认证服务（auth-bff）

### 职责

auth-bff 是**唯一有权签发 JWT 的服务**，其他所有 BFF 只验证，不签发。

- 邮箱密码登录（运营账号 / 租户账号）
- 第三方 OAuth 授权登录（钉钉 · 飞书 · 企业微信）
- 登出与 token 吊销
- access token 续期（基于 refresh token）
- 跨域一次性 token 的生成与验证

### 核心接口概览

```
POST /auth/login
  根据 source 区分运营或租户账号，验证密码，签发 JWT，写入 Cookie

POST /auth/logout
  删除 Redis 中的 refresh token，将 jti 写入黑名单，清除 Cookie

POST /auth/refresh
  验证 refresh token，签发新的 access token

GET  /auth/oauth/{provider}/authorize
  生成授权跳转 URL，将随机 state 存入 Redis，重定向至第三方平台

GET  /auth/oauth/{provider}/callback
  验证 state（防 CSRF），用 code 换取用户信息
  查或建 OAuth 关联及租户数据，签发 JWT，跳回前端

GET  /auth/crossdomain/token
  验证当前登录态，生成 30 秒有效一次性 token，返回供前端跳转使用

POST /auth/crossdomain/verify
  原子性取出并删除 Redis 中的一次性 token
  校验 userType，返回用户信息，由目标域 BFF 签发自己的 Cookie
```

---

## 7. 跨域登录流程（vxture.com ↔ ruyin.ai）

### vxture.com → ruyin.ai

```
① 用户在 console.vxture.com 已登录，触发跳转 ruyin.ai 的操作
② 前端请求 GET auth.vxture.com/auth/crossdomain/token
   验证 .vxture.com Cookie → 生成一次性 token（TTL 30s）→ 返回 token
③ 前端跳转 ruyin.ai/auth/callback?token={oneTimeToken}
④ ruyin-bff 调用 POST auth.vxture.com/auth/crossdomain/verify
   原子取出并删除 token → 校验 userType 必须为 tenant_user
   在 ruyin.ai domain 下签发新 Cookie
⑤ 用户在 ruyin.ai 直接已登录
```

反向流程（ruyin.ai → vxture.com）相同，方向相反。

---

## 8. BFF 验证规则

### 所有 BFF 通用（auth middleware）

每个请求进入路由前必须经过认证中间件：

- 从 Cookie 提取 access token
- 验证 JWT 签名有效性
- 检查 jti 是否在 Redis 黑名单
- 将用户信息（userId · userType · role · tenantId）挂载到请求上下文

任一步骤失败返回 401，不进入业务路由。

### 各 BFF 额外的 userType 守卫

```
admin-bff    →  userType 必须为 operator，否则返回 403
console-bff  →  userType 必须为 tenant_user，否则返回 403
ruyin-bff    →  userType 必须为 tenant_user，否则返回 403
```

### 租户数据隔离原则

console-bff 和 ruyin-bff 的所有业务路由，tenantId 只能从 JWT 上下文中获取，所有数据查询必须携带此 tenantId 作为过滤条件，禁止从请求参数接收 tenantId。

---

## 9. 容器清单

| 容器 | 类型 | 说明 |
|------|------|------|
| auth-bff | NestJS | 统一认证服务，唯一签发 JWT 的服务 |
| website | Next.js | 公营销站 |
| admin | Next.js | 运营门户 |
| console | Next.js | 租户工作台 |
| ruyin-agent | Next.js | 独立产品，standalone |
| website-bff | NestJS | — |
| admin-bff | NestJS | 仅接受 operator JWT |
| console-bff | NestJS | 仅接受 tenant_user JWT |
| ruyin-bff | NestJS | 仅接受 tenant_user JWT |
| ruyin-server | NestJS | ruyin AI 后端 |
| assistant-server | NestJS | 内嵌助手，admin + tenant 共享 |
| Nginx | — | 反向代理，路由分发 |
| PostgreSQL | — | 主数据库，含 pgvector 扩展 |
| Redis | — | Session · 黑名单 · 跨域 token · OAuth state |

**合计：14 个容器**

---

## 10. 代码审查规范

### 10.1 账号体系隔离

- [ ] 运营账号查询只能访问 operator 相关表，禁止访问 tenant_users 及租户业务表
- [ ] 租户账号查询必须携带 tenantId 过滤条件，禁止全租户扫描
- [ ] 两套账号体系的数据禁止在代码中 JOIN 或混合处理
- [ ] 密码字段只存 hash（bcrypt rounds ≥ 12），禁止明文或可逆加密

### 10.2 JWT 签发

- [ ] 只有 auth-bff 可以调用 JWT sign，其他 BFF 禁止引入任何签发逻辑
- [ ] 签发时必须包含 `userType` · `sub` · `tenantId` · `jti` · `exp` 字段
- [ ] `jti` 必须是随机 UUID，不得使用可预测值
- [ ] access token 有效期不得超过 15 分钟
- [ ] JWT 密钥必须从环境变量读取，禁止硬编码

### 10.3 BFF 中间件

- [ ] 所有 BFF 的每个路由必须经过 auth middleware，禁止裸路由
- [ ] admin-bff 所有路由必须验证 `userType === "operator"`
- [ ] console-bff 和 ruyin-bff 所有路由必须验证 `userType === "tenant_user"`
- [ ] 验证失败统一返回 401 / 403，错误信息不得包含内部实现细节
- [ ] jti 黑名单检查必须在签名验证之后、业务逻辑之前执行

### 10.4 第三方 OAuth 登录

- [ ] 授权流程必须生成随机 state 存入 Redis，callback 时验证 state 防 CSRF
- [ ] 用 code 换取平台 token 的操作必须在服务端完成，禁止在前端处理
- [ ] 自动注册流程必须在数据库事务中完成，任一步骤失败全部回滚
- [ ] `provider + open_id` 的唯一约束必须在数据库层面保证，不仅依赖业务代码
- [ ] 从第三方平台获取的 access token 如需存储，必须加密，不得明文入库

### 10.5 跨域一次性 Token

- [ ] 跨域 token 必须是随机 UUID，TTL 不得超过 30 秒
- [ ] verify 接口必须使用 Redis 原子操作（GETDEL），禁止先 GET 再 DEL
- [ ] verify 接口必须校验 userType 是否匹配目标产品
- [ ] 跨域 token 不得出现在任何应用日志中

### 10.6 Cookie 配置

- [ ] 所有认证 Cookie 必须设置 `HttpOnly: true`
- [ ] 生产环境必须设置 `Secure: true`
- [ ] vxture.com 系列 Cookie domain 必须为 `.vxture.com`
- [ ] ruyin.ai Cookie domain 必须为 `ruyin.ai`，禁止使用宽泛域名
- [ ] `SameSite` 设置为 `Lax`

### 10.7 租户数据隔离

- [ ] tenantId 只从 JWT 上下文获取，禁止从 query / body 接收
- [ ] 所有涉及租户数据的查询必须携带 tenantId 过滤条件
- [ ] 多租户切换必须重新签发 JWT（更新 tenantId），不得通过其他方式传递

### 10.8 依赖边界

- [ ] `@vxture/core-auth` 只包含 JWT 验证逻辑，禁止包含签发逻辑
- [ ] 前端代码禁止引入任何 JWT 库
- [ ] agent-server 不处理用户认证，认证由 BFF 完成后通过请求上下文传递
- [ ] OAuth provider 的调用逻辑只存在于 auth-bff 内部

### 10.9 安全规范

- [ ] 登录接口必须有频率限制（建议：同 IP 每分钟不超过 10 次）
- [ ] 密码登录失败不得区分"用户不存在"和"密码错误"
- [ ] 登出必须同时清除 refresh token（Redis）和 access token 黑名单
- [ ] 禁止在响应体中返回 JWT 字符串，只通过 Cookie 传递
- [ ] 修改密码、解绑第三方账号等敏感操作必须要求重新验证身份

---

## 11. 环境变量规范

```bash
# auth-bff
JWT_ACCESS_SECRET=           # access token 密钥，≥ 64 字符随机字符串
JWT_REFRESH_SECRET=          # refresh token 密钥，与 access 使用不同值
JWT_ACCESS_EXPIRES=900       # 单位秒，15 分钟
JWT_REFRESH_EXPIRES=604800   # 单位秒，7 天

# 钉钉 OAuth（阶段一优先）
DINGTALK_APP_KEY=
DINGTALK_APP_SECRET=
DINGTALK_REDIRECT_URI=https://auth.vxture.com/oauth/dingtalk/callback

# 飞书 OAuth（阶段二）
FEISHU_APP_ID=
FEISHU_APP_SECRET=
FEISHU_REDIRECT_URI=https://auth.vxture.com/oauth/feishu/callback

# 企业微信 OAuth（阶段二）
WECOM_CORP_ID=
WECOM_AGENT_SECRET=
WECOM_REDIRECT_URI=https://auth.vxture.com/oauth/wecom/callback

# 所有 BFF（用于验证签名，与 auth-bff 相同值）
JWT_ACCESS_SECRET=

# Redis
REDIS_URL=redis://redis:6379

# Cookie
COOKIE_DOMAIN_PLATFORM=.vxture.com
COOKIE_DOMAIN_RUYIN=ruyin.ai
```

---

## 12. 阶段规划

### 阶段一（当前优先）

- 邮箱密码登录（运营账号 + 租户账号）
- **钉钉个人账号 OAuth 授权登录**
- 首次登录自动创建个人租户（trial）
- 跨域无缝跳转（vxture.com ↔ ruyin.ai）

### 阶段二

- 飞书个人账号登录
- 企业微信个人账号登录
- 多租户切换器 UI

### 阶段三

- 个人租户升级为企业租户
- 企业管理员安装应用，打通企业通讯录
- 钉钉 / 飞书应用市场上架审核

---

*本文档描述功能、流程与设计意图，不包含数据库 DDL。数据库表结构以实际已建表为准。*
