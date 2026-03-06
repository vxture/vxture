# @vxture/shared

Vxture 共享层 - 工具函数、类型定义和全局常量

## 概述

本包提供 Vxture 平台的共享工具函数、TypeScript 类型定义和全局常量。保持框架无关、轻量级、纯工具性。

## 目录结构

```
packages/shared/
├── src/
│   ├── index.ts          # 统一入口文件
│   ├── types/            # TypeScript 类型定义
│   │   ├── index.ts
│   │   ├── auth.types.ts
│   │   ├── i18n.types.ts
│   │   ├── theme.types.ts
│   │   └── content.types.ts
│   ├── constants/        # 全局常量配置
│   │   ├── index.ts
│   │   ├── authConfig.ts
│   │   ├── i18nConfig.ts
│   │   └── themeConfig.ts
│   └── utils/            # 工具函数
│       ├── index.ts
│       ├── debug.ts
│       └── scroll.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 安装和使用

### 导入方式

```typescript
// 从统一入口导入
import {
  // 类型
  type UserInfo,
  type AuthState,
  type ThemeType,
  type LocaleType,
  // 常量
  AUTH_CONSTANTS,
  THEME_CONSTANTS,
  I18N_CONSTANTS,
  // 工具函数
  debugLog,
  resetWindowScrollTop,
} from '@vxture/shared';
```

### 各层使用示例

#### Core Layer (核心层)
```typescript
import { I18N_CONSTANTS, type LocaleType } from '@vxture/shared';
```

#### Service Layer (服务层)
```typescript
import { AUTH_CONSTANTS, type AuthState, debugLog } from '@vxture/shared';
```

#### Platform SDK Layer (平台 SDK 层)
```typescript
import { THEME_CONSTANTS, type ThemeType, resetWindowScrollTop } from '@vxture/shared';
```

## 模块说明

### Types (类型定义)

- `auth.types.ts` - 认证相关类型
- `i18n.types.ts` - 多语言相关类型
- `theme.types.ts` - 主题相关类型
- `content.types.ts` - 内容数据类型

### Constants (常量配置)

- `authConfig.ts` - 认证常量
- `i18nConfig.ts` - 多语言配置
- `themeConfig.ts` - 主题配置

### Utils (工具函数)

- `debug.ts` - 调试工具（开发环境启用）
- `scroll.ts` - 滚动工具函数

## 依赖规则

### 允许的依赖

- 轻量级第三方库

### 禁止的依赖

- Core 层包
- Service 层包
- UI/Portal 代码
- React、Next.js 等框架依赖
- 数据库库

## 脚本

```bash
# 类型检查
pnpm type-check

# Lint 检查
pnpm lint
```

## 开发规范

1. **类型优先** - 所有导出的函数和对象都应有完整的 TypeScript 类型定义
2. **纯函数** - 工具函数应尽量保持纯函数，无副作用
3. **无业务逻辑** - 此包只提供共享工具，不包含业务逻辑
4. **模块化** - 每个文件只负责单一功能，保持代码清晰

## 版本历史

- 1.0.0 - 初始版本，整合原 shared-types、shared-constants、shared-utils
