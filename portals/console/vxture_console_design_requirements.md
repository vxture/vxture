# Vxture Console 设计要求（供 Codex 实现）

## 1. 设计目标

为 `portals/console` 设计并实现统一后台控制台 UI。

本次设计目标：

- 视觉参考 **Vercel Dashboard**，但**不要顶部大面积灰色区域**
- 风格参考 **Google Material Design**，但**不照搬其整套体系**
- 整体基调为 **浅色、科技感、现代 SaaS、克制、清爽**
- 适配 Vxture 当前统一 `console` 架构，而不是传统 `admin / tenant` 双后台
- 模块规划要结合 **行业通用 SaaS 平台** 与 **Vxture 平台自身业务**
- 必须完全应用已有的design system | shared 等基础包，不能自建一套。

---

## 2. 总体视觉方向

### 2.1 关键词

- 浅色
- 科技感
- 干净
- 克制
- 现代
- 专业
- 高级但不过度装饰
- 清晰的信息层级

### 2.2 参考组合

- **布局结构参考**：Vercel Dashboard
- **组件细节参考**：Google Material Design（仅风格借鉴）
- **最终效果要求**：比微软后台更轻，比传统 admin 更现代，比纯 Material 更克制

### 2.3 禁止方向

禁止出现以下倾向：

- 传统后台管理系统风格
- 大面积深灰 / 黑色顶栏
- 大量高饱和蓝色块
- 过重阴影
- 过度拟物
- 页面过密、信息堆叠
- 表格堆满整屏
- 一屏很多主按钮
- 复杂花哨渐变背景

---

## 3. 视觉基调要求

### 3.1 页面背景

- 页面主背景使用极浅灰蓝或极浅中性色
- 推荐接近：`#F8FAFC` / `#F6F8FB` / `#F9FAFB`
- 禁止纯白整屏直铺到所有层级
- 通过背景层次区分页面背景、卡片背景、浮层背景

### 3.2 主色

- 主色采用 **科技感蓝色**，偏清透，不要厚重微软蓝
- 推荐范围：`#3B82F6` 附近
- 可搭配少量蓝紫色作为强调色，但只能轻量使用
- 重点操作、选中态、focus、链接态使用主色

### 3.3 卡片

- 卡片使用白色背景
- 边框轻，优先使用细边框而不是重阴影
- 阴影极轻微，仅用于浮层、弹层、下拉菜单
- 卡片圆角中等偏小，不要过圆

### 3.4 字体与信息层级

- 信息层级必须非常清楚
- 页面标题、分组标题、正文、辅助文本必须形成稳定梯度
- 不允许所有文字大小都接近，导致页面“糊成一片”
- 标题要更稳重，不要花哨

---

## 4. 布局要求

## 4.1 整体布局

采用统一控制台标准布局：

```txt
┌───────────────────────────────────────────────┐
│ 顶部栏 Header                                │
├──────────────┬────────────────────────────────┤
│ 左侧导航     │ 主内容区                        │
│ Sidebar      │                                │
│              │ 页面标题 / Tabs / 内容模块      │
└──────────────┴────────────────────────────────┘
```

### 4.2 Header

Header 必须轻量，不允许出现大面积灰条。

Header 只承载：

- 当前 workspace / tenant 切换
- 全局搜索入口（预留）
- 通知入口（预留）
- 用户菜单
- 面包屑（可放内容区顶部，不强制放 header）

Header 视觉要求：

- 高度适中
- 背景尽量接近白色或极浅色
- 细边框分隔
- 不要压迫感

### 4.3 Sidebar

左侧导航是控制台最重要的导航区域。

要求：

- 固定宽度
- 分组清晰
- 一级导航不要太多
- 采用文字 + 轻图标
- 当前选中态清晰，但不要厚重高亮块
- 支持模块分组标题

禁止：

- 导航项数量失控
- 所有菜单都放一级
- 大面积深色背景
- 强烈渐变背景

### 4.4 主内容区

主内容区要求：

- 留白充分
- 模块之间有清晰间距
- 最大内容宽度合理
- 页面顶部信息区统一
- 列表页、详情页、设置页有一致框架

---

## 5. 页面结构规范

所有页面优先遵循统一模板。

### 5.1 列表页模板

```txt
页面标题 + 页面说明 + 主操作按钮
Tabs（可选）
统计摘要卡片（可选）
筛选/搜索工具栏
数据表格 / 列表
右侧 Drawer / 弹窗详情
```

### 5.2 详情页模板

```txt
页面标题 + 返回
概览卡片
Tabs / 分组内容
操作区
活动记录 / 审计记录（预留）
```

### 5.3 设置页模板

```txt
页面标题 + 说明
分组 Section
每个 Section 使用卡片或清晰分隔
表单控件间距统一
```

---

## 6. 组件设计要求

## 6.1 通用原则

- 优先使用 `@vxture/design-system`
- 不重复造组件
- 控件视觉要统一
- 所有 hover / focus / active 状态要一致
- 所有输入类控件高度统一
- 表单、表格、弹层、抽屉要统一语言

## 6.2 Button

- 主按钮数量严格控制
- 一个页面最多一个强主按钮
- 次级操作使用次按钮或文本按钮
- 危险操作必须弱化，并放入二次确认

## 6.3 Input / Select / Search

- 统一高度
- 统一圆角
- focus 态明确但克制
- 不要厚重蓝边
- 搜索框适合顶部工具栏布局

## 6.4 Table

表格必须现代化，不要传统 ERP 风。

要求：

- 表头清晰但不厚重
- 行高适中
- 边框轻
- 支持 hover
- 支持空状态
- 核心列控制在 5~7 列以内
- 超长信息通过详情抽屉承载，不在表格塞满

## 6.5 Drawer / Dialog

- 优先用 Drawer 承载详情和轻编辑
- Dialog 用于确认或小型表单
- 浮层阴影要轻
- 浮层布局不要拥挤

## 6.6 Tabs

- Tabs 要简洁、轻量
- 当前项通过颜色和底边体现
- 不要过度粗重或大块填充

## 6.7 Cards

- 卡片优先承担概览、模块容器、设置分组
- 卡片内部留白充足
- 卡片之间间距统一

---

## 7. 动效与交互要求

### 7.1 动效原则

- 动效要轻，不做炫技
- hover、focus、展开收起、drawer 切换允许有轻微过渡
- 页面切换不做重动画

### 7.2 交互原则

- 所有操作应当清晰、直接
- 重要操作有明确反馈
- 异步加载、空状态、错误状态、无权限状态必须设计
- 不允许点击后无反馈

---

## 8. 模块规划要求（结合行业与 Vxture 平台）

统一 `console` 不是按数据库表拆，而是按业务域和用户任务拆。

### 8.1 一级模块建议

```txt
Overview
Workspace
Commerce
Platform
Usage
Settings
```

### 8.2 二级模块建议

#### Overview
- Dashboard
- 最近活动（预留）
- 关键统计（预留）

#### Workspace
- Members
- Roles & Permissions
- Organization
- Access Control

#### Commerce
- Subscription
- Billing
- Invoices
- Payments
- Quotas

#### Platform
- Tenants（平台用户可见）
- Products
- Pricing
- Models
- Agent / Service Access（预留）

#### Usage
- Usage Overview
- Consumption Records
- Resource Statistics

#### Settings
- Tenant Settings
- Notification Settings
- Integration Settings（预留）
- Profile / Preferences

---

## 9. 当前阶段重点模块

第一阶段不要求一次把所有模块做完。

优先实现以下模块：

1. Dashboard
2. Members
3. Roles & Permissions
4. Subscription
5. Billing
6. Quotas
7. Tenant Settings

平台级模块第二阶段补充：

- Tenants
- Products
- Pricing
- Models

---

## 10. 角色与视图要求

统一 `console` 通过权限和 capability 区分视图，而不是拆成两个应用。

### 10.1 平台运营视图
可见：

- Tenants
- Products
- Pricing
- Models
- 全局订阅与账单能力

### 10.2 租户管理员视图
可见：

- Members
- Roles & Permissions
- Subscription
- Billing
- Invoices
- Payments
- Quotas
- Tenant Settings

### 10.3 租户普通成员视图
可见：

- 受限模块
- 个人相关设置
- 只读或有限操作

要求：

- 菜单根据 capability 动态生成
- 路由守卫根据 capability 控制
- 按钮级操作根据 permission 控制

---

## 11. 首页 Dashboard 设计要求

首页必须简洁，不允许做成拥挤大屏。

建议包含：

- 当前 workspace / tenant 概览
- 关键订阅状态
- 当前额度 / 配额状态
- 账单提醒 / 发票提醒
- 快捷入口
- 最近活动（预留）

禁止：

- 大面积无意义图表
- 一屏放很多统计卡
- 过度运营看板化

---

## 12. Members 页面设计要求

这是第一批核心示例页面，必须做好。

要求：

- 顶部有页面标题与 Add Member 按钮
- 提供搜索与筛选
- 表格只保留关键列，例如：姓名 / 邮箱 / 角色 / 状态 / 最近活跃 / 操作
- 点击一行可打开右侧 Drawer 查看详情
- 编辑、禁用、重置邀请等操作收纳到更多菜单中
- 页面视觉要简洁、现代、轻量

---

## 13. Subscription / Billing 页面设计要求

此类页面要重点参考现代 SaaS 计费控制台，而不是传统财务系统。

要求：

- 先呈现当前套餐、状态、有效期、额度摘要
- 再呈现账单 / 发票 / 支付记录
- 信息优先级清晰
- 不要一上来就是大表格

建议结构：

```txt
当前订阅概览卡片
套餐明细 / 升降配入口
近期账单列表
发票记录
支付方式
```

---

## 14. 设计系统约束

Codex 在编码时必须遵循：

- 优先使用 `@vxture/design-system`
- 不允许在业务页面随意写一套新的按钮、输入框、Tabs、Dialog 样式
- 所有页面必须复用统一 shell 风格
- 所有颜色、间距、圆角、阴影尽量抽到 token
- 不允许硬编码大量随机样式值

---

## 15. 实现约束

### 15.1 前端层约束

`portals/console` 只负责：

- 页面布局
- 路由
- 用户交互
- 调用 `console-bff`

禁止：

- 直接调用 services
- 直接访问数据库
- 写后端业务规则

### 15.2 BFF 层约束

`bff/console-bff` 负责：

- auth session
- tenant context
- capabilities
- response shaping

禁止：

- 承载复杂 UI 逻辑
- 承载大段核心业务规则

这与当前 monorepo 架构和包边界规则保持一致。fileciteturn0file0turn0file1turn0file2

---

## 16. Codex 实施顺序要求

### 第一阶段

先完成基础框架：

- Console shell
- Header
- Sidebar
- Route layout
- Auth guard
- Tenant switcher 占位
- Capability-based menu

### 第二阶段

完成核心页面：

- Dashboard
- Members
- Roles & Permissions
- Subscription
- Billing
- Quotas

### 第三阶段

补充平台模块：

- Tenants
- Products
- Pricing
- Models
- Usage
- Settings

---

## 17. 最终效果要求

最终 UI 应呈现以下感受：

- 第一眼是现代 SaaS 控制台，而不是传统后台
- 颜色轻、留白足、科技感明确
- 模块清楚、层级清楚、操作清楚
- 平台级与租户级内容统一在一个 console 中，但不会混乱
- 后续可以继续扩展私有化 preset 与 capability 裁剪

---

## 18. 给 Codex 的一句话指令

请基于以下要求实现 `portals/console`：

- 风格参考 Vercel Dashboard 的结构与留白，但不要顶部灰色区域
- 视觉参考 Material Design 的清晰和组件秩序，但不要照搬 Material 视觉体系
- 整体使用浅色、轻科技感、现代 SaaS 控制台风格
- 模块按 Workspace / Commerce / Platform / Usage / Settings 规划
- 统一使用 `@vxture/design-system`
- 优先完成 shell、Dashboard、Members、Subscription、Billing、Quotas 等核心模块
- 不要做传统 admin 风，不要做重表格风，不要做微软式厚重后台
