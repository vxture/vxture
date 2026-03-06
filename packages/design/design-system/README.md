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
import { Icon, Button, Card, Input, Label } from '@vxture/design-system';
```

### ❌ 禁止用法

```typescript
// 禁止直接导入内部模块
import { Icon } from '@vxture/design-system/src/icons/Icon';
import { Button } from '@vxture/design-system/src/components/ui/button';
```

---

## 🎨 核心组件

### 1. 图标组件

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
- arrow-left
- arrow-right
- arrow-up
- arrow-down
- arrow-long-right
- chevron-left
- chevron-right
- chevron-up
- chevron-down

#### 通用交互 - 操作
- search
- settings
- edit
- delete
- add
- plus
- x
- check
- trash
- cog

#### 通用交互 - 状态
- success
- error
- warning
- info

#### 云服务/智能体 - 平台
- agent
- workflow
- trigger
- database
- cloud
- server
- cube
- building-library

#### 云服务/智能体 - 数据
- chart
- chart-bar
- table
- code
- api
- graph
- lightbulb
- sparkles
- shield-check

#### 用户/组织
- user
- user-group
- users
- medal
- star

#### 通讯/联系
- mail
- phone
- wechat
- github
- linkedin
- chat-circle
- paperplane-tilt

#### 时间/日历
- calendar
- calendar-days
- clock

#### 地图/位置
- map-pin
- map-marker

#### 主题/显示
- sun
- moon
- globe

#### 其他
- caret-left-bold
- caret-right-bold

---

### 2. 按钮组件

```typescript
import { Button } from '@vxture/design-system';

<Button>点击我</Button>
<Button variant="primary">主要按钮</Button>
<Button variant="outline">轮廓按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button size="sm">小按钮</Button>
<Button size="lg">大按钮</Button>
<Button disabled>禁用</Button>

<Button>
  <Icon name="search" size="sm" />
  搜索
</Button>
```

**按钮变体：** default/destructive/outline/secondary/ghost/link

**按钮尺寸：** default/sm/lg/icon

---

### 3. 主题系统

#### 3.1 颜色主题

```typescript
import { useTheme } from '@vxture/design-system';

const { theme, setTheme } = useTheme();

setTheme('light');    // 浅色模式
setTheme('dark');     // 深色模式
setTheme('system');   // 跟随系统
```

#### 3.2 UI 密度

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

## 📋 完整组件清单（16个）

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
| **Tabs** | 标签页 |
| **Tooltip** | 工具提示 |

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

## 🔧 工具函数

### cn - 类名合并

```typescript
import { cn } from '@vxture/design-system';

const className = cn(
  'base-class',
  { 'conditional-class': condition },
  'additional-class'
);
```

### useBreakpoint - 断点检测

```typescript
import { useBreakpoint } from '@vxture/design-system';

const { isMobile, isTablet, isDesktop } = useBreakpoint();
```

---

**版本：2.2.0**
**维护者：vxture team**
**最后更新：2026-03-06**
