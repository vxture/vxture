# Admin 目录结构参考

> 范围：`portals/admin/src/`
> 更新：2026-05-03
> 路由与菜单规格见 [`menu.md`](menu.md)

---

## 路由 → 模块索引

| 路由 | 页面模块 |
|------|---------|
| `/` | `src/app/(admin)/page.tsx` |
| `/login` | `src/app/login/page.tsx` |
| `/accounts` | `src/modules/accounts/AccountsPage.tsx` |
| `/admin-permissions` | `src/modules/admin-permissions/AdminPermissionsPage.tsx` |
| `/admin-roles` | `src/modules/admin-roles/AdminRolesPage.tsx` |
| `/announcements` | `src/modules/announcements/AnnouncementsPage.tsx` |
| `/approval-center` | `src/modules/platform/PlatformGovernanceListPage.tsx` |
| `/audit-logs` | `src/modules/audit-logs/AuditLogsPage.tsx` |
| `/billing` | `src/modules/billing/BillingPage.tsx` |
| `/billing/[billId]` | `src/modules/billing/BillingDetailPage.tsx` |
| `/commerce-overview` | `src/modules/commercial/CommerceOverviewPage.tsx` |
| `/invoices` | `src/modules/invoices/InvoicesPage.tsx` |
| `/model-gateway` | `src/modules/ai/ModelGatewayPage.tsx` |
| `/model-grants` | `src/modules/ai/ModelGrantsPage.tsx` |
| `/ops-todos` | `src/modules/ops/OpsTodosPage.tsx` |
| `/orders` | `src/modules/orders/OrdersPage.tsx` |
| `/orders/[orderId]` | `src/modules/orders/OrderDetailPage.tsx` |
| `/payments` | `src/modules/payments/PaymentsPage.tsx` |
| `/platform` | `src/modules/platform/PlatformAutonomyPage.tsx` |
| `/platform-admins` | `src/modules/platform/PlatformUsersPage.tsx` |
| `/platform-jobs` | `src/modules/platform/PlatformGovernanceListPage.tsx` |
| `/platform-secrets` | `src/modules/platform/PlatformGovernanceListPage.tsx` |
| `/product-solutions` | `src/modules/products/ProductSolutionsPage.tsx` |
| `/product-solutions/[solutionCode]` | `src/modules/products/ProductSolutionDetailPage.tsx` |
| `/products` | `src/modules/products/ProductsPage.tsx` |
| `/products/[productCode]` | `src/modules/products/ProductCapabilityDetailPage.tsx` |
| `/promotion-redemptions` | `src/modules/commercial/PromotionRedemptionsPage.tsx` |
| `/promotions` | `src/modules/commercial/PromotionsPage.tsx` |
| `/service-monitor` | `src/modules/ops/ServiceHealthPage.tsx` |
| `/service-plans` | `src/modules/products/ServicePlansPage.tsx` |
| `/service-plans/[solutionCode]/[tierCode]` | `src/modules/products/ServicePlanDetailPage.tsx` |
| `/skills` | `src/modules/skills/SkillsPage.tsx` |
| `/subscriptions` | `src/modules/subscriptions/SubscriptionsPage.tsx` |
| `/subscriptions/[subscriptionId]` | `src/modules/subscriptions/SubscriptionDetailPage.tsx` |
| `/tenants` | `src/modules/tenants/TenantsPage.tsx` |
| `/tenants/[tenantId]` | `src/modules/tenants/TenantDetailPage.tsx` |
| `/tickets` | `src/modules/support/TicketsPage.tsx` |
| `/usage-metering` | `src/modules/commercial/UsageMeteringPage.tsx` |
| `/verifications` | `src/modules/tenants/VerificationsPage.tsx` |
| `/* planned` | `src/modules/shared/AdminRoutePlaceholderPage.tsx` |

---

## 关键共享文件

| 文件 | 职责 |
|------|------|
| `src/config/navigation.ts` | 双域 Workspace、分组、菜单、路由、权限元数据 |
| `src/api/admin-bff.ts` | Admin BFF 请求封装 |
| `src/entities/console.ts` | Admin 前端实体类型定义 |
| `src/layout/AdminShell.tsx` | 后台主框架（侧边栏、顶部栏、工作区切换） |
| `src/layout/VelaAdminChat.tsx` | Admin 内置 Vela 助手入口 |
| `src/features/session/AdminSessionProvider.tsx` | 登录会话、用户与权限上下文 |
| `src/modules/shared/AdminPlaceholderPage.tsx` | planned 菜单通用占位页 |
| `src/shared/mock-console-data.ts` | ⚠️ 临时 mock 数据，需逐步数据库化 |

---

## 架构边界注意事项

1. `src/app/(admin)/plans/` 和 `src/app/(admin)/product-plans/` 路由文件存在，但不在当前导航主菜单中，属于历史路由，需确认是否保留。

2. `PlatformGovernanceListPage.tsx` 被 `密钥管理`、`任务调度`、`审批中心` 三个自治域页面复用，属于通用治理列表视图，不是各自独立实现。

3. `planned` 菜单（系统配置/通知中心）统一走 `src/app/(admin)/[...slug]/page.tsx` + `AdminRoutePlaceholderPage` 兜底，无需为每个待建设路由创建单独文件。

4. `src/shared/mock-console-data.ts` 仍存在，需要逐页确认哪些模块仍依赖它，优先替换为真实 BFF 接口。

5. 路由层（`src/app/`）原则上只做路由入口，页面实现委托给 `src/modules/**`。
