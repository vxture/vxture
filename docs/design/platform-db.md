# Platform DB 详细设计

> 版本：1.3.0 | 2026-05-14
> 上级文档：[`docs/design/database.md`](database.md)（顶层架构）
>
> **本文档为迁移前的目标态设计，评审确认后方可执行迁移。**

---

## 0. 阅读说明

### 字段排序原则

每张表的字段严格遵循以下顺序，不得随意颠倒：

```
① id                    主键，永远第一
② 归属 FK               tenant_id > account_id（scope 由宽到窄）
③ 自然业务键            UNIQUE code / ticket_no 等
④ 分类 / 类型字段        type / category / channel（决定如何解读这行数据）
⑤ 状态字段              status / status_code
⑥ 核心必填内容          NOT NULL 业务字段（按语义分组）
⑦ 可选扩展内容          NULL 业务字段
⑧ 布尔标志组            is_* 字段全部集中
⑨ 业务时间戳            expires_at / effective_at / start_at / end_at 等
⑩ JSONB 扩展            config / metadata / payload
⑪ 审计人                created_by → updated_by（有则按此顺序）
⑫ 标准时间戳            created_at → updated_at → deleted_at
                         ⚠️ 永远最后，永远此顺序，不可拆开
```

**Append-only 表**（`created_at` 结尾，无 `updated_at` / `deleted_at`）单独标注。

### 状态标注

| 标注 | 含义                                       |
| ---- | ------------------------------------------ |
| ✅   | 已存在，结构不变（仅随 schema 重命名生效） |
| ✏️   | 已存在，需修改字段或表名                   |
| 📦   | 已存在于其他 schema，需迁移并重命名        |
| 🆕   | 全新表，需创建                             |

### 现态 → 目标 Schema 对照

| 当前 Prisma schema   | 目标 schema | 变化摘要                                                                                                                      |
| -------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `account`            | `identity`  | 重命名；account 补安全字段（MFA/验证/锁定/来源）；credential 补 MFA；oauth_state 补 PKCE/OIDC；login_attempt 补 auth_method   |
| `tenancy`            | `tenant`    | 重命名；tenant 补 PLG 字段（owner/region/source/trial）；member 补 invited_by                                                 |
| ——（不存在）         | `iam`       | 全新；capability 补计量字段；permission 补 module/is_visible                                                                  |
| `product`            | `product`   | 待单独详细设计，当前结构不变                                                                                                  |
| `commerce`           | `commerce`  | 补 3 张缺失表；credit 补乐观锁 version；payment_method 补 last_used_at                                                        |
| `ai_gateway`（部分） | `model`     | model 补 model_type / 规格字段；provider 补 logo/description；policy 补 name/daily limit                                      |
| `platform`           | `ops`       | admin/role 合并冗余 status BOOLEAN；admin 补安全字段；announcement 补状态/语言/CTA；feature_flag 补分类；maintenance 补严重度 |
| `support`            | `support`   | ticket 补 account_id/SLA/CSAT；ticket_event 补 actor_type；audit_log 补可观测性；notification_log 补重试/溯源                 |

---

## 1. `identity` Schema（当前：`account`）

**职责：** 全平台统一身份，与产品和租户无关。解决「你是谁 / 你的凭证是否有效」。

### 表清单

| 表名                   | 当前表名                 | 状态                                               |
| ---------------------- | ------------------------ | -------------------------------------------------- |
| `account`              | `account`                | ✏️ 补安全字段，status 类型变更，password_hash 迁出 |
| `account_credential`   | ——（字段散在 account）   | ✏️ 提取新建，补 MFA 字段                           |
| `account_profile`      | `account_profile`        | ✏️ 补 country_code                                 |
| `sso_connection`       | `account_identity`       | ✏️ 表名语义化                                      |
| `oauth_provider`       | `account_oauth_provider` | ✏️ 表名简化                                        |
| `oauth_state`          | `account_oauth_state`    | ✏️ 补 PKCE/OIDC 字段，append-only                  |
| `password_reset_token` | `password_reset_token`   | ✅ append-only                                     |
| `account_session`      | ——（不存在）             | 🆕 append-only                                     |
| `account_verification` | ——（不存在）             | 🆕 append-only                                     |
| `login_attempt`        | ——（不存在）             | 🆕 补 auth_method，append-only                     |

---

**`account`** ✏️ — 账号主记录

| 字段                | 类型                                  | 说明                                                         |
| ------------------- | ------------------------------------- | ------------------------------------------------------------ |
| id                  | UUID NOT NULL                         | PK                                                           |
| username            | VARCHAR(64) NOT NULL                  | 登录名，全局唯一，不可修改                                   |
| account_source      | VARCHAR(32) NOT NULL DEFAULT 'web'    | 来源：`web` / `api` / `sso` / `admin_created` / `migrated`   |
| status              | VARCHAR(32) NOT NULL DEFAULT 'active' | `active` / `suspended` / `deleted`；原为 BOOLEAN，扩展为枚举 |
| email               | VARCHAR(128) NULL                     | 全局唯一                                                     |
| phone               | VARCHAR(32) NULL                      | 全局唯一                                                     |
| email_verified_at   | TIMESTAMPTZ NULL                      | NULL 表示邮箱未验证                                          |
| phone_verified_at   | TIMESTAMPTZ NULL                      | NULL 表示手机未验证                                          |
| login_count         | INT NOT NULL DEFAULT 0                | 累计成功登录次数，用于活跃度分析                             |
| login_failure_count | INT NOT NULL DEFAULT 0                | 当前连续失败次数；成功后重置为 0                             |
| last_login_at       | TIMESTAMPTZ NULL                      |                                                              |
| last_login_ip       | VARCHAR(64) NULL                      |                                                              |
| mfa_enabled         | BOOLEAN NOT NULL DEFAULT false        | 是否已启用多因素认证                                         |
| locked_until        | TIMESTAMPTZ NULL                      | 账号锁定到期时间；NULL 表示未锁定                            |
| created_at          | TIMESTAMPTZ NOT NULL                  |                                                              |
| updated_at          | TIMESTAMPTZ NOT NULL                  |                                                              |
| deleted_at          | TIMESTAMPTZ NULL                      | 软删除                                                       |

---

**`account_credential`** ✏️ — 登录凭证（从 account.password_hash 提出，补 MFA 字段）

| 字段                  | 类型                           | 说明                                            |
| --------------------- | ------------------------------ | ----------------------------------------------- |
| account_id            | UUID NOT NULL                  | PK，FK → account，1-1                           |
| password_hash         | VARCHAR(255) NULL              | bcrypt；NULL 表示纯 OAuth 账号无密码            |
| mfa_secret            | VARCHAR(255) NULL              | TOTP 种子（AES 加密存储）；NULL 表示未启用 TOTP |
| mfa_recovery_codes    | TEXT[] NULL                    | 一次性恢复码哈希列表；使用后从数组移除          |
| force_password_change | BOOLEAN NOT NULL DEFAULT false | 管理员要求下次登录强制改密                      |
| password_changed_at   | TIMESTAMPTZ NULL               | 最近一次密码修改时间；合规审计用                |
| created_at            | TIMESTAMPTZ NOT NULL           |                                                 |
| updated_at            | TIMESTAMPTZ NOT NULL           |                                                 |

> 独立表的价值：可对 credential 表单独设 Row-Level Security，主账号查询路径不触碰密码哈希和 MFA 密钥。

---

**`account_profile`** ✏️ — 账号扩展资料

| 字段         | 类型                 | 说明                                         |
| ------------ | -------------------- | -------------------------------------------- |
| account_id   | UUID NOT NULL        | PK，FK → account，1-1                        |
| country_code | CHAR(2) NULL         | ISO 3166-1；税务合规与本地化使用             |
| display_name | VARCHAR(96) NULL     |                                              |
| avatar_url   | VARCHAR(512) NULL    |                                              |
| headline     | VARCHAR(128) NULL    | 职位头衔                                     |
| bio          | TEXT NULL            |                                              |
| timezone     | VARCHAR(64) NULL     | IANA tz 格式，如 `Asia/Shanghai`             |
| language     | VARCHAR(32) NULL     | BCP-47，如 `zh-CN`                           |
| metadata     | JSONB NULL           | 自定义用户属性扩展（社交链接、个性化偏好等） |
| created_at   | TIMESTAMPTZ NOT NULL |                                              |
| updated_at   | TIMESTAMPTZ NOT NULL |                                              |

---

**`sso_connection`** ✏️ — 第三方登录绑定（原 `account_identity`）

| 字段                  | 类型                  | 说明                                           |
| --------------------- | --------------------- | ---------------------------------------------- |
| id                    | UUID NOT NULL         | PK                                             |
| account_id            | UUID NOT NULL         | FK → account                                   |
| provider              | VARCHAR(32) NOT NULL  | `dingtalk` / `wecom` / `github` / `google` 等  |
| provider_account_id   | VARCHAR(255) NOT NULL | 第三方侧唯一标识                               |
| provider_account_data | JSONB NULL            | 第三方返回的原始 profile（宽表，按需读取字段） |
| created_at            | TIMESTAMPTZ NOT NULL  |                                                |
| updated_at            | TIMESTAMPTZ NOT NULL  |                                                |
| deleted_at            | TIMESTAMPTZ NULL      | 解绑时软删除                                   |

> UNIQUE(account_id, provider)；UNIQUE(provider, provider_account_id)

---

**`oauth_provider`** ✏️ — OAuth 提供商平台级配置（原 `account_oauth_provider`）

| 字段             | 类型                          | 说明                                |
| ---------------- | ----------------------------- | ----------------------------------- |
| id               | UUID NOT NULL                 | PK                                  |
| code             | VARCHAR(64) NOT NULL          | 全局唯一标识码，如 `dingtalk`       |
| name             | VARCHAR(64) NOT NULL          | 显示名                              |
| client_id        | VARCHAR(255) NULL             | OAuth App Client ID                 |
| client_secret    | VARCHAR(255) NULL             | OAuth App Client Secret（加密存储） |
| scope            | VARCHAR(512) NULL             | 请求的权限范围                      |
| auth_url         | VARCHAR(512) NULL             | 授权端点                            |
| token_url        | VARCHAR(512) NULL             | Token 端点                          |
| account_info_url | VARCHAR(512) NULL             | 用户信息端点                        |
| redirect_uri     | VARCHAR(512) NULL             | 回调地址                            |
| is_enabled       | BOOLEAN NOT NULL DEFAULT true |                                     |
| sort             | INT NOT NULL DEFAULT 999      |                                     |
| created_at       | TIMESTAMPTZ NOT NULL          |                                     |
| updated_at       | TIMESTAMPTZ NOT NULL          |                                     |

---

**`oauth_state`** ✏️ — OAuth 授权请求临时状态（原 `account_oauth_state`，补 PKCE/OIDC，append-only）

| 字段          | 类型                  | 说明                                     |
| ------------- | --------------------- | ---------------------------------------- |
| id            | UUID NOT NULL         | PK                                       |
| provider_code | VARCHAR(64) NOT NULL  | FK → oauth_provider.code                 |
| state         | VARCHAR(128) NOT NULL | CSRF 防护随机值，全局唯一                |
| redirect_uri  | VARCHAR(512) NOT NULL | 授权完成后跳转地址                       |
| code_verifier | VARCHAR(128) NULL     | PKCE code_verifier；NULL 表示不使用 PKCE |
| nonce         | VARCHAR(128) NULL     | OIDC nonce，用于 ID Token 校验防重放     |
| ip_address    | VARCHAR(64) NULL      | 发起授权的客户端 IP，用于安全审计        |
| expires_at    | TIMESTAMPTZ NOT NULL  | TTL，过期后可物理清理                    |
| created_at    | TIMESTAMPTZ NOT NULL  |                                          |

---

**`password_reset_token`** ✅ — 密码重置令牌（append-only，used_at 记录使用状态）

| 字段       | 类型                 | 说明               |
| ---------- | -------------------- | ------------------ |
| id         | UUID NOT NULL        | PK                 |
| account_id | UUID NOT NULL        | FK → account       |
| token_hash | VARCHAR(64) NOT NULL | 令牌哈希，全局唯一 |
| expires_at | TIMESTAMPTZ NOT NULL | TTL                |
| used_at    | TIMESTAMPTZ NULL     | NULL 表示未使用    |
| created_at | TIMESTAMPTZ NOT NULL |                    |

---

**`account_session`** 🆕 — JWT 吊销黑名单（append-only）

| 字段          | 类型                  | 说明                                                         |
| ------------- | --------------------- | ------------------------------------------------------------ |
| id            | UUID NOT NULL         | PK                                                           |
| account_id    | UUID NOT NULL         | FK → account                                                 |
| jti           | VARCHAR(128) NOT NULL | JWT `jti` claim，全局唯一                                    |
| revoke_reason | VARCHAR(64) NOT NULL  | `logout` / `password_change` / `mfa_enabled` / `admin_force` |
| expires_at    | TIMESTAMPTZ NOT NULL  | JWT 原生过期时间，过期后此行可清理                           |
| created_at    | TIMESTAMPTZ NOT NULL  | 即吊销时间                                                   |

> 只存已吊销的 session，正常 session 不落库。JWT 校验：先验签名 → 再查 jti 是否在黑名单。

---

**`account_verification`** 🆕 — 邮箱 / 手机验证码（append-only）

| 字段          | 类型                   | 说明                                                          |
| ------------- | ---------------------- | ------------------------------------------------------------- |
| id            | UUID NOT NULL          | PK                                                            |
| account_id    | UUID NULL              | FK → account；NULL 表示注册前的预验证                         |
| target_type   | VARCHAR(16) NOT NULL   | `email` / `phone`                                             |
| target        | VARCHAR(128) NOT NULL  | 邮箱地址或手机号                                              |
| purpose       | VARCHAR(32) NOT NULL   | `register` / `login` / `bind` / `reset_password` / `mfa_bind` |
| code_hash     | VARCHAR(64) NOT NULL   | 验证码哈希，不存明文                                          |
| attempt_count | INT NOT NULL DEFAULT 0 | 错误尝试次数；≥ 5 次锁定此记录                                |
| expires_at    | TIMESTAMPTZ NOT NULL   | TTL，5–10 分钟                                                |
| used_at       | TIMESTAMPTZ NULL       | NULL 表示未使用                                               |
| created_at    | TIMESTAMPTZ NOT NULL   |                                                               |

---

**`login_attempt`** 🆕 — 登录尝试记录（限速 + 风控，append-only）

| 字段         | 类型                                    | 说明                                                                   |
| ------------ | --------------------------------------- | ---------------------------------------------------------------------- |
| id           | UUID NOT NULL                           | PK                                                                     |
| account_id   | UUID NULL                               | 账号存在时填充；账号不存在时为 NULL                                    |
| identity     | VARCHAR(128) NOT NULL                   | 本次尝试输入的邮箱 / 手机 / 用户名                                     |
| auth_method  | VARCHAR(32) NOT NULL DEFAULT 'password' | `password` / `sms_code` / `oauth` / `totp` / `recovery_code`           |
| result       | VARCHAR(32) NOT NULL                    | `success` / `wrong_password` / `not_found` / `locked` / `mfa_required` |
| ip_address   | VARCHAR(64) NOT NULL                    |                                                                        |
| country_code | CHAR(2) NULL                            | GeoIP 推断，用于异地登录风控                                           |
| user_agent   | VARCHAR(512) NULL                       |                                                                        |
| created_at   | TIMESTAMPTZ NOT NULL                    |                                                                        |

> 按 `(identity, created_at)` 和 `(ip_address, created_at)` 做滑动窗口计数。

---

## 2. `tenant` Schema（当前：`tenancy`）

**职责：** 多租户核心，PLG 模型下的租户生命周期、成员关系和组织信息。

### 表清单

| 表名                        | 当前表名                    | 状态                                        |
| --------------------------- | --------------------------- | ------------------------------------------- |
| `tenant`                    | `tenant`                    | ✏️ 补 PLG 字段（owner/region/source/trial） |
| `tenant_member`             | `tenant_member`             | ✏️ 移除 role_id，补 invited_by              |
| `tenant_setting`            | `tenant_config`             | ✏️ 表名语义化，字段顺序规范化               |
| `tenant_domain`             | `tenant_domain`             | ✅                                          |
| `tenant_organization`       | `tenant_organization`       | ✅                                          |
| `tenant_ownership_transfer` | `tenant_ownership_transfer` | ✅ append-only                              |
| `tenant_invitation`         | ——（不存在）                | 🆕                                          |

> 📦 迁出到 `iam`：`tenant_role` → `role`，`tenant_permission` → `permission`，`tenant_role_permission` → `role_permission`

---

**`tenant`** ✏️ — 租户主记录

| 字段             | 类型                                         | 说明                                                                          |
| ---------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| id               | UUID NOT NULL                                | PK                                                                            |
| tenant_code      | VARCHAR(64) NOT NULL                         | 全局唯一业务编码（URL slug）                                                  |
| tenant_type      | VARCHAR(32) NOT NULL                         | `individual` / `organization`                                                 |
| status           | VARCHAR(32) NOT NULL DEFAULT 'active'        | `active` / `suspended` / `deleted`                                            |
| status_reason    | VARCHAR(512) NULL                            | 状态变更原因                                                                  |
| status_at        | TIMESTAMPTZ NULL                             | 最近状态变更时间                                                              |
| tenant_name      | VARCHAR(128) NOT NULL                        | 租户名称                                                                      |
| display_name     | VARCHAR(128) NULL                            | 显示名（不填则用 tenant_name）                                                |
| description      | VARCHAR(1024) NULL                           |                                                                               |
| logo_url         | VARCHAR(512) NULL                            |                                                                               |
| region           | VARCHAR(64) NOT NULL DEFAULT 'cn-hangzhou'   | 租户数据所在区域，多区域合规隔离                                              |
| language         | VARCHAR(16) NOT NULL DEFAULT 'zh-CN'         |                                                                               |
| time_zone        | VARCHAR(64) NOT NULL DEFAULT 'Asia/Shanghai' |                                                                               |
| source           | VARCHAR(64) NULL                             | 租户注册来源：`self_registered` / `admin_created` / `invitation` / `migrated` |
| owner_account_id | UUID NULL                                    | 当前所有者（冗余存储，加速权限判断热路径）                                    |
| is_trial         | BOOLEAN NOT NULL DEFAULT false               | 当前是否处于试用期                                                            |
| trial_ends_at    | TIMESTAMPTZ NULL                             | 试用期结束时间；PLG 核心指标                                                  |
| converted_at     | TIMESTAMPTZ NULL                             | 首次付费订阅开始时间；PLG 转化指标                                            |
| approved_at      | TIMESTAMPTZ NULL                             | 运营审核通过时间                                                              |
| metadata         | JSONB NULL                                   | 自定义租户属性（入驻来源标签、行业分类等运营附加字段）                        |
| created_by       | UUID NULL                                    |                                                                               |
| approved_by      | UUID NULL                                    |                                                                               |
| created_at       | TIMESTAMPTZ NOT NULL                         |                                                                               |
| updated_at       | TIMESTAMPTZ NOT NULL                         |                                                                               |
| deleted_at       | TIMESTAMPTZ NULL                             |                                                                               |

---

**`tenant_member`** ✏️ — 租户成员关系（移除 role_id，补 invited_by）

| 字段             | 类型                                   | 说明                                                               |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------ |
| id               | UUID NOT NULL                          | PK                                                                 |
| tenant_id        | UUID NOT NULL                          | FK → tenant                                                        |
| account_id       | UUID NOT NULL                          | UNIQUE(tenant_id, account_id)                                      |
| role             | VARCHAR(32) NOT NULL DEFAULT 'member'  | 粗粒度角色：`owner` / `admin` / `member`；快速判断用，细粒度走 iam |
| status           | VARCHAR(32) NOT NULL DEFAULT 'active'  | `active` / `suspended` / `removed`                                 |
| joined_source    | VARCHAR(64) NOT NULL DEFAULT 'created' | `created` / `invited` / `sso`                                      |
| nickname         | VARCHAR(128) NULL                      | 租户内显示名                                                       |
| remark           | VARCHAR(512) NULL                      |                                                                    |
| invited_by       | UUID NULL                              | 邀请人 account_id；joined_source = invited 时填充                  |
| is_primary_owner | BOOLEAN NOT NULL DEFAULT false         | 唯一主所有者标志                                                   |
| joined_at        | TIMESTAMPTZ NOT NULL                   |                                                                    |
| last_active_at   | TIMESTAMPTZ NULL                       |                                                                    |
| metadata         | JSONB NULL                             | 租户内自定义成员属性（如内部工号、部门标签等）                     |
| created_by       | UUID NULL                              |                                                                    |
| updated_by       | UUID NULL                              |                                                                    |
| created_at       | TIMESTAMPTZ NOT NULL                   |                                                                    |
| updated_at       | TIMESTAMPTZ NOT NULL                   |                                                                    |
| deleted_at       | TIMESTAMPTZ NULL                       |                                                                    |

> 移除 `role_id`：细粒度角色绑定改由 `iam.member_role_binding` 多对多维护，支持一人多角色。

---

**`tenant_setting`** ✏️ — 租户级配置（原 `tenant_config`，表名语义化）

| 字段         | 类型                                  | 说明                                       |
| ------------ | ------------------------------------- | ------------------------------------------ |
| id           | UUID NOT NULL                         | PK                                         |
| tenant_id    | UUID NOT NULL                         | FK → tenant；UNIQUE(tenant_id, config_key) |
| config_group | VARCHAR(100) NULL                     | 分组，如 `notification` / `security`       |
| config_key   | VARCHAR(128) NOT NULL                 | 键名                                       |
| value_type   | VARCHAR(20) NOT NULL DEFAULT 'string' | `string` / `number` / `boolean` / `json`   |
| config_value | TEXT NULL                             |                                            |
| is_sensitive | BOOLEAN NOT NULL DEFAULT false        | 敏感值（读接口脱敏返回）                   |
| is_encrypted | BOOLEAN NOT NULL DEFAULT false        | 落库时是否加密                             |
| is_readonly  | BOOLEAN NOT NULL DEFAULT false        | 只读（禁止租户自行修改）                   |
| description  | VARCHAR(512) NULL                     |                                            |
| created_by   | UUID NOT NULL                         |                                            |
| updated_by   | UUID NULL                             |                                            |
| created_at   | TIMESTAMPTZ NOT NULL                  |                                            |
| updated_at   | TIMESTAMPTZ NOT NULL                  |                                            |
| deleted_at   | TIMESTAMPTZ NULL                      |                                            |

---

**`tenant_domain`** ✅ — 自定义域名绑定

| 字段                | 类型                                   | 说明                                      |
| ------------------- | -------------------------------------- | ----------------------------------------- |
| id                  | UUID NOT NULL                          | PK                                        |
| tenant_id           | UUID NOT NULL                          | FK → tenant                               |
| domain              | VARCHAR(256) NOT NULL                  | 全局唯一                                  |
| domain_type         | VARCHAR(32) NOT NULL                   | `primary` / `alias`                       |
| verification_status | VARCHAR(32) NOT NULL DEFAULT 'pending' | `pending` / `verified` / `failed`         |
| ssl_status          | VARCHAR(32) NOT NULL DEFAULT 'none'    | `none` / `pending` / `active` / `expired` |
| verification_token  | VARCHAR(128) NULL                      | DNS TXT 记录验证值                        |
| is_primary          | BOOLEAN NOT NULL DEFAULT false         |                                           |
| token_expires_at    | TIMESTAMPTZ NULL                       |                                           |
| verified_at         | TIMESTAMPTZ NULL                       |                                           |
| created_at          | TIMESTAMPTZ NOT NULL                   |                                           |
| updated_at          | TIMESTAMPTZ NOT NULL                   |                                           |
| deleted_at          | TIMESTAMPTZ NULL                       |                                           |

---

**`tenant_organization`** ✅ — 企业资质信息

| 字段                       | 类型                                      | 说明                                               |
| -------------------------- | ----------------------------------------- | -------------------------------------------------- |
| id                         | UUID NOT NULL                             | PK                                                 |
| tenant_id                  | UUID NOT NULL                             | FK → tenant，全局唯一                              |
| country_code               | CHAR(2) NOT NULL DEFAULT 'CN'             | ISO 3166-1                                         |
| company_name               | VARCHAR(256) NOT NULL                     |                                                    |
| unified_social_credit_code | VARCHAR(64) NULL                          | 统一社会信用代码                                   |
| industry                   | VARCHAR(128) NULL                         |                                                    |
| scale                      | VARCHAR(64) NULL                          | 企业规模                                           |
| province                   | VARCHAR(128) NULL                         |                                                    |
| city                       | VARCHAR(128) NULL                         |                                                    |
| district                   | VARCHAR(128) NULL                         |                                                    |
| postal_code                | VARCHAR(16) NULL                          |                                                    |
| address                    | VARCHAR(512) NULL                         |                                                    |
| contact_name               | VARCHAR(128) NULL                         |                                                    |
| contact_phone              | VARCHAR(64) NULL                          |                                                    |
| contact_email              | VARCHAR(128) NULL                         |                                                    |
| business_license_url       | VARCHAR(512) NULL                         | 营业执照 URL                                       |
| verified_status            | VARCHAR(32) NOT NULL DEFAULT 'unverified' | `unverified` / `pending` / `verified` / `rejected` |
| rejected_reason            | VARCHAR(512) NULL                         |                                                    |
| verified_by                | UUID NULL                                 |                                                    |
| verified_at                | TIMESTAMPTZ NULL                          |                                                    |
| created_at                 | TIMESTAMPTZ NOT NULL                      |                                                    |
| updated_at                 | TIMESTAMPTZ NOT NULL                      |                                                    |
| deleted_at                 | TIMESTAMPTZ NULL                          |                                                    |

---

**`tenant_ownership_transfer`** ✅ — 所有权转移记录（append-only）

| 字段            | 类型                                   | 说明                               |
| --------------- | -------------------------------------- | ---------------------------------- |
| id              | UUID NOT NULL                          | PK                                 |
| tenant_id       | UUID NOT NULL                          | FK → tenant                        |
| operator_id     | UUID NOT NULL                          | 执行操作的运营人员 account_id      |
| from_account_id | UUID NOT NULL                          | 原所有者                           |
| to_account_id   | UUID NOT NULL                          | 新所有者                           |
| transfer_status | VARCHAR(32) NOT NULL DEFAULT 'success' | `success` / `failed` / `cancelled` |
| transfer_reason | VARCHAR(512) NULL                      |                                    |
| remark          | TEXT NULL                              |                                    |
| created_at      | TIMESTAMPTZ NOT NULL                   |                                    |

---

**`tenant_invitation`** 🆕 — 邀请记录

| 字段        | 类型                                   | 说明                                             |
| ----------- | -------------------------------------- | ------------------------------------------------ |
| id          | UUID NOT NULL                          | PK                                               |
| tenant_id   | UUID NOT NULL                          | FK → tenant                                      |
| target_type | VARCHAR(16) NOT NULL                   | `email` / `phone`                                |
| target      | VARCHAR(128) NOT NULL                  | 被邀请的邮箱或手机                               |
| role        | VARCHAR(32) NOT NULL                   | 受邀后的初始粗粒度角色                           |
| status      | VARCHAR(32) NOT NULL DEFAULT 'pending' | `pending` / `accepted` / `expired` / `cancelled` |
| token_hash  | VARCHAR(64) NOT NULL                   | 邀请链接 token 哈希，全局唯一                    |
| expires_at  | TIMESTAMPTZ NOT NULL                   |                                                  |
| accepted_at | TIMESTAMPTZ NULL                       |                                                  |
| created_by  | UUID NOT NULL                          | 邀请人 account_id                                |
| created_at  | TIMESTAMPTZ NOT NULL                   |                                                  |
| updated_at  | TIMESTAMPTZ NOT NULL                   |                                                  |

---

## 3. `iam` Schema（全新，从 `tenancy` 提取）

**职责：** 租户域细粒度 RBAC + 平台能力门控。解决「租户用户在 console 内能做什么 / 能用哪些平台能力」。

### 表清单

| 表名                  | 来源                             | 状态                                               |
| --------------------- | -------------------------------- | -------------------------------------------------- |
| `role`                | `tenancy.tenant_role`            | 📦 迁入，字段精简                                  |
| `permission`          | `tenancy.tenant_permission`      | 📦 迁入，去除 scope 混合字段，补 module/is_visible |
| `role_permission`     | `tenancy.tenant_role_permission` | 📦 迁入                                            |
| `member_role_binding` | ——（不存在）                     | 🆕                                                 |
| `capability`          | ——（不存在）                     | 🆕 补计量字段                                      |
| `plan_capability`     | ——（不存在）                     | 🆕                                                 |

---

**`role`** 📦 — 租户自定义角色（原 `tenancy.tenant_role`）

| 字段        | 类型                                  | 说明                                                                       |
| ----------- | ------------------------------------- | -------------------------------------------------------------------------- |
| id          | UUID NOT NULL                         | PK                                                                         |
| tenant_id   | UUID NOT NULL                         | FK → tenant；UNIQUE(tenant_id, role_code)                                  |
| role_code   | VARCHAR(64) NOT NULL                  | 租户内唯一标识码                                                           |
| role_name   | VARCHAR(128) NOT NULL                 | 显示名                                                                     |
| description | VARCHAR(512) NULL                     |                                                                            |
| is_system   | BOOLEAN NOT NULL DEFAULT false        | 系统内置角色，不可删除                                                     |
| status      | VARCHAR(16) NOT NULL DEFAULT 'active' | `active` / `inactive`                                                      |
| sort        | INT NOT NULL DEFAULT 999              |                                                                            |
| ui_config   | JSONB NULL                            | 角色 UI 展示配置（颜色、图标等），如 `{"color":"#3B82F6","icon":"shield"}` |
| created_by  | UUID NULL                             |                                                                            |
| updated_by  | UUID NULL                             |                                                                            |
| created_at  | TIMESTAMPTZ NOT NULL                  |                                                                            |
| updated_at  | TIMESTAMPTZ NOT NULL                  |                                                                            |
| deleted_at  | TIMESTAMPTZ NULL                      |                                                                            |

---

**`permission`** 📦 — 权限项目录（原 `tenancy.tenant_permission`，补 module / is_visible）

| 字段            | 类型                                    | 说明                                                                 |
| --------------- | --------------------------------------- | -------------------------------------------------------------------- |
| id              | UUID NOT NULL                           | PK                                                                   |
| permission_code | VARCHAR(128) NOT NULL                   | 平台级全局唯一，如 `tenant.member.invite`                            |
| module          | VARCHAR(64) NULL                        | 所属产品模块，用于 UI 分组：`member` / `billing` / `ai` / `workflow` |
| permission_type | VARCHAR(32) NOT NULL DEFAULT 'function' | `menu` / `function` / `data`                                         |
| permission_name | VARCHAR(128) NOT NULL                   |                                                                      |
| parent_code     | VARCHAR(128) NULL                       | 树形结构，FK → permission.permission_code                            |
| description     | VARCHAR(512) NULL                       |                                                                      |
| is_active       | BOOLEAN NOT NULL DEFAULT true           |                                                                      |
| is_visible      | BOOLEAN NOT NULL DEFAULT true           | false 表示功能权限不在 UI 权限分配树中展示                           |
| sort            | INT NOT NULL DEFAULT 999                |                                                                      |
| created_at      | TIMESTAMPTZ NOT NULL                    |                                                                      |
| updated_at      | TIMESTAMPTZ NOT NULL                    |                                                                      |
| deleted_at      | TIMESTAMPTZ NULL                        |                                                                      |

> 移除：`tenant_id`（权限定义是平台级的）、`permission_scope`（scope 混合设计已废除）。

---

**`role_permission`** 📦 — 角色权限关联（原 `tenancy.tenant_role_permission`，复合 PK，硬删除）

| 字段          | 类型                 | 说明                         |
| ------------- | -------------------- | ---------------------------- |
| role_id       | UUID NOT NULL        | FK → role；复合 PK           |
| permission_id | UUID NOT NULL        | FK → permission；复合 PK     |
| tenant_id     | UUID NOT NULL        | 冗余存储，加速按租户维度查询 |
| created_by    | UUID NULL            |                              |
| created_at    | TIMESTAMPTZ NOT NULL |                              |

---

**`member_role_binding`** 🆕 — 成员 → 角色多对多绑定（硬删除）

| 字段       | 类型                 | 说明                                                  |
| ---------- | -------------------- | ----------------------------------------------------- |
| id         | UUID NOT NULL        | PK                                                    |
| tenant_id  | UUID NOT NULL        | 冗余存储，加速租户维度查询                            |
| member_id  | UUID NOT NULL        | FK → tenant.tenant_member；UNIQUE(member_id, role_id) |
| role_id    | UUID NOT NULL        | FK → role                                             |
| granted_by | UUID NULL            |                                                       |
| granted_at | TIMESTAMPTZ NOT NULL | 即绑定时间                                            |

> Revoke 时直接删行（硬删除），无需 deleted_at。

---

**`capability`** 🆕 — 平台能力项目录（静态配置，运营在 admin 后台维护）

| 字段            | 类型                           | 说明                                                                |
| --------------- | ------------------------------ | ------------------------------------------------------------------- |
| id              | UUID NOT NULL                  | PK                                                                  |
| capability_code | VARCHAR(128) NOT NULL          | 全局唯一，如 `model.custom` / `workflow.advanced`                   |
| category        | VARCHAR(64) NOT NULL           | 分类：`ai` / `workflow` / `storage` / `security` 等                 |
| capability_name | VARCHAR(128) NOT NULL          |                                                                     |
| description     | VARCHAR(512) NULL              |                                                                     |
| unit            | VARCHAR(32) NULL               | 计量单位：`requests` / `tokens` / `members` / `GB`；NULL 表示不计量 |
| default_limit   | BIGINT NULL                    | 计划开放此能力时的默认配额上限；NULL 表示无限                       |
| is_active       | BOOLEAN NOT NULL DEFAULT true  |                                                                     |
| is_metered      | BOOLEAN NOT NULL DEFAULT false | 是否统计用量并参与配额扣减                                          |
| created_at      | TIMESTAMPTZ NOT NULL           |                                                                     |
| updated_at      | TIMESTAMPTZ NOT NULL           |                                                                     |

---

**`plan_capability`** 🆕 — 订阅计划 → 能力集映射（复合 PK，硬删除）

| 字段           | 类型                 | 说明                                             |
| -------------- | -------------------- | ------------------------------------------------ |
| plan_id        | UUID NOT NULL        | FK → product.plan；复合 PK                       |
| capability_id  | UUID NOT NULL        | FK → capability；复合 PK                         |
| limit_override | BIGINT NULL          | 覆盖 capability.default_limit；NULL 表示使用默认 |
| created_by     | UUID NULL            |                                                  |
| created_at     | TIMESTAMPTZ NOT NULL |                                                  |

> 运行时查询链：`commerce.tenant_subscription.plan_id` → `iam.plan_capability` → `iam.capability`。

---

## 4. `product` Schema

**职责：** 套餐、功能特性、定价、Agent 目录的权威静态配置来源。变更极少，可全量缓存。

待单独详细设计。现有 7 张表（`plan`、`feature`、`plan_feature`、`plan_price`、`agent`、`agent_feature`、`plan_agent`）结构暂不变更。

规划中扩展表（待产品需求确定后添加，当前不实施）：

| 表名            | 用途                          |
| --------------- | ----------------------------- |
| `skill_catalog` | 技能（工具调用）目录          |
| `plan_skill`    | 计划可访问的技能集            |
| `solution`      | 行业解决方案包                |
| `plan_solution` | 计划对应的解决方案            |
| `preset`        | 部署预设（SaaS / 私有化变体） |

---

## 5. `commerce` Schema

**职责：** 租户的商业状态——订阅、配额、用量、账单、支付。详细设计见 [`docs/design/commerce.md`](commerce.md)。

✅ **现有 12 张表结构不变**：

- core Prisma 侧（9 张）：`tenant_subscription`、`tenant_subscription_history`、`tenant_subscription_override`、`tenant_invoice`、`tenant_invoice_item`、`tenant_invoice_receipt`、`tenant_payment`、`tenant_refund`、`tenant_transaction`
- gateway Prisma 侧（3 张）：`tenant_subscription_quota`、`tenant_usage_event`、`tenant_usage_summary`

---

**`tenant_credit`** 🆕 — 账户余额与赠送额度（每租户一行，快照表）

| 字段           | 类型                               | 说明                                          |
| -------------- | ---------------------------------- | --------------------------------------------- |
| id             | UUID NOT NULL                      | PK                                            |
| tenant_id      | UUID NOT NULL                      | FK → tenant_subscription；全局唯一            |
| currency       | VARCHAR(16) NOT NULL DEFAULT 'CNY' |                                               |
| balance        | DECIMAL(12,2) NOT NULL DEFAULT 0   | 当前可用余额                                  |
| total_granted  | DECIMAL(12,2) NOT NULL DEFAULT 0   | 累计赠送额度                                  |
| total_consumed | DECIMAL(12,2) NOT NULL DEFAULT 0   | 累计消耗                                      |
| version        | INT NOT NULL DEFAULT 0             | 乐观锁版本号；每次余额变动 +1，防并发丢失更新 |
| updated_at     | TIMESTAMPTZ NOT NULL               | 最近余额变动时间                              |

> 余额变动的审计流水在 `tenant_transaction` 账本，此表只存当前快照。UPDATE 时必须携带 `WHERE version = $known_version`。

---

**`tenant_billing_address`** 🆕 — 开票抬头信息

| 字段         | 类型                           | 说明                   |
| ------------ | ------------------------------ | ---------------------- |
| id           | UUID NOT NULL                  | PK                     |
| tenant_id    | UUID NOT NULL                  | FK → tenant            |
| invoice_type | VARCHAR(32) NOT NULL           | `personal` / `company` |
| title        | VARCHAR(256) NOT NULL          | 发票抬头               |
| tax_no       | VARCHAR(64) NULL               | 企业税号               |
| phone        | VARCHAR(64) NULL               | 联系电话（专用发票）   |
| address      | VARCHAR(512) NULL              | 注册地址（专用发票）   |
| bank_name    | VARCHAR(256) NULL              | 开户行（专用发票）     |
| bank_account | VARCHAR(256) NULL              | 银行账号（专用发票）   |
| is_default   | BOOLEAN NOT NULL DEFAULT false |                        |
| created_at   | TIMESTAMPTZ NOT NULL           |                        |
| updated_at   | TIMESTAMPTZ NOT NULL           |                        |
| deleted_at   | TIMESTAMPTZ NULL               |                        |

---

**`tenant_payment_method`** 🆕 — 绑定支付方式

| 字段         | 类型                                  | 说明                                  |
| ------------ | ------------------------------------- | ------------------------------------- |
| id           | UUID NOT NULL                         | PK                                    |
| tenant_id    | UUID NOT NULL                         | FK → tenant                           |
| method_type  | VARCHAR(32) NOT NULL                  | `alipay` / `wechat` / `bank_transfer` |
| status       | VARCHAR(32) NOT NULL DEFAULT 'active' | `active` / `expired` / `removed`      |
| display_name | VARCHAR(128) NOT NULL                 | 如 "支付宝 138\*\*\*\*1234"           |
| external_id  | VARCHAR(256) NULL                     | 第三方侧绑定 ID（加密存储）           |
| is_default   | BOOLEAN NOT NULL DEFAULT false        |                                       |
| last_used_at | TIMESTAMPTZ NULL                      | 最近一次使用时间；UI 排序参考         |
| created_at   | TIMESTAMPTZ NOT NULL                  |                                       |
| updated_at   | TIMESTAMPTZ NOT NULL                  |                                       |
| deleted_at   | TIMESTAMPTZ NULL                      |                                       |

---

## 6. `model` Schema（当前：`ai_gateway` schema 中的前 4 张表）

**职责：** AI 模型的平台级注册、授权和计费策略管理。AI Gateway 运行时的配置来源。

> **迁移动作**：从 `services/ai/gateway/prisma/schema.prisma` 的 `ai_gateway` schema 提取 4 张表，迁入 Platform DB 新建的 `model` schema，归入 `packages/core/database/prisma/schema.prisma` 管理。gateway Prisma 仅保留 `routing`、`key`、`reqlog` 相关内容。

### 表清单

| 表名               | 当前表名             | 当前 schema  | 状态                              |
| ------------------ | -------------------- | ------------ | --------------------------------- |
| `provider`         | `ai_provider`        | `ai_gateway` | 📦 迁入，补 logo/description      |
| `model`            | `ai_model`           | `ai_gateway` | 📦 迁入，补 model_type / 规格字段 |
| `model_grant`      | `ai_model_grant`     | `ai_gateway` | 📦 迁入                           |
| `model_price_rule` | `ai_model_cost_rate` | `ai_gateway` | 📦 迁入，表名语义化               |
| `model_policy`     | ——（不存在）         | ——           | 🆕                                |

---

**`provider`** 📦 — 模型服务商（原 `ai_provider`，补 logo / description）

| 字段          | 类型                                  | 说明                                           |
| ------------- | ------------------------------------- | ---------------------------------------------- |
| id            | UUID NOT NULL                         | PK                                             |
| provider_code | VARCHAR(64) NOT NULL                  | 全局唯一，如 `openai` / `anthropic` / `aliyun` |
| provider_type | VARCHAR(32) NOT NULL DEFAULT 'online' | `online` / `self_hosted`                       |
| provider_name | VARCHAR(128) NOT NULL                 | 显示名                                         |
| description   | VARCHAR(512) NULL                     | 服务商简介                                     |
| logo_url      | TEXT NULL                             | 服务商 Logo，用于 admin UI 展示                |
| homepage_url  | TEXT NULL                             |                                                |
| console_url   | TEXT NULL                             | 服务商控制台地址                               |
| billing_url   | TEXT NULL                             | 服务商账单地址                                 |
| is_active     | BOOLEAN NOT NULL DEFAULT true         |                                                |
| config        | JSONB NULL                            | 额外配置（超时 / 重试策略等）                  |
| created_by    | UUID NULL                             |                                                |
| updated_by    | UUID NULL                             |                                                |
| created_at    | TIMESTAMPTZ NOT NULL                  |                                                |
| updated_at    | TIMESTAMPTZ NOT NULL                  |                                                |
| deleted_at    | TIMESTAMPTZ NULL                      |                                                |

---

**`model`** 📦 — 模型定义（原 `ai_model`，补 model_type / 规格字段）

| 字段               | 类型                                | 说明                                                 |
| ------------------ | ----------------------------------- | ---------------------------------------------------- |
| id                 | UUID NOT NULL                       | PK                                                   |
| provider_id        | UUID NULL                           | FK → provider                                        |
| model_code         | VARCHAR(128) NOT NULL               | 全局唯一，如 `openai/gpt-4o`                         |
| provider           | VARCHAR(64) NOT NULL                | 冗余存储 provider_code，加速 Gateway 查询            |
| model_type         | VARCHAR(32) NOT NULL DEFAULT 'chat' | `chat` / `embedding` / `image` / `audio` / `rerank`  |
| protocol           | VARCHAR(64) NOT NULL                | `openai` / `anthropic` / `custom`                    |
| model_name         | VARCHAR(128) NOT NULL               | 显示名                                               |
| description        | VARCHAR(512) NULL                   | 模型功能简介                                         |
| endpoint_url       | TEXT NOT NULL                       | 推理端点                                             |
| context_window     | INT NULL                            | 最大上下文 tokens；用于 UI 展示和请求校验            |
| max_output_tokens  | INT NULL                            | 单次响应最大 tokens                                  |
| capabilities       | VARCHAR[] NOT NULL DEFAULT '{}'     | `chat` / `embedding` / `vision` / `function_call` 等 |
| supports_streaming | BOOLEAN NOT NULL DEFAULT true       | 是否支持流式输出                                     |
| is_active          | BOOLEAN NOT NULL DEFAULT true       |                                                      |
| sort               | INT NOT NULL DEFAULT 999            | 在 UI 模型选择器中的排序                             |
| config             | JSONB NULL                          | 额外参数（temperature 上限 / 上下文窗口等）          |
| created_by         | UUID NULL                           |                                                      |
| updated_by         | UUID NULL                           |                                                      |
| created_at         | TIMESTAMPTZ NOT NULL                |                                                      |
| updated_at         | TIMESTAMPTZ NOT NULL                |                                                      |
| deleted_at         | TIMESTAMPTZ NULL                    |                                                      |

> 移除 `api_key_env_var`：API Key 的存储和读取完全归 AI Gateway DB 的 `key` schema 管理，Platform DB 不触碰 Key。

---

**`model_grant`** 📦 — 租户模型访问授权（原 `ai_model_grant`）

| 字段       | 类型                          | 说明                                             |
| ---------- | ----------------------------- | ------------------------------------------------ |
| id         | UUID NOT NULL                 | PK                                               |
| model_id   | UUID NOT NULL                 | FK → model                                       |
| tenant_id  | UUID NOT NULL                 |                                                  |
| agent_id   | UUID NULL                     | NULL 表示租户全局授权；有值表示仅特定 Agent 可用 |
| priority   | INT NOT NULL DEFAULT 100      | 多授权冲突时的优先级（值小=优先）                |
| is_active  | BOOLEAN NOT NULL DEFAULT true |                                                  |
| reason     | VARCHAR(512) NULL             | 授权原因备注                                     |
| expires_at | TIMESTAMPTZ NULL              | NULL 表示永久有效                                |
| created_by | UUID NULL                     |                                                  |
| updated_by | UUID NULL                     |                                                  |
| created_at | TIMESTAMPTZ NOT NULL          |                                                  |
| updated_at | TIMESTAMPTZ NOT NULL          |                                                  |
| deleted_at | TIMESTAMPTZ NULL              |                                                  |

---

**`model_price_rule`** 📦 — 模型计费规则（原 `ai_model_cost_rate`）

| 字段               | 类型                                 | 说明                              |
| ------------------ | ------------------------------------ | --------------------------------- |
| id                 | UUID NOT NULL                        | PK                                |
| model_id           | UUID NOT NULL                        | FK → model                        |
| billing_mode       | VARCHAR(32) NOT NULL DEFAULT 'token' | `token` / `request` / `character` |
| currency           | VARCHAR(16) NOT NULL DEFAULT 'CNY'   |                                   |
| unit_tokens        | INT NOT NULL DEFAULT 1000000         | 计价单位（每 N tokens）           |
| input_unit_price   | DECIMAL(18,8) NOT NULL DEFAULT 0     | 输入 token 单价                   |
| output_unit_price  | DECIMAL(18,8) NOT NULL DEFAULT 0     | 输出 token 单价                   |
| request_unit_price | DECIMAL(18,8) NOT NULL DEFAULT 0     | 按请求计费时的单价                |
| is_active          | BOOLEAN NOT NULL DEFAULT true        |                                   |
| effective_at       | TIMESTAMPTZ NOT NULL                 | 价格生效时间                      |
| expires_at         | TIMESTAMPTZ NULL                     | NULL 表示持续有效                 |
| created_by         | UUID NULL                            |                                   |
| updated_by         | UUID NULL                            |                                   |
| created_at         | TIMESTAMPTZ NOT NULL                 |                                   |
| updated_at         | TIMESTAMPTZ NOT NULL                 |                                   |

---

**`model_policy`** 🆕 — 模型访问速率与并发策略

| 字段               | 类型                          | 说明                                    |
| ------------------ | ----------------------------- | --------------------------------------- |
| id                 | UUID NOT NULL                 | PK                                      |
| model_id           | UUID NOT NULL                 | FK → model；UNIQUE(model_id, tenant_id) |
| tenant_id          | UUID NULL                     | NULL 表示全局默认策略；有值覆盖全局     |
| name               | VARCHAR(128) NULL             | 策略名称，便于 admin 识别               |
| priority           | INT NOT NULL DEFAULT 100      | 多策略匹配时的优先级（值小=优先）       |
| max_concurrent     | INT NULL                      | 最大并发请求数                          |
| rate_limit_rpm     | INT NULL                      | 每分钟最大请求次数                      |
| rate_limit_tpm     | BIGINT NULL                   | 每分钟最大 token 消耗量                 |
| rate_limit_tpd     | BIGINT NULL                   | 每日最大 token 消耗量；NULL 表示不限    |
| max_context_tokens | INT NULL                      | 单次请求最大 context window             |
| is_active          | BOOLEAN NOT NULL DEFAULT true |                                         |
| effective_at       | TIMESTAMPTZ NOT NULL          |                                         |
| expires_at         | TIMESTAMPTZ NULL              |                                         |
| created_by         | UUID NULL                     |                                         |
| updated_by         | UUID NULL                     |                                         |
| created_at         | TIMESTAMPTZ NOT NULL          |                                         |
| updated_at         | TIMESTAMPTZ NOT NULL          |                                         |

---

## 7. `ops` Schema（当前：`platform`）

**职责：** 平台运营账号体系、全局配置、功能开关、平台治理记录。

> **迁移动作**：schema 重命名 `platform` → `ops`；5 张表去除 `platform_` 前缀（仅重命名，字段保留）。

### 表清单

| 表名                | 当前表名                   | 状态                                                 |
| ------------------- | -------------------------- | ---------------------------------------------------- |
| `admin`             | `platform_admin`           | ✏️ 去前缀；合并冗余 status 字段；补安全字段          |
| `role`              | `platform_role`            | ✏️ 去前缀；合并冗余 status 字段                      |
| `permission`        | `platform_permission`      | ✏️ 去前缀；补 is_visible                             |
| `role_permission`   | `platform_role_permission` | ✏️ 去前缀；清理冗余 updated_by/updated_at            |
| `setting`           | `platform_config`          | ✏️ 去前缀并语义化；补 is_encrypted / validation_rule |
| `governance_record` | `governance_record`        | ✅                                                   |
| `feature_flag`      | ——（不存在）               | 🆕                                                   |
| `announcement`      | ——（不存在）               | 🆕                                                   |
| `maintenance`       | ——（不存在）               | 🆕                                                   |

---

**`admin`** ✏️ — 运营人员账号（原 `platform_admin`；合并 status 冗余；补 MFA / 锁定字段）

| 字段                | 类型                                  | 说明                                                                              |
| ------------------- | ------------------------------------- | --------------------------------------------------------------------------------- |
| id                  | UUID NOT NULL                         | PK                                                                                |
| role_id             | UUID NOT NULL                         | FK → role                                                                         |
| username            | VARCHAR(64) NOT NULL                  | 全局唯一                                                                          |
| status              | VARCHAR(32) NOT NULL DEFAULT 'active' | `active` / `suspended` / `locked`；原 status(BOOLEAN) 与 status_code 合并为此字段 |
| email               | VARCHAR(128) NULL                     | 全局唯一                                                                          |
| phone               | VARCHAR(32) NULL                      | 全局唯一                                                                          |
| display_name        | VARCHAR(50) NOT NULL DEFAULT ''       |                                                                                   |
| password_hash       | VARCHAR(255) NOT NULL                 |                                                                                   |
| login_failure_count | INT NOT NULL DEFAULT 0                | 连续失败次数；成功后重置                                                          |
| remark              | VARCHAR(255) NULL                     |                                                                                   |
| last_login_ip       | VARCHAR(64) NULL                      |                                                                                   |
| is_system           | BOOLEAN NOT NULL DEFAULT false        | 内置超管，不可删除                                                                |
| mfa_enabled         | BOOLEAN NOT NULL DEFAULT false        | 是否启用 TOTP 多因素认证                                                          |
| locked_until        | TIMESTAMPTZ NULL                      | 账号锁定到期时间                                                                  |
| password_changed_at | TIMESTAMPTZ NULL                      | 最近密码修改时间；合规要求定期改密                                                |
| last_login_at       | TIMESTAMPTZ NULL                      |                                                                                   |
| sort                | INT NOT NULL DEFAULT 999              |                                                                                   |
| created_by          | UUID NULL                             |                                                                                   |
| updated_by          | UUID NULL                             |                                                                                   |
| created_at          | TIMESTAMPTZ NOT NULL                  |                                                                                   |
| updated_at          | TIMESTAMPTZ NOT NULL                  |                                                                                   |
| deleted_at          | TIMESTAMPTZ NULL                      |                                                                                   |

> 原有两个 `status` 字段（BOOLEAN + VARCHAR）合并为单一 `status VARCHAR(32)`。

---

**`role`** ✏️ — 运营角色（原 `platform_role`；合并 status 冗余）

| 字段                 | 类型                                  | 说明                                                          |
| -------------------- | ------------------------------------- | ------------------------------------------------------------- |
| id                   | UUID NOT NULL                         | PK                                                            |
| role_code            | VARCHAR(64) NOT NULL                  | 全局唯一                                                      |
| status               | VARCHAR(32) NOT NULL DEFAULT 'active' | `active` / `inactive`；原 status(BOOLEAN) 与 status_code 合并 |
| name_en              | VARCHAR(128) NOT NULL                 | 英文名                                                        |
| name_i18n_key        | VARCHAR(128) NOT NULL                 | i18n key                                                      |
| description          | VARCHAR(255) NOT NULL DEFAULT ''      |                                                               |
| description_i18n_key | VARCHAR(128) NULL                     |                                                               |
| is_system            | BOOLEAN NOT NULL DEFAULT false        | 内置角色，不可删除                                            |
| sort                 | INT NOT NULL DEFAULT 999              |                                                               |
| created_by           | UUID NULL                             |                                                               |
| updated_by           | UUID NULL                             |                                                               |
| created_at           | TIMESTAMPTZ NOT NULL                  |                                                               |
| updated_at           | TIMESTAMPTZ NOT NULL                  |                                                               |

---

**`permission`** ✏️ — 运营权限项（原 `platform_permission`，补 is_visible）

| 字段        | 类型                             | 说明                                        |
| ----------- | -------------------------------- | ------------------------------------------- |
| id          | UUID NOT NULL                    | PK                                          |
| parent_id   | UUID NULL                        | FK → permission（自引用树结构）             |
| perm_code   | VARCHAR(64) NOT NULL             | 全局唯一                                    |
| perm_type   | VARCHAR(20) NOT NULL             | `menu` / `button` / `api`                   |
| perm_name   | VARCHAR(64) NOT NULL             |                                             |
| route_path  | VARCHAR(255) NULL                | 前端路由路径（menu 类型用）                 |
| component   | VARCHAR(255) NULL                | 前端组件路径                                |
| icon        | VARCHAR(64) NULL                 |                                             |
| description | VARCHAR(255) NOT NULL DEFAULT '' |                                             |
| is_active   | BOOLEAN NOT NULL DEFAULT true    |                                             |
| is_visible  | BOOLEAN NOT NULL DEFAULT true    | false 表示 API 级权限，不在菜单树 UI 中展示 |
| sort        | INT NOT NULL DEFAULT 999         |                                             |
| created_by  | UUID NOT NULL                    |                                             |
| updated_by  | UUID NOT NULL                    |                                             |
| created_at  | TIMESTAMPTZ NOT NULL             |                                             |
| updated_at  | TIMESTAMPTZ NOT NULL             |                                             |

---

**`role_permission`** ✏️ — 运营角色权限关联（原 `platform_role_permission`，复合 PK，清理冗余字段）

| 字段          | 类型                 | 说明                     |
| ------------- | -------------------- | ------------------------ |
| role_id       | UUID NOT NULL        | FK → role；复合 PK       |
| permission_id | UUID NOT NULL        | FK → permission；复合 PK |
| created_by    | UUID NOT NULL        |                          |
| created_at    | TIMESTAMPTZ NOT NULL |                          |

> 移除原有 `updated_by` / `updated_at`：关联表是点对点绑定，无更新语义，只有增删。

---

**`setting`** ✏️ — 全局平台配置（原 `platform_config`，补 is_encrypted / validation_rule）

| 字段            | 类型                                  | 说明                                      |
| --------------- | ------------------------------------- | ----------------------------------------- |
| id              | UUID NOT NULL                         | PK                                        |
| config_group    | VARCHAR(64) NOT NULL                  | 分组，如 `email` / `security` / `payment` |
| config_key      | VARCHAR(128) NOT NULL                 | 全局唯一                                  |
| value_type      | VARCHAR(20) NOT NULL DEFAULT 'string' | `string` / `number` / `boolean` / `json`  |
| config_value    | TEXT NOT NULL                         |                                           |
| is_sensitive    | BOOLEAN NOT NULL DEFAULT false        | 敏感值（读接口脱敏）                      |
| is_encrypted    | BOOLEAN NOT NULL DEFAULT false        | 落库时是否 AES 加密存储                   |
| is_readonly     | BOOLEAN NOT NULL DEFAULT false        | 系统内置配置，不可从 UI 修改              |
| validation_rule | VARCHAR(512) NULL                     | 值校验规则（正则 或 JSON Schema 片段）    |
| description     | TEXT NULL                             |                                           |
| created_by      | UUID NULL                             |                                           |
| updated_by      | UUID NULL                             |                                           |
| created_at      | TIMESTAMPTZ NOT NULL                  |                                           |
| updated_at      | TIMESTAMPTZ NOT NULL                  |                                           |

---

**`governance_record`** ✅ — 平台治理记录（字段顺序已合理，无需变更）

用 `kind` 字段区分记录类型：`risk`（租户风险评估）/ `compliance`（合规事件）/ `policy`（策略变更）等。

---

**`feature_flag`** 🆕 — 功能开关（按租户 / 按环境灰度）

| 字段                | 类型                                   | 说明                                             |
| ------------------- | -------------------------------------- | ------------------------------------------------ |
| id                  | UUID NOT NULL                          | PK                                               |
| flag_key            | VARCHAR(128) NOT NULL                  | 全局唯一键名，如 `feature.new_editor`            |
| category            | VARCHAR(64) NOT NULL DEFAULT 'release' | `release` / `experiment` / `ops` / `kill_switch` |
| environment         | VARCHAR(32) NOT NULL DEFAULT 'all'     | `all` / `beta` / `prod`                          |
| description         | VARCHAR(512) NULL                      |                                                  |
| is_globally_enabled | BOOLEAN NOT NULL DEFAULT false         | 全局默认值                                       |
| is_archived         | BOOLEAN NOT NULL DEFAULT false         | 已永久决策的开关；标记后可清理代码               |
| rollout_percentage  | INT NOT NULL DEFAULT 0                 | 百分比灰度（0–100），0 表示不灰度                |
| tenant_overrides    | JSONB NOT NULL DEFAULT '{}'            | `{ "<tenant_id>": true/false }` 租户级覆盖       |
| expires_at          | TIMESTAMPTZ NULL                       | 临时开关；到期后自动视为 false                   |
| created_by          | UUID NULL                              |                                                  |
| updated_by          | UUID NULL                              |                                                  |
| created_at          | TIMESTAMPTZ NOT NULL                   |                                                  |
| updated_at          | TIMESTAMPTZ NOT NULL                   |                                                  |

---

**`announcement`** 🆕 — 系统公告

| 字段                | 类型                                 | 说明                                               |
| ------------------- | ------------------------------------ | -------------------------------------------------- |
| id                  | UUID NOT NULL                        | PK                                                 |
| announcement_type   | VARCHAR(32) NOT NULL                 | `maintenance` / `feature` / `security` / `billing` |
| severity            | VARCHAR(16) NOT NULL DEFAULT 'info'  | `info` / `warning` / `critical`                    |
| status              | VARCHAR(32) NOT NULL DEFAULT 'draft' | `draft` / `published` / `revoked`；草稿不对外展示  |
| lang                | VARCHAR(16) NOT NULL DEFAULT 'zh-CN' | 公告内容语言；多语言版本独立行存储                 |
| title               | VARCHAR(256) NOT NULL                |                                                    |
| content             | TEXT NOT NULL                        | Markdown 正文                                      |
| cta_label           | VARCHAR(64) NULL                     | 行动号召按钮文案，如 "查看详情"                    |
| cta_url             | VARCHAR(512) NULL                    | 行动号召链接                                       |
| target_plans        | VARCHAR(64)[] NOT NULL DEFAULT '{}'  | 空数组 = 所有套餐                                  |
| target_tenant_types | VARCHAR(32)[] NOT NULL DEFAULT '{}'  | 空数组 = 所有租户类型                              |
| is_dismissible      | BOOLEAN NOT NULL DEFAULT true        | 用户可手动关闭                                     |
| publish_at          | TIMESTAMPTZ NOT NULL                 | 发布时间（可预排）                                 |
| expires_at          | TIMESTAMPTZ NULL                     | 公告到期自动下线                                   |
| meta                | JSONB NULL                           | 额外触达条件或展示配置（如自定义图标等）           |
| created_by          | UUID NOT NULL                        |                                                    |
| created_at          | TIMESTAMPTZ NOT NULL                 |                                                    |
| updated_at          | TIMESTAMPTZ NOT NULL                 |                                                    |
| deleted_at          | TIMESTAMPTZ NULL                     |                                                    |

---

**`maintenance`** 🆕 — 维护窗口

| 字段               | 类型                                     | 说明                                                    |
| ------------------ | ---------------------------------------- | ------------------------------------------------------- |
| id                 | UUID NOT NULL                            | PK                                                      |
| severity           | VARCHAR(16) NOT NULL DEFAULT 'minor'     | `minor` / `major` / `critical`                          |
| status             | VARCHAR(32) NOT NULL DEFAULT 'scheduled' | `scheduled` / `in_progress` / `completed` / `cancelled` |
| title              | VARCHAR(256) NOT NULL                    |                                                         |
| description        | TEXT NULL                                | 维护内容说明                                            |
| impact_description | TEXT NULL                                | 对用户的影响说明，面向用户端展示                        |
| affected_services  | VARCHAR(64)[] NOT NULL DEFAULT '{}'      | 受影响服务列表                                          |
| start_at           | TIMESTAMPTZ NOT NULL                     | 计划开始时间                                            |
| end_at             | TIMESTAMPTZ NOT NULL                     | 计划结束时间                                            |
| actual_end_at      | TIMESTAMPTZ NULL                         | 实际结束时间                                            |
| created_by         | UUID NOT NULL                            |                                                         |
| updated_by         | UUID NULL                                |                                                         |
| created_at         | TIMESTAMPTZ NOT NULL                     |                                                         |
| updated_at         | TIMESTAMPTZ NOT NULL                     |                                                         |

---

## 8. `support` Schema

**职责：** 用户支持工单、操作审计、通知发送流水。

### 表清单

| 表名               | 当前表名       | 状态                                        |
| ------------------ | -------------- | ------------------------------------------- |
| `ticket`           | `ticket`       | ✏️ 补 account_id / assignee_id / SLA / CSAT |
| `ticket_event`     | `ticket_event` | ✏️ 补 actor_type，append-only               |
| `audit_log`        | ——（不存在）   | 🆕 append-only，按月分区                    |
| `notification_log` | ——（不存在）   | 🆕 append-only                              |

---

**`ticket`** ✏️ — 支持工单

| 字段                 | 类型                                   | 说明                                               |
| -------------------- | -------------------------------------- | -------------------------------------------------- |
| id                   | UUID NOT NULL                          | PK                                                 |
| tenant_id            | UUID NOT NULL                          | FK → tenant                                        |
| account_id           | UUID NULL                              | 提交工单的租户用户 account_id；NULL 表示系统或匿名 |
| ticket_no            | VARCHAR(64) NOT NULL                   | 全局唯一工单号                                     |
| category             | VARCHAR(64) NOT NULL DEFAULT 'general' | `general` / `billing` / `technical` / `account`    |
| priority             | VARCHAR(16) NOT NULL DEFAULT 'p2'      | `p0` / `p1` / `p2` / `p3`                          |
| source               | VARCHAR(64) NOT NULL DEFAULT 'console' | `console` / `admin` / `api`                        |
| status               | VARCHAR(32) NOT NULL DEFAULT 'open'    | `open` / `in_progress` / `resolved` / `closed`     |
| title                | VARCHAR(200) NOT NULL                  |                                                    |
| description          | TEXT NOT NULL DEFAULT ''               |                                                    |
| reporter_name        | VARCHAR(100) NULL                      | 冗余存储，快速展示无需 JOIN                        |
| assignee_id          | UUID NULL                              | 负责处理的运营人员 ops.admin.id                    |
| assignee_name        | VARCHAR(100) NULL                      | 冗余存储                                           |
| tags                 | VARCHAR(64)[] NOT NULL DEFAULT '{}'    | 标签，用于筛选和分类                               |
| satisfaction_score   | INT NULL                               | 用户满意度评分 1–5；resolved 后可提交              |
| satisfaction_comment | VARCHAR(512) NULL                      | 满意度评论                                         |
| sla_breach_at        | TIMESTAMPTZ NULL                       | SLA 截止时间（按 category+priority 计算写入）      |
| first_response_at    | TIMESTAMPTZ NULL                       | 首次人工回复时间；SLA 考核指标                     |
| due_at               | TIMESTAMPTZ NULL                       | 人工设置的期望完成时间                             |
| resolved_at          | TIMESTAMPTZ NULL                       |                                                    |
| closed_at            | TIMESTAMPTZ NULL                       |                                                    |
| created_at           | TIMESTAMPTZ NOT NULL                   |                                                    |
| updated_at           | TIMESTAMPTZ NOT NULL                   |                                                    |
| deleted_at           | TIMESTAMPTZ NULL                       |                                                    |

---

**`ticket_event`** ✏️ — 工单事件流水（补 actor_type，append-only）

| 字段       | 类型                        | 说明                                                                 |
| ---------- | --------------------------- | -------------------------------------------------------------------- |
| id         | UUID NOT NULL               | PK                                                                   |
| ticket_id  | UUID NOT NULL               | FK → ticket，级联删除                                                |
| event_type | VARCHAR(64) NOT NULL        | `created` / `assigned` / `commented` / `status_changed` / `resolved` |
| actor_type | VARCHAR(32) NOT NULL        | `admin` / `tenant_user` / `system`；区分操作人类型                   |
| actor_id   | UUID NULL                   | 操作人；NULL 表示系统自动                                            |
| actor_name | VARCHAR(100) NOT NULL       | 冗余存储快速展示                                                     |
| payload    | JSONB NOT NULL DEFAULT '{}' | 事件详情（如状态变更前后值）                                         |
| created_at | TIMESTAMPTZ NOT NULL        |                                                                      |

---

**`audit_log`** 🆕 — 操作审计（append-only，按月 RANGE 分区）

| 字段          | 类型                                   | 说明                                   |
| ------------- | -------------------------------------- | -------------------------------------- |
| id            | UUID NOT NULL                          | PK（含分区键）                         |
| actor_type    | VARCHAR(32) NOT NULL                   | `admin` / `tenant_user` / `system`     |
| actor_id      | UUID NOT NULL                          | 操作人 account_id                      |
| tenant_id     | UUID NULL                              | 租户侧操作时携带；平台侧操作为 NULL    |
| action        | VARCHAR(128) NOT NULL                  | 操作码，如 `tenant.member.invite`      |
| result        | VARCHAR(32) NOT NULL DEFAULT 'success' | `success` / `failure` / `blocked`      |
| resource_type | VARCHAR(64) NOT NULL                   | 操作对象类型，如 `tenant_member`       |
| resource_id   | VARCHAR(128) NOT NULL                  | 操作对象 ID                            |
| error_code    | VARCHAR(64) NULL                       | result = failure 时的错误码            |
| before        | JSONB NULL                             | 变更前快照                             |
| after         | JSONB NULL                             | 变更后快照                             |
| request_id    | VARCHAR(128) NULL                      | HTTP 请求 trace ID，用于跨服务日志关联 |
| duration_ms   | INT NULL                               | 操作耗时（毫秒）                       |
| ip_address    | VARCHAR(64) NULL                       |                                        |
| user_agent    | VARCHAR(512) NULL                      |                                        |
| created_at    | TIMESTAMPTZ NOT NULL                   | 分区键，按月 RANGE 分区                |

> 保留期 ≥ 2 年。DB RULE 阻止 UPDATE / DELETE。按月分区控制单区体积。

---

**`notification_log`** 🆕 — 通知发送流水（append-only）

| 字段                | 类型                   | 说明                                                                   |
| ------------------- | ---------------------- | ---------------------------------------------------------------------- |
| id                  | UUID NOT NULL          | PK                                                                     |
| tenant_id           | UUID NULL              | 租户触发的通知                                                         |
| account_id          | UUID NULL              | 接收通知的账号                                                         |
| channel             | VARCHAR(32) NOT NULL   | `email` / `sms`                                                        |
| template_code       | VARCHAR(64) NOT NULL   | 通知模板编码                                                           |
| status              | VARCHAR(32) NOT NULL   | `sent` / `failed` / `bounced` / `delivered`                            |
| reference_type      | VARCHAR(64) NULL       | 触发来源类型：`subscription` / `invitation` / `alert` / `verification` |
| reference_id        | VARCHAR(128) NULL      | 触发来源实体 ID，用于溯源                                              |
| recipient           | VARCHAR(256) NOT NULL  | 邮箱或手机号（脱敏后存储）                                             |
| subject             | VARCHAR(256) NULL      | 邮件主题                                                               |
| provider            | VARCHAR(64) NULL       | 发送服务商，如 `aliyun_sms` / `sendgrid`                               |
| provider_message_id | VARCHAR(256) NULL      | 第三方消息 ID，用于对账                                                |
| error_message       | TEXT NULL              | 失败原因                                                               |
| retry_count         | INT NOT NULL DEFAULT 0 | 累计重试次数                                                           |
| delivered_at        | TIMESTAMPTZ NULL       | 确认送达时间（email delivery receipt）                                 |
| opened_at           | TIMESTAMPTZ NULL       | 邮件首次打开时间（Open Tracking）                                      |
| created_at          | TIMESTAMPTZ NOT NULL   |                                                                        |

---

## 9. 迁移行动清单

> 评审确认后按顺序执行，每步独立可回滚，不跨步骤合并。
>
> **字段变更策略**：涉及结构重建的表（schema 迁入 / 字段新增大于 3 个）使用 `CREATE TABLE + INSERT + DROP + RENAME` 完整重建，一步到位保证列顺序正确。简单改名类操作使用 `ALTER TABLE`。

### Step 1 — Schema 重命名

```sql
ALTER SCHEMA account  RENAME TO identity;
ALTER SCHEMA tenancy  RENAME TO tenant;
ALTER SCHEMA platform RENAME TO ops;
```

### Step 2 — 建立 `iam` schema，迁入并重命名表

```sql
CREATE SCHEMA iam;
ALTER TABLE tenant.tenant_role            SET SCHEMA iam;  ALTER TABLE iam.tenant_role            RENAME TO role;
ALTER TABLE tenant.tenant_permission      SET SCHEMA iam;  ALTER TABLE iam.tenant_permission      RENAME TO permission;
ALTER TABLE tenant.tenant_role_permission SET SCHEMA iam;  ALTER TABLE iam.tenant_role_permission RENAME TO role_permission;
```

### Step 3 — 建立 `model` schema，迁入并重命名表

```sql
CREATE SCHEMA model;
ALTER TABLE ai_gateway.ai_provider        SET SCHEMA model;  ALTER TABLE model.ai_provider        RENAME TO provider;
ALTER TABLE ai_gateway.ai_model           SET SCHEMA model;  ALTER TABLE model.ai_model           RENAME TO model;
ALTER TABLE ai_gateway.ai_model_grant     SET SCHEMA model;  ALTER TABLE model.ai_model_grant     RENAME TO model_grant;
ALTER TABLE ai_gateway.ai_model_cost_rate SET SCHEMA model;  ALTER TABLE model.ai_model_cost_rate RENAME TO model_price_rule;
```

### Step 4 — `ops` 表名去前缀

```sql
ALTER TABLE ops.platform_admin           RENAME TO admin;
ALTER TABLE ops.platform_role            RENAME TO role;
ALTER TABLE ops.platform_permission      RENAME TO permission;
ALTER TABLE ops.platform_role_permission RENAME TO role_permission;
ALTER TABLE ops.platform_config          RENAME TO setting;
```

### Step 5 — 表重建（字段结构变更）

重建范围：字段新增或删除超过 2 个的表采用 CREATE + INSERT + DROP + RENAME 模式，确保最终列顺序与目标态完全一致。

**重建表清单（按 schema 顺序）：**

| Schema     | 表                   | 重建原因                                                    |
| ---------- | -------------------- | ----------------------------------------------------------- |
| `identity` | `account`            | 新增 7 个字段，status 类型变更，password_hash 删除          |
| `identity` | `account_credential` | 全新表（从 account 拆出），新增 MFA 字段                    |
| `identity` | `account_profile`    | 新增 country_code                                           |
| `identity` | `oauth_state`        | 新增 3 个字段（PKCE/OIDC/IP）                               |
| `tenant`   | `tenant`             | 新增 5 个 PLG 字段                                          |
| `tenant`   | `tenant_member`      | 删除 role_id，新增 invited_by                               |
| `iam`      | `permission`         | 删除 tenant_id / permission_scope，新增 module / is_visible |
| `model`    | `provider`           | 新增 logo_url / description                                 |
| `model`    | `model`              | 新增 6 个字段，删除 api_key_env_var                         |
| `ops`      | `admin`              | 合并 status BOOLEAN，新增 4 个安全字段                      |
| `ops`      | `role`               | 合并 status BOOLEAN                                         |
| `ops`      | `role_permission`    | 删除 updated_by / updated_at                                |
| `ops`      | `setting`            | 新增 is_encrypted / validation_rule                         |
| `support`  | `ticket`             | 新增 7 个字段                                               |
| `support`  | `ticket_event`       | 新增 actor_type                                             |

**轻量 ALTER（不影响列顺序的追加）：**

```sql
-- iam.capability：全新表，直接 CREATE
-- iam.plan_capability：全新表，直接 CREATE（补 limit_override 字段）
-- model.model_policy：全新表，直接 CREATE
-- commerce.tenant_credit：全新表，直接 CREATE
```

### Step 6 — 新建表

按各 schema 顺序创建（含索引和约束）：

- `identity`：`account_session`、`account_verification`、`login_attempt`
- `tenant`：`tenant_invitation`
- `iam`：`member_role_binding`、`capability`、`plan_capability`
- `model`：`model_policy`
- `commerce`：`tenant_credit`、`tenant_billing_address`、`tenant_payment_method`
- `ops`：`feature_flag`、`announcement`、`maintenance`
- `support`：`audit_log`（含月份分区）、`notification_log`

### Step 7 — Prisma Schema 文件同步

- `packages/core/database/prisma/schema.prisma`：`schemas` 列表更新为新 schema 名，所有模型 `@@schema()` 同步
- `services/ai/gateway/prisma/schema.prisma`：移除已迁出的 4 张 model 表，保留 `commerce` 相关

---

_版本：1.3.0 | 2026-05-14_
