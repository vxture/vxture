# Vxture 设计系统架构设计

公用设计系统，适用于运营管理平台、业务服务系统、智能体服务平台。
无业务逻辑，纯 UI 组件。

## 架构概览

### 核心原则
- 组件化：每个功能独立成组件
- 原子化：从基础到复杂的层级结构
- 一致性：统一的设计语言和规范
- 可扩展性：支持主题定制和组件扩展

### 技术选型
- React 19 (Client Component)
- TypeScript 5.9
- TailwindCSS 4
- Phosphor Icons (@phosphor-icons/react)

## 目录结构

```
src/
├── icon/              # 图标系统
│   ├── Icon.tsx       # 主组件
│   ├── iconMap.ts     # Phosphor 组件映射
│   ├── tokens.ts      # 语义化 token 定义
│   └── index.ts       # 导出文件
├── button/            # 按钮组件
│   ├── Button.tsx     # 主组件
│   └── index.ts       # 导出文件
├── layout/            # 布局组件
│   └── Container.tsx
├── theme/             # 主题配置
│   └── colors.ts      # 颜色系统
├── types/             # 类型定义
│   └── common.ts
└── index.ts           # 统一导出入口
```

## 核心组件架构

### 1. 图标组件 (Icon)

**功能**：统一的图标渲染入口，封装 Phosphor Icons。

**设计要点**：
- 支持多种权重：thin/light/regular/bold/fill/duotone
- 语义化命名，与业务解耦
- 统一的 API 接口，简化使用
- 类型安全，只能使用预定义的图标名称
- 支持响应式大小 (sm/md/lg/xl) 或自定义数值

**实现**：`src/icon/Icon.tsx`

### 2. 图标 Token 系统

**功能**：定义语义化图标 token 系统

**设计原则**：
- 图标仅表达「业务语义」，不表达样式或情绪
- 内容层只能使用此处定义的 token
- UI 层负责 token → 具体 icon 的转换
- 严格的扩展规则：只允许添加可复用的 token

**分类**：
- 通用交互：navigation, action, status
- 云服务/智能体专属：platform, data
- 用户/组织：user
- 通讯/联系：communication
- 时间/日历：time
- 地图/位置：location
- 主题/显示：theme

**实现**：`src/icon/tokens.ts`

### 3. 图标映射系统

**功能**：将语义化名称映射到 Phosphor 图标组件

**设计要点**：
- 唯一直接依赖 Phosphor Icons 的地方
- 统一管理图标映射关系
- 支持扩展和维护

**实现**：`src/icon/iconMap.ts`

### 4. 按钮组件 (Button)

**功能**：基础按钮组件，支持多种样式变体。

**设计要点**：
- 内置 5 种样式变体：primary/secondary/danger/success/outline
- 支持图标配置
- 响应式设计
- 状态管理（disabled, loading）

**实现**：`src/button/Button.tsx`

### 5. 布局组件 (Container)

**功能**：基础布局容器组件。

**实现**：`src/layout/Container.tsx`

### 6. 主题系统

**功能**：统一的颜色系统管理。

**设计要点**：
- 语义化颜色命名
- 支持主题切换（深色/浅色）
- 统一的配色方案

**实现**：`src/theme/colors.ts`

## 架构特点

### 1. 无业务逻辑
- 纯 UI 组件库
- 不包含业务逻辑
- 可独立于业务系统使用

### 2. 原子化设计
- 基础组件 (Atoms)：Icon, Button
- 组合组件 (Molecules)：基于基础组件组合
- 容器组件 (Organisms)：页面级组件

### 3. 严格的导出控制
- 所有组件通过 `src/index.ts` 统一导出
- 禁止直接导入内部文件
- 确保 API 一致性

### 4. TypeScript 支持
- 完整的类型定义
- 严格的类型检查
- 类型安全的组件 API

## 使用规范

### 组件导入
```typescript
// 正确：统一入口导入
import { Icon, Button } from '@vxture/design-system';

// 错误：直接导入内部模块
import { Icon } from '@vxture/design-system/src/icon/Icon';
```

### 图标使用
**严格禁止直接使用 Phosphor Icons**：
```typescript
// 正确
<Icon name="user" size="lg" weight="bold" />

// 错误
import { UserIcon } from '@phosphor-icons/react';
<UserIcon size={24} />
```

## 维护说明

### 添加新组件
1. 在对应目录创建新组件文件
2. 定义 TypeScript 类型
3. 实现组件逻辑
4. 在 `src/index.ts` 中导出
5. 更新 README.md 文档

### 添加新图标
1. 在 `src/icon/tokens.ts` 中添加到对应的语义分类
2. 在 `src/icon/iconMap.ts` 中添加映射关系
3. 更新相关文档

### 更新主题
修改 `src/theme/colors.ts` 文件。

## 开发规范

### 文件命名
- 组件名：PascalCase (UserLoginForm.tsx)
- 目录名：kebab-case (user-login-form/)
- 类型文件：*.ts
- 组件文件：*.tsx

### 编码规范
- 使用 Client Component：`'use client'`
- 严格类型定义，禁止使用 any
- 保持组件单一职责
- 使用 TailwindCSS 4 进行样式管理

---

**最后更新：** 2026-03-05
**维护者：** vxture team
**文档版本：** 1.1.0