# Vxture 设计系统架构设计

公用设计系统，适用于运营管理平台、业务服务系统、智能体服务平台。
无业务逻辑，纯 UI 组件。

---

## 一、架构原则

### 1.1 核心原则

* **高内聚 (High cohesion)** - 每个模块职责单一
* **低耦合 (Low coupling)** - 模块间依赖最小化
* **分层架构 (Layered architecture)** - 清晰的层级划分
* **最小依赖 (Minimal dependencies)** - 仅引入必要的第三方库
* **可替换外部库 (Replaceable external libraries)** - 外部依赖可替换

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

### 1.4 Shared 包规则

* Design System **可以** 从 @shared 导入
* @shared **禁止** 依赖 Design System

---

## 二、技术选型

### 2.1 核心技术栈

* React 19 (Client Component)
* TypeScript 5.9
* TailwindCSS 4

### 2.2 第三方库

| 类别 | 库 | 说明 |
|------|-----|------|
| **Icons** | `@phosphor-icons/react` | 图标库 |
| **Theme** | `next-themes` | 主题管理 |
| **Components** | `shadcn/ui 源码 + Radix UI 基础` | 组件库 |
| **Utilities** | `clsx` | 条件类名 |
| | `tailwind-merge` | Tailwind 类名合并 |
| **Animations** | `tailwindcss-animate` | 动画效果 |

---

## 三、目录结构

```
src/
├── icons/                    # 图标系统
│   ├── icon-dictionary.ts    # 图标白名单（数组形式）
│   ├── icon-registry.ts      # 图标注册中心
│   ├── Icon.tsx              # 图标组件
│   ├── types.ts              # 图标类型定义
│   └── index.ts              # 导出入口（逐个导出）
├── components/               # 组件库
│   ├── index.ts              # 组件导出入口
│   └── ui/                   # UI 组件（16个常用组件）
│       ├── index.ts          # UI 组件导出入口
│       ├── avatar.tsx        # Avatar 组件
│       ├── badge.tsx         # Badge 组件
│       ├── breadcrumb.tsx    # Breadcrumb 组件
│       ├── button.tsx        # Button 组件
│       ├── card.tsx          # Card 组件
│       ├── checkbox.tsx      # Checkbox 组件
│       ├── dialog.tsx        # Dialog 组件
│       ├── dropdown-menu.tsx # Dropdown Menu 组件
│       ├── input.tsx         # Input 组件
│       ├── label.tsx         # Label 组件
│       ├── popover.tsx       # Popover 组件
│       ├── select.tsx        # Select 组件
│       ├── separator.tsx     # Separator 组件
│       ├── tabs.tsx          # Tabs 组件
│       └── tooltip.tsx       # Tooltip 组件
├── theme/                    # 主题系统
│   ├── index.ts              # 主题导出
│   ├── ThemeProvider.tsx     # 主题提供者
│   ├── useTheme.ts           # 主题 Hook
│   └── theme.types.ts        # 主题类型
├── tokens/                   # 设计 Tokens
│   ├── index.ts              # Tokens 导出
│   ├── colors.ts             # 颜色 Tokens
│   ├── spacing.ts            # 间距 Tokens
│   ├── radius.ts             # 圆角 Tokens
│   ├── shadow.ts             # 阴影 Tokens
│   └── typography.ts         # 排版 Tokens
├── styles/                   # 全局样式
│   ├── globals.css           # 全局样式
│   ├── variables.css         # CSS 变量
│   └── tailwind.css          # Tailwind 基础
├── hooks/                    # 自定义 Hooks（内部使用，不导出）
│   ├── index.ts              # Hooks 导出入口
│   └── useBreakpoint.ts      # 断点 Hook
├── utils/                    # 工具函数（内部使用，不导出）
│   └── cn.ts                 # 类名合并工具
└── index.ts                  # 统一导出入口
```

---

## 四、核心模块架构

### 4.1 图标系统 (Icons)

**职责：**
- 图标白名单管理（dictionary）
- 图标实现注册（registry）
- 图标组件入口（Icon）
- 类型定义（types）

**文件说明：**

- **icon-dictionary.ts** - 数组形式的图标白名单，带业务分组注释
- **icon-registry.ts** - 唯一直接导入 @phosphor-icons/react 的文件
- **Icon.tsx** - 使用 registry 渲染，空值合并操作符，无 if 校验
- **types.ts** - 完整类型定义（IconName, IconProps, IconWeight, IconSize, IconSizeMap）
- **index.ts** - 显式逐个导出，保证 API 稳定

---

### 4.2 Token 系统 (Tokens)

**职责：** 定义视觉设计基础

**要求：**
- tokens 必须是 readonly
- tokens 只包含设计值
- tokens 不包含逻辑
- 通过 tokens/index.ts 统一导出

**Token 类型：**
- `colors.ts` - 颜色系统（brand, gray）
- `spacing.ts` - 间距系统（xs, sm, md, lg, xl, 2xl）
- `radius.ts` - 圆角系统（sm, md, lg, xl, full）
- `shadow.ts` - 阴影系统（sm, md, lg）
- `typography.ts` - 排版系统（fontFamily, fontSize, fontWeight）

---

### 4.3 样式系统 (Styles)

**职责：**
- CSS Reset
- CSS Variables
- 全局基础样式
- Tailwind 基础配置

**文件：**
- `globals.css` - 引入 variables.css 和 tailwind.css，全局重置
- `variables.css` - CSS 变量定义（--vx-* 前缀）
- `tailwind.css` - Tailwind 指令（@tailwind base, components, utilities）

---

### 4.4 主题系统 (Theme)

**职责：** 管理 light / dark / system 主题

**实现：**
- `ThemeProvider.tsx` - 封装 next-themes ThemeProvider
- `useTheme.ts` - 重新导出 next-themes useTheme
- `theme.types.ts` - Theme 类型定义
- `index.ts` - 统一导出

---

### 4.5 组件系统 (Components)

**架构思想：**
```
DS Component
    ↓
shadcn/ui 思想 + Radix UI 基础
```

**当前阶段：** 使用 shadcn/ui 思想与 Radix UI 基础组件实现完整 UI 组件库

**组件文件结构：**
- `Button.tsx` - forwardRef，使用 cn 合并 class，默认 variant="default"，默认 size="default"
- `index.ts` - 统一导出组件和类型

**Button 变体：** default / destructive / outline / secondary / ghost / link

**Button 尺寸：** default / sm / lg / icon

**当前组件库（16个 UI 组件）：**

- `Avatar` - 用户头像组件
- `Badge` - 徽章组件
- `Breadcrumb` - 面包屑导航组件
- `Button` - 按钮组件
- `Card` - 卡片组件
- `Checkbox` - 复选框组件
- `Dialog` - 对话框组件
- `DropdownMenu` - 下拉菜单组件
- `Input` - 输入框组件
- `Label` - 标签组件
- `Popover` - 弹出框组件
- `Select` - 选择器组件
- `Separator` - 分隔线组件
- `Tabs` - 标签页组件
- `Tooltip` - 工具提示组件

---

### 4.6 工具函数 (Utils)

**cn() 工具：**
- 组合 clsx 和 tailwind-merge
- 解决 Tailwind 类名冲突
- 条件类名支持

**文件：** `utils/cn.ts`

---

### 4.7 自定义 Hooks

**useBreakpoint Hook：**
- 断点检测 Hook
- 支持响应式布局
- 导出类型：Breakpoint, UseBreakpointReturn

---

## 五、公共 API

**统一入口：** `src/index.ts`

**导出内容：**
- icons
- components
- theme
- tokens

---

## 六、代码质量规则

* 完整 TypeScript 支持
* 无循环依赖
* 单个文件 < 200 行
* 清晰的命名规范
* Design System 内无业务逻辑
* 所有模块必须有 index.ts 导出

---

## 七、架构特点

### 7.1 无业务逻辑
- 纯 UI 组件库
- 不包含业务逻辑
- 可独立于业务系统使用

### 7.2 分层架构
- **Foundation Layer** - tokens, styles, utils
- **Component Layer** - Icon, Button, Card 等 16 个 UI 组件
- 严格的依赖方向

### 7.3 可替换外部库
- Icons: @phosphor-icons/react → 可替换
- Theme: next-themes → 可替换
- Components: @radix-ui/react-* → 可替换
- 通过 registry/dictionary 模式隔离

---

## 八、使用规范

### 8.1 组件导入

```typescript
// 正确：统一入口导入
import { Icon, Button } from '@vxture/design-system';

// 错误：直接导入内部模块
import { Icon } from '@vxture/design-system/src/icons/Icon';
```

### 8.2 图标使用

**严格禁止直接使用 Phosphor Icons：**

```typescript
// 正确
<Icon name="user" size="lg" weight="bold" />

// 错误
import { UserIcon } from '@phosphor-icons/react';
<UserIcon size={24} />
```

---

## 九、维护说明

### 9.1 添加新组件

1. 在 `src/components/ui/` 下创建组件文件
2. 定义 TypeScript 类型和接口
3. 实现组件样式（使用 cn 工具）
4. 实现组件逻辑（使用 Radix UI 基础组件）
5. 在 `src/components/ui/index.ts` 中导出
6. 在 `src/index.ts` 中导出
7. 更新文档

### 9.2 添加新图标

1. 在 `src/icons/icon-dictionary.ts` 中添加到对应业务分组
2. 在 `src/icons/icon-registry.ts` 中添加 import 和映射
3. 确保两个文件分组一致

### 9.3 更新 Token

修改 `src/tokens/` 对应文件。

---

**最后更新：** 2026-03-05
**维护者：** vxture team
**文档版本：** 2.0.0
