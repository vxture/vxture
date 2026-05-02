# Admin 目录结构梳理

> 范围：`portals/admin`
> 日期：2026-05-03
> 目标：明确 Admin 的整体目录、路由层、业务模块层、运营管理域与平台自治域的文件归属。

---

## 1. 项目根目录

```text
portals/admin/
├─ docs/
│  └─ admin-menu-design.md
│
├─ messages/
│  ├─ en-US.json
│  └─ zh-CN.json
│
├─ public/
│  ├─ assets/
│  │  ├─ ai/
│  │  │  └─ ai-agent-icon-32.gif
│  │  └─ icon/
│  │     └─ avatar-default.png
│  └─ brand/
│     └─ vxture-logo-white.png
│
├─ src/
│  ├─ api/
│  ├─ app/
│  ├─ components/
│  ├─ config/
│  ├─ entities/
│  ├─ features/
│  ├─ layout/
│  ├─ lib/
│  ├─ modules/
│  ├─ providers/
│  └─ shared/
│
├─ eslint.config.mjs
├─ next.config.js
├─ package.json
├─ postcss.config.cjs
└─ tsconfig.json
```

### 根目录职责

| 路径 | 职责 |
| --- | --- |
| `docs/` | Admin 局部设计文档。 |
| `messages/` | Admin 国际化消息，当前为 `zh-CN` 和 `en-US`。 |
| `public/` | Admin 静态资源。 |
| `src/app/` | Next.js App Router 路由层。 |
| `src/modules/` | 页面主体业务模块。 |
| `src/config/navigation.ts` | Admin 双域菜单与工作区配置。 |
| `src/api/admin-bff.ts` | Admin 前端访问 Admin BFF 的 API 封装。 |
| `src/entities/console.ts` | Admin 前端实体类型。 |
| `src/layout/` | Admin Shell、Vela Chat 等框架布局。 |
| `src/lib/` | i18n、格式化等基础工具。 |
| `src/providers/` | 全局 Provider 组合。 |

---

## 2. App Router 路由层

```text
src/app/
├─ layout.tsx
├─ globals.css
├─ login/
│  └─ page.tsx
├─ api/
│  └─ dev-services/
│     └─ route.ts
└─ (admin)/
   ├─ layout.tsx
   ├─ page.tsx
   ├─ [...slug]/
   │  └─ page.tsx
   │
   ├─ accounts/
   │  └─ page.tsx
   ├─ admin-permissions/
   │  └─ page.tsx
   ├─ admin-roles/
   │  └─ page.tsx
   ├─ announcements/
   │  └─ page.tsx
   ├─ approval-center/
   │  └─ page.tsx
   ├─ audit-logs/
   │  └─ page.tsx
   │
   ├─ billing/
   │  ├─ page.tsx
   │  └─ [billId]/
   │     └─ page.tsx
   ├─ commerce-overview/
   │  └─ page.tsx
   ├─ invoices/
   │  └─ page.tsx
   │
   ├─ model-gateway/
   │  └─ page.tsx
   ├─ model-grants/
   │  └─ page.tsx
   │
   ├─ ops-todos/
   │  └─ page.tsx
   ├─ orders/
   │  ├─ page.tsx
   │  └─ [orderId]/
   │     └─ page.tsx
   ├─ payments/
   │  └─ page.tsx
   │
   ├─ plans/
   │  └─ page.tsx
   ├─ platform/
   │  └─ page.tsx
   ├─ platform-admins/
   │  └─ page.tsx
   ├─ platform-jobs/
   │  └─ page.tsx
   ├─ platform-secrets/
   │  └─ page.tsx
   │
   ├─ product-plans/
   │  └─ page.tsx
   ├─ product-solutions/
   │  ├─ page.tsx
   │  └─ [solutionCode]/
   │     └─ page.tsx
   ├─ products/
   │  ├─ page.tsx
   │  └─ [productCode]/
   │     └─ page.tsx
   ├─ promotion-redemptions/
   │  └─ page.tsx
   ├─ promotions/
   │  └─ page.tsx
   │
   ├─ service-monitor/
   │  └─ page.tsx
   ├─ service-plans/
   │  ├─ page.tsx
   │  └─ [solutionCode]/
   │     └─ [tierCode]/
   │        └─ page.tsx
   ├─ skills/
   │  └─ page.tsx
   │
   ├─ subscriptions/
   │  ├─ page.tsx
   │  └─ [subscriptionId]/
   │     └─ page.tsx
   ├─ tenants/
   │  ├─ page.tsx
   │  └─ [tenantId]/
   │     └─ page.tsx
   ├─ tickets/
   │  └─ page.tsx
   ├─ usage-metering/
   │  └─ page.tsx
   └─ verifications/
      └─ page.tsx
```

### 路由层规则

- `src/app/layout.tsx`：Admin 根布局，读取 cookie、加载国际化消息、挂载 `ConsoleAppProviders`。
- `src/app/(admin)/layout.tsx`：后台工作区布局，挂载 `AdminShell`。
- `src/app/(admin)/page.tsx`：运营管理域首页，即 `/`。
- `src/app/(admin)/[...slug]/page.tsx`：兜底占位页，用于规划中但尚未建设的菜单。
- 具体 `page.tsx` 原则上只做路由入口，把页面实现委托给 `src/modules/**`。

---

## 3. 运营管理域目录

运营管理域定位：商业系统消费侧，承载租户、产品、订阅、交易、财务、客户服务等业务数据。

### 3.1 菜单与页面文件映射

| 菜单分组 | 菜单项 | 路由 | 页面模块 |
| --- | --- | --- | --- |
| 运营总览 | 运营总览 | `/` | `src/app/(admin)/page.tsx` |
| 运营总览 | 运营待办 | `/ops-todos` | `src/modules/ops/OpsTodosPage.tsx` |
| 租户账号 | 租户信息 | `/tenants` | `src/modules/tenants/TenantsPage.tsx` |
| 租户账号 | 账号体系 | `/accounts` | `src/modules/accounts/AccountsPage.tsx` |
| 租户账号 | 实名认证 | `/verifications` | `src/modules/tenants/VerificationsPage.tsx` |
| 产品体系 | 产品能力 | `/products` | `src/modules/products/ProductsPage.tsx` |
| 产品体系 | 解决方案 | `/product-solutions` | `src/modules/products/ProductSolutionsPage.tsx` |
| 产品体系 | 服务套餐 | `/service-plans` | `src/modules/products/ServicePlansPage.tsx` |
| 产品体系 | 营销优惠 | `/promotions` | `src/modules/commercial/PromotionsPage.tsx` |
| 订阅交易 | 订阅管理 | `/subscriptions` | `src/modules/subscriptions/SubscriptionsPage.tsx` |
| 订阅交易 | 交易订单 | `/orders` | `src/modules/orders/OrdersPage.tsx` |
| 订阅交易 | 用量计费 | `/usage-metering` | `src/modules/commercial/UsageMeteringPage.tsx` |
| 订阅交易 | 优惠核销 | `/promotion-redemptions` | `src/modules/commercial/PromotionRedemptionsPage.tsx` |
| 商业分析 | 商业总览 | `/commerce-overview` | `src/modules/commercial/CommerceOverviewPage.tsx` |
| 模型技能 | 模型授权 | `/model-grants` | `src/modules/ai/ModelGrantsPage.tsx` |
| 模型技能 | 技能市场 | `/skills` | `src/modules/skills/SkillsPage.tsx` |
| 财务结算 | 账单中心 | `/billing` | `src/modules/billing/BillingPage.tsx` |
| 财务结算 | 收款管理 | `/payments` | `src/modules/payments/PaymentsPage.tsx` |
| 财务结算 | 发票管理 | `/invoices` | `src/modules/invoices/InvoicesPage.tsx` |
| 客户服务 | 工单中心 | `/tickets` | `src/modules/support/TicketsPage.tsx` |
| 客户服务 | 消息公告 | `/announcements` | `src/modules/announcements/AnnouncementsPage.tsx` |

### 3.2 运营域模块文件

```text
src/modules/
├─ accounts/
│  └─ AccountsPage.tsx
│
├─ announcements/
│  └─ AnnouncementsPage.tsx
│
├─ ai/
│  └─ ModelGrantsPage.tsx
│
├─ billing/
│  ├─ BillingPage.tsx
│  ├─ BillingDetailPage.tsx
│  ├─ BillingBillActionDialog.tsx
│  ├─ InvoiceReceiptActionDialog.tsx
│  └─ OfflineInvoiceDialog.tsx
│
├─ commercial/
│  ├─ CommerceOverviewPage.tsx
│  ├─ PromotionsPage.tsx
│  ├─ PromotionRedemptionsPage.tsx
│  ├─ UsageMeteringPage.tsx
│  └─ commercial-utils.tsx
│
├─ invoices/
│  └─ InvoicesPage.tsx
│
├─ ops/
│  └─ OpsTodosPage.tsx
│
├─ orders/
│  ├─ OrdersPage.tsx
│  ├─ OrderDetailPage.tsx
│  └─ OrderOfflinePaymentDialog.tsx
│
├─ payments/
│  └─ PaymentsPage.tsx
│
├─ products/
│  ├─ ProductsPage.tsx
│  ├─ ProductCapabilityDetailPage.tsx
│  ├─ ProductSolutionsPage.tsx
│  ├─ ProductSolutionDetailPage.tsx
│  ├─ ServicePlansPage.tsx
│  ├─ ServicePlanDetailPage.tsx
│  └─ ProductPlansPage.tsx
│
├─ skills/
│  └─ SkillsPage.tsx
│
├─ subscriptions/
│  ├─ SubscriptionsPage.tsx
│  ├─ SubscriptionDetailPage.tsx
│  └─ SubscriptionOperationDialog.tsx
│
├─ support/
│  └─ TicketsPage.tsx
│
└─ tenants/
   ├─ TenantsPage.tsx
   ├─ TenantDetailPage.tsx
   ├─ VerificationsPage.tsx
   └─ tenant-utils.ts
```

---

## 4. 平台自治域目录

平台自治域定位：平台能力供给侧，管理平台自身身份、资源、运行、安全、系统配置和通知能力。

### 4.1 菜单与页面文件映射

| 菜单分组 | 菜单项 | 状态 | 路由 | 页面模块 |
| --- | --- | --- | --- | --- |
| 平台总览 | 平台总览 | active | `/platform` | `src/modules/platform/PlatformAutonomyPage.tsx` |
| 身份权限 | 平台用户 | active | `/platform-admins` | `src/modules/platform/PlatformUsersPage.tsx` |
| 身份权限 | 平台角色 | active | `/admin-roles` | `src/modules/admin-roles/AdminRolesPage.tsx` |
| 身份权限 | 权限策略 | active | `/admin-permissions` | `src/modules/admin-permissions/AdminPermissionsPage.tsx` |
| 平台资源 | 模型网关 | active | `/model-gateway` | `src/modules/ai/ModelGatewayPage.tsx` |
| 平台资源 | 密钥管理 | active | `/platform-secrets` | `src/modules/platform/PlatformGovernanceListPage.tsx` |
| 运行保障 | 服务监控 | active | `/service-monitor` | `src/modules/ops/ServiceHealthPage.tsx` |
| 运行保障 | 任务调度 | active | `/platform-jobs` | `src/modules/platform/PlatformGovernanceListPage.tsx` |
| 安全审计 | 审计日志 | active | `/audit-logs` | `src/modules/audit-logs/AuditLogsPage.tsx` |
| 安全审计 | 审批中心 | active | `/approval-center` | `src/modules/platform/PlatformGovernanceListPage.tsx` |
| 系统配置 | 参数配置 | planned | `/system-parameters` | `src/app/(admin)/[...slug]/page.tsx` |
| 系统配置 | 字典管理 | planned | `/data-dictionaries` | `src/app/(admin)/[...slug]/page.tsx` |
| 系统配置 | 开关控制 | planned | `/feature-toggles` | `src/app/(admin)/[...slug]/page.tsx` |
| 通知中心 | 通知渠道 | planned | `/notification-channels` | `src/app/(admin)/[...slug]/page.tsx` |
| 通知中心 | 发送记录 | planned | `/notification-logs` | `src/app/(admin)/[...slug]/page.tsx` |

### 4.2 自治域模块文件

```text
src/modules/
├─ admin-permissions/
│  └─ AdminPermissionsPage.tsx
│
├─ admin-roles/
│  └─ AdminRolesPage.tsx
│
├─ ai/
│  └─ ModelGatewayPage.tsx
│
├─ audit-logs/
│  └─ AuditLogsPage.tsx
│
├─ ops/
│  └─ ServiceHealthPage.tsx
│
└─ platform/
   ├─ PlatformAutonomyPage.tsx
   ├─ PlatformUsersPage.tsx
   └─ PlatformGovernanceListPage.tsx
```

---

## 5. 共享与基础层目录

```text
src/
├─ api/
│  └─ admin-bff.ts
│
├─ components/
│  └─ ui/
│     └─ primitives.tsx
│
├─ config/
│  └─ navigation.ts
│
├─ entities/
│  └─ console.ts
│
├─ features/
│  └─ session/
│     └─ AdminSessionProvider.tsx
│
├─ layout/
│  ├─ AdminShell.tsx
│  └─ VelaAdminChat.tsx
│
├─ lib/
│  ├─ admin-formatters.ts
│  ├─ console-intl.tsx
│  └─ i18n.ts
│
├─ modules/
│  └─ shared/
│     ├─ ActionButton.tsx
│     ├─ AdminPlaceholderPage.tsx
│     ├─ AdminRoutePlaceholderPage.tsx
│     ├─ EmptyState.tsx
│     ├─ PageHeader.tsx
│     ├─ ViewModeSwitch.tsx
│     └─ index.ts
│
├─ providers/
│  └─ ConsoleAppProviders.tsx
│
└─ shared/
   ├─ ip-location.ts
   └─ mock-console-data.ts
```

### 共享层职责

| 文件 | 职责 |
| --- | --- |
| `src/api/admin-bff.ts` | Admin BFF 请求封装。 |
| `src/config/navigation.ts` | 双域 Workspace、分组、菜单、路由、权限元数据。 |
| `src/entities/console.ts` | Admin 前端实体类型定义。 |
| `src/features/session/AdminSessionProvider.tsx` | Admin 登录会话、用户与权限上下文。 |
| `src/layout/AdminShell.tsx` | 后台主框架、侧边栏、顶部栏、工作区切换。 |
| `src/layout/VelaAdminChat.tsx` | Admin 内置 Vela 助手。 |
| `src/lib/i18n.ts` | 服务端消息加载、locale 标准化。 |
| `src/lib/console-intl.tsx` | 客户端翻译 Provider 与 hook。 |
| `src/providers/ConsoleAppProviders.tsx` | Theme、Fullscreen、Intl、Tooltip 等全局 Provider 组合。 |
| `src/modules/shared/*` | 页面级通用组件，如标题、空状态、占位页、视图切换。 |
| `src/shared/mock-console-data.ts` | 临时或兜底前端数据源。 |

---

## 6. 页面路由到模块入口索引

```text
/                                      -> src/app/(admin)/page.tsx
/login                                 -> src/app/login/page.tsx
/accounts                              -> src/modules/accounts/AccountsPage.tsx
/admin-permissions                     -> src/modules/admin-permissions/AdminPermissionsPage.tsx
/admin-roles                           -> src/modules/admin-roles/AdminRolesPage.tsx
/announcements                         -> src/modules/announcements/AnnouncementsPage.tsx
/approval-center                       -> src/modules/platform/PlatformGovernanceListPage.tsx
/audit-logs                            -> src/modules/audit-logs/AuditLogsPage.tsx
/billing                               -> src/modules/billing/BillingPage.tsx
/billing/[billId]                      -> src/modules/billing/BillingDetailPage.tsx
/commerce-overview                     -> src/modules/commercial/CommerceOverviewPage.tsx
/invoices                              -> src/modules/invoices/InvoicesPage.tsx
/model-gateway                         -> src/modules/ai/ModelGatewayPage.tsx
/model-grants                          -> src/modules/ai/ModelGrantsPage.tsx
/ops-todos                             -> src/modules/ops/OpsTodosPage.tsx
/orders                                -> src/modules/orders/OrdersPage.tsx
/orders/[orderId]                      -> src/modules/orders/OrderDetailPage.tsx
/payments                              -> src/modules/payments/PaymentsPage.tsx
/platform                              -> src/modules/platform/PlatformAutonomyPage.tsx
/platform-admins                       -> src/modules/platform/PlatformUsersPage.tsx
/platform-jobs                         -> src/modules/platform/PlatformGovernanceListPage.tsx
/platform-secrets                      -> src/modules/platform/PlatformGovernanceListPage.tsx
/product-solutions                     -> src/modules/products/ProductSolutionsPage.tsx
/product-solutions/[solutionCode]      -> src/modules/products/ProductSolutionDetailPage.tsx
/products                              -> src/modules/products/ProductsPage.tsx
/products/[productCode]                -> src/modules/products/ProductCapabilityDetailPage.tsx
/promotion-redemptions                 -> src/modules/commercial/PromotionRedemptionsPage.tsx
/promotions                            -> src/modules/commercial/PromotionsPage.tsx
/service-monitor                       -> src/modules/ops/ServiceHealthPage.tsx
/service-plans                         -> src/modules/products/ServicePlansPage.tsx
/service-plans/[solutionCode]/[tierCode] -> src/modules/products/ServicePlanDetailPage.tsx
/skills                                -> src/modules/skills/SkillsPage.tsx
/subscriptions                         -> src/modules/subscriptions/SubscriptionsPage.tsx
/subscriptions/[subscriptionId]        -> src/modules/subscriptions/SubscriptionDetailPage.tsx
/tenants                               -> src/modules/tenants/TenantsPage.tsx
/tenants/[tenantId]                    -> src/modules/tenants/TenantDetailPage.tsx
/tickets                               -> src/modules/support/TicketsPage.tsx
/usage-metering                        -> src/modules/commercial/UsageMeteringPage.tsx
/verifications                         -> src/modules/tenants/VerificationsPage.tsx
/* planned fallback                    -> src/modules/shared/AdminRoutePlaceholderPage.tsx
```

---

## 7. 架构边界

### 运营管理域

- 承载业务数据和运营动作。
- 关注租户、账号、产品、订阅、交易、财务、客户服务。
- 模型能力只做商业授权，不做技术接入。
- 通知能力只做消息使用侧，不管理底层渠道。

### 平台自治域

- 管理平台自身能力和治理能力。
- 关注平台用户、平台角色、权限策略、模型网关、密钥、运行、审计、审批。
- 系统配置和通知能力属于平台供给侧，运营域不放配置类菜单。

---

## 8. 当前需要留意的结构点

1. `src/app/(admin)/plans/page.tsx` 和 `src/app/(admin)/product-plans/page.tsx` 当前存在路由文件，但不在最新导航主菜单中。
2. `src/app/(admin)/service-health/` 目录存在空目录迹象，当前有效路由是 `/service-monitor`。
3. `src/modules/platform/PlatformGovernanceListPage.tsx` 复用于 `密钥管理 / 任务调度 / 审批中心` 三个自治域页面。
4. planned 菜单依赖 `src/app/(admin)/[...slug]/page.tsx` 和 `AdminRoutePlaceholderPage` 兜底展示。
5. `src/shared/mock-console-data.ts` 仍存在，后续应继续确认哪些页面已完全数据库化，避免样例数据回流。
