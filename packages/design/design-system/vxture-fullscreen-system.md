# Vxture Workspace Maximization System (WMS)

**版本**：1.0.0
**最后更新**：2026-03-12
**设计状态**：架构设计完成，等待编码实现

---

## 概述

在设计系统中新增 **Workspace Maximization System (WMS)**，提供两种全屏模式：

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| **pseudo** | 工作区最大化（伪全屏） | 隐藏导航栏、侧边栏、状态栏，保留浏览器框架 |
| **native** | 显示器级全屏（原生全屏） | 浏览器全屏 API，占满整个显示器 |

---

## 一、功能定位

### 1.1 核心目标
- 提供统一的全屏管理接口
- 支持 pseudo 和 native 两种模式并存
- 与设计系统现有架构无缝集成
- 良好的浏览器兼容性和降级策略
- 用户偏好持久化

### 1.2 设计原则
- **统一接口**：两种模式使用相同的 API
- **模式明确**：`mode = "pseudo" | "native"`
- **渐进增强**：native 不可用时自动降级到 pseudo
- **状态持久化**：用户选择的模式和状态保存到 localStorage
- **错误友好**：完善的错误处理和用户反馈

---

## 二、核心架构设计

### 2.1 模块目录结构

```
packages/design/design-system/src/
├── workspace/              # 新增目录
│   ├── WorkspaceProvider.tsx  # 核心 Provider
│   ├── useWorkspace.ts        # Hook
│   ├── workspace.types.ts      # 类型定义
│   ├── workspace.constants.ts  # 常量
│   └── index.ts              # 统一导出
└── index.ts                # 更新，导出 workspace 模块
```

### 2.2 类型定义 (workspace.types.ts)

```typescript
/**
 * workspace.types.ts - Workspace 系统类型定义
 * @package @vxture/design-system
 *
 * 功能：定义全屏系统的所有类型
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Types
 */

/**
 * 全屏模式类型
 *
 * - pseudo: 工作区最大化（伪全屏），隐藏 UI 元素但保留浏览器框架
 * - native: 显示器级全屏（原生全屏），使用浏览器全屏 API
 */
export type WorkspaceMode = "pseudo" | "native";

/**
 * 全屏状态
 */
export interface WorkspaceState {
  /** 当前模式 */
  mode: WorkspaceMode | null;
  /** 是否处于全屏状态 */
  isMaximized: boolean;
  /** 上次使用的模式 */
  lastMode: WorkspaceMode | null;
}

/**
 * Workspace Context Value
 */
export interface WorkspaceContextValue extends WorkspaceState {
  /**
   * 进入全屏
   * @param mode - 可选，指定模式，默认使用上次模式或 defaultMode
   */
  maximize: (mode?: WorkspaceMode) => Promise<void>;

  /**
   * 退出全屏
   */
  minimize: () => Promise<void>;

  /**
   * 切换全屏
   * @param mode - 可选，指定目标模式，默认切换当前模式
   */
  toggle: (mode?: WorkspaceMode) => Promise<void>;

  /**
   * 设置模式（不立即生效）
   * @param mode - 要设置的模式
   */
  setMode: (mode: WorkspaceMode) => void;

  /**
   * 检查原生全屏是否支持
   */
  isNativeSupported: () => boolean;
}

/**
 * WorkspaceProvider Props
 */
export interface WorkspaceProviderProps {
  /** 子组件 */
  readonly children: React.ReactNode;
  /** 默认模式 */
  readonly defaultMode?: WorkspaceMode;
  /** 默认是否最大化 */
  readonly defaultMaximized?: boolean;
  /** Pseudo 全屏时应用到的容器元素，默认为 document.documentElement */
  readonly containerSelector?: string;
  /** 最大化回调 */
  readonly onMaximize?: (mode: WorkspaceMode) => void;
  /** 最小化回调 */
  readonly onMinimize?: () => void;
  /** 模式变更回调 */
  readonly onModeChange?: (mode: WorkspaceMode) => void;
}
```

---

## 三、技术实现方案

### 3.1 核心组件：WorkspaceProvider.tsx

**架构特点**：
1. 嵌套 Context Provider（在 ThemeProvider 之后）
2. 管理 pseudo 和 native 两种模式
3. 处理原生全屏 API 的兼容性问题
4. 持久化用户偏好到 localStorage
5. 统一的错误处理

**核心逻辑流程**：

```
pseudo 模式实现：
- 添加 CSS class 到目标容器
- 控制侧边栏/导航栏的显示/隐藏
- 监听 ESC 键退出
- 使用 transition 动画

native 模式实现：
- 使用 document.documentElement.requestFullscreen()
- 使用 document.exitFullscreen()
- 监听 fullscreenchange 事件
- 处理浏览器兼容性（webkitRequestFullscreen 等）
```

**关键方法**：

```typescript
// 进入全屏
async function maximize(mode?: WorkspaceMode) {
  const targetMode = mode || lastMode || defaultMode;

  if (targetMode === 'native' && !isNativeSupported()) {
    // 降级到 pseudo
    await maximize('pseudo');
    return;
  }

  if (targetMode === 'native') {
    await enterNativeFullscreen();
  } else {
    await enterPseudoFullscreen();
  }
}

// 退出全屏
async function minimize() {
  if (mode === 'native') {
    await exitNativeFullscreen();
  } else {
    await exitPseudoFullscreen();
  }
}

// 切换全屏
async function toggle(mode?: WorkspaceMode) {
  if (isMaximized) {
    await minimize();
  } else {
    await maximize(mode);
  }
}
```

### 3.2 Hook API：useWorkspace.ts

```typescript
import { useWorkspace } from '@vxture/design-system';

// 完整用法
const {
  mode,           // 当前模式: "pseudo" | "native" | null
  isMaximized,    // 是否全屏: boolean
  lastMode,       // 上次模式: "pseudo" | "native" | null

  // 操作方法
  maximize,       // 进入全屏: (mode?) => Promise<void>
  minimize,       // 退出全屏: () => Promise<void>
  toggle,         // 切换全屏: (mode?) => Promise<void>
  setMode,        // 设置模式（不立即生效）: (mode) => void
  isNativeSupported, // 检查原生全屏支持: () => boolean
} = useWorkspace();
```

---

## 四、CSS 类名约定

### 4.1 在 variables.css 中添加

```css
/* Workspace 系统变量 */
:root {
  --vx-workspace-transition-duration: 0.3s;
  --vx-workspace-transition-easing: ease-in-out;
}
```

### 4.2 Pseudo 全屏的 CSS 类

```css
/* Pseudo 全屏状态 - 添加到 body 或指定容器 */
.vx-workspace-maximized-pseudo {
  /* 伪全屏状态标记 */
}

/* Pseudo 全屏时，隐藏侧边栏 */
.vx-workspace-maximized-pseudo .sidebar {
  transform: translateX(-100%);
  opacity: 0;
  transition: transform var(--vx-workspace-transition-duration) var(--vx-workspace-transition-easing),
              opacity var(--vx-workspace-transition-duration) var(--vx-workspace-transition-easing);
}

/* Pseudo 全屏时，隐藏顶部导航 */
.vx-workspace-maximized-pseudo .navbar {
  transform: translateY(-100%);
  opacity: 0;
  transition: transform var(--vx-workspace-transition-duration) var(--vx-workspace-transition-easing),
              opacity var(--vx-workspace-transition-duration) var(--vx-workspace-transition-easing);
}

/* Pseudo 全屏时，工作区占满空间 */
.vx-workspace-maximized-pseudo .workspace-content {
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
}

/* Native 全屏状态 - 浏览器自动处理，用于特殊样式调整 */
.vx-workspace-maximized-native {
  /* 原生全屏状态标记 */
}
```

---

## 五、与现有系统的集成

### 5.1 导出扩展

在 `src/index.ts` 中添加：

```typescript
// ============================================================================
// Workspace
// ============================================================================
export * from "./workspace";
```

### 5.2 Provider 层级

```tsx
// 应用根布局
import { ThemeProvider, WorkspaceProvider } from '@vxture/design-system';
import '@vxture/design-system/styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <ThemeProvider defaultTheme="system" defaultDensity="default">
          <WorkspaceProvider
            defaultMode="pseudo"
            containerSelector="#app-root"
            onMaximize={(mode) => console.log('Maximized:', mode)}
            onMinimize={() => console.log('Minimized')}
          >
            {children}
          </WorkspaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## 六、使用示例

### 6.1 基础用法 - 全屏控制按钮组

```tsx
import { useWorkspace } from '@vxture/design-system';
import { Icon, Button } from '@vxture/design-system';

function WorkspaceControls() {
  const {
    isMaximized,
    maximize,
    minimize,
    toggle,
    isNativeSupported
  } = useWorkspace();

  return (
    <div className="flex items-center gap-2">
      {/* 进入 Pseudo 全屏 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => maximize('pseudo')}
        disabled={isMaximized}
        title="工作区最大化"
      >
        <Icon name="maximize" />
      </Button>

      {/* 进入 Native 全屏（如果支持） */}
      {isNativeSupported() && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => maximize('native')}
          disabled={isMaximized}
          title="显示器全屏"
        >
          <Icon name="expand" />
        </Button>
      )}

      {/* 退出全屏 */}
      {isMaximized && (
        <Button
          variant="ghost"
          size="icon"
          onClick={minimize}
          title="退出全屏"
        >
          <Icon name="minimize" />
        </Button>
      )}

      {/* 一键切换（使用上次模式） */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => toggle()}
        title={isMaximized ? "退出全屏" : "全屏"}
      >
        <Icon name={isMaximized ? "minimize" : "maximize"} />
      </Button>
    </div>
  );
}
```

### 6.2 模式选择器

```tsx
import { useWorkspace } from '@vxture/design-system';
import { Button, DropdownMenu } from '@vxture/design-system';

function ModeSelector() {
  const { mode, setMode, maximize, isMaximized } = useWorkspace();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="sm">
          {mode === 'pseudo' ? '工作区' : '显示器'}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          onClick={() => {
            setMode('pseudo');
            if (!isMaximized) maximize('pseudo');
          }}
        >
          工作区最大化
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            setMode('native');
            if (!isMaximized) maximize('native');
          }}
        >
          显示器全屏
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
```

---

## 七、持久化与偏好存储

### 7.1 localStorage 键

```
vx-workspace-mode      # 上次使用的模式: "pseudo" | "native"
vx-workspace-maximized  # 是否默认最大化: "true" | "false"
```

### 7.2 持久化策略

- 初始化时从 localStorage 读取
- 状态变更时写入 localStorage
- 提供清除偏好的方法（可选）

---

## 八、边界情况处理

### 8.1 浏览器兼容性

**原生全屏 API 检测**：

```typescript
function isNativeSupported(): boolean {
  return !!(
    document.documentElement.requestFullscreen ||
    (document.documentElement as any).webkitRequestFullscreen ||
    (document.documentElement as any).mozRequestFullScreen ||
    (document.documentElement as any).msRequestFullscreen
  );
}
```

**降级策略**：
- 如果 native 全屏不支持，自动降级到 pseudo 模式
- 提供 `isNativeSupported()` 工具函数供 UI 判断是否显示 native 选项

### 8.2 权限与错误处理

**关键约束**：
- native 全屏需要用户交互（不能自动进入）
- 必须在事件处理函数中调用
- 捕获全屏 API 的异常

**错误处理**：
```typescript
try {
  await document.documentElement.requestFullscreen();
} catch (err) {
  console.warn('Native fullscreen failed, falling back to pseudo');
  await enterPseudoFullscreen();
}
```

### 8.3 状态同步

**监听事件**：
- ESC 键监听（pseudo 模式）
- 浏览器 `fullscreenchange` 事件（native 模式）
- `fullscreenerror` 事件（native 模式错误）
- 窗口 resize 事件（可选，用于适配）

**同步机制**：
- Provider 内部状态与浏览器状态保持同步
- 提供 onMaximize / onMinimize 回调
- 支持外部状态监听

---

## 九、设计要点总结

| 特性 | 方案 |
|------|------|
| **模式区分** | `mode = "pseudo" | "native"` |
| **统一接口** | `maximize()` / `minimize()` / `toggle()` 接受可选 mode 参数 |
| **持久化** | localStorage 存储用户偏好 |
| **CSS 类名** | `.vx-workspace-maximized-pseudo` / `.vx-workspace-maximized-native` |
| **Provider 集成** | 在 ThemeProvider 之后，独立 Context |
| **兼容性** | native 模式不可用时自动降级到 pseudo |
| **用户反馈** | onMaximize / onMinimize / onModeChange 回调 |

---

## 十、后续扩展考虑

### 10.1 可能的增强功能

1. **多显示器支持**：指定在哪个显示器全屏
2. **快捷键配置**：自定义全屏快捷键
3. **动画定制**：允许自定义过渡动画
4. **区域全屏**：只全屏特定区域而非整个页面
5. **记住窗口大小**：在 native 全屏之前记住窗口位置

### 10.2 与其他系统的集成

- 与主题系统联动（全屏时自动切换到暗色主题）
- 与密度系统联动（全屏时自动切换到 comfortable 密度）
- 提供完整的事件，支持外部状态管理集成

---

**设计完成！**

## 附录：图标建议

为了支持这个功能，建议在图标系统中添加以下图标：

| 图标名称 | 用途 |
|---------|------|
| `maximize` | 进入全屏（工作区） |
| `minimize` | 退出全屏 |
| `expand` | 显示器全屏 |
| `compress` | 退出显示器全屏 |

---

**文档状态**：✅ 设计完成，待编码实现
