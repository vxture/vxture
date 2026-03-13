# @vxture/shared 包检查结果

## 检查概述

**检查时间**：2026-03-13
**检查文件**：`CHECK.md`
**检查内容**：架构规范、依赖管理、目录结构、TypeScript 规范、导出规则

---

## ✅ 通过项

### 1. 包配置检查

- **package.json**：包名为 `@vxture/shared`，版本为 1.0.0，private: true（符合 monorepo 内部包要求）
- **main 和 types**：正确配置了 `dist/index.js` 和 `dist/index.d.ts`
- **scripts**：配置了 build、type-check、lint、clean 等必要脚本
- **tsconfig.json**：正确继承 `../../../tsconfig.base.json`，设置了 rootDir 和 outDir，严格模式已启用
- **tsconfig.build.json**：继承 `./tsconfig.json`，开启了 declaration 和 sourceMap
- **tsup.config.ts**：正确配置了 entry、format、dts 和 clean 选项

### 2. 目录结构检查

- **src/index.ts**：使用 `export type *` 导出类型，`export *` 导出值，符合要求
- **src/constants/**：包含 auth.constants.ts、locale.constants.ts、theme.constants.ts，只包含常量定义
- **src/types/**：包含 auth.types.ts、content.types.ts、locale.types.ts、theme.types.ts，只包含类型定义
- **src/utils/**：包含 debug.utils.ts、locale.utils.ts，包含纯函数，无副作用

### 3. 命名规范检查

- 文件名符合 `*.utils.ts`、`*.types.ts`、`*.constants.ts` 规范
- 所有文件都包含完整的文件头注释
- 导出的常量和类型使用了合适的前缀（AUTH_CONSTANTS、THEME_CONSTANTS 等）

---

## ⚠️ 建议优化项

### 3. package.json 缺少优化字段

**文件**：`package.json`

**问题**：缺少 `exports` 字段、`files` 字段和 `sideEffects` 字段

**建议**：添加以下配置：

```json
"exports": {
  ".": {
    "import": "./dist/index.js",
    "require": "./dist/index.cjs",
    "types": "./dist/index.d.ts"
  }
},
"files": ["dist"],
"sideEffects": false
```

### 4. types/index.ts 导出方式优化

**文件**：`src/types/index.ts`

**问题**：使用 `export type { ... }` 逐个导出类型，维护成本较高

**建议**：可以考虑使用 `export type * from './xxx.types'` 简化导出（但需确保没有命名冲突）

**当前代码**：
```typescript
export type { UserInfo, LoginCredentials, LoginResponse, AuthState } from './auth.types';
export type { LocaleType, I18nConfig, I18nResource, I18nState } from './locale.types';
export type { ThemeType, ThemeConfig, ThemeState } from './theme.types';
export type {
  ContentTheme,
  ContentIntent,
  ContentVariant,
  ButtonVariant,
  MediaType,
  Link,
  Action,
  CTA,
  Media,
  Cover,
  ContactItem,
  SharedSuccessResponse,
  SharedErrorResponse,
  SharedAPIResponse,
} from './content.types';
```

**优化建议**：
```typescript
export type * from './auth.types';
export type * from './content.types';
export type * from './locale.types';
export type * from './theme.types';
```

### 5. index.ts 示例代码清理

**文件**：`src/index.ts`

**问题**：示例代码中引用了不存在的 `resetWindowScrollTop` 和 `UserInfo` 类型

**建议**：清理示例代码，移除不存在的引用

---

## ❌ 必须修复项

### 6. locale.constants.ts 类型定义位置不当

**文件**：`src/constants/locale.constants.ts`

**问题**：在常量文件中定义了类型 `Locale`，混合了类型和值的导出，不符合架构规范

**修复方案**：将类型定义移到 `src/types/locale.types.ts` 中，常量文件只保留值

**当前代码（需要移除）**：
```typescript
/**
 * Locale 类型
 * @description 全平台唯一的语言类型定义
 */
export type Locale = typeof SUPPORTED_LOCALES[number];
```

### 7. locale.types.ts 类型导入问题

**文件**：`src/types/locale.types.ts`

**问题**：从常量文件导入类型，形成了类型依赖循环

**修复方案**：将 Locale 类型定义移到类型文件中，避免从常量文件导入类型

**当前代码**：
```typescript
import type { Locale } from '../constants/locale.constants';
```

**修复后**：
```typescript
export const SUPPORTED_LOCALES = ['zh', 'en'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];
```

### 8. locale.utils.ts 类型导入优化

**文件**：`src/utils/locale.utils.ts`

**问题**：从 `../constants` 导入类型，增加了耦合

**修复方案**：改为从类型文件导入，或者直接在工具文件中定义类型

**当前代码**：
```typescript
import type { Locale } from '../constants';
```

**修复后**：
```typescript
import type { Locale } from '../types';
```

### 9. auth.types.ts 包含 store 方法定义

**文件**：`src/types/auth.types.ts`

**问题**：`AuthState` 接口包含了 Zustand store 的方法定义，违反了 shared 包的纯类型原则

**修复方案**：将 store 方法定义移到 `core-auth` 包中，shared 包只保留数据类型

**需要移除的部分**：
```typescript
export interface AuthState {
  user: UserInfo | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenRefreshTimerId: ReturnType<typeof setTimeout> | null;

  /**
   * Login with credentials
   */
  login: (credentials: LoginCredentials) => Promise<void>;

  /**
   * Logout the user
   */
  logout: () => Promise<void>;

  /**
   * Refresh the access token
   */
  refreshTokenAction: () => Promise<void>;

  /**
   * Set token data
   */
  setToken: (token: string, refreshToken: string, tokenExpiry: number) => void;

  /**
   * Set user information
   */
  setUser: (user: UserInfo | null) => void;

  /**
   * Set up token refresh timer
   */
  setupTokenRefreshTimer: () => void;

  /**
   * Clear token refresh timer
   */
  clearTokenRefreshTimer: () => void;

  /**
   * Check if user has permission
   */
  hasPermission: (permission: string) => boolean;

  /**
   * Clear error message
   */
  clearError: () => void;
}
```

### 10. theme.types.ts 包含 store 方法定义

**文件**：`src/types/theme.types.ts`

**问题**：`ThemeState` 接口包含了 Zustand store 的方法定义

**修复方案**：将 store 方法定义移到 `design-system` 或 `core-locale` 包中

**需要移除的部分**：
```typescript
export interface ThemeState {
  theme: ThemeType;
  availableThemes: ThemeConfig[];
  isDarkMode: boolean;

  /**
   * Set theme
   * @param theme - Theme name
   */
  setTheme: (theme: ThemeType) => void;

  /**
   * Toggle theme (light/dark)
   */
  toggleTheme: () => void;
}
```

### 11. locale.types.ts 包含 store 方法定义

**文件**：`src/types/locale.types.ts`

**问题**：`I18nState` 接口包含了 Zustand store 的方法定义

**修复方案**：将 store 方法定义移到 `core-locale` 包中

**需要移除的部分**：
```typescript
export interface I18nState {
  locale: Locale;
  availableLocales: I18nConfig[];

  /**
   * Translation function
   * @param key - Translation key
   * @returns Translated text
   */
  t: (key: string) => string;

  /**
   * Set current locale
   * @param locale - Locale identifier
   */
  setLocale: (locale: Locale) => void;
}
```

---

## ❓ 需要人工决策项

### 12. 是否添加缺失的工具和类型文件

**问题**：架构文档提到可能需要补充 `format.utils.ts`、`pagination.types.ts`、`error.types.ts`

**决策建议**：
- 评估平台实际需求
- 如果这些工具/类型被多个包使用，则应该添加
- 否则，可以在需要时再添加

### 13. shared 包是否应该发布为 public

**问题**：检查清单提到 `private: false` 可能更合适，但当前是 `private: true`（符合 monorepo 内部包）

**决策建议**：
- 保持 `private: true`，因为这是 monorepo 内部包，通过 workspace 引用
- 如果将来需要发布到 npm，可以设置为 `private: false` 并配置合适的 publishConfig

---

## 🚀 修复优先级

1. **高优先级**：修复 types 目录中包含 store 方法定义的问题（auth.types.ts、theme.types.ts、locale.types.ts）
2. **中优先级**：修复类型导入和定义的问题（locale.types.ts、locale.constants.ts、locale.utils.ts）
3. **低优先级**：优化 package.json 和 types/index.ts 的配置

---

## 📊 检查统计

- 通过项：10 项
- 建议优化项：3 项
- 必须修复项：6 项
- 需要人工决策项：2 项

---

## 🔍 备注

该检查是基于 Vxture 平台架构规范进行的。shared 包作为最底层的包，必须保持纯工具、类型、常量的定位，不能包含任何业务逻辑或状态管理代码。

所有修改应符合根目录 `CLAUDE.md` 和包内 `CLAUDE.md` 中规定的规范。
