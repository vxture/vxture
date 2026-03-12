# Design System (DS) 与 Website 对接清单

> 对接检查日期：2026-03-12
> 设计系统版本：@vxture/design-system (package.json: 0.1.0)
> Website 版本：@vxture/website (package.json: 0.1.0)

---

## 📋 设计系统核心板块概览

design-system (`packages/design/design-system/`) 包含以下核心板块：

```
@vxture/design-system/
├── 🎨 Icons - 图标系统 (Phosphor Icons 封装)
├── 🧩 Components - UI 组件库 (基于 Radix UI)
├── 🌓 Theme - 主题系统 (next-themes)
├── 📐 Density - UI 密度控制 (compact/default/comfortable)
├── 🎯 Tokens - 设计 tokens (颜色、间距、阴影、圆角、排版)
├── 🛠️ Hooks - 通用 Hooks (useBreakpoint、useMediaQuery、useMounted)
├── 🪜 Layers - 层级系统 (z-index 管理)
└── 📄 Layout - 布局组件 (容器、全屏、网格、堆叠)
```

---

## 🚩 需要对接的关键板块

### 1. 🌓 主题系统 (Theme System)

**对接状态**：❌ 未对接

**设计系统提供**：
- `ThemeProvider` - 主题上下文提供者
- `useTheme()` - 主题 Hook（包含 density 控制）
- 支持 `light` / `dark` / `system` 三种模式
- CSS 类名切换，与 Tailwind 集成

**Website 当前状况**：
- 正在使用自定义的 `themeStore` (Zustand)
- 同时存在 `GlobalContext` 中的 theme 管理
- 未使用 design-system 的 `ThemeProvider`

**对接需求**：
- 替换 `src/stores/themeStore.ts` 为 DS 的 `useTheme()`
- 移除 `GlobalContext` 中的重复主题管理
- 在 `src/app/layout.tsx` 中添加 `ThemeProvider`
- 确保与 next-themes 的服务器端渲染兼容性

**相关文件**：
- `packages/design/design-system/src/theme/ThemeProvider.tsx`
- `packages/design/design-system/src/theme/useTheme.ts`
- `portals/website/src/stores/themeStore.ts`
- `portals/website/src/app/layout.tsx`

---

### 2. 🎯 UI 密度控制 (Density Control)

**对接状态**：❌ 未对接

**设计系统提供**：
- `DENSITY_STORAGE_KEY` - 存储 key
- `DEFAULT_DENSITY` - 默认值（"default"）
- 支持 `compact` / `default` / `comfortable` 三种密度
- 通过 CSS 类名实现组件尺寸缩放

**Website 当前状况**：
- 完全未使用密度控制
- 所有组件尺寸固定

**对接需求**：
- 在 Header 中添加密度切换控制
- 实现 localStorage 持久化存储
- 确保响应式布局与密度变化兼容

**相关文件**：
- `packages/design/design-system/src/density/density.types.ts`
- `packages/design/design-system/src/density/densityConfig.ts`

---

### 3. 🧩 UI 组件库 (Components)

**对接状态**：❌ 大部分未使用

**设计系统提供**：
- 基础 UI 组件（基于 Radix UI）：
  - Buttons, Inputs, Checkboxes, Switches
  - Cards, Badges, Tooltips, Popovers
  - Dialogs, Dropdown Menus, Tabs
  - Avatars, Separators, Breadcrumbs

**Website 当前状况**：
- 只使用了 `Icon` 组件
- 其他组件均自行实现（或使用 Tailwind 基础样式）
- 登录/注册表单使用原生 HTML 元素

**对接需求**：
- 替换所有硬编码的 UI 组件为 DS 组件
- 优化表单组件（登录、注册）
- 统一按钮、输入框、卡片等组件样式

**相关文件**：
- `packages/design/design-system/src/components/ui/` 目录
- `portals/website/src/components/` 目录（特别是 common/）
- `portals/website/src/app/(auth)/` 目录

---

### 4. 🎨 图标系统 (Icon System)

**对接状态**：✅ 已使用，但可优化

**设计系统提供**：
- 统一的 `Icon` 组件
- 语义化图标名称
- 支持尺寸、粗细、颜色定制
- 图标注册表管理（phosphor-icons）

**Website 当前状况**：
- 已在多个组件中使用 `Icon` 组件
- 使用的图标：`sun`, `moon`, `globe`, `arrow-down`, `arrow-up` 等

**优化建议**：
- 检查是否使用了未注册的图标名称
- 统一图标尺寸和权重规范
- 考虑图标本地化需求（如有）

**相关文件**：
- `packages/design/design-system/src/icons/Icon.tsx`
- `packages/design/design-system/src/icons/iconRegistry.ts`
- `packages/design/design-system/src/icons/iconDictionary.ts`
- 所有使用 `<Icon>` 的 website 组件

---

### 5. 📄 布局系统 (Layout Components)

**对接状态**：❌ 未对接

**设计系统提供**：
- `Container` - 响应式容器组件
- `FullscreenProvider` - 全屏系统
- `Grid` / `Stack` - 布局工具

**Website 当前状况**：
- 使用硬编码的 Tailwind 类名实现布局
- 全屏功能未使用 DS 提供的基础设施

**对接需求**：
- 使用 `<Container>` 组件统一页面布局
- 替换自定义的全屏实现为 `FullscreenProvider`
- 优化响应式断点处理

**相关文件**：
- `packages/design/design-system/src/components/layout/container/`
- `packages/design/design-system/src/components/layout/fullscreen/`
- `portals/website/src/components/layout/` 目录

---

### 6. 🎯 设计 Tokens (Design Tokens)

**对接状态**：❌ 未对接

**设计系统提供**：
- `colors.ts` - 品牌色板
- `spacing.ts` - 间距系统
- `radius.ts` - 圆角规范
- `shadow.ts` - 阴影层级
- `typography.ts` - 排版配置
- `motion.ts` - 动画时长

**Website 当前状况**：
- 使用硬编码的 Tailwind 工具类
- 未统一使用 design-system 的 tokens
- 部分组件有重复的颜色定义

**对接需求**：
- 统一使用 DS 的颜色变量
- 标准化间距、阴影、圆角使用
- 确保与 theme 系统联动（亮色/暗色模式）

**相关文件**：
- `packages/design/design-system/src/tokens/` 目录
- `portals/website/src/app/globals.css`
- 所有使用 Tailwind 类名的组件

---

### 7. 🛠️ 通用 Hooks (General Hooks)

**对接状态**：❌ 未使用

**设计系统提供**：
- `useBreakpoint` - 断点检测
- `useMediaQuery` - 媒体查询
- `useMounted` - 组件挂载检测

**Website 当前状况**：
- 使用自定义实现或直接操作 DOM
- 未使用 DS 提供的标准化 Hooks

**对接需求**：
- 替换自定义的断点检测逻辑
- 优化响应式布局实现
- 统一组件挂载状态检查

**相关文件**：
- `packages/design/design-system/src/hooks/` 目录
- `portals/website/src/hooks/` 目录

---

### 8. 🪜 层级系统 (Layer System)

**对接状态**：❌ 未使用

**设计系统提供**：
- `zIndex` - 统一的层级常量
- 避免 z-index 冲突

**Website 当前状况**：
- 使用硬编码的 z-index 值
- 存在层级冲突风险

**对接需求**：
- 统一使用 DS 的 z-index 常量
- 优化组件层级管理

**相关文件**：
- `packages/design/design-system/src/layers/zIndex.ts`
- 所有设置 position: relative/absolute 的组件

---

## 📊 对接优先级矩阵

| 板块 | 对接状态 | 优先级 | 影响范围 | 实施复杂度 |
|------|----------|--------|----------|------------|
| 🌓 主题系统 | 未对接 | 🔴 高 | 全局 | 中 |
| 🎯 UI 密度 | 未对接 | 🟡 中 | 全局 | 低 |
| 🧩 UI 组件 | 部分使用 | 🟡 中 | 页面级 | 高 |
| 🎨 图标系统 | 已使用 | 🟢 低 | 组件级 | 低 |
| 📄 布局系统 | 未对接 | 🟡 中 | 页面级 | 中 |
| 🎯 设计 Tokens | 未对接 | 🟢 低 | 组件级 | 中 |
| 🛠️ 通用 Hooks | 未使用 | 🟢 低 | 组件级 | 低 |
| 🪜 层级系统 | 未使用 | 🟢 低 | 组件级 | 低 |

---

## 🚀 建议的实施顺序

### 阶段 1 - 基础架构 (1-2 周)
1. 🔴 主题系统对接
2. 🟡 布局系统对接
3. 🟢 图标系统优化

### 阶段 2 - 组件升级 (2-3 周)
4. 🟡 UI 组件对接（表单、按钮、卡片）
5. 🟡 设计 Tokens 标准化
6. 🟡 UI 密度控制

### 阶段 3 - 优化完善 (1 周)
7. 🟢 通用 Hooks 替换
8. 🟢 层级系统统一
9. 性能优化与测试

---

## 📝 依赖关系说明

### 必选依赖
- `@vxture/design-system` - 核心依赖（已在 package.json）
- `next-themes` - 主题系统依赖（DS 已包含）

### 可选依赖
- `@phosphor-icons/react` - 图标库（DS 已包含）
- `radix-ui/react-*` - UI 组件基础（DS 已包含）

---

## 🎯 成功对接的衡量标准

1. **统一入口**：`import { X } from '@vxture/design-system'` 为唯一引入方式
2. **无重复状态**：移除所有自定义的 theme / density / z-index 管理
3. **一致性**：所有页面使用相同的设计 tokens 和组件样式
4. **可维护性**：design-system 版本升级时无重大重构

---

## 📚 参考文档

- [design-system README](../packages/design/design-system/README.md)
- [Design Tokens 规范](../docs/design/tokens.md)
- [组件库使用指南](../docs/design/components.md)

---

## 🔍 后续检查清单

- [ ] 确保所有组件都使用 DS 提供的图标名称
- [ ] 验证主题切换在服务器端渲染时的行为
- [ ] 检查响应式布局在不同密度下的表现
- [ ] 测试密度切换时的动画效果
- [ ] 确认所有链接到外部资源的图标/图片都能正常加载
