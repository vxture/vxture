# Vxture Design System Runtime Architecture

## 1. 设计目标

为了保证设计系统在长期演进中的 **可维护性、扩展性和清晰的开发体验**，Runtime 架构采用以下原则：

**核心原则**

* 内部模块化（Directory Modularization）
* 对外统一 API（Public API Aggregation）
* 单一 Provider 入口（Single Runtime Provider）

最终目标：

* 内部结构清晰
* 外部使用简单
* 支持未来扩展（density / motion / rtl / accessibility）

---

# 2. 架构原则

## 2.1 内部模块化

按职责拆分目录：

* theme → 主题系统
* density → UI 密度控制
* tokens → design tokens
* styles → CSS 变量与全局样式
* components → UI 组件

每个模块独立管理自己的逻辑。

---

## 2.2 对外统一 API

设计系统只提供 **单一入口导出**：

```
@vxture/design-system
```

所有模块通过 `index.ts` 统一导出。

开发者不需要了解内部目录结构。

---

## 2.3 单一 Provider 入口

设计系统运行时统一使用：

```
ThemeProvider
```

内部统一管理：

```
theme
density
```

而不是：

```
ThemeProvider
DensityProvider
```

原因：

* 减少 Provider 嵌套
* 统一 UI runtime state
* 方便 CSS variable 注入
* 便于未来扩展

---

# 3. 最终目录结构

```
src
│
├─ components
│
├─ theme
│   ├─ ThemeProvider.tsx
│   ├─ useTheme.ts
│   ├─ theme.types.ts
│   └─ index.ts
│
├─ density
│   ├─ density.types.ts
│   ├─ density.config.ts
│   └─ index.ts
│
├─ tokens
│   ├─ typography.ts
│   ├─ spacing.ts
│   └─ index.ts
│
├─ styles
│   ├─ variables.css
│   ├─ density.css
│   └─ globals.css
│
└─ index.ts
```

---

# 4. Density 设计

Density 控制 **UI 密度与布局尺度**。

```
compact
default
comfortable
```

示例：

```
export type Density =
  | "compact"
  | "default"
  | "comfortable"
```

density 主要影响：

* spacing
* component height
* padding
* typography scale

---

# 5. Theme Context 设计

ThemeProvider 管理 runtime UI 状态。

```
ThemeContext
```

状态结构：

```
type ThemeContextValue = {
  theme: "light" | "dark"

  density: Density

  setTheme: (theme: Theme) => void
  setDensity: (density: Density) => void
}
```

---

# 6. ThemeProvider 示例

```
<ThemeProvider
  defaultTheme="light"
  defaultDensity="default"
>
  <App />
</ThemeProvider>
```

---

# 7. Hook 使用方式

组件中读取 runtime state：

```
const { theme, density, setDensity } = useTheme()
```

修改 density：

```
setDensity("comfortable")
```

---

# 8. CSS 变量策略

CSS 变量统一放在：

```
styles/variables.css
```

示例：

```
:root {
  --vx-font-size-sm: 14px;
  --vx-font-size-md: 16px;
  --vx-font-size-lg: 18px;
}
```

density class 控制 scale：

```
.density-compact { ... }
.density-default { ... }
.density-comfortable { ... }
```

---

# 9. 统一导出 API

设计系统通过 `src/index.ts` 聚合导出：

```
export * from "./components"

export { ThemeProvider, useTheme } from "./theme"

export * from "./tokens"
```

开发者使用：

```
import {
  ThemeProvider,
  useTheme
} from "@vxture/design-system"
```

---

# 10. 架构优势

该架构具备以下优势：

### 清晰

模块职责明确：

```
theme
density
tokens
components
```

### 简单

开发者只需：

```
ThemeProvider
useTheme()
```

### 可扩展

未来可扩展：

```
motion
rtl
contrast
accessibility
```

而无需改变整体结构。

---

# 11. 架构总结

最终设计原则：

```
内部模块化
外部统一 API
单一 Runtime Provider
```

核心思路：

```
目录拆分
导出聚合
```

这是设计系统长期稳定演进的推荐架构。
