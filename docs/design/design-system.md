# Design System 使用规范

**版本**：1.0.0
**日期**：2026-05-12
**范围**：所有应用层代码（`portals/*` · `agent-studio/*`）

> Design System 当前处于收敛与规范化阶段。本文档记录治理原则，约束 AI 生成代码和人工开发行为。

---

## 1. 核心原则

**应用侧所有 UI 必须且只能基于 `@vxture/design-system`。**

应用层（`portals/`、`agent-studio/`）禁止：

- 自建任何样式（CSS / CSS-in-JS / Tailwind class / inline style）
- 自建任何组件（Button、Modal、Table、Form 等，无论大小）
- 自建任何图标（SVG inline、自定义 icon 组件、字体图标）
- 复制或变体化 DS 组件（修改一两个属性后重新封装）
- 绕过 DS token 直接写颜色、间距、字体等视觉值

---

## 2. 合法的使用方式

```ts
// ✅ 从 DS 导入组件
import { Button, Table, Modal } from '@vxture/design-system';

// ✅ 从 DS 导入 token（用于极少数需要动态计算的场景）
import { tokens } from '@vxture/design-system/tokens';

// ✅ 从 DS 导入图标
import { IconUser, IconSettings } from '@vxture/design-system/icons';

// ✅ 组合 DS 提供的原子组件实现业务布局
// ✅ 通过 DS 组件的 props/variant/size 控制视觉差异
```

```ts
// ❌ 自建按钮
const MyButton = styled.button`background: #1677ff; ...`;

// ❌ 自建图标
const ArrowIcon = () => <svg>...</svg>;

// ❌ 绕过 DS 写样式
<div style={{ color: '#666', fontSize: 14 }}>

// ❌ 复制 DS 组件后修改
// （哪怕只改了 borderRadius 一个属性）
```

---

## 3. DS 当前提供的能力边界

| 类别 | 提供内容 | 应用侧操作 |
|------|---------|-----------|
| 组件 | 基础 UI 组件（Button / Input / Table / Modal 等） | 直接使用，传 props |
| 图标 | 统一图标库（`@vxture/design-system/icons`） | 直接导入，不得自建 |
| Token | 颜色 / 间距 / 字体 / 圆角等设计变量 | 引用 token，不得硬编码 |
| 主题 | 亮色 / 暗色 / 品牌色覆盖 | 通过 ThemeProvider 设置 |
| 布局 | 页面壳（Shell / Sidebar / Header）等容器 | 直接使用 |

> DS 正在收敛阶段，上表内容随 DS 版本更新。如某个能力 DS 尚未提供，走第 4 节流程请求添加，**不得在应用侧临时自建**。

---

## 4. DS 未覆盖场景的处理流程

当业务需要 DS 尚未提供的组件或样式时：

```
1. 确认 DS 确实没有对应组件 / token
      ↓
2. 在 packages/design/design-system/ 中新增
      ↓
3. 在 DS 包内实现并通过 index.ts 导出
      ↓
4. 应用层从 DS 导入使用
```

**禁止的捷径**：在应用层临时实现，"等以后再提到 DS"。这条路径历史上已造成大量样式债务，是本规范要消灭的根本原因。

---

## 5. AI 行为约束

AI 在修改 `portals/*` 或 `agent-studio/*` 时，**必须**遵守：

1. 生成的所有 JSX 只能使用 `@vxture/design-system` 导出的组件
2. 生成的代码不得包含任何 `style={{...}}` 属性（极少数动画计算除外，需注释说明原因）
3. 生成的代码不得包含 `className` 属性（DS 组件内部管理样式）
4. 生成的代码不得包含任何 `<svg>` 元素或自定义 icon 函数
5. 生成的代码不得包含任何 CSS 文件或 CSS Module 文件
6. 如需某个 DS 中不存在的组件，**在回复中明确告知用户**，并建议走第 4 节流程，不得自行实现

违反上述规则的代码不得提交，AI 必须主动识别并拒绝生成。

---

## 6. 存量债务处理原则

当前代码库中存在一定量的应用侧自建样式和组件（历史遗留）。

处理策略：

- **不要在存量债务旁边继续堆叠新债务**
- 修改某个页面时，若该页面有自建样式，原地替换为 DS 等价实现
- 不做大规模批量重写——在功能迭代中逐步收敛
- 每次 PR 只负责本次改动涉及的模块，不跨模块清理

---

## 7. 关联文档

- `docs/packages/design-system.md` — DS 包技术实现约束
- `docs/architecture/08-design-system.md` — DS 架构层级规范
- `packages/design/design-system/` — DS 源码
