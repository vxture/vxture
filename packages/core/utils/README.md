# @vxture/core-utils — 平台级工具集

> **面向开发人员/AI 的使用文档**
> 本文档详细说明如何使用 @vxture/core-utils 包的功能和方法。
> 如需了解开发该包的约束和规范，请查看 `CLAUDE.md`。

---

## 🌟 包概述

平台级通用工具：日志、环境判断、类型守卫、平台级 helper。
与 `@vxture/shared` 的区别：shared 是纯通用工具，core-utils 是有平台意识的工具（如带结构化日志格式）。

**核心特性：**
- 结构化日志工具
- 环境判断工具
- 类型守卫工具
- 平台级错误处理
- 双端兼容（浏览器 + Node.js）

---

## 📦 安装

```bash
pnpm add @vxture/core-utils
```

---

## 🚀 使用示例

### 日志工具

```typescript
import { createLogger, LogLevel, type LogRecord } from '@vxture/core-utils';

// 创建日志记录器
const logger = createLogger({
  level: LogLevel.INFO,
  prefix: 'MyApp',
});

// 记录不同级别的日志
logger.debug('调试信息', { data: 'xxx' });
logger.info('普通信息', { user: '123' });
logger.warn('警告信息', { timeout: 3000 });
logger.error('错误信息', { error: new Error('Something went wrong') });

// 创建子日志记录器
const childLogger = logger.child('Module');
childLogger.info('模块信息');
```

### 环境判断

```typescript
import { isServer, isBrowser, isDev, isProd, isTest } from '@vxture/core-utils';

// 判断运行环境
if (isServer()) {
  console.log('运行在服务器端');
}

if (isBrowser()) {
  console.log('运行在浏览器端');
}

// 判断构建环境
if (isDev()) {
  console.log('开发环境');
}

if (isProd()) {
  console.log('生产环境');
}

if (isTest()) {
  console.log('测试环境');
}
```

### 类型守卫

```typescript
import {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isNonNullable,
  type Maybe,
  type Nullable,
} from '@vxture/core-utils';

// 基本类型检查
function processValue(value: unknown) {
  if (isString(value)) {
    console.log('字符串:', value.toUpperCase());
  } else if (isNumber(value)) {
    console.log('数字:', value * 2);
  } else if (isBoolean(value)) {
    console.log('布尔:', value);
  } else if (isObject(value)) {
    console.log('对象:', Object.keys(value));
  } else if (isArray(value)) {
    console.log('数组:', value.length);
  } else if (isFunction(value)) {
    console.log('函数');
  }
}

// 非空检查
function processUser(user: Nullable<User>) {
  if (isNonNullable(user)) {
    console.log(user.name);
  }
}
```

### 错误处理

```typescript
import {
  VxtureError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
  type ErrorMetadata,
} from '@vxture/core-utils';

// 使用标准错误
throw new NotFoundError('User not found', {
  metadata: { userId: '123' },
});

throw new ValidationError('Invalid data', {
  metadata: { fields: ['email', 'password'] },
});

// 创建自定义错误
class CustomError extends VxtureError {
  constructor(message: string, options?: { metadata?: ErrorMetadata }) {
    super(message, { code: 'CUSTOM_ERROR', ...options });
  }
}
```

---

## 📚 API 参考

### 日志工具

```typescript
/**
 * 日志记录器
 */
export class Logger {
  /**
   * 创建新的日志记录器
   * @param config - 日志配置
   */
  constructor(config?: LoggerConfig)

  /**
   * 记录调试日志
   * @param message - 日志消息
   * @param metadata - 元数据
   */
  debug(message: string, metadata?: Record<string, unknown>): void

  /**
   * 记录信息日志
   * @param message - 日志消息
   * @param metadata - 元数据
   */
  info(message: string, metadata?: Record<string, unknown>): void

  /**
   * 记录警告日志
   * @param message - 日志消息
   * @param metadata - 元数据
   */
  warn(message: string, metadata?: Record<string, unknown>): void

  /**
   * 记录错误日志
   * @param message - 日志消息
   * @param metadata - 元数据
   */
  error(message: string, metadata?: Record<string, unknown>, error?: Error): void

  /**
   * 创建子日志记录器
   * @param prefix - 前缀
   * @returns 子日志记录器
   */
  child(prefix: string): Logger
}

/**
 * 创建日志记录器
 * @param config - 日志配置
 * @returns Logger 实例
 */
export function createLogger(config?: LoggerConfig): Logger

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}
```

### 环境判断

```typescript
/**
 * 检查是否运行在服务器端
 * @returns 是否在服务器端
 */
export function isServer(): boolean

/**
 * 检查是否运行在浏览器端
 * @returns 是否在浏览器端
 */
export function isBrowser(): boolean

/**
 * 检查是否在开发环境
 * @returns 是否在开发环境
 */
export function isDev(): boolean

/**
 * 检查是否在生产环境
 * @returns 是否在生产环境
 */
export function isProd(): boolean

/**
 * 检查是否在测试环境
 * @returns 是否在测试环境
 */
export function isTest(): boolean
```

### 类型守卫

```typescript
/**
 * 检查是否为字符串
 */
export function isString(value: unknown): value is string

/**
 * 检查是否为数字
 */
export function isNumber(value: unknown): value is number

/**
 * 检查是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean

/**
 * 检查是否为对象
 */
export function isObject(value: unknown): value is Record<string, unknown>

/**
 * 检查是否为数组
 */
export function isArray(value: unknown): value is unknown[]

/**
 * 检查是否为函数
 */
export function isFunction(value: unknown): value is Function

/**
 * 检查是否非空
 */
export function isNonNullable<T>(value: T): value is NonNullable<T>
```

### 错误处理

```typescript
/**
 * 基础错误类
 */
export class VxtureError extends Error {
  code: string
  metadata?: ErrorMetadata

  constructor(
    message: string,
    options?: {
      code?: string
      metadata?: ErrorMetadata
      cause?: Error
    }
  )
}

/**
 * 验证错误
 */
export class ValidationError extends VxtureError

/**
 * 未找到错误
 */
export class NotFoundError extends VxtureError

/**
 * 未授权错误
 */
export class UnauthorizedError extends VxtureError

/**
 * 禁止访问错误
 */
export class ForbiddenError extends VxtureError

/**
 * 服务器内部错误
 */
export class InternalServerError extends VxtureError
```

### 类型定义

```typescript
/**
 * 可能为 undefined
 */
export type Maybe<T> = T | undefined

/**
 * 可能为 null
 */
export type Nullable<T> = T | null

/**
 * 可选类型
 */
export type Optional<T> = T | undefined | null

/**
 * 类类型
 */
export type Class<T = unknown> = new (...args: unknown[]) => T

/**
 * 函数类型
 */
export type FunctionType = (...args: unknown[]) => unknown

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 日志配置
 */
export interface LoggerConfig {
  level?: LogLevel
  prefix?: string
  enableTimestamp?: boolean
}

/**
 * 日志记录
 */
export interface LogRecord {
  timestamp: Date
  level: LogLevel
  prefix?: string
  message: string
  metadata?: Record<string, unknown>
  error?: Error
}

/**
 * 错误元数据
 */
export interface ErrorMetadata {
  [key: string]: unknown
}
```

---

## 🛠 开发注意事项

### 与 shared 的区别

- `@vxture/shared`：纯通用工具，无平台意识
- `@vxture/core-utils`：平台级工具，有平台意识

```typescript
// ✅ 正确 - 放在 core-utils
const logger = createLogger({ prefix: 'MyApp' });

// ✅ 正确 - 放在 shared
const result = sum(1, 2);
```

### 导入路径

消费方只从 `@vxture/core-utils` 导入，禁止深路径导入：

```typescript
// ✅ 正确
import { createLogger, isServer } from '@vxture/core-utils';

// ❌ 错误
import { createLogger } from '@vxture/core-utils/src/utils/logger.utils';
```

---

## 📁 目录结构

```
packages/core/utils/
├── src/
│   ├── utils/        # 工具函数
│   ├── types/        # 类型定义
│   └── index.ts      # 单一公共出口
├── README.md         # 使用文档（本文档）
├── CLAUDE.md         # AI 编码指南
└── package.json      # 包配置
```

---

## 🔄 向后兼容性

包保持向后兼容性，所有废弃 API 会标记 `@deprecated` 注释。

---

## 📝 更新日志

### v1.0.0
- 初始版本
- 实现日志工具
- 实现环境判断工具
- 实现类型守卫工具
- 实现错误处理工具
- 添加类型定义
- 完善文档和规范
