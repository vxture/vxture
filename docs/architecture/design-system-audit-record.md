# Design System 审计记录

日期：2026-05-09  
范围：`@vxture/design-system` 包自身规范性，以及 `portals/*`、`agent-studio/*`、`business/*`、`packages/*` 对 DS 的使用规范性。  
目标：记录当前已完成收敛后的遗留问题，作为后续分批治理清单。

## 当前基线

- `pnpm lint:design` 当前通过。
- `portals/website/src/components/ui` 已清理，业务组件迁移到语义目录。
- `website` / `console` / `admin` / `ruyin` 均已通过 `@vxture/design-system/styles/globals.css` 引入 DS 全局样式。
- `lint:design` 已覆盖 `portals`、`packages`、`agent-studio`、`business`。
- `website` / `console` 不再维护应用层 `.vx-auth-*` / `.vx-captcha-*` 样式源。
- `console` / `admin` build 已恢复 lint/type 检查。
- `lint:design` 已新增 inline design style / native primitive / app `--vx-*` token definition / app hardcoded scale 检查，并通过 `scripts/guardrails/design-system-baseline.json` 锁住存量债务，禁止新增签名。
- 当前 `pnpm lint:design` 输出锁定 2866 个存量尺度命中；`scripts/guardrails/design-system-baseline.json` 记录 1011 个唯一存量尺度签名。应用层 `--vx-*` token 定义、业务源码原生基础控件、设计型 inline style 已全部清零；`px/rem/em` 应用尺度债务进入新增拦截和逐步缩减模式。
- `agent-studio/vela` 根布局已接入统一字体、ThemeProvider、FullscreenProvider；核心聊天组件已移除 inline design style 和原生基础控件。
- 源码扫描未发现业务源码直接导入 `@vxture/design-system/src/**`。
- 源码扫描未发现业务源码直接导入 `@phosphor-icons/react`、`lucide-react`、`react-icons`、`@radix-ui/*`；`lint:design` 已用 `ds/no-direct-ui-engine-imports` 禁止新增。

## 审计命令

```bash
pnpm lint:design
rg -n "@vxture/design-system" portals agent-studio business packages --glob "!packages/design/design-system/**"
rg -n "@vxture/design-system/" portals business agent-studio packages --glob "*.ts" --glob "*.tsx" --glob "*.css"
rg -n "#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(" portals packages agent-studio business --glob "!packages/design/design-system/**" --glob "!**/public/**"
rg -n "style=\{\{|<button|<input|<select|<textarea" portals/website/src portals/console/src portals/admin/src agent-studio/vela/src
rg -n -- "--vx-[\w-]+\s*:" portals business agent-studio --glob "*.css"
rg -n "@phosphor-icons/react|lucide-react|react-icons|@radix-ui/" portals business agent-studio --glob "*.ts" --glob "*.tsx"
rg -n "@phosphor-icons/react|lucide-react|react-icons|@radix-ui/" portals business agent-studio --glob "package.json"
```

## 维度一：DS 系统自身规范性

### DS-SYS-001：守卫脚本覆盖范围不足

优先级：P0  
状态：已修复。  
修复证据：`scripts/guardrails/check-design-system.mjs` 已扫描 `portals`、`packages`、`agent-studio`、`business`，并把前端源码规则从 portal 扩展到业务/agent 前端工作区。  
问题：`agent-studio/vela` 和 `business/ruyin` 的样式违规不会被 `pnpm lint:design` 拦截。  
修复方向：将 guardrail 扫描根扩展到所有前端/业务工作区：`portals`、`agent-studio`、`business`，必要时排除纯后端目录。  
验收标准：`business/ruyin/src/app/globals.css` 的硬编码颜色、字体会被当前规则捕获；`agent-studio/vela` 的 inline font/style 问题可被新规则或专项规则捕获。  
当前验收：`pnpm lint:design` 通过。

### DS-SYS-002：DS token 存在 TS 与 CSS 两套人工维护源

优先级：P0  
状态：已修复。  
修复证据：`styles/tokens.css` 是运行时 token 值源；`src/tokens/colors|spacing|radius|shadow|typography.ts` 已改为只暴露 `var(--vx-*)` 引用，不再重复维护 hex/px/shadow 值。`lint:design` 已新增 `ds/no-token-runtime-value-duplicates`，阻止 TS token 文件重新写运行时值。  
问题：TS tokens 只覆盖基础集合，CSS tokens 还包含 auth、shell、section、hero 等大量语义值，两边不是生成关系，存在漂移风险。  
修复方向：建立单一 token source。建议以结构化 TS/JSON 为源，生成 `tokens.css`、Tailwind `@theme` 映射和类型导出。  
验收标准：新增或修改 token 只能改一处源文件；构建生成 CSS 与类型；CI 校验生成产物一致。  
当前验收：`pnpm lint:design`、`@vxture/design-system` type-check/build 通过。

### DS-SYS-003：Tailwind `@theme` 只映射颜色，未完整映射 radius/spacing/shadow/typography

优先级：P0  
状态：已修复。  
修复证据：`tokens.css` 的 `@theme` 已补齐 `--spacing-vx-*`、`--radius-vx-*`、`--shadow-vx-*`、`--text-vx-*` 映射。  
问题：颜色已基本收敛，但间距、圆角、阴影、字号还没有完全进入 DS token 体系。  
修复方向：补齐 `--spacing-vx-*`、`--radius-vx-*`、`--shadow-vx-*`、`--text-vx-*` 等 Tailwind v4 token 映射，并迁移 DS 组件内部 class。  
验收标准：DS 基础组件不再依赖 Tailwind 默认设计尺度；应用层新增组件只能使用 `vx-*` token class 或 DS 组件。  
当前验收：`@vxture/design-system` type-check/build 通过。

### DS-SYS-004：DS 组件 CSS 内仍有硬编码布局尺度

优先级：P1  
状态：已修复。  
修复证据：`packages/design/design-system/src/styles/components.css` 中原有精确组件尺度已回收到 `tokens.css` 的 `--vx-component-metric-*` token，组件 CSS 只引用 `var(--vx-*)`。  
问题：这些值虽然在 DS 内部，但仍绕过 token 层，后续无法通过 density/theme 统一调整。  
修复方向：把组件级尺度提升为 semantic component tokens，例如 `--vx-button-radius`、`--vx-input-height`、`--vx-card-radius`。  
验收标准：`components.css` 的尺寸、圆角、阴影值均来自 `--vx-*` token。  
当前验收：`rg -n "\\b\\d+(?:\\.\\d+)?(?:px|rem|em)\\b|999px" packages/design/design-system/src/styles/components.css` 无结果；`@vxture/design-system` type-check/build 通过。

### DS-SYS-005：包导出与应用别名策略混用 dist/src

优先级：P1  
状态：已修复。  
修复证据：`@vxture/design-system` 已提供 `.`、`/tokens`、`/types`、`/server` 公共入口；portal dev/build alias 已从 `dist/index.mjs` 改为 `src/client.ts`，并通过 `transpilePackages` 编译 source。CSS 仍通过 package exports 暴露稳定样式入口。  
问题：JS 和 CSS 的消费边界不一致；本地开发依赖 DS 先 build，容易出现源码已改但消费方仍使用旧 dist 的问题。  
修复方向：统一开发与构建策略。可选方案：应用 dev 期使用 source + `transpilePackages`，生产使用 package exports；或在 dev-tools 中强制 DS watch build。  
验收标准：修改 DS 组件后，portal dev 无需手动 build 即可生效；CI 构建仍从 package 公共入口消费。  
当前验收：website/console/admin/ruyin/agent-studio-vela type-check/build 通过。

### DS-SYS-006：`@vxture/design-system/*` tsconfig wildcard 暴露了潜在深层导入通道

优先级：P1  
状态：已修复。  
修复证据：`portals/website/tsconfig.json`、`portals/console/tsconfig.json`、`portals/admin/tsconfig.json` 已删除 `@vxture/design-system/*` wildcard，只保留根入口类型映射。  
问题：虽然当前源码未发现深层导入，但 wildcard 会绕开“只从根入口导入”的规范。  
修复方向：删除应用 tsconfig 中的 DS wildcard，或只保留明确允许的 CSS 子路径类型映射。  
验收标准：业务代码只能 `import { Button } from '@vxture/design-system'`；样式只能按 package exports 允许路径导入。  
当前验收：源码扫描未发现 `@vxture/design-system/src/**` 或未授权 DS 深层导入。

### DS-SYS-007：DS 根入口整体注入 `"use client"`，客户端边界过粗

优先级：P1  
状态：已修复。  
修复证据：`tsup.config.ts` 只给 dist `index` 主组件入口注入 `"use client"`；`/tokens`、`/types`、`/server` 子入口保持 server-safe。source dev 入口使用 `src/client.ts`，不污染 server-safe 子入口。  
问题：tokens、types、utils 等本可 server-safe 的导出也被客户端化；Next Server Component 中引入类型/常量时容易扩大客户端边界。  
修复方向：拆分入口：`@vxture/design-system` 可保持组件客户端入口，同时提供 `@vxture/design-system/tokens`、`/types`、`/server` 等无 client 指令入口。  
验收标准：服务端可安全导入 token/type，不触发 client boundary。  
当前验收：`@vxture/design-system` build 生成 `index`、`tokens`、`types`、`server` 四个入口且无 client directive 警告。

### DS-SYS-008：Auth 样式双源重复治理

优先级：P0  
状态：已修复。  
修复证据：`.vx-auth-*`、`.vx-signup-*`、`.vx-captcha-*` 样式源已回收到 `packages/design/design-system/src/styles/auth.css`；`website` / `console` 应用层不再定义这些选择器。  
问题：登录模板已抽象，但样式仍存在 DS 与应用双源，后续 website/console/admin 登录视觉会继续漂移。  
修复方向：删除应用层重复 `.vx-auth-*` 样式，仅保留应用特有页面样式；如确有差异，回收到 DS props 或 auth semantic tokens。  
验收标准：`website`、`console` 不再定义 `.vx-auth-*`；登录页样式只由 DS auth.css 控制。

### DS-SYS-009：DS 文档与真实实现不一致

优先级：P1  
状态：已修复。  
修复证据：`docs/architecture/08-design-system.md` 已更新到 `Version 1.2.2`，样式入口、目录结构、消费者范围、AI 规则和 guardrail 禁止项与当前实现对齐。  
问题：文档无法作为开发约束依据，AI/人工开发会根据旧结构生成错误代码。  
修复方向：更新架构文档，并把 guardrail 规则、禁止项、允许项写入文档。  
验收标准：文档结构、包版本、导出入口、样式入口和实际文件一致。

### DS-SYS-010：DS 二级文档与包实现再次出现漂移

优先级：P2
状态：暂缓，等待文档体系规划统一处理。
证据：`packages/design/design-system/README.md` 仍写 `版本：3.0.0`、`最后更新：2026-03-12`、基础 UI 组件 `16个`；`docs/architecture/08-design-system.md` 写 `current: 18 components`；实际 `@vxture/design-system` 包版本为 `1.2.2`，`src/components/ui` 当前有 25 个 `.tsx` 组件。
问题：架构文档已基本对齐，但包 README 和组件数量说明会继续误导 AI/人工开发，尤其会弱化“DS 不足先补 DS”的执行依据。
修复方向：不在本轮单独修正文档内容，等待文档体系规划确定唯一文档源、同步规则和验收口径后统一处理；届时以 `package.json`、公共导出入口和 `src/components/ui` 实际清单为准，更新 `packages/design/design-system/README.md` 与 `docs/architecture/08-design-system.md`。
验收标准：DS README、架构文档、包版本、组件数量、公共导出清单一致；仓库中不再出现旧口径 `版本：3.0.0`、`16个`、`current: 18 components`。

### DS-SYS-011：DS 守卫只管源码 import，尚未约束应用依赖清单

优先级：P1
状态：待处理。
证据：业务源码未直接导入 `@phosphor-icons/react`、`lucide-react`、`react-icons`、`@radix-ui/*`，但 `portals/admin/package.json` 与 `portals/console/package.json` 仍声明 `@phosphor-icons/react`。
问题：源码 import 已收敛到 DS `Icon`，但依赖层没有封口；后续页面仍可绕过 DS 重新直接使用底层图标库，且依赖关系无法表达“底层 UI 引擎只属于 DS 内部”。
修复方向：扩展 `scripts/guardrails/check-design-system.mjs`，扫描 `portals/*`、`business/*`、`agent-studio/*` 的 `package.json`，禁止应用声明底层 UI 引擎依赖；`@phosphor-icons/react`、Radix、图标库等只能出现在 `@vxture/design-system`。
验收标准：`rg -n "@phosphor-icons/react|lucide-react|react-icons|@radix-ui/" portals business agent-studio --glob "package.json"` 无结果；新增应用依赖会被 `pnpm lint:design` 阻断。

## 维度二：DS 使用规范性

### DS-USE-001：`business/ruyin` 未接入 DS，仍是独立样式系统

优先级：P0  
状态：已修复。  
修复证据：`business/ruyin` 已加入 `@vxture/design-system`，根布局接入 `ThemeProvider` / `FullscreenProvider`，全局样式改为 DS globals，主页改用 DS Button/Card/Badge。  
问题：Ruyin 作为租户侧业务应用，应与 website/console 同登录态、同视觉系统，但当前 UI 完全独立。  
修复方向：为 `@vxture/ruyin` 增加 DS 依赖，引入 DS globals，删除私有颜色变量和按钮样式，使用 DS Button/Card/Badge/Layout。  
验收标准：`business/ruyin/src/app/globals.css` 不再定义颜色、字体、按钮基础样式；页面使用 DS 组件。  
当前验收：`@vxture/ruyin` type-check/build 通过。

### DS-USE-002：`agent-studio/vela` 大量 inline style，未组件化使用 DS

优先级：P1  
状态：已修复。  
修复证据：`agent-studio/vela/src/components/*` 核心聊天组件已改用语义 CSS class 与 DS Button/Badge/Textarea；`rg -n "style=\\{\\{|<button|<input|<select|<textarea" agent-studio/vela/src` 无结果。  
问题：虽然引入了 `@vxture/design-system/styles/globals.css`，但实际 UI 仍主要是手写样式，难以统一密度、主题和可访问性。  
修复方向：分批把常用结构回收为 DS 能力：ChatShell、MessageBubble、ToolCallCard、ConfirmDialog、InputComposer，或至少使用 DS Button/Input/Card/Badge。  
验收标准：agent-studio 基础交互不再依赖大段 inline style；ThemeProvider/DensityProvider 与门户一致。  
当前验收：`@vxture/agent-studio-vela` type-check/build 通过。

### DS-USE-003：`agent-studio/vela` 字体加载不完整

优先级：P1  
状态：已修复。  
修复证据：`agent-studio/vela/src/app/layout.tsx` 已按平台标准加载 Sora / Inter / Geist Mono 字体变量，并接入 `ThemeProvider`、`FullscreenProvider`；body 不再 inline 设置字体。  
问题：`var(--font-sans)` 依赖应用层加载器变量，Vela 未提供，实际字体可能回退不可控。  
修复方向：要么复用统一 AppFontProvider/RootLayout helper，要么在 Vela layout 中按平台标准加载字体变量。  
验收标准：所有前端应用字体加载逻辑一致，body 不再 inline 设置字体。

### DS-USE-004：console/admin 构建关闭了 lint/type 错误拦截

优先级：P0  
状态：已修复。  
修复证据：`portals/console/next.config.js` 与 `portals/admin/next.config.js` 已移除 `eslint.ignoreDuringBuilds`、`typescript.ignoreBuildErrors`。  
问题：即使 DS 使用违规或类型错误出现，build 也可能通过，削弱 DS 治理。  
修复方向：完成存量问题修复后关闭 ignore；短期至少在 CI 显式跑 `pnpm --filter @vxture/console type-check/lint` 与 admin 对应命令。  
验收标准：console/admin build 不忽略 lint/type；CI 失败能阻断违规合入。  
当前验收：`@vxture/console` 与 `@vxture/admin` lint/type-check/build 均通过。

### DS-USE-005：console/admin 全局 CSS 仍过大，平台样式没有完全回收 DS

优先级：P1  
状态：进行中。  
证据：`console/admin` shell、tabs、table、toolbar 与模块级尺寸/通知 token 已回收到 DS `platform.css` / `tokens.css`；应用层 `--vx-*` token 定义扫描为 0。DS 已补齐 `DataTable`、`FilterBar`、`ActionMenu`、`Pagination`、`DialogForm`、`StatusBadge`、`MetricCard` 并从公共入口导出。  
问题：全局 CSS 承载了大量 shell、表格、过滤器、弹窗、操作菜单、分页、业务模块样式，应用层仍在维护一套实际设计系统。  
修复方向：按模块抽出 DS 组件和语义样式：PageHeader、Toolbar、FilterBar、DataTable、ActionMenu、Pagination、StatusBadge、MetricCard、DialogForm。  
验收标准：portal globals.css 只保留业务页面级少量样式；通用控件样式进入 DS。
当前进展：console `MetricGrid` 已迁移到 DS `MetricCard`，`TableToolbar` 已迁移到 DS `FilterBar`，Billing/Dashboard 发票表格已迁移到 DS `DataTable`，Members/Roles 行操作已迁移到 DS `ActionMenu` 并删除旧菜单面板 CSS；Members/Roles 新建/编辑/删除/解绑等工作流弹窗已迁移到 DS `DialogForm`，应用侧不再自建这些弹窗 overlay/form。admin 高频列表和交易/AI/commercial 分页已统一使用 DS `Pagination`，Tenants/Verifications/Accounts/Products/ProductPlans/ProductSolutions/ServicePlans/PlatformUsers 行操作已迁移到 DS `ActionMenu`；Billing/Orders/Payments/Invoices/Subscriptions 交易域、Promotions/PromotionRedemptions/UsageMetering 商业运营域、Tickets/OpsTodos 运营支持域、TenantDetail 成员操作、AdminRoles/AdminPermissions/PlatformGovernance 权限治理操作、ModelGateway/ModelGrants AI 操作已迁移到 DS `ActionMenu`，应用侧不再维护这些页面的菜单展开状态；ModelGateway/ModelGrants 配置弹窗和 Payments 备注确认弹窗已迁移到 DS `DialogForm`；ServiceHealth 和 agent-studio/vela 工具调用结果表格已迁移到 DS `DataTable`；`portals/admin/src/modules` 已无 `vx-tenant-actions__menu` 手写菜单残留，admin/console/website/agent-studio/vela 业务源码已无原生 table 残留。

### DS-USE-006：admin/console/website 原生基础控件迁移到 DS

优先级：P1  
状态：已修复。  
证据：`rg -n "<(button|input|select|textarea)\\b" portals/admin/src portals/console/src portals/website/src agent-studio/vela/src -g "*.tsx"` 无结果。  
问题：DS 已有 Button/Input/Select/Checkbox/Badge/Card，但模块内仍手写原生控件和 class，交互状态、焦点、密度、禁用态不统一。  
修复方向：优先迁移列表页工具栏、筛选器、分页、行操作菜单和弹窗表单。DS 不足时先补 DS 能力，再迁移应用。  
验收标准：业务模块不再手写基础按钮/输入框样式；新增页面必须使用 DS primitives 或 DS 业务组件。  
当前验收：admin、console、website、agent-studio/vela 业务源码不再直接写原生 `button/input/select/textarea`；新增原生基础控件会被 `pnpm lint:design` 阻断。

### DS-USE-007：website 仍有若干 Tailwind 拼写错误/历史类

优先级：P0  
状态：已修复。  
修复证据：`SolutionSection.tsx`、`CTASection.tsx`、`StatsSection.tsx` 的 `tranvx-*` 已修复为 `translate-*`，guardrail 增加 `ds/no-known-tailwind-typo` 检查。  
问题：这些类明显是 `translate-*` 被错误替换，属于视觉行为 bug，且 guardrail 当前没有捕获。  
修复方向：立即修正为 Tailwind 正确类，并给 guardrail 增加已知 typo 检测。  
验收标准：`rg -n "tranvx"` 无结果；相关页面 hover/定位恢复正常。

### DS-USE-008：website 还有应用级 auth/signup/reset/verify 样式残留

优先级：P1  
状态：样式源已回收到 DS；认证页面组件形态仍需继续收敛。  
修复证据：`.vx-signup-*` 与 `.vx-captcha-*` 已回收到 DS auth 样式；website 的 `LoginForm`、`ResetPasswordForm`、`VerifyForm`、`SignupForm`、`SliderCaptcha` 与 console 的 `LoginForm`、`SliderCaptcha` 已迁移到 DS `Button` / `Input`，默认登录背景也从 inline 变量收回到 DS `.vx-auth-page--default-bg`；`website` 仅保留法律内容页 `.vx-legal-*` 等非认证业务页面样式。  
问题：登录主模板已抽象，但注册、重置、验证、人机验证仍部分停留在 website 样式层。  
修复方向：把 signup/reset/verify/captcha 回收到 DS auth 模块，或建立 DS AuthFlow 子组件。  
验收标准：website auth 相关 CSS 不再自建基础控件样式，仅传配置、文案、回调。  
当前验收：website / console auth 组件已无原生 `button/input/select/textarea`，SliderCaptcha 仅保留滑块坐标类动态 inline style。

### DS-USE-009：docs 与目录说明仍鼓励应用级 `ui/`

优先级：P1  
状态：已修复。  
修复证据：`portals/website/portals/website/DIRECTORY_STRUCTURE.md` 与 `portals/console/console_ui_framework.md` 已改为禁止应用自建 `ui/` / `primitives/` 基础组件目录，DS 不足时先补 DS。  
问题：与最新原则“优先 DS，不足先补 DS，禁止应用自建基础组件”冲突。  
修复方向：更新或废弃过期文档，明确应用侧只能有语义业务组件目录。  
验收标准：文档中不再出现建议应用自建基础 primitives 的表述。

### DS-USE-010：business/ruyin 不在当前 DS guardrail 扫描内，且违反颜色/字体规则

优先级：P0  
状态：已修复。  
修复证据：`business/ruyin/src/app/globals.css` 已改为导入 DS globals，不再维护私有颜色/字体/按钮样式。  
问题：这正是 DS 守卫要禁止的内容，但当前脚本未扫描 `business`。  
修复方向：与 DS-SYS-001 合并处理，扩展扫描根后再迁移 Ruyin。  
验收标准：扩展守卫后，未迁移的 Ruyin 会导致 `pnpm lint:design` 失败；迁移完成后通过。

### DS-USE-011：应用侧 inline style 规则分类与设计型收敛

优先级：P2  
状态：已修复。  
修复证据：`scripts/guardrails/check-design-system.mjs` 已新增 `ds/no-inline-design-style`，允许 CSS 变量、坐标、transform、背景图片等动态值，拦截颜色、字体、间距、圆角、阴影等设计值；存量设计型 inline style 已清零。  
问题：部分 inline style 是合理动态值，部分是基础样式逃逸；当前没有白名单/黑名单区分。  
修复方向：规则上只允许动态变量类 style，例如 CSS variable、坐标、百分比、背景图 URL；禁止颜色、字体、圆角、阴影、固定间距。  
验收标准：guardrail 能区分合理动态 style 与样式逃逸。  
当前验收：`pnpm lint:design` 通过；inline design style 存量签名为 0，baseline 仅保留应用 CSS 尺度债务。

### DS-USE-012：DS usage 约束尚未覆盖 native primitive 使用

优先级：P2  
状态：已修复。  
修复证据：`scripts/guardrails/check-design-system.mjs` 已新增 `ds/no-native-primitive` 与 `ds/no-native-table`，业务源码新增 `<button>`、`<input>`、`<select>`、`<textarea>`、`<table>`、`<thead>`、`<tbody>`、`<tr>`、`<th>`、`<td>` 会被拦截；native primitive 存量签名为 0。  
问题：应用可以绕过 DS 组件直接写原生控件，继续形成私有交互样式。  
修复方向：新增 lint 规则：业务模块默认禁止原生表单控件，允许 DS 内部、极少数无样式语义控件、或带注释白名单。  
验收标准：新增页面直接写原生基础控件会被拦截。  
当前验收：`pnpm lint:design` 通过；新增原生基础控件和原生表格会失败，native primitive 存量签名为 0。

### DS-USE-013：应用层存在绕过 DS 的底层 UI 引擎直接导入风险

优先级：P1  
状态：已修复。  
修复证据：admin shell 与 AI 模块已统一通过 DS `Icon` 使用 Phosphor 图标；`lint:design` 新增 `ds/no-direct-ui-engine-imports`，禁止应用层直接导入 `@phosphor-icons/react`、`lucide-react`、`react-icons`、`@radix-ui/*`。  
问题：即使 DS 已提供 Icon/Popover/Tooltip 等能力，应用仍可能直接 import 底层库，导致图标命名、尺寸、可访问性和后续替换策略不可控。  
修复方向：底层 UI 引擎只允许 DS 内部注册和封装，业务应用仅消费 `@vxture/design-system` 公共入口。  
验收标准：`rg -n "@phosphor-icons/react|lucide-react|react-icons|@radix-ui/" portals business agent-studio --glob "*.ts" --glob "*.tsx"` 无结果；新增直接导入会被 `pnpm lint:design` 阻断。

### DS-USE-014：应用层 `--vx-*` 私有 token 清零

优先级：P0  
状态：已修复。  
修复证据：`scripts/guardrails/check-design-system.mjs` 已新增 `ds/no-app-vx-token-definitions`，应用 CSS 新增 `--vx-*` token 定义会被拦截；存量应用层 `--vx-*` token 定义已迁移到 DS 或移除。  
证据：`rg -n --glob "*.css" -- "--vx-[\\w-]+\\s*:" portals/admin/src portals/console/src portals/website/src business agent-studio` 无结果。  
问题：应用层虽然大量使用 DS token 值，但仍通过 `--vx-console-*`、`--vx-admin-*`、`--vx-shell-*`、模块级 `--vx-*` 变量维护私有 token 层，等价于在应用内复制一套设计系统。  
修复方向：把跨应用 shell、table、toolbar、pagination、action menu、dialog form、metric card 等变量回收到 DS semantic/component tokens；业务确有临时局部变量时不得使用 `--vx-*` 前缀。  
验收标准：应用全局 CSS 不再新增 `--vx-*` token；baseline 中 `ds/no-app-vx-token-definitions` 数量保持为 0。

### DS-USE-015：应用 CSS 硬编码尺度缺少新增拦截

优先级：P1  
状态：已修复，存量逐步缩减。  
修复证据：`scripts/guardrails/check-design-system.mjs` 已新增 `ds/no-app-hardcoded-scale`，应用 CSS 新增硬编码 `px/rem/em` 设计尺度会被拦截；媒体查询、grid/minmax 等布局算法和 1px hairline 已按白名单处理。  
问题：应用全局 CSS 仍存在大量 `px/rem/em` 尺寸、间距、字号、圆角、阴影等设计尺度，容易绕过 DS token 和组件语义样式。  
修复方向：存量先通过 baseline 锁定，后续按模块迁移到 DS spacing/radius/typography/shadow token 或 DS 组件语义样式。  
验收标准：`pnpm lint:design` 能阻断新增硬编码尺度签名；baseline 中 `ds/no-app-hardcoded-scale` 数量随模块迁移持续下降。  
当前验收：`pnpm lint:design` 通过；`design-system-baseline.json` 当前记录 1011 个唯一存量尺度签名。

### DS-USE-016：应用依赖清单仍可绕过 DS 引入底层 UI 引擎

优先级：P1
状态：待处理。
证据：`portals/admin/package.json` 与 `portals/console/package.json` 仍声明 `@phosphor-icons/react`；当前源码没有直接 import，但依赖清单仍暴露绕过 DS 的入口。
问题：DS 使用合规不能只看源码 import，也要看依赖边界。应用一旦直接依赖图标库或 Radix 等底层 UI 引擎，就会削弱 DS 对图标命名、尺寸、可访问性、主题和替换策略的控制。
修复方向：删除应用层底层 UI 引擎依赖；需要图标、弹层、选择器、Tooltip、Popover 等能力时，统一通过 `@vxture/design-system` 公共入口消费。DS 不足时先补 DS，再迁移应用调用。
验收标准：应用 `package.json` 不再声明 `@phosphor-icons/react`、`lucide-react`、`react-icons`、`@radix-ui/*`；应用源码只从 `@vxture/design-system`、`@vxture/design-system/tokens`、`@vxture/design-system/types`、`@vxture/design-system/server` 和允许的 `styles/*` 入口消费 DS。

### DS-USE-017：DS 消费者质量门禁没有覆盖所有前端应用

优先级：P1
状态：待处理。
证据：`website` / `console` / `admin` 的 lint 与 type-check 已通过；`agent-studio/vela` 的 `lint` 脚本当前只是 `echo "No lint yet"`，无法提供真实源码检查。
问题：agent-studio 已成为 DS 消费者并被 `lint:design` 扫描，但常规 lint 门禁缺失会让 React、可访问性、未使用代码、Hook 规则等问题绕过应用级质量门。
修复方向：为 `@vxture/agent-studio-vela` 接入与 portal 一致的 ESLint 配置和 lint 脚本；CI/本地验收统一执行 `type-check`、`lint`、`build` 与 `pnpm lint:design`。
验收标准：`pnpm --filter @vxture/agent-studio-vela lint` 执行真实 ESLint 检查并通过；所有 DS 消费者都具备一致的 `type-check` / `lint` / `build` 门禁。

### DS-USE-018：DS 应用调用合规需要形成允许入口白名单

优先级：P1
状态：待处理。
证据：当前扫描未发现未授权 DS 深层导入，应用样式只从 `@vxture/design-system/styles/globals.css` 引入；但规则仍主要依赖正则扫描，缺少明确白名单文档和 package export 对照。
问题：随着 `/tokens`、`/types`、`/server`、`styles/*` 子入口增加，应用侧容易把“允许的公共子入口”和“禁止的内部深层路径”混淆。
修复方向：在 DS 文档和 guardrail 中固化允许入口白名单：`@vxture/design-system`、`/tokens`、`/types`、`/server`、`/styles/globals.css` 以及经 package exports 明确暴露的样式入口；其他 `@vxture/design-system/*` 默认禁止。
验收标准：新增 `@vxture/design-system/src/**` 或未列入白名单的 `@vxture/design-system/*` 导入会失败；文档、package exports、tsconfig alias 与守卫脚本三者保持一致。

## 下一轮任务清单

1. P0：建立应用层 `--vx-*` token definition guardrail，用 baseline 锁住历史债务，禁止新增私有 token。状态：已完成。
2. P0：把 shell/admin/console 根级 token 回收到 DS `tokens.css` 与 shell/component semantic tokens，先处理 `--vx-shell-*`、`--vx-console-*`、`--vx-admin-*`。状态：已完成。
3. P0：补齐 DS 高频业务组件：DataTable、FilterBar、ActionMenu、Pagination、DialogForm、StatusBadge、MetricCard。状态：已完成，组件已从 `@vxture/design-system` 公共入口导出；后续应用迁移按 P1 全局 CSS 压缩继续推进。
4. P0：优先迁移 admin 高频列表页和弹窗表单：Tenants、Accounts、Products、PlatformUsers、AdminPermissions。状态：已完成基础控件迁移；本轮已把相关分页控件收敛到 DS `Pagination`，并迁移 Tenants/Verifications/Accounts/Products/ProductPlans/ProductSolutions/ServicePlans/PlatformUsers 行操作到 DS `ActionMenu`。
5. P1：迁移 console 高频模块：Workspace Members/Roles、Account Profile/Organization、Subscription tabs。状态：已完成基础控件迁移；本轮已迁移共享统计卡、工具栏、发票表格、Members/Roles 行操作菜单和 Members/Roles 工作流弹窗到 DS 组合组件。
6. P1：迁移 website 剩余 native primitive：Cases、Footer、AgentMarketplace、ScrollToButton、SolutionSection。状态：已完成。
7. P1：收敛剩余 inline design style，确认动态 Canvas/坐标类例外是否可改为 DS utility 或 CSS class。状态：已完成设计型 inline 收敛；动态坐标/图片类 inline 继续允许。
8. P1：补充 app CSS 尺度值治理，禁止应用新增硬编码 `px/rem/em` 设计尺度，允许布局算法和媒体查询白名单。状态：已完成，当前锁定 1011 个唯一存量尺度签名。
9. P1：每完成一个模块迁移，更新 `design-system-baseline.json` 并在本记录中同步数量。状态：进行中，当前 baseline 仅承载尺度债务，inline/native/app token 维度为 0。
10. P1：继续压缩 admin/console 模块级表格、工具栏、弹窗表单和行操作菜单 CSS，优先迁移仍依赖业务全局 class 的列表页。状态：进行中；admin 高频行操作菜单已完成，console Workspace Members/Roles、admin AI 配置弹窗和 Payments 备注确认弹窗已迁移到 DS `DialogForm`。
11. P2：更新 DS README 与架构文档组件清单，修正旧版本号、旧组件数量和过期目录说明。状态：暂缓，等待文档体系规划统一处理。
12. P1：扩展 `lint:design` 到应用 `package.json` 依赖清单，禁止应用声明底层 UI 引擎依赖。状态：新增待处理。
13. P1：删除 admin/console 对 `@phosphor-icons/react` 的直接依赖，确保图标能力只通过 DS `Icon` 暴露。状态：新增待处理。
14. P1：为 `agent-studio/vela` 补真实 ESLint 门禁，纳入 DS 消费者统一 `type-check` / `lint` / `build` 验收。状态：新增待处理。
15. P1：把 DS 允许入口白名单写入文档和守卫脚本，统一 package exports、tsconfig alias 与应用导入规则。状态：新增待处理。

## 本轮任务清单（2026-05-10）

1. P2：降低 DS 文档同步任务优先级，标记为等待文档体系规划统一处理。状态：已完成，准备提交。
2. P1：扩展 `lint:design`，扫描应用 `package.json`，禁止应用声明底层 UI 引擎依赖。状态：待执行。
3. P1：移除 admin/console 对 `@phosphor-icons/react` 的直接依赖，保持图标能力只通过 DS `Icon` 暴露。状态：待执行。
4. P1：为 `agent-studio/vela` 接入真实 ESLint 门禁。状态：待执行。
5. P1：把 DS 允许入口白名单固化到守卫脚本，阻断未授权 `@vxture/design-system/*` 深层导入。状态：待执行。
6. P1：继续压缩 admin/console 全局 CSS 尺度债务；每完成一个模块迁移就更新 baseline。状态：待执行。

## 后续验收清单

- `pnpm lint:design` 扫描所有前端工作区并通过。
- `rg -n "tranvx" portals/website/src` 无结果。
- `rg -n "#[0-9a-fA-F]{3,8}\b|rgba?\(" business agent-studio portals --glob "!**/public/**"` 仅在 DS token owner 或允许位置出现。
- `rg -n -- "--vx-[\w-]+\s*:" portals business agent-studio --glob "*.css"` 的新增命中会被 `pnpm lint:design` 阻断。
- `rg -n "@/components/ui|components/primitives" portals business agent-studio` 无业务源码结果。
- `rg -n "@vxture/design-system/" portals business agent-studio packages --glob "*.ts" --glob "*.tsx" --glob "*.css"` 的结果仅允许 `/tokens`、`/types`、`/server` 和 package exports 暴露的 `styles/*`；无 `src/**` 或其他未授权深层导入。
- `rg -n "@phosphor-icons/react|lucide-react|react-icons|@radix-ui/" portals business agent-studio --glob "package.json"` 无应用依赖清单结果。
- `packages/design/design-system/README.md`、`docs/architecture/08-design-system.md`、`packages/design/design-system/package.json` 的版本、组件数量、导出入口一致。
- `agent-studio/vela` 提供真实 lint 脚本，并通过 `pnpm --filter @vxture/agent-studio-vela lint`。
- `website`、`console`、`admin`、`ruyin`、`agent-studio/vela` 均通过各自适用的 `type-check`、`lint`、`build`。
