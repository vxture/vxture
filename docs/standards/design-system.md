# Design System 使用规范

版本：1.2.2
日期：2026-05-14
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

## 4. DS 不足时的处理

1. 确认 DS 没有对应 primitive、pattern 或 token。
2. 在 `packages/design/design-system/` 中补齐能力。
3. 从公共入口导出，必要时同步 style entry 和 guardrail 白名单。
4. 应用端改为消费 DS 能力。
5. 运行 `pnpm lint:design` 和受影响 package 的 `lint` / `type-check` / `build`。

禁止在应用端先临时实现，再计划以后回收。

## 5. AI 行为约束

AI 修改前端代码时必须：

- 优先从 `@vxture/design-system` 选择组件、Icon、token 和样式入口。
- 遇到 DS 不足时先补 DS 或明确记录缺口。
- 保持业务 class 为组装语义，不把基础控件、颜色、尺度写回应用层。
- 运行或记录对应验收命令。

## 6. 守卫命令

```bash
pnpm lint:design
pnpm --filter @vxture/design-system lint
pnpm --filter @vxture/design-system build
```

消费者变更还要运行对应应用的 `lint` / `type-check` / `build`。

## 7. 关联文档

- `packages/design/design-system/README.md`
- `docs/packages/design/design-system.md`
- `docs/audit/checklist-ds.md`
