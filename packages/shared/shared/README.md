# @vxture/shared

> **面向开发人员/AI 的使用文档**
> 本文档详细说明 @vxture/shared 包的功能、API 和使用方法，包含完整的导入方式、类型说明和代码示例。

## 包概述

@vxture/shared 是 Vxture 平台的**核心共享基础库**，提供以下能力：
- **纯工具函数**（格式化、验证、调试）
- **通用类型定义**（认证、主题、内容、语言）
- **全局常量配置**（认证、主题、语言）
- **无依赖**：不依赖任何内部包或框架，运行于任何环境

## 安装和导入

```bash
# 通过 pnpm 安装（monorepo）
pnpm add @vxture/shared

# 导入方式（统一入口）
import {
  // 类型
  type UserInfo,
  type AuthState,
  type ThemeType,
  type Locale,

  // 常量
  AUTH_CONSTANTS,
  THEME_CONSTANTS,

  // 语言相关（统一）
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,

  // 工具函数
  debugLog,
  configureDebug,
  formatCurrency,
  formatDate,
  formatNumber,
} from '@vxture/shared';
```

## 核心功能和方法

### 1. 语言系统

#### 语言类型和常量
```typescript
// 支持的语言列表（只读）
console.log(SUPPORTED_LOCALES); // ['zh', 'en']

// 默认语言
console.log(DEFAULT_LOCALE); // 'zh'

// 类型安全的语言变量
const locale: Locale = 'en';

// 检查语言支持
const isSupported = SUPPORTED_LOCALES.includes(locale);
```

#### 格式化工具
```typescript
// 格式化货币
formatCurrency(100, 'zh'); // '¥100.00'
formatCurrency(100, 'en'); // '$100.00'

// 格式化日期
formatDate(new Date(), 'zh'); // '2026/3/13'
formatDate(new Date(), 'en'); // '3/13/2026'

// 格式化数字
formatNumber(1000.5, 'zh'); // '1,000.5'
formatNumber(1000.5, 'en'); // '1,000.5'
```

### 2. 认证系统

#### 类型定义
```typescript
// 用户信息
interface UserInfo {
  id: string;
  name: string;
  email: string;
  permissions: string[];
  lastLogin?: number;
  [key: string]: unknown;
}

// 认证状态
interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

#### 认证常量
```typescript
// 存储键
AUTH_CONSTANTS.STORAGE_KEY; // 'auth-storage'

// Token 刷新缓冲区（30秒）
AUTH_CONSTANTS.TOKEN_REFRESH_BUFFER; // 30000

// 默认 Token 过期时间（1小时）
AUTH_CONSTANTS.DEFAULT_TOKEN_EXPIRY; // 3600

// 权限常量
AUTH_CONSTANTS.PERMISSIONS.ADMIN; // 'admin'
AUTH_CONSTANTS.PERMISSIONS.EDIT; // 'edit'
```

### 3. 主题系统

#### 主题类型
```typescript
// 有效主题类型
type ThemeType = 'light' | 'dark' | string;
```

#### 主题常量
```typescript
// 默认主题
THEME_CONSTANTS.DEFAULT_THEME; // 'light'

// 可用主题
THEME_CONSTANTS.AVAILABLE_THEMES; // [
//   { name: 'light', displayName: '浅色', isDark: false },
//   { name: 'dark', displayName: '深色', isDark: true }
// ]

// 存储键
THEME_CONSTANTS.STORAGE_KEY; // 'theme-storage'

// HTML 属性
THEME_CONSTANTS.THEME_ATTRIBUTE; // 'data-theme'
```

### 4. 调试工具

#### 使用方式
```typescript
// 配置调试（应用初始化时）
configureDebug({ isDevelopment: true });

// 输出日志（仅开发环境）
debugLog('应用已初始化');
debugWarn('使用了已废弃的 API');
debugError('严重错误');

// 获取当前配置
getDebugConfig();
```

## 兼容性说明

### 关于 scroll 工具

scroll 工具已**迁移到 @vxture/platform-browser 包**，但保留了向后兼容性：

```typescript
// 旧代码（会有废弃警告）
import { resetWindowScrollTop } from '@vxture/shared';

// 新代码（推荐）
import { resetWindowScrollTop } from '@vxture/platform-browser';
```

## 使用场景示例

### 在服务端使用
```typescript
import { SUPPORTED_LOCALES, type Locale, formatNumber } from '@vxture/shared';

export function formatPrice(amount: number, currency: string, locale: Locale) {
  const formattedNumber = formatNumber(amount, locale);
  return `${formattedNumber} ${currency}`;
}

export function isValidLocale(lang: string): lang is Locale {
  return SUPPORTED_LOCALES.includes(lang as Locale);
}
```

### 在前端使用
```typescript
import { configureDebug, debugLog, DEFAULT_LOCALE } from '@vxture/shared';

// 初始化时配置
configureDebug({ isDevelopment: process.env.NODE_ENV === 'development' });

// 语言切换
function switchLanguage(locale: string) {
  if (SUPPORTED_LOCALES.includes(locale)) {
    localStorage.setItem('locale', locale);
    debugLog('语言已切换到:', locale);
  }
}

// 获取用户偏好语言
function getUserLocale(): string {
  return localStorage.getItem('locale') || DEFAULT_LOCALE;
}
```

## 脚本命令

```bash
# 类型检查
pnpm type-check

# Lint 检查
pnpm lint

# 无构建命令（直接使用源代码）
```

## 依赖和边界

### 允许的依赖
- **zod**：schema 校验
- **dayjs**：日期工具
- 其他轻量无副作用三方库

### 禁止的依赖
- 任何内部包（@vxture/core-*、@vxture/service-* 等）
- NestJS / Next.js / React
- Prisma / axios / dotenv
- 浏览器专用 API（window、document、localStorage）
- Node.js 专用 API（fs、path、http）
