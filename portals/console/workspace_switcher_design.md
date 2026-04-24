请为当前 console 实现一个完整的 Workspace Switcher，作为平台顶部的全局工作空间入口。参考 GitHub 的账号切换弹层交互方式，但视觉风格使用浅色、简洁、科技感的 SaaS console 风格，而不是照搬 GitHub 视觉。

重要业务前提（必须严格遵守）：
1. 在本平台中，workspace 可以理解为“租户空间”
2. organization = tenant，二者一对一，不单独设计 organization 业务模型
3. 用户切换 workspace，本质上就是切换 currentTenantId
4. UI 层统一使用 workspace 命名
5. 数据与权限层仍然使用 tenant 作为核心业务实体
6. 所有业务访问都基于当前 tenantId

用户规则（必须实现对应逻辑）：
1. 自主注册用户：
   - 注册后必须先拥有一个 personal workspace（即个人租户）
   - 在此基础上，可继续创建多个 organization workspace
   - 也可加入其他 workspace
2. 受邀注册用户：
   - 初始没有 personal workspace
   - 默认绑定邀请来源 workspace
   - 后续支持自建一个 personal workspace
3. 一个用户可能拥有多个 workspace，因此顶部必须支持切换
4. 用户在任一时刻只能有一个 current workspace

目标：
实现一个顶部 Workspace Switcher，支持：
- 当前 workspace 展示
- 多 workspace 切换
- 创建 workspace
- 在没有 personal workspace 时创建 personal workspace
- 管理 workspace 入口
- 加入 workspace 入口预留
- 后续可无缝替换为真实 API

请先分析当前 console 结构，再按以下要求设计并直接生成代码。

---

# 一、产品语义与命名约定

请遵循以下命名原则：

产品/UI 命名：
- Workspace
- Workspace Switcher
- Current Workspace
- Create Workspace
- Manage Workspace

实现/数据层命名：
- tenant
- tenantId
- tenantList
- currentTenantId
- tenant membership

要求：
1. UI 文案统一使用 workspace
2. 代码实现中可以使用 tenant 作为核心实体
3. 组件名可使用 WorkspaceSwitcher
4. store/context 可以命名为 WorkspaceContext 或 TenantContext，但要保持清晰统一
5. 不要再额外引入 organization 独立模型

---

# 二、实现范围

请实现以下模块：

1. 顶部入口组件
- WorkspaceSwitcher

2. 弹出面板
- WorkspaceSwitcherPanel

3. 列表项组件
- WorkspaceSwitcherItem

4. 创建弹窗
- CreateWorkspaceDialog

5. 全局上下文与状态
- WorkspaceContext / useWorkspace
或
- TenantContext / useWorkspace

6. mock 数据与本地示例

7. 顶部 header 接入示例

---

# 三、数据模型设计

请定义清晰的类型，至少包含：

- Tenant
- TenantMembership
- WorkspaceListItem
- WorkspaceContextState

建议字段如下：

Tenant:
- id: string
- name: string
- slug: string
- avatar?: string
- type: "personal" | "organization"
- ownerId: string
- createdAt: string

TenantMembership:
- userId: string
- tenantId: string
- role: "owner" | "admin" | "member"
- status: "active" | "pending" | "disabled"

WorkspaceListItem:
- id: string
- name: string
- slug: string
- avatar?: string
- type: "personal" | "organization"
- role: "owner" | "admin" | "member"
- isCurrent: boolean

WorkspaceContextState:
- currentTenantId: string | null
- currentWorkspace: WorkspaceListItem | null
- workspaceList: WorkspaceListItem[]
- hasPersonalWorkspace: boolean
- switchWorkspace: (workspaceId: string) => void
- createWorkspace: (payload) => Promise<void>

说明：
1. workspace 是产品视角
2. tenant 是底层业务视角
3. 不要把模型设计复杂化，但要为未来 API 对接留好扩展点

---

# 四、顶部入口设计（WorkspaceSwitcher）

请在 console 顶部 header 中实现一个紧凑的切换入口，作为全局主入口之一。

展示内容：
- 当前 workspace 头像
- 当前 workspace 名称
- 下拉箭头

交互要求：
1. 点击后打开弹出面板
2. 再次点击可关闭
3. 点击面板外部关闭
4. Esc 可关闭
5. 当前 workspace 名称过长时做省略
6. 组件应支持在窄宽度 header 中正常使用

样式要求：
- 高度紧凑
- 不要使用厚重边框
- hover 有轻微背景变化
- 当前状态清晰但不突兀

---

# 五、弹出面板设计（核心）

弹出面板参考 GitHub 账号切换弹层的交互结构，但不要照搬视觉。请采用浅色 SaaS 风格，布局清晰，留白合理。

面板尺寸建议：
- 宽度：320px ~ 360px
- 最大高度受限
- 中间列表区域可滚动
- 与触发器对齐，并考虑视口边界

面板分为 4 个区域：

## A. Header 区
包含：
- 标题：Switch workspace / 切换工作空间
- 关闭按钮

要求：
- 简洁紧凑
- 标题清晰
- 关闭按钮弱化但可见

## B. Current Workspace 区
用于高亮显示当前 workspace

展示：
- 头像
- 名称
- 类型标签（Personal / Organization）
- “当前使用中”状态
- 可带勾选态

要求：
- 视觉上区别于普通列表项
- 像一个轻卡片或高亮列表项
- 不要使用很重的边框

## C. Workspace List 区
展示用户可访问的所有 workspace

内容：
- 若存在 personal workspace，则展示
- 展示所有 organization workspace
- 当前项高亮
- 列表较长时可滚动

每个列表项包含：
- 头像/首字母图标
- workspace 名称
- 类型标签
- 用户角色（owner/admin/member）
- 当前项勾选态

交互要求：
1. 点击某项后切换 workspace
2. 切换成功后关闭面板
3. 更新全局 context
4. 同步更新路由
5. 后续可扩展为调用真实接口

## D. Action 区
作为底部操作区，提供能力入口：

至少包含：
- Create workspace
- Create personal workspace（仅当用户没有 personal workspace 时显示）
- Join workspace（先做预留入口，可仅输出占位行为）
- Manage workspace（跳转到设置页）

要求：
- 与列表区视觉分开，但尽量用留白而不是重分割线
- 作为按钮组或操作项组
- 样式要清爽

---

# 六、关键业务逻辑（必须落实）

## 1. Workspace 切换逻辑
点击列表项时，执行：

- 更新 currentTenantId
- 更新 currentWorkspace
- 关闭弹层
- 同步路由到当前 workspace 对应路径

建议路由方式：
- /workspace/:slug
或
- /t/:slug

请根据当前 console 路由风格选择更合适的一种，并说明原因。

另外，请预留以下扩展能力：
- API 请求头自动注入 tenantId
- 页面级权限重新校验
- tenant 不可访问时自动 fallback

## 2. Personal Workspace 特殊规则
必须支持以下逻辑：

- 自主注册用户默认已有 personal workspace
- 受邀注册用户初始可能没有 personal workspace
- 当用户没有 personal workspace 时：
  - 面板中显示 “Create personal workspace”
- 一个用户最多只能有一个 personal workspace
- 创建 personal workspace 成功后：
  - 自动加入 workspace 列表
  - 自动切换到该 workspace

## 3. Create Workspace 逻辑
CreateWorkspaceDialog 至少包含字段：
- name
- slug
- type

type 规则：
- 默认创建 organization workspace
- 若走 “Create personal workspace” 入口，则 type 固定为 personal

创建成功后：
- 插入 workspaceList
- 自动切换到新 workspace
- 关闭 dialog
- 关闭 switcher panel

## 4. 权限相关
需要体现基础权限差异：

- owner：admin：可看到 Manage workspace
- member：可切换，但管理能力可弱化或禁用
- 暂不实现复杂权限系统，但组件与类型设计要可扩展

---

# 七、UI 风格要求

整体风格要求：
- 浅色主题
- 白色 / 浅灰 / 极浅蓝为主
- 科技感、现代化、简洁
- 不要 GitHub 那种偏厚重灰调
- 不要强分割线
- 通过留白、分组、轻背景区分层次

具体要求：
1. 圆角 12~16px
2. 小阴影，轻悬浮感
3. hover 有浅背景反馈
4. 当前项高亮明显但不刺眼
5. 列表项排版要整洁
6. 面板应有较好的密度，不松散也不拥挤

---

# 八、技术实现要求

请基于当前项目实际技术栈实现，不要写成脱离项目的独立 demo。

要求：
1. 使用 React + TypeScript
2. 优先复用当前 console 已有组件体系
3. 若当前项目已有基础组件，请优先复用：
   - Popover / Dropdown
   - Dialog
   - Avatar
   - ScrollArea
   - Button
4. 不要引入新的重型依赖
5. 组件拆分清晰，避免把所有逻辑塞在一个文件
6. 类型定义独立抽离
7. mock 数据单独文件管理
8. 代码风格与当前 console 保持一致
9. 保证后续易于接入真实 API

---

# 九、建议目录结构

请结合当前项目目录实际情况放置，但建议参考：

components/navigation/workspace-switcher/
- workspace-switcher.tsx
- workspace-switcher-panel.tsx
- workspace-switcher-item.tsx
- create-workspace-dialog.tsx
- types.ts
- mock.ts
- hooks.ts

stores/
- workspace-context.ts

如果当前项目已有更适合的目录，请按现有规范落地，但要说明原因。

---

# 十、输出顺序要求

请严格按以下顺序执行：

1. 先分析当前 console 结构，说明这个功能最适合接入 header 的哪里
2. 给出组件拆分方案
3. 给出状态流转方案
4. 给出路由切换方案
5. 给出 mock 数据结构
6. 然后生成完整代码
7. 最后补充接入说明：
   - 如何挂到 header
   - 如何替换 mock 为真实 API
   - 如何与登录态结合
   - 如何在请求层注入 tenantId
   - 如何为后续权限系统预留扩展点

---

# 十一、实现质量要求

请不要只做一个简单下拉菜单，而要实现一个真正可用的 Workspace Switcher。

要求最终结果具备：
- 完整交互
- 清晰状态管理
- 可扩展的数据模型
- 与当前 console 架构一致
- 方便后续接真实接口

如果当前项目中已有相似 header、popover、dialog、avatar、menu 组件，请优先复用，不要重复造轮子。