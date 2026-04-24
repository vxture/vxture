# Vxture Console 架构概要设计（简版）

## 1. 目标

在 `portals/` 下新建统一后台应用 `console/`，作为平台运营、租户管理、租户业务配置的统一控制台。

该控制台遵循以下原则：

- **统一前端入口**：平台侧与租户侧共用同一个 `console`
- **权限驱动视图**：不同角色看到不同菜单、页面与操作能力
- **BFF 单一入口**：`console` 只访问 `console-bff`
- **模块化扩展**：按业务域拆分模块，而不是按应用拆分 admin / tenant
- **可支持私有化裁剪**：未来可通过 preset / capability 裁剪出私有化版本

---

## 2. 推荐目录结构

```txt
vxture/
├── portals/
│   ├── website/
│   └── console/
│
├── bff/
│   ├── website-bff/
│   └── console-bff/
│
├── services/
│   ├── identity/
│   │   └── iam/
│   ├── tenant/
│   │   ├── organization/
│   │   └── quota/
│   ├── commerce/
│   │   ├── subscription/
│   │   ├── billing/
│   │   ├── invoice/
│   │   └── payment/
│   ├── platform/
│   │   ├── catalog/
│   │   ├── pricing/
│   │   └── model-registry/
│   └── support/
│       └── ticket/
│
├── packages/
│   ├── shared/
│   │   └── shared/
│   ├── core/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── config/
│   │   ├── locale/
│   │   ├── tenant/
│   │   └── utils/
│   ├── design/
│   │   └── design-system/
│   └── platform/
│       └── {name}/
└── pnpm-workspace.yaml
```

---

## 3. console 应用定位

`portals/console` 是统一后台控制台，不再区分 `admin` 与 `tenant` 两个独立应用。

### 3.1 目标用户

- 平台运营人员
- 平台管理员
- 租户管理员
- 租户成员（受限）

### 3.2 负责内容

- 后台布局与导航
- 登录后控制台体验
- 模块页面编排
- 权限驱动菜单显示
- 调用 `console-bff` 获取数据

### 3.3 不负责内容

- 不承载业务规则
- 不直接调用 `services/*`
- 不直接调用 `core-*`
- 不直接访问数据库
- 不直接访问 agent backend

---

## 4. console-bff 定位

`bff/console-bff` 是 `portals/console` 的唯一后端入口。

### 4.1 负责内容

- 登录态校验
- 会话管理
- 当前用户解析
- 当前租户上下文解析
- 权限集下发
- 聚合多个 service 的响应
- 为控制台输出前端友好的 DTO

### 4.2 不负责内容

- 不承载核心业务规则
- 不写复杂领域逻辑
- 不引入 UI 代码

---

## 5. console 推荐内部结构

```txt
portals/console/
├── src/
│   ├── app/                  # 应用入口、路由注册、providers
│   ├── layout/               # Shell、Header、Sidebar、Breadcrumb
│   ├── modules/              # 业务模块
│   │   ├── iam/
│   │   ├── organization/
│   │   ├── subscription/
│   │   ├── billing/
│   │   ├── invoice/
│   │   ├── payment/
│   │   ├── quota/
│   │   ├── product/
│   │   ├── pricing/
│   │   ├── model/
│   │   ├── usage/
│   │   └── settings/
│   ├── features/             # 可复用前端能力（auth、permission、tenant-switch 等）
│   ├── entities/             # 前端领域实体与类型
│   ├── shared/               # hooks、utils、constants
│   ├── api/                  # 请求封装，仅面向 console-bff
│   ├── config/               # 菜单、路由、能力注册
│   └── styles/
│
├── package.json
├── tsconfig.json
└── vite.config.ts / next.config.ts
```

---

## 6. console-bff 推荐内部结构

```txt
bff/console-bff/
├── src/
│   ├── routers/
│   │   ├── auth.router.ts
│   │   ├── me.router.ts
│   │   ├── iam.router.ts
│   │   ├── organization.router.ts
│   │   ├── subscription.router.ts
│   │   ├── billing.router.ts
│   │   ├── invoice.router.ts
│   │   ├── payment.router.ts
│   │   ├── quota.router.ts
│   │   ├── product.router.ts
│   │   ├── pricing.router.ts
│   │   ├── model.router.ts
│   │   ├── usage.router.ts
│   │   └── settings.router.ts
│   ├── aggregators/
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── tenant.middleware.ts
│   │   └── permission.middleware.ts
│   ├── capabilities/         # 当前会话可见能力下发
│   ├── dto/
│   ├── clients/              # service clients
│   ├── config/
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## 7. 模块划分原则

统一 `console` 不等于所有页面混在一起，而是按领域模块化。

### 7.1 推荐一级模块

- `iam`：账号、成员、角色、权限
- `organization`：租户、组织、工作区、部门
- `subscription`：订阅、套餐、生效周期、升降配
- `billing`：账单、扣费、对账
- `invoice`：发票申请、开票记录
- `payment`：支付方式、付款记录
- `quota`：额度、配额、使用限制
- `product`：产品目录、功能清单
- `pricing`：价格体系、套餐价格
- `model`：模型管理、模型接入、模型策略
- `usage`：调用量、资源消耗、统计报表
- `settings`：系统设置、租户设置、通知与偏好

### 7.2 模块边界规则

每个模块只负责本模块的：

- 页面
- 路由
- 查询/表单
- DTO 映射
- 权限点声明

跨模块编排放在：

- `layout/`
- `features/`
- `aggregators/`

---

## 8. 权限驱动设计

统一 console 的核心不是“所有人看同样页面”，而是“同一套应用，根据权限展示不同能力”。

### 8.1 权限层级

建议至少分三层：

1. **登录态**：是否允许进入 console
2. **菜单权限**：是否显示某个模块入口
3. **操作权限**：是否允许新增、编辑、删除、审批、导出等操作

### 8.2 示例能力点

```txt
platform.tenant.manage
platform.product.manage
platform.pricing.manage
platform.model.manage

tenant.user.manage
tenant.role.manage
tenant.subscription.read
tenant.billing.read
tenant.invoice.manage
tenant.payment.manage
tenant.quota.read
```

### 8.3 前端落地

菜单、路由、按钮都基于 capability / permission 控制，不基于硬编码角色名称控制。

---

## 9. 私有化支持原则

未来若要把某个租户的管理与业务提取出来私有化部署，统一 `console` 仍可复用。

设计上提前遵循：

- `console` 作为统一壳层
- 具体模块可裁剪
- `console-bff` 可按部署模式装配不同 router
- 平台级能力与租户级能力分离
- 通过 capability / preset 控制可见模块

建议未来预留：

```txt
portals/console/src/presets/
bff/console-bff/src/presets/
```

可支持：

- `saas-platform`
- `saas-tenant`
- `private-tenant`

当前第一阶段可先不实现完整 preset 系统，但目录要预留。

---

## 10. 第一阶段实施顺序

### Step 1：新建目录

- `portals/console`
- `bff/console-bff`

### Step 2：先做 console 基础壳层

优先完成：

- App Shell
- Header
- Sidebar
- Breadcrumb
- Route Guard
- Auth Session 恢复
- 当前用户与当前租户上下文
- 权限过滤菜单

### Step 3：先做 console-bff 基础能力

优先完成：

- `/auth`
- `/me`
- `/capabilities`
- `/tenant-context`

### Step 4：第一批业务模块

优先顺序建议：

1. `iam`
2. `organization`
3. `subscription`
4. `billing`
5. `quota`

### Step 5：补充平台运营模块

- `product`
- `pricing`
- `model`
- `usage`
- `settings`

---

## 11. 第一阶段最低可用版本（MVP）

第一阶段不追求全业务完成，只要让 `console` 成为真正可扩展的骨架。

### MVP 包含

- 统一后台壳层
- 登录后控制台首页
- 当前用户信息
- 当前租户上下文
- 菜单权限控制
- 一个 `iam` 模块示例
- 一个 `subscription` 模块示例
- `console-bff` 基础 router 与 middleware

### MVP 暂不追求

- 全量业务模块
- 全量私有化 preset
- 完整审计系统
- 复杂报表中心

---

## 12. 当前建议结论

当前架构建议正式调整为：

```txt
portals/
  website/
  console/

bff/
  website-bff/
  console-bff/
```

不再新建：

```txt
portals/admin
portals/tenant
bff/admin-bff
bff/tenant-bff
```

统一后台应用 `console` 通过：

- 权限
- capability
- 租户上下文
- 模块装配

来区分平台运营视图与租户管理视图。

这条路线最适合你当前“还在设计阶段、几乎无历史代码”的状态，也最利于后续 SaaS 与私有化并行演进。
