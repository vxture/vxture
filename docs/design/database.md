# Vxture 数据库顶层架构设计

> 版本：1.1.0 | 2026-05-15
> 上级文档：[`docs/design/control-plane.md`](control-plane.md)（双平面架构概要）

---

## 1. 设计战略

### 1.1 核心分层原则

Vxture 数据库体系遵循双平面架构，与代码架构严格对应：

```
┌─────────────────────────────────────────────────────────────┐
│               PLATFORM CONTROL PLANE                        │
│               平台控制面（全局唯一，仅 Prod）                  │
│                                                             │
│  单一权威数据源  ·  全局租户 / 订阅 / 配额 / 治理               │
│  支付不能双份  ·  订阅不能双份  ·  账本不可变                   │
└─────────────────────────────────────────────────────────────┘
                           ↕ tenant_id / user_id（引用，不复制）
┌───────────────────────────────────────────────────────────────┐
│               BUSINESS DATA PLANE                             │
│               业务数据面（按产品隔离，Beta + Prod 双轨）         │
│                                                               │
│  Ruyin          Xuanzhen（玄阵）    …（未来产品）               │
│  beta │ prod    beta │ prod           beta │ prod              │
└───────────────────────────────────────────────────────────────┘
```

### 1.2 Beta vs Prod 的核心区分

**Beta 是环境隔离，不是套餐隔离。**

| 维度          | Beta 业务数据库                   | Prod 业务数据库                |
| ------------- | --------------------------------- | ------------------------------ |
| 目标用户      | 公测用户、内部测试、功能验证      | 所有正式用户（含 Free 套餐）   |
| 数据生命周期  | 可自动清理、限期保留、可重置      | 永久保留，受合规约束           |
| 数据迁移方向  | Beta → Prod（转正时迁移业务数据） |                                |
| 配额/订阅来源 | 仍来自 Platform DB（统一配额）    | 仍来自 Platform DB（统一配额） |
| SLA           | 无承诺                            | 承诺                           |

**Free 套餐用户走 Prod**，因为 Free 是正式订阅计划（`plan_code = 'free'`），只是配额受限，不是试用环境。

---

## 2. 数据库拓扑全景

### 2.1 物理数据库实例

```
┌──────────────────────────────────────────────────────────────┐
│  vx-platform-pg                                              │
│  PostgreSQL — worker-01，仅 Prod，强备份                      │
│                                                              │
│  Database: vxturestudio_platform_main                        │
│  ├── schema: identity      账号 / 认证 / 会话                 │
│  ├── schema: tenant        租户 / 成员 / 邀请                 │
│  ├── schema: iam           角色 / 权限 / 能力项               │
│  ├── schema: product       产品目录 / 套餐 / 定价（静态配置）  │
│  ├── schema: commerce      订阅 / 配额 / 用量 / 账单 / 支付   │
│  ├── schema: model         模型注册 / 授权 / 策略             │
│  ├── schema: ops           运营账号 / 治理 / 全局配置         │
│  └── schema: support       工单 / 审计日志 / 通知记录         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  vx-aigateway-pg                                             │
│  PostgreSQL — worker-02，仅 Prod，高写入量分离               │
│                                                              │
│  Database: vxturestudio_aigateway_main                          │
│  ├── schema: routing       模型路由规则 / Provider 配置       │
│  ├── schema: key           API Key 安全存储（加密）           │
│  └── schema: reqlog        请求日志（高频，独立归档策略）      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│  vx-ruyin-beta        │  │  vx-ruyin-prod        │
│  PostgreSQL            │  │  PostgreSQL            │
│  worker-02             │  │  worker-02             │
│                        │  │                        │
│  vxturebiz_ruyin_beta  │  │  vxturebiz_ruyin_prod  │
└──────────────────────┘  └──────────────────────┘

┌────────────────────────────┐  ┌────────────────────────────┐
│  vx-xuanzhen-beta           │  │  vx-xuanzhen-prod           │
│  PostgreSQL                 │  │  PostgreSQL                 │
│  worker-02                  │  │  worker-02                  │
│                             │  │                             │
│  vxturebiz_xuanzhen_beta    │  │  vxturebiz_xuanzhen_prod    │
└────────────────────────────┘  └────────────────────────────┘
```

### 2.2 数据库命名规则

| 类型       | 命名模式                      | 示例                                               |
| ---------- | ----------------------------- | -------------------------------------------------- |
| 平台控制面 | `vxturestudio_platform_main`  | 唯一，固定名                                       |
| AI Gateway | `vxturestudio_aigateway_main` | 唯一，固定名                                       |
| 业务 Beta  | `vxturebiz_{product}_beta`    | `vxturebiz_ruyin_beta` / `vxturebiz_xuanzhen_beta` |
| 业务 Prod  | `vxturebiz_{product}_prod`    | `vxturebiz_ruyin_prod` / `vxturebiz_xuanzhen_prod` |

---

## 3. Platform DB 各 Schema 详述

### 3.1 `identity` — 账号与认证

**职责：** 全平台统一身份来源，与任何具体产品无关。

```
core_tables:
  account              -- 账号（email / phone / 唯一标识）
  account_credential   -- 密码哈希 / OAuth token（不存明文）
  account_session      -- 活跃 JWT session（黑名单机制）
  account_verification -- 手机/邮箱验证码（TTL + 限速）
  sso_connection       -- 第三方登录绑定（DingTalk / 企业微信 / GitHub）
  login_attempt        -- 登录失败记录（IP + 账号维度，限速用）
```

**约束：**

- `account.status`：`active | suspended | deleted`（软删除）
- `account_credential` 与 `account` 1-1，写时加密
- `account_session` 支持黑名单（logout 时写 blacklist，JWT 校验时查）

---

### 3.2 `tenant` — 租户与组织

**职责：** 多租户核心，PLG 模型下的租户生命周期管理。

```
core_tables:
  tenant             -- 租户基本信息（tenantCode / type / status）
  tenant_member      -- 租户成员关系（account → tenant，含角色）
  tenant_invitation  -- 邀请记录（email / phone，含过期时间）
  tenant_setting     -- 租户级配置（KV 形式，如通知偏好、时区）
  tenant_domain      -- 自定义域名绑定（私有化场景）
```

**核心字段设计：**

- `tenant.type`：`individual | organization`
- `tenant.status`：`active | suspended | deleted`
- `tenant_member.role`：`owner | admin | member`（粗粒度，细粒度由 iam 管）
- `tenant_member.environment_access`：`beta | prod | both`（控制成员可访问哪个环境）

---

### 3.3 `iam` — 角色、权限与能力

**职责：** RBAC 权限体系，覆盖租户域和平台域两套权限树。

```
core_tables:
  -- 租户域权限（console 使用）
  tenant_role            -- 租户内自定义角色
  tenant_permission      -- 权限项目录（如 tenant.member.manage）
  tenant_role_permission -- 角色权限关联
  member_role_binding    -- 成员 → 角色绑定

  -- 能力门控（subscription 驱动）
  capability             -- 能力项目录（如 platform.model.manage）
  subscription_capability -- 订阅计划对应的能力集
```

**两套权限域隔离：**

| 域                  | 位置                           | 用途                                     |
| ------------------- | ------------------------------ | ---------------------------------------- |
| 租户域 RBAC         | `iam.tenant_role / permission` | 控制租户成员在 console 内的操作权限      |
| 平台能力 Capability | `iam.capability`               | 控制租户可访问哪些功能（由订阅计划决定） |
| 运营域 RBAC         | `ops.role / ops.permission`    | 控制运营人员在 admin 后台的权限          |

---

### 3.4 `product` — 产品目录（静态配置）

**职责：** 套餐、功能、定价、Agent 目录的权威来源。由运营后台维护，变更极少，可加缓存。

```
core_tables:
  plan           -- 订阅计划（free / starter / pro / enterprise）
  feature        -- 功能特性目录（feature_code / 计量单位）
  plan_feature   -- 计划包含功能 + quota_value + is_unlimited
  plan_price     -- 计划定价（monthly / annual / 币种）
  agent_catalog  -- Agent 目录（vela / ruyin / 行业 agent）
  plan_agent     -- 计划可访问的 Agent
  skill_catalog  -- 技能（工具）目录
  plan_skill     -- 计划可访问的技能
  solution       -- 业务方案（行业解决方案包）
  plan_solution  -- 计划对应的解决方案
  preset         -- 部署预设（SaaS / 私有化变体）
```

**不可变性约束：** `plan` / `feature` 一旦上线不允许删除，只能 `is_active = false`。历史订阅的 quota_value 以 `commerce.tenant_subscription_quota` 快照为准，plan 变更不影响已有订阅。

---

### 3.5 `commerce` — 订阅 / 配额 / 用量 / 账单

**职责：** 租户的商业状态。详细设计见 [`docs/design/commerce.md`](commerce.md)。

```
core_tables:
  tenant_subscription         -- 当前订阅（状态机）
  tenant_subscription_quota   -- 配额快照（plan_feature 静态副本）
  tenant_subscription_override -- 企业定制配额覆盖
  tenant_subscription_history -- 订阅变更历史
  tenant_usage_event          -- 用量原始事件（append-only）
  tenant_usage_summary        -- 用量聚合（实时配额检查读此表）
  tenant_invoice              -- 账单（月结/年结）
  tenant_payment              -- 付款记录
  tenant_refund               -- 退款申请
  tenant_transaction          -- 资金账本（不可变，DB 规则阻止修改）
  tenant_credit               -- 账户余额/赠送额度
  tenant_billing_address      -- 开票信息
  tenant_payment_method       -- 绑定支付方式
```

**用量数据聚合路径：**

```
Business DB 用量事件（本地上报）
        ↓ 异步聚合 Job（每分钟）
commerce.tenant_usage_event（平台 DB，原始流水）
        ↓ 定时聚合（每 5 分钟）
commerce.tenant_usage_summary（平台 DB，实时检查用）
```

> **注意**：AI Gateway 写 `tenant_usage_event` 直接写平台 DB，不经过业务 DB。业务 DB 只存业务侧的会话/任务数据，不存配额数据。

---

### 3.6 `model` — AI 模型注册与授权

**职责：** 全平台 AI 模型的统一注册、授权和访问策略管理。此 schema 是 AI Gateway 的配置来源。

```
core_tables:
  model_provider   -- 模型提供商（OpenAI / Anthropic / 阿里云 / 火山）
  model            -- 模型定义（provider / model_id / 计费规则 / 能力标签）
  model_grant      -- 租户模型访问授权（tenant → model，含配额限制）
  model_policy     -- 模型访问策略（速率限制 / 并发限制 / 时间窗口）
  model_price_rule -- 模型计费规则（per-token 价格，支持历史价格版本）
```

**API Key 管理：** API Key **不**存在此 schema，存在 `vx-aigateway-pg` 的 `key` schema（加密存储，AI Gateway 专用，平台 DB 不接触 Key 明文）。

---

### 3.7 `ops` — 运营账号与平台治理

**职责：** 平台运营侧的账号体系、权限管理和全局配置。与 `identity/tenant` 的租户域完全独立。

> 命名说明：原名 `platform` 与 Platform DB 整体概念重名，改为 `ops`（operations）以消除歧义。schema 内表名不再带 `platform_` 前缀，schema 本身已提供命名空间。

```
core_tables:
  -- 运营账号体系
  admin            -- 运营人员账号
  role             -- 运营角色（超级管理员 / 财务 / 客服等）
  permission       -- 运营权限项
  role_permission  -- 角色权限关联

  -- 平台配置
  setting          -- 全局平台配置（KV + schema 验证）
  feature_flag     -- 功能开关（按租户 / 按环境）
  maintenance      -- 维护窗口声明
  announcement     -- 系统公告（支持按 tenant_type / plan 过滤）

  -- 平台治理
  risk_record      -- 租户风险评估记录（normal / follow_up / high）
  compliance_event -- 合规事件记录
```

---

### 3.8 `support` — 工单与审计

**职责：** 用户支持、操作审计、通知发送记录。

```
core_tables:
  ticket          -- 支持工单（tenant / priority / status）
  ticket_comment  -- 工单评论/回复
  audit_log       -- 操作审计（actor / action / resource / before / after）
  notification_log -- 通知发送记录（邮件/短信，含发送状态）
```

**审计日志约束：** `audit_log` 只追加，不修改，保留期 ≥ 2 年。按月分区（Table Partitioning）控制单表大小。

---

## 4. AI Gateway DB

**容器：** `vx-aigateway-pg`（独立，不与平台 DB 共实例）

**独立原因：** 请求日志写入量极高（每次 AI 调用写一条），与平台 DB 共实例会影响 OLTP 性能。

```
Database: vxturestudio_aigateway_main

schema: routing
  provider_config    -- Provider 连接配置（endpoint / timeout / 重试策略）
  model_route        -- 模型路由规则（model_id → provider + 权重）
  fallback_rule      -- 降级规则（primary fail → fallback provider）

schema: key
  provider_api_key   -- Provider API Key（AES-256 加密，内存解密）
  key_rotation_log   -- Key 轮换记录

schema: reqlog
  request_record     -- 每次 AI 请求完整日志（高频，按月分区）
  error_record       -- 错误/异常记录
```

**与 Platform DB 的关系：**

- AI Gateway 读 `platform.model` 获取模型定义
- AI Gateway 写 `commerce.tenant_usage_event` 到 Platform DB（用量计量权威）
- `reqlog` 是 AI Gateway 内部审计，不同于 `commerce.tenant_usage_event`

---

## 5. 业务 DB 结构

每个业务产品有两个对称的数据库（beta / prod）。结构相同，数据完全隔离。

### 5.1 通用业务 DB 结构

```
Database: vxturebiz_{product}_{env}

schema: context
  -- 与平台的关联（引用 tenant_id / user_id，不复制数据）
  app_instance     -- 应用实例注册（tenant_id / env / status）
  member_context   -- 成员上下文（user_id / display_name 缓存，可失效）

schema: app
  -- 产品特定业务数据（见各产品详述）

schema: agent
  -- AI 交互数据
  conversation     -- 会话（tenant_id / user_id / app_instance_id）
  message          -- 消息（role / content / token_count）
  task             -- AI 任务记录（异步任务、长作业）
  artifact         -- AI 生成物（报告 / 图表 / 文件引用）

schema: local_usage
  -- 业务侧用量上报（待聚合到 Platform DB）
  usage_raw        -- 原始用量（聚合前缓冲，异步 Job 同步到 platform）
  sync_checkpoint  -- 同步水位记录
```

### 5.2 Ruyin (`vxturebiz_ruyin_{env}`)

```
schema: app
  knowledge_base     -- 知识库（tenant_id / name / embedding_model）
  kb_document        -- 知识库文档（file_ref / chunk_count / status）
  kb_chunk           -- 文本分块（content / vector_id / embedding 参考）
  workflow           -- 工作流定义
  workflow_run       -- 工作流执行记录
  assistant_config   -- 助手配置（system prompt / tools / model 偏好）
```

向量数据（embeddings）存储在独立的向量数据库（Qdrant / pgvector）中，`kb_chunk` 只存 vector_id 引用。

### 5.3 玄阵 · Xuanzhen（规划中）

**产品定位：** 战场三维仿真平台，覆盖人员 / 装备 / 设施 / 任务 / 作战全要素，面向军事推演与效能评估。

**数据库规划（待产品需求确定后细化）：**

- 遵循通用业务 DB 结构：Beta + Prod 双库（`vxturebiz_xuanzhen_{env}`）
- 通用层（`context / agent / local_usage`）结构与 Ruyin 一致
- 业务复杂度高，`app` 域预计拆分为多个专用 Schema（力量体系 / 地形设施 / 任务 / 场景 / 推演），具体拆分方式待需求评审后确定
- 需启用 PostGIS 扩展（空间坐标数据）
- 高频仿真事件日志需独立分区策略（按推演轮次）

> 详细 Schema 设计待立项后展开，当前不落地。

---

## 6. Beta → Prod 转换流程

```
用户在 Beta 环境试用满意，决定转正
         │
         ▼
运营在 admin 后台发起 Beta → Prod 转换操作
         │
         ├─ Platform DB 操作（无需迁移，已在同一 Platform DB）：
         │   • tenant_member.environment_access 更新为 prod
         │   • tenant_subscription 状态从 trial → active
         │
         ▼
业务数据迁移（可选，按用户意愿）：
  方案A：保留 Beta 数据，迁移到 Prod DB（pg_dump → pg_restore 子集）
  方案B：Prod 环境全新开始，Beta 数据定期清理

         ▼
Beta 数据生命周期：
  • trial_expires_at 到期 → 自动标记为 cleanup_pending
  • 30 天后执行物理清理（可配置）
  • 合规归档：敏感数据保留元数据记录
```

---

## 7. 跨 DB 数据流

```
┌─────────────────────────────────────────────────────┐
│                   Platform DB                        │
│                                                     │
│  model.* ─────────────────────────────────────────┐ │
│  (模型配置)                                         │ │
│                                                     │ │
│  commerce.tenant_usage_event ◄────────────────────┐ │ │
│  commerce.tenant_usage_summary (聚合)              │ │ │
│  commerce.tenant_subscription_quota (配额)         │ │ │
└────────────────────────────────────┬───────────────┘ │ │
                                     │ 读配额          │ │
                          ┌──────────▼──────────┐      │ │
                          │   AI Gateway DB      │      │ │
                          │   routing / key      │      │ │
                          └──────────┬──────────┘      │ │
                                     │ 写用量事件       │ │
                                     └─────────────────┘ │
                                                         │
┌─────────────────────────────────────────────────────┐  │
│          Business DB (ruyin / xuanzhen / …)          │  │
│          (beta 或 prod)                              │  │
│                                                     │  │
│  app.* ─ 业务数据（知识库 / 推演场景 / 任务）          │  │
│  agent.conversation / message ─ AI 交互              │  │
│  local_usage.usage_raw ─────────────────────────────┘  │
│    (异步 Job 上报到 commerce.tenant_usage_event)        │
│                                                     │  │
│  context.app_instance ────────────────────────────────┘ │
│    (只存 tenant_id 引用，不复制 tenant 数据)             │
└─────────────────────────────────────────────────────────┘
```

**数据流向规则：**

1. 平台 DB 数据**不下沉**到业务 DB（不复制 tenant / account 详情）
2. 业务 DB 只持有 `tenant_id` / `user_id` 作为外部引用
3. 用量数据**只上报**到平台 DB，不在业务 DB 做配额判断
4. AI Gateway 是用量事件的**唯一写入者**，业务服务禁止直接写 usage_event

---

## 8. 治理原则

### 8.1 备份策略

| 数据库        | 备份频率            | 保留期           | 策略             |
| ------------- | ------------------- | ---------------- | ---------------- |
| Platform DB   | 每日全量 + 实时 WAL | 30 天 + 年度归档 | 异地双份，加密   |
| AI Gateway DB | 每日全量            | 14 天            | 同机房备份       |
| Business Prod | 每日全量 + WAL      | 30 天            | 同机房备份       |
| Business Beta | 每日全量            | 7 天             | 本地备份，可重建 |

### 8.2 访问控制

> 详细分层规则、PostgreSQL GRANT 脚本、BFF 访问矩阵、演进路线图见
> **[`docs/design/data-access.md`](data-access.md)**（执行级别：强制）。

| 数据库        | 应用账号权限                                   | 禁止                                            |
| ------------- | ---------------------------------------------- | ----------------------------------------------- |
| Platform DB   | 各 schema 独立 PG 角色，最小权限（见 §3 GRANT） | DDL 操作、BFF 绕过 Domain Service 直连           |
| AI Gateway DB | `aigateway_svc` 专属账号                       | 其他服务直接访问                                |
| Business DB   | 各 product service 专属账号                    | 跨产品访问、直接读 Platform DB                  |

### 8.3 Schema 迁移原则

- 所有 Schema 变更通过 `packages/core/database` 统一管理（Prisma 或 SQL migration）
- Platform DB 迁移：灰度，可回滚，不允许锁表超过 1 秒
- Business Beta DB：可接受较长迁移时间
- Business Prod DB：迁移窗口期执行，提前公告

### 8.4 连接池

- Platform DB：PgBouncer，transaction 模式，各服务独立连接池
- AI Gateway DB：应用层连接池（写入高频，避免 PgBouncer 事务锁开销）
- Business DB：PgBouncer，session 模式（业务事务较长）

---

## 9. 命名规范

### 9.1 Schema 内表命名

```
{schema}_{entity}            -- 普通表
{schema}_{entity}_history    -- 历史/变更记录表
{schema}_{entity}_log        -- 日志表（高频写，分区）
{schema}_{entity}_override   -- 覆盖/定制表
```

### 9.2 字段命名

| 约定          | 示例                                                |
| ------------- | --------------------------------------------------- |
| 主键          | `id UUID DEFAULT gen_random_uuid()`                 |
| 外键          | `{entity}_id`                                       |
| 时间戳        | `created_at / updated_at TIMESTAMPTZ`               |
| 软删除        | `deleted_at TIMESTAMPTZ NULL`                       |
| 状态枚举      | `status VARCHAR(32)`（用 CHECK 约束，不用 PG ENUM） |
| 布尔标志      | `is_{name} BOOLEAN`                                 |
| JSON 扩展字段 | `metadata JSONB NULL`                               |
| 货币金额      | `NUMERIC(12,2)`（单位：元，不用浮点）               |
| Token 数量    | `BIGINT`（可能超过 INT 范围）                       |

### 9.3 索引命名

```
idx_{table}_{columns}         -- 普通索引
uidx_{table}_{columns}        -- 唯一索引
pk_{table}                    -- 主键（PG 自动命名，不手动指定）
fk_{table}_{ref_table}        -- 外键约束
chk_{table}_{rule}            -- CHECK 约束
```

---

## 10. 分阶段实施路线

### Phase 1（当前）：平台核心域上线

| Schema     | 状态                             |
| ---------- | -------------------------------- |
| `identity` | ✅ 基本表已建立                  |
| `tenant`   | ✅ 基本表已建立                  |
| `iam`      | ✅ 租户域已建立，平台域待补全    |
| `product`  | ✅ 静态配置表已建立              |
| `commerce` | ✅ Schema 已建立，支付流程待完善 |
| `model`    | ⚠️ 基本表已建立，模型策略待补全  |
| `ops`      | ⚠️ 运营账号已建，治理表待补全    |
| `support`  | ⚠️ 工单表已建，审计分区待配置    |

### Phase 2：业务 DB 标准化

- 统一业务 DB schema 模板（`context / app / agent / local_usage`）
- Ruyin Prod DB 完整建立
- Beta → Prod 转换工具链
- 用量上报异步 Job

### Phase 3：高可用与治理

- Platform DB 主从复制 + 只读副本（报表查询）
- 审计日志分区（`support.audit_log` 按月分区）
- 时序数据分区（`simulation.sim_event` 等高频分区表）
- 自动备份验证流程

---

## 11. 关键设计约束汇总

| 约束                             | 原因                                 |
| -------------------------------- | ------------------------------------ |
| Platform DB 不存业务执行数据     | 控制面不应因业务洪峰降级             |
| 业务 DB 不存配额/订阅数据        | 配额必须统一，不能分布式             |
| AI Gateway 是用量写入唯一入口    | 防止绕过配额、保证审计完整           |
| `tenant_transaction` 不可变      | 账本是法律证据，任何修改都是追加冲正 |
| `tenant_usage_event` Append-only | 用量数据是计费依据，不允许删改       |
| Beta / Prod 业务 DB 物理隔离     | 防止测试数据污染生产，支持独立清理   |
| Free 套餐走 Prod                 | Free 是正式订阅，不是测试环境        |
| API Key 只在 AI Gateway DB 存储  | 降低平台 DB 被攻击时的 Key 泄露风险  |
