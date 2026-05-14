# Design System 审计记录

日期：2026-05-09  
范围：`@vxture/design-system` 包自身规范性，以及 `portals/*`、`agent-studio/*`、`business/*`、`packages/*` 对 DS 的使用规范性。  
目标：记录当前已完成收敛后的遗留问题，作为后续分批治理清单。

## 当前基线

- `pnpm lint:design` 当前通过。
- `portals/website/src/components/ui` 已清理，业务组件迁移到语义目录。
- `website` / `console` / `admin` / `ruyin` / `agent-studio/vela` 均已通过 `@vxture/design-system/styles/globals.css` 引入 DS 全局样式。
- `lint:design` 已覆盖 `portals`、`packages`、`agent-studio`、`business`。
- `website` / `console` 不再维护应用层 `.vx-auth-*` / `.vx-captcha-*` 样式源。
- `console` / `admin` build 已恢复 lint/type 检查。
- `lint:design` 已新增 inline design style / native primitive / app `--vx-*` token definition / app hardcoded scale 检查，并通过 `scripts/guardrails/design-system-baseline.json` 锁住存量债务，禁止新增签名。
- 当前 `pnpm lint:design` 通过；`scripts/guardrails/design-system-baseline.json` 的 `allowed` 为空数组。应用层 `--vx-*` token 定义、业务源码原生基础控件、原生表格、设计型 inline style、应用 CSS 硬编码尺度均进入零 baseline 新增拦截模式。
- `agent-studio/vela` 根布局已接入统一字体、ThemeProvider、FullscreenProvider；核心聊天组件已移除 inline design style 和原生基础控件。
- 源码扫描未发现业务源码直接导入 `@vxture/design-system/src/**`。
- 源码扫描未发现业务源码直接导入 `@phosphor-icons/react`、`lucide-react`、`react-icons`、`@radix-ui/*`；`lint:design` 已用 `ds/no-direct-ui-engine-imports` 禁止新增。
- DS `platform.css` 已拆分为稳定聚合入口和 `platform-*` 分层模块，后续可按 L2/L3/L4 边界逐模块收敛。
- DS `console.css` 已拆分为稳定 Console portal style pack 入口和 `console-*` 模块。
- admin `admin-shell.css` 已拆分为稳定聚合入口和 shell 模块；入口仅保留 `@import`。
- admin `admin-assistant.css`、`admin-permissions.css` 已拆分为稳定聚合入口和 domain 模块；入口仅保留 `@import`。
- admin `admin-service-health.css`、`admin-operations.css` 已拆分为稳定聚合入口和 domain 模块；入口仅保留 `@import`。
- admin `admin-management.css` 已拆分为稳定聚合入口和 domain 模块；入口仅保留 `@import`。
- admin `admin-management-commerce.css`、`admin-management-directory.css`、`admin-tenant-detail.css` 已拆分为稳定聚合入口和 domain 模块；入口仅保留 `@import`。
- admin `admin-management-models.css`、`admin-management-pills.css`、`admin-management-products.css` 已拆分为稳定聚合入口和 domain 模块；入口仅保留 `@import`。
- admin `admin-overview.css` 已拆分为稳定聚合入口和 overview domain 模块；入口仅保留 `@import`。
- website `globals.css` 已拆分为稳定聚合入口和 `website-*` 模块。
- Vela `globals.css` 已拆分为稳定聚合入口和 `vela-*` 模块。
- Ruyin `globals.css` 已拆分为稳定聚合入口和 `ruyin-*` 模块。
- `lint:design` 已用 `ds/no-style-entry-rules` 约束 DS style pack、admin shell、admin assistant、admin permissions、admin service health、admin operations、admin management 系列、admin overview、tenant detail 和应用 `globals.css` 大入口保持 import-only。

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

## DS/CSS 分层分级治理模型（2026-05-14）

### 治理目标

- DS 负责规则、基准、通用能力和可复用模式；应用端负责业务语义组装，不把所有页面细节下沉到 DS。
- “组装不是定义”：应用可以用业务 class 编排 DS 组件和语义类，但不得重新定义 DS primitive、底层 UI 引擎、`--vx-*` token 或基础视觉尺度。
- CSS 收敛以边界清晰为第一优先级，其次才是减少行数；行数下降必须来自分层和复用，不来自隐藏重复实现。

### 分层职责

1. L0 Foundation：归属 DS。包含 `tokens.css`、`typography.css`、`tailwind.css`、theme/density/font 基线。只定义平台级 token、字体、密度、主题变量。应用只能消费，不得定义 `--vx-*`。
2. L1 Primitive：归属 DS。包含 Button、Input、Select、Checkbox、Card、Badge、Icon、Dialog、基础表单控件等 React primitive 与 `.vx-*` 基础语义类。应用不得手写原生基础控件替代，也不得直接依赖图标库、Radix 等底层 UI 引擎。
3. L2 Platform Pattern：归属 DS。包含跨两个及以上应用复用的结构模式，例如 DataTable、FilterBar、ActionMenu、Pagination、DialogForm、StatusBadge、MetricCard、通用 page header/table toolbar/shell chrome 模式。命名必须保持平台语义，不能携带具体业务实体。
4. L3 Portal Experience：归属 portal。包含 admin/console/website/ruyin/agent-studio 的导航、工作区切换、门户 chrome、响应式布局和产品气质。可以组装 DS L1/L2，但不能新增基础 token、基础控件或通用 pattern 的第二实现。
5. L4 Domain Assembly：归属业务模块。包含租户、账单、权限、模型网关、运营治理等实体页面的业务语义布局、状态组合和局部信息密度。业务 class 只能表达语义编排，不能承载通用控件能力。
6. L5 Runtime Dynamic：归属调用现场。仅允许动态坐标、进度、CSS 变量赋值、背景图 URL、动画延迟等运行时值。设计型颜色、字号、间距、圆角、阴影不得以内联样式出现。

### 下沉判定

- 进入 DS：同一结构被两个及以上 portal/domain 复用；或它承载可访问性、主题、密度、焦点、键盘交互、图标规范等平台规则；或它是基础控件/表格/菜单/弹窗/分页/筛选器。
- 保留在 Portal：只体现某个应用的 chrome、信息架构、导航密度、工作区体验、品牌入口或首屏布局，且不应成为其他应用默认规范。
- 保留在 Domain：只与具体实体、权限、状态机、业务指标和数据组织有关；可使用 DS primitive/pattern，但不定义新的基础样式。
- 保留为 Runtime：值必须来自运行时数据或布局计算；如能提前写成 CSS token/class，就不应以内联方式存在。

### 命名与引用边界

- CSS custom property `--vx-*` 只由 DS 定义；应用 CSS 可以消费，但不得声明。
- DS 公共调用只允许 `@vxture/design-system`、`/tokens`、`/types`、`/server` 和 package exports 明确暴露的 `styles/*`；其他深层路径默认禁止。
- 应用 class 可以带门户/业务前缀表达组装语义，例如 `admin-*`、`console-*` 或历史 `vx-admin-*`，但这些 class 不构成 DS 公共契约。
- DS 中的 `platform.css` 只承载 L2 平台模式；若选择器出现强业务实体、单 portal 专属语义或页面级布局，应回退到 L3/L4。

### 全局验收规则

- `pnpm lint:design` 必须通过，且 `scripts/guardrails/design-system-baseline.json` 的 `allowed` 保持为空。
- 新增应用 CSS 不得定义 `--vx-*`，不得新增硬编码颜色、字号、间距、圆角、阴影等设计尺度。
- 新增业务源码不得直接写原生基础控件或原生表格；DS 不足时先补 DS，再迁移应用调用。
- 新增应用依赖不得声明 `@phosphor-icons/react`、`lucide-react`、`react-icons`、`@radix-ui/*` 等底层 UI 引擎。
- 每批次必须至少执行 `pnpm lint:design`、受影响 package 的 `lint` / `type-check` / `build`，并记录未执行项原因。

## 六批次执行计划（2026-05-14）

1. P0：固化分层模型与验收口径。范围：本审计清单、DS-USE 状态修正、六批次任务定义。验收：`git diff --check`、`pnpm lint:design` 通过；提交独立 commit。
2. P1：拆分 DS `platform.css`。状态：已完成机械拆分；`platform.css` 保持稳定聚合入口，具体规则分布到 core/account/notifications/tenant-settings/layout/models/access/shell/content 模块。后续继续逐模块判断 L2 留 DS、L3/L4 回 portal/domain。验收：DS lint/build、`pnpm lint:design`、admin build、console build 通过。
3. P1：重整 Console 样式边界。状态：已完成机械拆分；`console.css` 保持稳定公开入口，具体规则分布到 base/shell-layout/tenant-switcher/assistant/shell-chrome/responsive 模块。后续继续逐模块判定哪些是 Console L3 portal 体验，哪些可升级为 DS L2 平台模式。验收：DS lint/build、`pnpm lint:design`、console build 通过。
4. P1：继续收敛 Admin 管理域。状态：已完成机械拆分；`admin-shell.css` 已拆成 core/sidebar/nav/responsive/content/locale/compact 模块；`admin-assistant.css` 已拆成 panel/conversation/messages/composer/responsive 模块；`admin-permissions.css` 已拆成 core/tree/tree-node/dialog 模块；`admin-service-health.css` 已拆成 core/summary/catalog/responsive 模块；`admin-operations.css` 已拆成 controls/audit/announcements/skills/dialog/tickets 模块；`admin-management.css` 保持稳定聚合入口，具体规则分布到 core/directory/models/commerce/products/tenant-workspace 模块；`admin-overview.css` 已拆成 core/metrics/business/products/models/service/responsive 模块；`admin-management-commerce.css`、`admin-management-directory.css`、`admin-tenant-detail.css` 已按交易、目录、租户详情域拆分；`admin-management-models.css`、`admin-management-pills.css`、`admin-management-products.css` 已按模型、状态标识、产品服务域拆分。验收：admin build、`pnpm lint:design` 通过；大入口保持 import-only。
5. P1：补强分层 guardrail。状态：已完成；`ds/no-style-entry-rules` 已约束 DS/platform、DS/console、admin/console/website/ruyin/Vela globals、admin shell、admin assistant、admin permissions、admin service health、admin operations、admin management 系列、admin overview 和 tenant detail 大入口保持 import-only，`platform-*` 模块继续纳入 DS semantic CSS 约束。验收：`pnpm lint:design` 通过；baseline 仍为空。
6. P2：文档与模板同步。状态：进行中；文档体系已迁移到 `docs/packages` / `docs/standards` / `docs/audit`，本轮同步 DS README、包说明、使用规范、组件清单、包 exports、消费者规范。验收：版本、组件数量、公共导出入口一致；新应用模板默认接入 DS globals、ThemeProvider、质量门禁和 guardrail。

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
状态：已闭合，进入持续收敛。  
修复证据：`packages/design/design-system/src/styles/tokens.css` 已新增 `--vx-button-*`、`--vx-field-*`、`--vx-card-*`、`--vx-shell-*`、`--vx-switch-*` 等语义组件尺度 token；`packages/design/design-system/src/styles/components.css` 已清除对 `var(--vx-component-metric-*)` 的直接消费；`scripts/guardrails/check-design-system.mjs` 已新增 `ds/no-component-metric-in-ds-components-css`，禁止 DS 基础组件语义类绕过语义 token 层。  
问题：`--vx-component-metric-*` 现在只应作为 DS token 层的尺度兜底池，不应成为组件 CSS 或应用侧的直接使用契约；`platform-*` 分层模块中仍存在少量过渡性直用，后续需要按业务域逐步提升为 `--vx-<domain>-*` / `--vx-<component>-*` 语义 token。
修复方向：保持 `raw value -> component metric fallback -> semantic component token -> semantic class/component` 的分层关系。新增或修改 DS 组件时，必须先补语义 token，再在组件样式中消费；治理 `platform-*` 模块时按 L2/L3/L4 边界迁移，优先把重复 radius、font-size、gap、padding、shadow 抽成域语义 token。
验收标准：`components.css` 中 `var(--vx-component-metric-*)` 命中数持续为 0；新增 DS 语义类不得直接消费兜底 metric token；每轮 `platform-*` 治理都减少直接 metric token 命中或把命中提升为更明确的域语义 token。
当前验收：`rg -n -- "var\\(--vx-component-metric" packages/design/design-system/src/styles/components.css` 无结果；`pnpm lint:design`、`@vxture/design-system` type-check/build、website/console/admin/agent-studio-vela build 均通过。

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
修复证据：`docs/packages/design/design-system.md` 与 `docs/standards/design-system.md` 已承接 DS 包说明和使用规范；样式入口、目录结构、消费者范围、AI 规则和 guardrail 禁止项与当前实现对齐。  
问题：文档无法作为开发约束依据，AI/人工开发会根据旧结构生成错误代码。  
修复方向：更新包说明、使用规范与审计记录，并把 guardrail 规则、禁止项、允许项写入文档。  
验收标准：文档结构、包版本、导出入口、样式入口和实际文件一致。

### DS-SYS-010：DS 二级文档与包实现再次出现漂移

优先级：P2
状态：已修复，进入持续同步。
证据：`packages/design/design-system/README.md`、`docs/packages/design/design-system.md`、`docs/standards/design-system.md` 已同步到包版本 `1.2.2`、25 个 UI 组件、当前 package exports 和 CSS 分层入口；旧架构层 DS 专项文档已由文档体系迁移移除。
问题：包 README、包说明和使用规范一旦与实际实现漂移，会继续误导 AI/人工开发，尤其会弱化“DS 不足先补 DS”的执行依据。
修复方向：以 `package.json`、公共导出入口和 `src/components/ui` 实际清单为准；新增 DS export、style entry、组件或 guardrail 时同步 README、`docs/packages/design/design-system.md`、`docs/standards/design-system.md`、`docs/audit/checklist-ds.md`。
验收标准：DS README、包说明、使用规范、包版本、组件数量、公共导出清单一致；仓库中不再出现旧版本号、旧组件数量或已删除架构文档口径。

### DS-SYS-011：DS 守卫只管源码 import，尚未约束应用依赖清单

优先级：P1
状态：已修复。
修复证据：`scripts/guardrails/check-design-system.mjs` 已新增 `ds/no-app-ui-engine-dependencies`，扫描应用 `package.json` 并禁止声明 `@phosphor-icons/react`、`lucide-react`、`react-icons`、`@radix-ui/*`；`portals/admin` 与 `portals/console` 已移除 `@phosphor-icons/react` 直依赖。
原证据：业务源码未直接导入 `@phosphor-icons/react`、`lucide-react`、`react-icons`、`@radix-ui/*`，但 `portals/admin/package.json` 与 `portals/console/package.json` 曾声明 `@phosphor-icons/react`。
问题：源码 import 已收敛到 DS `Icon`，但依赖层没有封口；后续页面仍可绕过 DS 重新直接使用底层图标库，且依赖关系无法表达“底层 UI 引擎只属于 DS 内部”。
修复方向：扩展 `scripts/guardrails/check-design-system.mjs`，扫描 `portals/*`、`business/*`、`agent-studio/*` 的 `package.json`，禁止应用声明底层 UI 引擎依赖；`@phosphor-icons/react`、Radix、图标库等只能出现在 `@vxture/design-system`。
验收标准：`rg -n "@phosphor-icons/react|lucide-react|react-icons|@radix-ui/" portals business agent-studio --glob "package.json"` 无结果；新增应用依赖会被 `pnpm lint:design` 阻断。

## 维度二：DS 使用规范性

### DS-USE-001：`business/ruyin` 未接入 DS，仍是独立样式系统

优先级：P0  
状态：已修复。  
修复证据：`business/ruyin` 已加入 `@vxture/design-system`，根布局接入 `ThemeProvider` / `FullscreenProvider`，全局入口改为 DS globals + `ruyin-base.css` 组合，主页改用 DS Button/Card/Badge。
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
状态：已闭合，转入持续巡检。  
证据：`console/admin` shell、tabs、table、toolbar 与模块级尺寸/通知 token 已回收到 DS `platform.css` / `tokens.css`；DS 已补齐 `DataTable`、`FilterBar`、`ActionMenu`、`Pagination`、`DialogForm`、`StatusBadge`、`MetricCard` 并从公共入口导出。应用层 `--vx-*` token 定义、原生基础控件、原生表格、设计型 inline style 和硬编码尺度 baseline 均为 0。  
问题：历史上全局 CSS 承载了 shell、表格、过滤器、弹窗、操作菜单、分页等实际设计系统能力；当前主要风险已从存量违规转为新增页面重新自建控件、尺度或私有 token。  
修复方向：通用结构一律先补 DS，再迁移应用调用；应用 CSS 仅保留业务语义布局、状态编排和必要动态变量，不得定义 `--vx-*` token、不得写基础控件样式、不得新增硬编码设计尺度。  
验收标准：`pnpm lint:design` 通过且 baseline 为空；portal globals.css 不承担通用控件实现；新增列表、工具栏、弹窗、菜单、分页、表格必须优先使用 DS 组合组件。  
当前进展：console `MetricGrid` / `TableToolbar` / 发票表格 / Members-Roles 行操作与工作流弹窗已迁移到 DS；admin 高频列表、交易域、商业运营域、运营支持域、权限治理域、AI 配置域已迁移到 DS `ActionMenu` / `Pagination` / `DialogForm`；admin shell、assistant、permissions、service health、operations、overview、commerce、directory、tenant detail、models、pills、products 样式入口已拆为 import-only 聚合入口和分层 domain 模块；ServiceHealth 和 agent-studio/vela 工具调用结果表格已迁移到 DS `DataTable`。

### DS-USE-006：admin/console/website/ruyin/agent-studio 原生基础控件迁移到 DS

优先级：P1  
状态：已修复。  
证据：`rg -n "<(button|input|select|textarea)\\b" portals/admin/src portals/console/src portals/website/src business/ruyin/src agent-studio/vela/src -g "*.tsx"` 无结果。  
问题：DS 已有 Button/Input/Select/Checkbox/Badge/Card，但模块内仍手写原生控件和 class，交互状态、焦点、密度、禁用态不统一。  
修复方向：优先迁移列表页工具栏、筛选器、分页、行操作菜单和弹窗表单。DS 不足时先补 DS 能力，再迁移应用。  
验收标准：业务模块不再手写基础按钮/输入框样式；新增页面必须使用 DS primitives 或 DS 业务组件。  
当前验收：admin、console、website、ruyin、agent-studio/vela 业务源码不再直接写原生 `button/input/select/textarea`；新增原生基础控件会被 `pnpm lint:design` 阻断。

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
修复证据：`business/ruyin/src/app/globals.css` 已改为 import-only；Ruyin 应用级 body 基线移入 `business/ruyin/src/styles/ruyin-base.css`，仅消费 DS token，不再维护私有颜色/字体/按钮样式。
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
当前验收：`pnpm lint:design` 通过；inline design style 存量签名为 0，baseline 为空。

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

### DS-USE-015：应用 CSS 硬编码尺度零 baseline

优先级：P1  
状态：已修复，baseline 清零。  
修复证据：`scripts/guardrails/check-design-system.mjs` 已新增 `ds/no-app-hardcoded-scale`，应用 CSS 新增硬编码 `px/rem/em` 设计尺度会被拦截；媒体查询、grid/minmax 等布局算法和 1px hairline 已按白名单处理；`scripts/guardrails/design-system-baseline.json` 当前 `allowed: []`。  
问题：应用 CSS 硬编码尺度会绕过 DS token、密度和主题调节能力，是应用侧复制设计系统的主要入口之一。  
修复方向：保持零 baseline；新增尺寸、间距、字号、圆角、阴影必须使用 DS token、Tailwind `vx-*` token class 或 DS 组件语义样式。确需布局算法时使用白名单模式，并避免承载视觉设计值。  
验收标准：`pnpm lint:design` 能阻断新增硬编码尺度签名；baseline 保持为空。  
当前验收：`pnpm lint:design` 通过；`design-system-baseline.json` 当前无存量尺度签名。

### DS-USE-016：应用依赖清单仍可绕过 DS 引入底层 UI 引擎

优先级：P1
状态：已修复。
修复证据：`portals/admin/package.json`、`portals/console/package.json` 和 `pnpm-lock.yaml` 已移除应用层 `@phosphor-icons/react` 依赖；`pnpm lint:design` 已能阻断应用重新声明底层 UI 引擎依赖。
原证据：`portals/admin/package.json` 与 `portals/console/package.json` 曾声明 `@phosphor-icons/react`；当前源码没有直接 import，但依赖清单仍暴露绕过 DS 的入口。
问题：DS 使用合规不能只看源码 import，也要看依赖边界。应用一旦直接依赖图标库或 Radix 等底层 UI 引擎，就会削弱 DS 对图标命名、尺寸、可访问性、主题和替换策略的控制。
修复方向：删除应用层底层 UI 引擎依赖；需要图标、弹层、选择器、Tooltip、Popover 等能力时，统一通过 `@vxture/design-system` 公共入口消费。DS 不足时先补 DS，再迁移应用调用。
验收标准：应用 `package.json` 不再声明 `@phosphor-icons/react`、`lucide-react`、`react-icons`、`@radix-ui/*`；应用源码只从 `@vxture/design-system`、`@vxture/design-system/tokens`、`@vxture/design-system/types`、`@vxture/design-system/server` 和允许的 `styles/*` 入口消费 DS。

### DS-USE-017：DS 消费者质量门禁尚未完全一致

优先级：P1
状态：已修复，进入新增消费者持续巡检。
证据：`website` / `console` / `admin` / `agent-studio/vela` / `business/ruyin` / `agent-studio/agent-template` / `@vxture/design-system` 均已提供真实 lint 脚本；`agent-studio/agent-template` 的 `build` 已改为 `tsc --noEmit`，不再使用占位命令。
问题：历史上 `pnpm lint:design` 已覆盖 DS 规则，但常规 lint 门禁不一致会让 React、可访问性、未使用代码、Hook 规则等应用级质量问题绕过部分 DS 消费者。
修复方向：保持所有 DS 消费者具备 `type-check` / `lint` / `build` 门禁；新增前端应用或模板时，必须同步接入 ESLint、TypeScript、DS globals、ThemeProvider 与 `pnpm lint:design`。
验收标准：所有 DS 消费者的 lint 脚本都执行真实 ESLint 检查；`pnpm lint:design` 与受影响消费者的 `lint` / `type-check` / `build` 均可作为独立批次验收门禁。

### DS-USE-018：DS 应用调用入口白名单

优先级：P1
状态：已修复，需随 DS exports 持续同步。
证据：`scripts/guardrails/check-design-system.mjs` 已固化 `ALLOWED_DS_IMPORTS`：`@vxture/design-system`、`/tokens`、`/types`、`/server` 和明确允许的 `styles/*`；当前扫描未发现未授权 DS 深层导入，应用侧 DS 样式只从 `@vxture/design-system/styles/globals.css` 引入，本地样式通过应用 `globals.css` 聚合到分层模块。
问题：随着 `/tokens`、`/types`、`/server`、`styles/*` 子入口增加，应用侧容易把“允许的公共子入口”和“禁止的内部深层路径”混淆。
修复方向：每次新增 DS package export 时，同步更新 package exports、守卫白名单、消费者文档和 tsconfig alias 策略；其他 `@vxture/design-system/*` 默认禁止。
验收标准：新增 `@vxture/design-system/src/**` 或未列入白名单的 `@vxture/design-system/*` 导入会失败；文档、package exports、tsconfig alias 与守卫脚本三者保持一致。

## 第二维度任务清单

1. P0：应用侧 DS 入口白名单。状态：已完成；守卫只允许根入口、`/tokens`、`/types`、`/server` 和明确暴露的 `styles/*`，未授权深层导入会失败。
2. P0：应用侧底层 UI 引擎隔离。状态：已完成；源码 import 和 `package.json` 依赖清单均禁止直接使用 `@phosphor-icons/react`、`lucide-react`、`react-icons`、`@radix-ui/*`。
3. P0：应用侧私有 token / 原生控件 / 原生表格 / 设计型 inline style / 硬编码尺度。状态：已完成；`design-system-baseline.json` 为空 baseline，新增违规由 `pnpm lint:design` 阻断。
4. P1：应用通用 UI 组合能力回收到 DS。状态：已完成主要高频路径；DataTable、FilterBar、ActionMenu、Pagination、DialogForm、StatusBadge、MetricCard 已公共导出并被 admin/console/agent-studio/website 高频场景消费。
5. P1：DS 消费者质量门禁一致化。状态：已完成；website/admin/console/agent-studio/vela/business/ruyin/agent-studio/agent-template/@vxture/design-system 均有真实 lint，新增消费者继续按同口径巡检。
6. P1：持续巡检新增页面。状态：进行中；新增列表、表单、弹窗、菜单、分页、表格必须先复用 DS，不足时先补 DS 再落应用；portal 全局入口只做 import 聚合。
7. P2：DS README 与包说明组件清单同步。状态：已完成；README、`docs/packages/design/design-system.md`、`docs/standards/design-system.md` 与包版本、25 个 UI 组件、公共导出入口一致。

## 本轮梳理（2026-05-12）

1. 已确认：应用源码未发现未授权 DS 深层导入；DS 样式入口集中在 `@vxture/design-system/styles/globals.css`，应用 `globals.css` 只做 import 聚合。
2. 已确认：应用源码和应用 `package.json` 未发现底层 UI 引擎直接导入或直接依赖。
3. 已确认：应用侧 `--vx-*` token 定义、原生基础控件、原生表格扫描无结果。
4. 已确认：设计型 inline style 由 guardrail 区分，当前只保留坐标、进度、CSS 变量、背景图、动画延迟等动态值。
5. 已确认：`pnpm lint:design` 通过，`design-system-baseline.json` 为空 baseline。
6. 已完成：`business/ruyin` 和 `agent-studio/agent-template` 已接入真实 lint，DS 消费者质量门禁进入新增消费者巡检。

## 后续验收清单

- `pnpm lint:design` 扫描所有前端工作区并通过。
- `rg -n "tranvx" portals/website/src` 无结果。
- `rg -n "#[0-9a-fA-F]{3,8}\b|rgba?\(" business agent-studio portals --glob "!**/public/**"` 仅在 DS token owner 或允许位置出现。
- `rg -n -- "--vx-[\w-]+\s*:" portals business agent-studio --glob "*.css"` 的新增命中会被 `pnpm lint:design` 阻断。
- `rg -n "@/components/ui|components/primitives" portals business agent-studio` 无业务源码结果。
- `rg -n "@vxture/design-system/" portals business agent-studio packages --glob "*.ts" --glob "*.tsx" --glob "*.css"` 的结果仅允许 `/tokens`、`/types`、`/server` 和 package exports 暴露的 `styles/*`；无 `src/**` 或其他未授权深层导入。
- `rg -n "@phosphor-icons/react|lucide-react|react-icons|@radix-ui/" portals business agent-studio --glob "package.json"` 无应用依赖清单结果。
- `packages/design/design-system/README.md`、`docs/packages/design/design-system.md`、`docs/standards/design-system.md`、`packages/design/design-system/package.json` 的版本、组件数量、导出入口一致。
- `agent-studio/vela` 提供真实 lint 脚本，并通过 `pnpm --filter @vxture/agent-studio-vela lint`。
- `business/ruyin`、`agent-studio/agent-template` 与其他 DS 消费者均通过各自适用的 `type-check`、`lint`、`build`。
- 每批迁移后，变更范围对应的 DS/portal/domain package 必须独立验证并独立 commit。
