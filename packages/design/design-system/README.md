# Vxture Design System

公用设计系统，适用于运营管理平台、业务服务系统、智能体服务平台。
无业务逻辑，纯 UI 组件。

---

## 📦 快速开始

### 基础配置

```typescript
// 根布局文件
import { ThemeProvider } from '@vxture/design-system';
import '@vxture/design-system/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ThemeProvider defaultTheme="system" defaultDensity="default">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## 🎯 导入规范（必须遵守）

### ✅ 正确用法

```typescript
// 统一从入口导入
import {
  Icon, Button, Card, Input, Label,
  Container, Stack, Grid,
  FullscreenProvider, FullscreenContainer, FullscreenToggle,
  useTheme, useBreakpoint, useFullscreen,
  cn, tokens
} from '@vxture/design-system';
```

### ❌ 禁止用法

```typescript
// 禁止直接导入内部模块
import { Icon } from '@vxture/design-system/src/icons/Icon';
import { Button } from '@vxture/design-system/src/components/ui/button';
```

---

## 🏗 目录架构

```
@vxture/design-system/
├── src/
│   ├── icons/              # 图标系统（Icon 组件 + 注册表）
│   ├── components/
│   │   ├── ui/            # 基础 UI 组件（16个）
│   │   └── layout/        # 布局组件（全屏、容器、Stack、Grid）
│   ├── theme/             # 主题系统（Provider + hooks）
│   ├── density/           # 密度系统
│   ├── tokens/            # 设计令牌（颜色、间距、圆角、阴影、字体、动效）
│   ├── layers/            # 层级管理（z-index）
│   ├── hooks/             # 自定义 Hooks
│   ├── utils/             # 工具函数
│   ├── types/             # 类型定义
│   └── styles/            # 样式文件
└── index.ts               # 统一导出入口
```

---

## 🎨 核心功能模块

### 1. 图标系统

**必须使用 `<Icon>` 组件，禁止直接使用外部图标库。**

```typescript
import { Icon } from '@vxture/design-system';

<Icon name="user" size="lg" weight="bold" />
<Icon name="settings" size={24} className="text-blue-500" />
<Icon name="home" size="sm" weight="regular" />
```

**图标属性：**
- `name` - 必填，图标名称（见下方支持的图标）
- `size` - 可选，尺寸：xs/sm/md/lg/xl 或数字（默认：md）
- `weight` - 可选，粗细：thin/light/regular/bold/fill/duotone（默认：regular）
- `className` - 可选，CSS 类名
- `color` - 可选，图标颜色，接受任意合法 CSS 颜色值（默认：currentColor，继承父元素文字颜色）
- `fallback` - 可选，降级图标名称，当 name 无匹配时显示（主要用于 JSON/API 驱动的动态图标场景）

**支持的图标（按分组）：**

#### 通用交互 - 导航
- home
- arrow-left, arrow-right, arrow-up, arrow-down
- arrow-long-right
- chevron-left, chevron-right, chevron-up, chevron-down

#### 通用交互 - 操作
- search, settings, edit, delete
- add, plus, x, check, trash, cog

#### 通用交互 - 状态
- success, error, warning, info

#### 云服务/智能体 - 平台
- agent, workflow, trigger, database, cloud, server, cube, building-library

#### 云服务/智能体 - 数据
- chart, chart-bar, table, code, api, graph
- lightbulb, sparkles, shield-check

#### 用户/组织
- user, user-group, users, medal, star

#### 通讯/联系
- mail, phone, wechat, github, linkedin
- chat-circle, paperplane-tilt

#### 时间/日历
- calendar, calendar-days, clock

#### 地图/位置
- map-pin, map-marker

#### 主题/显示
- sun, moon, globe

#### 其他
- caret-left-bold, caret-right-bold

---

### 2. UI 组件（16个）

```typescript
import { Button, Card, Input, Label, Avatar, Badge, Breadcrumb } from '@vxture/design-system';
import { Checkbox, Dialog, DropdownMenu, Popover, Select, Separator, Switch, Tabs, Tooltip } from '@vxture/design-system';
```

#### 按钮组件

```typescript
import { Button } from '@vxture/design-system';

<Button>点击我</Button>
<Button variant="destructive">删除按钮</Button>
<Button variant="outline">轮廓按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="link">链接按钮</Button>
<Button size="sm">小按钮</Button>
<Button size="lg">大按钮</Button>
<Button size="icon">图标按钮</Button>
<Button disabled>禁用</Button>

<Button>
  <Icon name="search" size="sm" />
  搜索
</Button>
```

**按钮变体：** default/destructive/outline/secondary/ghost/link

**按钮尺寸：** default/sm/lg/icon

#### 完整组件清单

| 组件 | 说明 |
|------|------|
| **Avatar** | 用户头像 |
| **Badge** | 徽章 |
| **Breadcrumb** | 面包屑导航 |
| **Button** | 按钮（6种变体） |
| **Card** | 卡片（Header/Content/Footer） |
| **Checkbox** | 复选框 |
| **Dialog** | 对话框（模态） |
| **DropdownMenu** | 下拉菜单 |
| **Input** | 输入框 |
| **Label** | 标签 |
| **Popover** | 弹出框 |
| **Select** | 选择器 |
| **Separator** | 分隔线 |
| **Switch** | 开关 |
| **Tabs** | 标签页 |
| **Tooltip** | 工具提示 |

---

### 3. 布局组件

#### 容器组件

```typescript
import { Container } from '@vxture/design-system';

<Container size="sm">小容器</Container>
<Container size="md">中容器</Container>
<Container size="lg">大容器</Container>
<Container size="xl">超大容器</Container>
<Container size="full">全屏容器</Container>
```

#### Stack 布局

```typescript
import { Stack, HStack, VStack } from '@vxture/design-system';

<VStack spacing="md">
  <div>垂直堆叠</div>
  <div>元素1</div>
  <div>元素2</div>
</VStack>

<HStack spacing="lg">
  <div>水平排列</div>
  <div>元素1</div>
  <div>元素2</div>
</HStack>

<Stack direction="horizontal" spacing="sm" align="center">
  <div>通用 Stack</div>
</Stack>
```

#### Grid 布局

```typescript
import { Grid } from '@vxture/design-system';

<Grid columns={3} gap="md">
  <div>网格项 1</div>
  <div>网格项 2</div>
  <div>网格项 3</div>
</Grid>

<Grid columns={{ base: 1, md: 2, lg: 3 }} gap="lg">
  <div>响应式网格</div>
</Grid>
```

---

### 4. 全屏基础设施

设计系统提供完整的全屏功能支持，包含 Provider、容器、门户、切换按钮和 Hook。

#### 基础配置

```typescript
import { FullscreenProvider } from '@vxture/design-system';

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <FullscreenProvider>
      {children}
    </FullscreenProvider>
  );
}
```

#### 使用全屏容器

```typescript
import { FullscreenContainer, FullscreenToggle, useFullscreen } from '@vxture/design-system';

function FullscreenDemo() {
  const { isFullscreen, enter, exit, toggle } = useFullscreen();

  return (
    <FullscreenContainer>
      <div className="p-4">
        <h1>全屏内容区域</h1>
        <p>此区域可以进入全屏模式</p>

        {/* 使用切换按钮组件 */}
        <FullscreenToggle />

        {/* 或使用 Hook 自定义控制 */}
        <button onClick={toggle}>
          {isFullscreen ? '退出全屏' : '进入全屏'}
        </button>
      </div>
    </FullscreenContainer>
  );
}
```

#### 全屏门户

```typescript
import { FullscreenPortal } from '@vxture/design-system';

function FullscreenWithPortal() {
  return (
    <FullscreenContainer>
      <div>主内容</div>

      {/* Portal 中的内容会在全屏时渲染到指定位置 */}
      <FullscreenPortal>
        <div className="fixed top-4 right-4">
          仅在全屏时显示的内容
        </div>
      </FullscreenPortal>
    </FullscreenContainer>
  );
}
```

**全屏 API：**

| API | 说明 |
|-----|------|
| `FullscreenProvider` | 全屏上下文提供者 |
| `FullscreenContainer` | 可全屏的容器组件 |
| `FullscreenPortal` | 全屏门户，内容在全屏时渲染 |
| `FullscreenToggle` | 全屏切换按钮 |
| `useFullscreen()` | 全屏 Hook，返回 isFullscreen, enter, exit, toggle |

---

### 5. 主题系统

#### 颜色主题

```typescript
import { useTheme } from '@vxture/design-system';

const { theme, setTheme } = useTheme();

setTheme('light');    // 浅色模式
setTheme('dark');     // 深色模式
setTheme('system');   // 跟随系统
```

#### UI 密度

```typescript
import { useTheme } from '@vxture/design-system';

const { density, setDensity } = useTheme();

setDensity('compact');      // 紧凑模式 (0.875x)
setDensity('default');      // 默认模式 (1x)
setDensity('comfortable');  // 舒适模式 (1.125x)
```

**密度级别说明：**

| 级别 | 缩放比例 | 适用场景 |
|------|---------|---------|
| `compact` | 0.875x | 小屏幕、高密度数据展示 |
| `default` | 1x | 默认，大部分场景 |
| `comfortable` | 1.125x | 舒适阅读、更大间距 |

**密度影响范围：**
- 字体大小 (typography scale)
- 间距 (spacing)
- 组件高度 (component height)
- 内边距 (padding)

**密度设置会持久化到 localStorage。**

---

### 6. 设计令牌

```typescript
import { tokens } from '@vxture/design-system';

// 颜色
tokens.colors.primary[500];
tokens.colors.gray[900];

// 间距
tokens.spacing['4'];  // 1rem
tokens.spacing['8'];  // 2rem

// 圆角
tokens.radius.md;
tokens.radius.lg;

// 阴影
tokens.shadow.sm;
tokens.shadow.lg;

// 字体
tokens.typography.fontSizes.lg;
tokens.typography.fontWeights.semibold;

// 动效
tokens.motion.duration['300'];
tokens.motion.easing['ease-out'];
```

---

### 7. 自定义 Hooks

```typescript
import {
  useBreakpoint,
  useMediaQuery,
  useMounted,
  useControllableState,
  useFullscreen
} from '@vxture/design-system';

// 断点检测
const { isMobile, isTablet, isDesktop, breakpoint } = useBreakpoint();

// 媒体查询
const isWide = useMediaQuery('(min-width: 1024px)');

// 挂载状态（避免 hydration 问题）
const isMounted = useMounted();

// 可控状态
const [value, setValue] = useControllableState({
  prop: props.value,
  defaultProp: props.defaultValue,
  onChange: props.onChange
});

// 全屏（见全屏基础设施章节）
```

---

### 8. 工具函数

#### cn - 类名合并

```typescript
import { cn } from '@vxture/design-system';

const className = cn(
  'base-class',
  { 'conditional-class': condition },
  'additional-class'
);
```

---

### 9. 层级管理

```typescript
import { zIndex } from '@vxture/design-system';

// 预定义的 z-index 值
zIndex.dropdown;    // 1000
zIndex.sticky;      // 1020
zIndex.fixed;       // 1030
zIndex.modalBackdrop; // 1040
zIndex.modal;       // 1050
zIndex.popover;     // 1060
zIndex.tooltip;     // 1070
```

---

## ⚠️ 禁止事项（重要）

### ❌ 禁止 1：直接使用外部图标库

```typescript
// ❌ 绝对禁止
import { UserIcon } from '@phosphor-icons/react';
<UserIcon size={24} />

// ✅ 必须使用
<Icon name="user" size="lg" />
```

### ❌ 禁止 2：直接导入内部模块

```typescript
// ❌ 禁止
import { Button } from '@vxture/design-system/src/components/ui/button';

// ✅ 必须使用
import { Button } from '@vxture/design-system';
```

### ❌ 禁止 3：直接操作 DOM 切换主题

```typescript
// ❌ 禁止
document.documentElement.classList.toggle('dark');

// ✅ 必须使用
setTheme('dark');
```

### ❌ 禁止 4：修改 ui/* 目录下的第三方源文件

```typescript
// ❌ 禁止直接修改 shadcn/ui 原始组件
// 不允许修改 packages/design-system/src/components/ui/ 目录下的任何文件

// ✅ 应该通过封装或扩展的方式进行定制
// 可以在应用层创建组件封装或使用组合方式
```

---

## 🏗 架构说明

设计系统采用 **next-themes** 作为主题切换的核心库，实现了：

- **主题切换**：light/dark/system 三种主题模式
- **密度系统**：compact/default/comfortable 三个密度级别
- **全屏基础设施**：完整的全屏功能支持（Provider、Container、Portal、Toggle、Hook）
- **布局组件**：Container、Stack、Grid 等高级布局原语
- **设计令牌**：colors/spacing/radius/shadow/typography/motion
- **CSS 变量**：统一的 `--vx-*` 变量命名规范
- **持久化**：主题和密度设置持久化到 localStorage

设计系统是跨层通用的 UI 基础设施，所有前端应用（portals/agent-studio）都应使用此系统。

### 技术栈

- **UI 基元**：Radix UI + shadcn/ui
- **图标**：Phosphor Icons
- **主题**：next-themes
- **样式**：Tailwind CSS
- **类名合并**：clsx + tailwind-merge

---

**版本：3.0.0**
**维护者：vxture team**
**最后更新：2026-03-12**
