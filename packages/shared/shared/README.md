# @vxture/shared

> **面向开发人员/AI 的使用文档**
> 本文档详细说明 @vxture/shared 包的功能、API 和使用方法，包含完整的导入方式、类型说明和代码示例。

## 包概述

@vxture/shared 是 Vxture 平台的**核心共享基础库**，提供以下能力：

- **纯工具函数**（格式化、验证、调试）
- **通用类型定义**（认证、主题、语言、API 响应、UI 语义化）
- **全局常量配置**（认证、主题、语言、UI）
- **无依赖**：不依赖任何内部包或框架，运行于任何环境

## 安装和导入

```bash
# 通过 pnpm 安装（monorepo）
pnpm add @vxture/shared

# 导入方式（统一入口）
import {
  // 类型
  type UserInfo,
  type TokenData,
  type Theme,
  type Locale,
  type ApiResponse,

  // 常量
  AUTH_CONSTANTS,
  THEME_CONSTANTS,
  SEMANTIC_COLORS,

  // 语言相关（统一）
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,

  // 工具函数
  debugLog,
  debugWarn,
  debugError,
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
console.log(SUPPORTED_LOCALES); // ['zh-CN', 'en-US']

// 默认语言
console.log(DEFAULT_LOCALE); // 'zh-CN'

// 类型安全的语言变量
const locale: Locale = "en-US";

// 检查语言支持
const isSupported = SUPPORTED_LOCALES.includes(locale);
```

#### 格式化工具

```typescript
// 格式化货币
formatCurrency(100, "zh"); // '¥100.00'
formatCurrency(100, "en"); // '$100.00'
formatCurrency(100, "zh", "USD"); // '$100.00'

// 格式化日期
formatDate(new Date(), "zh"); // '2026/3/13'
formatDate(new Date(), "en"); // '3/13/2026'

// 格式化数字
formatNumber(1000.5, "zh"); // '1,000.5'
formatNumber(1000.5, "en"); // '1,000.5'
```

### 2. 认证系统

#### 类型定义

```typescript
// 用户信息
interface UserInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  permissions: string[];
  lastLogin?: number;
}

// Token 数据结构
interface TokenData {
  token: string;
  refreshToken: string;
  expiresIn: number;
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
type Theme = "light" | "dark" | "system";

// 扩展主题类型（支持自定义主题）
type ThemeValue = Theme | (string & {});

// 使用示例
const defaultTheme: Theme = "light"; // ✅
const customTheme: ThemeValue = "tenant-blue"; // ✅
```

#### 主题常量

```typescript
// 默认主题
THEME_CONSTANTS.DEFAULT_THEME; // 'system'

// 可用主题（isExplicitDark：是否显式指定为深色，system 主题不确定，故为 false）
THEME_CONSTANTS.AVAILABLE_THEMES; // [
//   { name: 'system', displayName: '跟随系统', isExplicitDark: false },
//   { name: 'light',  displayName: '浅色',     isExplicitDark: false },
//   { name: 'dark',   displayName: '深色',     isExplicitDark: true  },
// ]

// 存储键
THEME_CONSTANTS.STORAGE_KEY; // 'theme-storage'

// HTML 属性
THEME_CONSTANTS.THEME_ATTRIBUTE; // 'data-theme'
```

### 4. 调试工具

#### 使用方式

```typescript
// 自动检测开发环境，无需手动配置
debugLog("应用已初始化");
debugWarn("使用了已废弃的 API");
debugError("严重错误");
```

### 5. API 响应类型

#### 标准响应类型

```typescript
// 成功响应
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: number;
}

// 错误响应
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: number;
}

// 联合类型
type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// 使用示例
const response: ApiResponse<UserInfo> = {
  success: true,
  data: { id: "1", name: "用户" },
  timestamp: Date.now(),
};
```

### 6. UI 语义化系统

#### 语义色彩

```typescript
// 支持的语义色彩
console.log(SEMANTIC_COLORS); // ['primary', 'secondary', 'brand', 'info', 'success', 'warning', 'danger']

// 语义色彩类型
type SemanticColor =
  | "primary"
  | "secondary"
  | "brand"
  | "info"
  | "success"
  | "warning"
  | "danger";

// 使用示例
const buttonColor: SemanticColor = "primary";
```

### 7. 错误类型

```typescript
import {
  VxtureError,
  ValidationError,
  UnauthorizedError,
  isVxtureError,
} from "@vxture/shared";

// 抛出语义化错误
throw new ValidationError("邮箱格式不正确");
throw new UnauthorizedError(); // 默认 message: 'Unauthorized'

// 所有子类继承 VxtureError，携带 status / code / details / requestId
try {
  await someOp();
} catch (err) {
  if (isVxtureError(err)) {
    console.log(err.status, err.code); // 400, 'VALIDATION_ERROR'
    console.log(err.toJSON());
  }
}
```

可用子类：`ValidationError`(400) / `UnauthorizedError`(401) / `ForbiddenError`(403) / `NotFoundError`(404) / `ConflictError`(409) / `InternalServerError`(500)

### 8. 对象工具

```typescript
import { deepMerge, deepClone, isPlainObject } from "@vxture/shared";

// 深度合并（source 优先，数组替换不追加）
const merged = deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } });
// → { a: 1, b: { c: 2, d: 3 } }

// 深度克隆（基于 structuredClone，支持 Map/Set/循环引用）
const clone = deepClone({ a: { b: 1 } });
```

### 9. 跨 Portal 导航上下文

```typescript
import { encodePortalContext, decodePortalContext } from "@vxture/shared";

// 序列化（用于构造跳转 URL）
const qs = encodePortalContext({
  from: "website",
  returnTo: "https://...",
  caller: "Vxture 官网",
});
const url = `${CONSOLE_URL}?${qs}`;

// 反序列化（在目标 portal 入口调用）
// ⚠️ returnTo 仅验证类型，消费方必须自行校验 URL 合法性和 origin 白名单
const ctx = decodePortalContext(window.location.search); // null | PortalNavContext
```

### 10. 用户偏好常量

```typescript
import { PREFERENCE_CONSTANTS } from "@vxture/shared";

PREFERENCE_CONSTANTS.SYNC_STORAGE_KEY; // 'vx-user-preferences'（跨标签页同步用）
PREFERENCE_CONSTANTS.SYNC_EVENT; // 'vx:user-preferences'（同文档通知用）
PREFERENCE_CONSTANTS.DENSITY_COOKIE_KEY; // 'vx-density'
PREFERENCE_CONSTANTS.COOKIE_MAX_AGE; // 31536000（1 年，秒）
```

## 脚本命令

```bash
# 构建产物（dist/）
pnpm build

# 类型检查
pnpm type-check
```

## 依赖和边界

### 允许的依赖

- **zod**：schema 校验
- **dayjs**：日期工具
- 其他轻量无副作用三方库

### 禁止的依赖

- 任何内部包（@vxture/core-_、@vxture/service-_ 等）
- NestJS / Next.js / React
- Prisma / axios / dotenv
- 浏览器专用 API（window、document、localStorage）
- Node.js 专用 API（fs、path、http）

## 使用场景示例

### 在服务端使用

```typescript
import { SUPPORTED_LOCALES, type Locale, formatNumber } from "@vxture/shared";

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
import { debugLog, DEFAULT_LOCALE } from "@vxture/shared";

// 获取用户偏好语言
function getUserLocale(): string {
  return localStorage.getItem("locale") || DEFAULT_LOCALE;
}
```
