# Vxture 设计系统架构

公用设计系统，适用于运营管理平台、业务服务系统、智能体服务平台。
无业务逻辑，纯 UI 组件。

---

## 一、架构概览

### 1.1 核心特点

* **无业务逻辑** - 纯 UI 组件库，可独立使用
* **分层架构** - Foundation → Component → Application
* **可替换外部库** - 通过 registry/dictionary 模式隔离第三方依赖
* **高内聚低耦合** - 模块职责单一，依赖最小化

### 1.2 四层逻辑架构

| 层级 | 说明 |
|------|------|
| **Application Layer** | 消费应用（使用 Design System 的应用） |
| **Component Layer** | DS 组件（Icon, Button, Card 等） |
| **Foundation Layer** | 基础层（tokens, styles, utilities） |
| **External Layer** | 第三方集成（@phosphor-icons/react, next-themes, @radix-ui/react-* 等） |

### 1.3 依赖方向

```
Application → Design System → Shared
Design System → Third-party libraries
```

---

## 二、目录结构

```
src/
├── icons/                    # 图标系统
│   ├── icon-dictionary.ts    # 图标白名单
│   ├── icon-registry.ts      # 图标注册中心
│   ├── Icon.tsx              # 图标组件
│   ├── types.ts              # 类型定义
│   └── index.ts              # 导出入口
├── components/               # 组件库
│   ├── index.ts              # 组件导出入口
│   └── ui/                   # UI 组件（16个常用组件）
├── theme/                    # 主题系统
│   ├── ThemeProvider.tsx     # 主题提供者（统一管理 theme + density）
│   ├── useTheme.ts           # 主题 Hook
│   └── theme.types.ts        # 主题类型
├── density/                  # UI 密度系统
│   ├── density.types.ts      # Density 类型定义
│   └── density.config.ts     # Density 配置
├── tokens/                   # 设计 Tokens
│   ├── colors.ts             # 颜色 Tokens
│   ├── spacing.ts            # 间距 Tokens
│   ├── radius.ts             # 圆角 Tokens
│   ├── shadow.ts             # 阴影 Tokens
│   └── typography.ts         # 排版 Tokens
├── styles/                   # 全局样式
│   ├── globals.css           # 全局样式
│   ├── variables.css         # CSS 变量（含 density 变量）
│   └── tailwind.css          # Tailwind 基础
├── hooks/                    # 自定义 Hooks（内部使用）
├── utils/                    # 工具函数（内部使用）
└── index.ts                  # 统一导出入口
```

---

## 三、核心模块

### 3.1 Tokens - 设计令牌

定义视觉设计基础：
- `colors.ts` - 颜色系统（brand, gray）
- `spacing.ts` - 间距系统（xs, sm, md, lg, xl, 2xl）
- `radius.ts` - 圆角系统（sm, md, lg, xl, full）
- `shadow.ts` - 阴影系统（sm, md, lg）
- `typography.ts` - 排版系统（fontFamily, fontSize, fontWeight）

**规则**：tokens 必须是 readonly，只包含设计值，不包含逻辑。

### 3.2 Styles - 样式系统

- `globals.css` - 全局重置，引入 variables 和 tailwind
- `variables.css` - CSS 变量定义（--vx-* 前缀），含 density 缩放
- `tailwind.css` - Tailwind 指令

### 3.3 Density - 密度系统

管理 UI 密度与布局尺度，支持三个级别：

| 级别 | 缩放 | 适用场景 |
|------|------|----------|
| `compact` | 0.875x | 小屏幕、高密度数据展示 |
| `default` | 1x | 默认，平衡展示 |
| `comfortable` | 1.125x | 舒适阅读、更大间距 |

**影响范围**：spacing、component height、padding、typography scale
**持久化**：localStorage 中存储 `vx-density`

### 3.4 Theme - 主题系统

统一管理 light / dark / system 主题和 UI 密度：

- `ThemeProvider.tsx` - 封装 next-themes，内置 DensityProvider
- `useTheme.ts` - 导出 `useTheme()` Hook

**Context 返回值**：
```typescript
{
  theme: "light" | "dark" | "system"
  setTheme: (theme: Theme) => void
  density: "compact" | "default" | "comfortable"
  setDensity: (density: Density) => void
}
```

### 3.5 Icons - 图标系统

- **icon-dictionary.ts** - 图标白名单，带业务分组
- **icon-registry.ts** - 唯一直接导入 @phosphor-icons/react 的文件
- **Icon.tsx** - 使用 registry 渲染
- **types.ts** - 完整类型定义

**使用规范**：禁止直接使用 Phosphor Icons，必须通过 `<Icon name="user" />`

### 3.6 Components - 组件系统

**架构思想**：
```
DS Component
    ↓
shadcn/ui 思想 + Radix UI 基础
```

**当前组件库（16个 UI 组件）**：
Avatar, Badge, Breadcrumb, Button, Card, Checkbox, Dialog, DropdownMenu,
Input, Label, Popover, Select, Separator, Tabs, Tooltip

**组件规范**：
- forwardRef
- 使用 cn 合并 class
- 默认 variant="default"，默认 size="default"

### 3.7 Utils - 工具函数

**cn() 工具**：组合 clsx 和 tailwind-merge，解决 Tailwind 类名冲突

---

## 四、技术选型

| 类别 | 技术 | 说明 |
|------|------|------|
| **核心** | React 19 + TypeScript 5.9 | 组件框架 |
| | TailwindCSS 4 | 样式框架 |
| **Icons** | `@phosphor-icons/react` | 图标库 |
| **Theme** | `next-themes` | 主题管理 |
| **Components** | `shadcn/ui 思想 + Radix UI` | 组件基础 |
| **Utilities** | `clsx`, `tailwind-merge` | 类名工具 |
| **Animations** | `tailwindcss-animate` | 动画效果 |

---

## 五、公共 API

**统一入口**：`src/index.ts`

**导出内容**：
- icons
- components
- theme
- tokens

---

## 六、使用规范

### 6.1 组件导入

```typescript
// 正确：统一入口导入
import { Icon, Button } from '@vxture/design-system';

// 错误：直接导入内部模块
import { Icon } from '@vxture/design-system/src/icons/Icon';
```

### 6.2 图标使用

```typescript
// 正确
<Icon name="user" size="lg" weight="bold" />

// 错误：禁止直接使用 Phosphor Icons
import { UserIcon } from '@phosphor-icons/react';
<UserIcon size={24} />
```

---

## 七、维护说明

### 7.1 添加新组件

1. 在 `src/components/ui/` 下创建组件文件
2. 定义 TypeScript 类型和接口
3. 实现组件样式（使用 cn 工具）
4. 实现组件逻辑（使用 Radix UI 基础组件）
5. 在 `src/components/ui/index.ts` 中导出
6. 在 `src/index.ts` 中导出
7. 更新文档

### 7.2 添加新图标

1. 在 `src/icons/icon-dictionary.ts` 中添加到对应业务分组
2. 在 `src/icons/icon-registry.ts` 中添加 import 和映射
3. 确保两个文件分组一致

### 7.3 更新 Token

修改 `src/tokens/` 对应文件。

---

## 八、代码质量规则

* 完整 TypeScript 支持
* 无循环依赖
* 单个文件 < 200 行
* 清晰的命名规范
* Design System 内无业务逻辑
* 所有模块必须有 index.ts 导出

---

**版本：2.2.0**
**维护者：vxture team**
**最后更新：2026-03-06**