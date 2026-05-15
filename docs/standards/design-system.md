# Design System 使用规范

版本：1.3.0
日期：2026-05-15
范围：`portals/*`、`business/*`、`agent-studio/*` 以及其他前端消费者

Design System 是平台 UI 的规则层、基准层和通用能力层。应用端负责业务语义组装，不负责重新定义基础控件、底层 UI 引擎、设计 token 或通用模式。

## 1. 分层原则

| 层级 | 归属 | 允许内容 |
|------|------|----------|
| L0 Foundation | DS | token、字体、主题、密度、Tailwind `@theme` 映射 |
| L1 Primitive | DS | Button/Input/Card/Dialog/Icon 等基础组件 |
| L2 Platform Pattern | DS | DataTable、FilterBar、ActionMenu、Pagination、DialogForm、StatusBadge、MetricCard、通用 shell/page/table 模式 |
| L3 Portal Experience | Portal | 导航、门户 chrome、工作区体验、产品气质 |
| L4 Domain Assembly | 业务模块 | 业务实体页面的语义布局和状态组装 |
| L5 Runtime Dynamic | 调用现场 | 坐标、进度、背景图 URL、动画延迟等运行时值 |

应用可以组装 DS 能力，但不能把组装写成新的基础定义。

## 2. 合法使用方式

```tsx
import { Button, DataTable, DialogForm, Icon } from "@vxture/design-system";
import "@vxture/design-system/styles/globals.css";

<Button>
  <Icon name="search" size="sm" />
  搜索
</Button>;
```

允许的 DS 子入口只有：

- `@vxture/design-system`
- `@vxture/design-system/tokens`
- `@vxture/design-system/types`
- `@vxture/design-system/server`
- package exports 明确暴露的 `@vxture/design-system/styles/*`

## 3. 禁止事项

应用层禁止：

- 从 `@vxture/design-system/src/**` 或未授权子路径导入。
- 直接依赖或导入 `@phosphor-icons/react`、`lucide-react`、`react-icons`、`@radix-ui/*`。
- 手写 `button`、`input`、`select`、`textarea`、`table` 等基础控件。
- 定义 `--vx-*` CSS custom property。
- 新增硬编码颜色、字号、间距、圆角、阴影等设计值。
- 用 inline style 承载设计值。
- 在聚合入口文件里继续写具体规则，例如 `platform.css`、`console.css`、`admin-management.css`。

允许的应用 CSS 只表达业务组装语义，例如布局排列、状态组合、实体信息密度。若某个结构具备跨应用复用价值，先补 DS，再迁移应用调用。

## 4. AI 色彩语义

DS 1.3.0 引入 Quantum AI 色彩层。AI primitive 色阶只属于 DS Foundation，应用只能消费语义 token，不得直接引用 `--vx-color-ai-500`、`--vx-color-ai-cyan-500`、`--vx-color-spark-400` 或 `bg-vx-ai-500` 这类 primitive 工具类。
本批迁入不替换现有品牌主色，也不自动把 auth / shell 切换到 aurora 视觉；这些属于后续独立视觉决策。

| token | 用途 |
|------|------|
| `--vx-color-primary` | 产品主色：CTA、链接、焦点环、激活导航和品牌 chrome |
| `--vx-color-ai` | AI 专属 UI：模型徽章、助手 chrome、AI 生成标识、AI 导航入口 |
| `--vx-color-ai-cyan` | 仅与 `--vx-color-ai` 成对使用，用于 AI 渐变层次、图谱线条和内发光 |
| `--vx-color-spark` | 仅用于生成中、完成闪烁、token stream 等短暂动画瞬间 |
| `--vx-gradient-aurora` | 品牌级重点视觉：登录视觉面板、营销 hero、Agent 落地页；单屏最多一个 |

禁止把 `--vx-color-ai` 用作通用 CTA，禁止把 `--vx-color-spark` 用在静态表面。
`pnpm lint:design` 通过 `ds/no-app-ai-primitive-token` 阻止应用侧直接消费 AI primitive 色阶。

## 5. DS 不足时的处理

1. 确认 DS 没有对应 primitive、pattern 或 token。
2. 在 `packages/design/design-system/` 中补齐能力。
3. 从公共入口导出，必要时同步 style entry 和 guardrail 白名单。
4. 应用端改为消费 DS 能力。
5. 运行 `pnpm lint:design` 和受影响 package 的 `lint` / `type-check` / `build`。

禁止在应用端先临时实现，再计划以后回收。

## 6. AI 行为约束

AI 修改前端代码时必须：

- 优先从 `@vxture/design-system` 选择组件、Icon、token 和样式入口。
- 遇到 DS 不足时先补 DS 或明确记录缺口。
- 保持业务 class 为组装语义，不把基础控件、颜色、尺度写回应用层。
- 运行或记录对应验收命令。

## 7. 守卫命令

```bash
pnpm lint:design
pnpm --filter @vxture/design-system lint
pnpm --filter @vxture/design-system build
```

消费者变更还要运行对应应用的 `lint` / `type-check` / `build`。

## 8. 关联文档

- `packages/design/design-system/README.md`
- `docs/packages/design/design-system.md`
- `docs/audit/checklist-ds.md`
