# Admin 运营后台产品规格

> 版本：1.0.0 | 更新：2026-05-11
> 技术实现：[`docs/packages/portals/admin.md`](../../../packages/portals/admin.md)
> BFF：[`docs/packages/bff/admin.md`](../../../packages/bff/admin.md)

---

## 定位

Admin（`admin.vxture.com`）是面向**平台运营者**的后台管理系统。

采用**双域架构**：

| 域 | 职责 | 核心用户 |
|----|------|---------|
| 平台自治域（Platform） | 平台能力供给侧：身份、资源、运行、安全、系统配置 | 平台技术/运维人员 |
| 运营管理域（Operation） | 商业消费侧：租户、产品、订阅、交易、财务、客服 | 平台商务/运营人员 |

Vela 智能助手嵌入 Admin（`VelaAdminChat.tsx`），贯穿两个域提供操作辅助。

---

## 功能模块实现状态

### 平台自治域

| 菜单分组 | 菜单项 | 路由 | 状态 |
|---------|--------|------|------|
| 平台总览 | 平台总览 | `/platform` | ⚠️ 占位页 |
| 身份权限 | 平台用户 | `/platform-admins` | ✅ 已接入 |
| 身份权限 | 平台角色 | `/admin-roles` | ✅ 已接入 |
| 身份权限 | 权限策略 | `/admin-permissions` | ✅ 已接入 |
| 平台资源 | 模型网关 | `/model-gateway` | ✅ 已接入 |
| 平台资源 | 密钥管理 | `/platform-secrets` | ⚠️ 治理列表页 |
| 运行保障 | 服务监控 | `/service-monitor` | ✅ 已接入 |
| 运行保障 | 任务调度 | `/platform-jobs` | ⚠️ 治理列表页 |
| 安全审计 | 审计日志 | `/audit-logs` | ✅ UI 完成（BFF 数据层待接入） |
| 安全审计 | 审批中心 | `/approval-center` | ⚠️ 治理列表页 |
| 系统配置 | 参数配置 | `/system-parameters` | 📋 待建设 |
| 系统配置 | 字典管理 | `/data-dictionaries` | 📋 待建设 |
| 系统配置 | 开关控制 | `/feature-toggles` | 📋 待建设 |
| 通知中心 | 通知渠道 | `/notification-channels` | 📋 待建设 |
| 通知中心 | 发送记录 | `/notification-logs` | 📋 待建设 |

### 运营管理域

| 菜单分组 | 菜单项 | 路由 | 状态 |
|---------|--------|------|------|
| 运营总览 | 运营总览 | `/` | ✅ 已接入 |
| 运营总览 | 运营待办 | `/ops-todos` | ✅ 已接入（实时聚合） |
| 租户账号 | 租户信息 | `/tenants` | ✅ 已接入 |
| 租户账号 | 账号体系 | `/accounts` | ✅ 已接入 |
| 租户账号 | 实名认证 | `/verifications` | ✅ 已接入 |
| 产品体系 | 产品能力 | `/products` | ✅ 已接入 |
| 产品体系 | 解决方案 | `/product-solutions` | ✅ 已接入 |
| 产品体系 | 服务套餐 | `/service-plans` | ✅ 已接入 |
| 产品体系 | 营销优惠 | `/promotions` | ✅ 已接入 |
| 订阅交易 | 订阅管理 | `/subscriptions` | ✅ 已接入 |
| 订阅交易 | 交易订单 | `/orders` | ✅ 已接入 |
| 订阅交易 | 用量计费 | `/usage-metering` | ✅ 已接入 |
| 订阅交易 | 优惠核销 | `/promotion-redemptions` | ✅ 已接入 |
| 商业分析 | 商业总览 | `/commerce-overview` | ✅ 已接入 |
| 模型技能 | 模型授权 | `/model-grants` | ✅ 已接入 |
| 模型技能 | 技能市场 | `/skills` | ✅ UI 完成（BFF 数据层待接入） |
| 财务结算 | 账单中心 | `/billing` | ✅ 已接入 |
| 财务结算 | 收款管理 | `/payments` | ✅ 已接入 |
| 财务结算 | 发票管理 | `/invoices` | ✅ 已接入 |
| 客户服务 | 工单中心 | `/tickets` | ✅ 已接入 |
| 客户服务 | 消息公告 | `/announcements` | ✅ UI 完成（BFF 数据层待接入） |

**图例**：✅ 已接入 BFF 数据 | ⚠️ 页面存在但为占位/治理列表 | 📋 菜单已定义，路由走 slug 兜底

---

## 域边界原则

**模型**：平台自治域做技术接入（模型网关），运营管理域做商业授权（模型授权）。两者分离，不混用。

**用户**：平台自治域管理平台内部用户（platform_admin），运营管理域管理租户账号（tenant_user）。

**配置**：全部在平台自治域（系统配置分组），运营管理域禁止出现配置类菜单。

**通知**：平台自治域管通知渠道（能力侧），运营管理域使用消息公告（消费侧）。

---

## 数据库依赖

Admin 通过 admin-bff 访问平台主库（`vx-platform-pg`），涉及 schema：

| Schema | 用途 |
|--------|------|
| `account` | 账号查询与管理 |
| `tenancy` | 租户、成员、认证管理 |
| `product` | 产品、解决方案、套餐配置 |
| `commerce` | 订阅、订单、支付、发票、用量 |
| `platform` | 平台用户、角色、权限、密钥、任务 |
| `support` | 工单、工单事件 |

详见 [`docs/db/index.md`](../../../db/index.md)。

---

## 登录与鉴权

- 运营后台**仅支持邮箱密码登录**，不接入钉钉/飞书/企业微信（禁止在 admin-bff 配置第三方 OAuth）
- JWT `userType = operator`，`authScope = platform_admin`
- 权限判断使用菜单 `code` 字段，见 [`menu.md`](menu.md)

---

## 关联文档

| 文档 | 内容 |
|------|------|
| [`menu.md`](menu.md) | 双域完整菜单规格（path / code / i18n / status / TS 初始化数据） |
| [`directory-structure.md`](directory-structure.md) | 路由 → 模块索引 / 架构边界注意事项 |
| [`docs/db/platform-governance.md`](../../../db/platform-governance.md) | 平台治理记录表设计草案 |
| [`docs/db/tickets.md`](../../../db/tickets.md) | 工单与运营待办 DB 设计 |
| [`docs/design/auth.md § 钉钉配置参考`](../../../design/auth.md) | 钉钉 OAuth 配置（仅用于 website-bff，admin 禁用） |
