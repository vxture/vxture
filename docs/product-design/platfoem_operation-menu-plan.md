# vxture 平台菜单结构（最终统一版）

> 适用于：平台自治域（platform） + 运营管理域（operation）
> 原则：职责清晰 / 命名统一 / 无重复 / 可扩展

---

# 一、平台自治域（Platform Domain）

> 定义：平台内核能力（供给侧）
> 仅提供能力，不承载业务数据

## 平台总览

- 平台总览
  path: /platform
  code: platform_overview
  i18n: menu.platform.overview

---

## 身份权限

- 平台用户
  path: /platform-admins
  code: platform_admin
  i18n: menu.platform.admin_user

- 平台角色
  path: /admin-roles
  code: platform_role
  i18n: menu.platform.admin_role

- 权限策略
  path: /admin-permissions
  code: permission_policy
  i18n: menu.platform.permission_policy

---

## 平台资源

- 模型网关
  path: /model-gateway
  code: model_gateway
  i18n: menu.platform.model_gateway

- 密钥管理
  path: /platform-secrets
  code: secret_store
  i18n: menu.platform.secret_store

---

## 运行保障

- 服务监控
  path: /service-monitor
  code: service_monitor
  i18n: menu.platform.service_monitor

- 任务调度
  path: /platform-jobs
  code: job_scheduler
  i18n: menu.platform.job_scheduler

---

## 安全审计

- 审计日志
  path: /audit-logs
  code: audit_log
  i18n: menu.platform.audit_log

- 审批中心
  path: /approval-center
  code: approval_flow
  i18n: menu.platform.approval_flow

---

## 系统配置（能力层）

> 所有配置统一收口，禁止出现在运营域

- 参数配置
  code: system_param
  i18n: menu.platform.system_param

- 字典管理
  code: system_dict
  i18n: menu.platform.system_dict

- 开关控制
  code: feature_toggle
  i18n: menu.platform.feature_toggle

---

## 通知中心（能力层）

> 平台通知能力（被运营域调用）

- 通知渠道
  code: notification_channel
  i18n: menu.platform.notification_channel

- 发送记录
  code: notification_log
  i18n: menu.platform.notification_log

---

# 二、运营管理域（Operation Domain）

> 定义：商业系统（消费侧）
> 使用平台能力，承载所有业务数据

## 运营总览

- 运营总览
  path: /
  code: operation_overview
  i18n: menu.operation.overview

- 运营待办
  path: /ops-todos
  code: operation_todo
  i18n: menu.operation.todo

---

## 租户账号

> 租户体系（客户侧身份）

- 租户信息
  path: /tenants
  code: tenant_profile
  i18n: menu.operation.tenant_profile

- 账号体系
  path: /accounts
  code: account_system
  i18n: menu.operation.account_system

- 实名认证
  path: /verifications
  code: identity_verification
  i18n: menu.operation.identity_verification

---

## 产品体系

> SaaS 产品定义核心层

- 产品能力
  path: /products
  code: product_capability
  i18n: menu.operation.product_capability

- 解决方案
  path: /product-solutions
  code: solution_package
  i18n: menu.operation.solution_package

- 服务套餐
  path: /service-plans
  code: service_plan
  i18n: menu.operation.service_plan

- 营销优惠
  path: /promotions
  code: promotion_campaign
  i18n: menu.operation.promotion_campaign

---

## 订阅交易

> 商业闭环核心（Billing）

- 订阅管理
  path: /subscriptions
  code: subscription
  i18n: menu.operation.subscription

- 交易订单
  path: /orders
  code: order_record
  i18n: menu.operation.order_record

- 用量计费
  path: /usage-metering
  code: usage_billing
  i18n: menu.operation.usage_billing

- 优惠核销
  path: /promotion-redemptions
  code: promotion_redeem
  i18n: menu.operation.promotion_redeem

---

## 商业分析

> 运营决策层

- 商业总览
  path: /commerce-overview
  code: commerce_overview
  i18n: menu.operation.commerce_overview

---

## 模型技能

> AI 平台核心差异层

⚠️ 注意边界：

- 不做技术接入（在自治域）
- 只做商业授权

- 模型授权
  path: /model-grants
  code: model_access
  i18n: menu.operation.model_access

- 技能市场
  path: /skills
  code: skill_market
  i18n: menu.operation.skill_market

---

## 财务结算

> 财务域

- 账单中心
  path: /billing
  code: billing_center
  i18n: menu.operation.billing_center

- 收款管理
  path: /payments
  code: payment_record
  i18n: menu.operation.payment_record

- 发票管理
  path: /invoices
  code: invoice_record
  i18n: menu.operation.invoice_record

---

## 客户服务

> 客户运营支撑

⚠️ 依赖：平台【通知中心】

- 工单中心
  path: /tickets
  code: support_ticket
  i18n: menu.operation.support_ticket

- 消息公告
  path: /announcements
  code: notification_message
  i18n: menu.operation.notification_message

---

# 三、最终边界规则（必须执行）

## 1. 模型

- 平台：模型网关（技术）
- 运营：模型授权（商业）

## 2. 用户

- 平台：平台用户（内部）
- 运营：租户用户（客户）

## 3. 配置

- 全部在：平台自治域（系统配置）
- 运营域禁止出现配置类菜单

## 4. 通知

- 平台：通知能力
- 运营：消息使用

---

# 四、一句话架构

Platform（自治域） = 能力提供
Operation（运营域） = 能力使用
