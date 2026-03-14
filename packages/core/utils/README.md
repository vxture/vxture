# @vxture/core-utils — 平台级工具集

> 面向开发人员的使用文档。开发规范见 `CLAUDE.md`。

---

## 概述

平台级通用工具：日志、环境判断、类型守卫、错误类。

与 `@vxture/shared` 的区别：
- **shared**：纯通用工具，无平台意识
- **core-utils**：有平台意识的工具（结构化日志、环境判断）

---

## 安装

```bash
pnpm add @vxture/core-utils
```

---

## 快速使用

### 日志工具

```typescript
import { VxLogger, logger, LogLevel } from '@vxture/core-utils';

// 使用默认 logger
logger.info('Hello', { user: '123' });

// 创建自定义 logger
const customLogger = new VxLogger({ level: LogLevel.DEBUG, context: 'MyApp' });
customLogger.debug('Debug message');

// 子 logger
const childLogger = customLogger.child('SubModule');
childLogger.warn('Warning');
```

### 环境判断

```typescript
import {
  getNodeEnv,
  isProduction,
  isDevelopment,
  isTest,
  isStaging,
  isNode,
  isBrowser,
} from '@vxture/core-utils';

console.log(getNodeEnv()); // 'development'
console.log(isProduction()); // true/false
console.log(isNode()); // true/false
console.log(isBrowser()); // true/false
```

### 类型守卫

```typescript
import {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isDefined,
  isNotNull,
  isPresent,
  isNonEmptyString,
  isValidUrl,
  isUuid,
} from '@vxture/core-utils';

function processValue(value: unknown) {
  if (isString(value)) {
    return value.toUpperCase();
  }
  if (isNumber(value)) {
    return value * 2;
  }
  if (isPresent(value)) {
    // value 既不是 null 也不是 undefined
  }
}
```

### 错误类

```typescript
import {
  VxtureError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
  isVxtureError,
} from '@vxture/core-utils';

// 使用预定义错误
throw new NotFoundError('User not found');
throw new ValidationError('Invalid email');

// 检查错误类型
if (isVxtureError(err)) {
  console.log(err.code, err.status);
}
```

---

## API

### 日志

| 导出 | 类型 | 说明 |
|------|------|------|
| `VxLogger` | Class | 日志类 |
| `logger` | Instance | 默认 logger 实例 |
| `LogLevel` | Const | 日志级别枚举 |

### 环境

| 导出 | 类型 | 说明 |
|------|------|------|
| `getNodeEnv()` | Function | 获取 NODE_ENV |
| `isProduction()` | Function | 是否生产环境 |
| `isDevelopment()` | Function | 是否开发环境 |
| `isTest()` | Function | 是否测试环境 |
| `isStaging()` | Function | 是否 staging 环境 |
| `isNode()` | Function | 是否 Node.js 环境 |
| `isBrowser()` | Function | 是否浏览器环境 |

### 类型守卫

| 分类 | 导出 |
|------|------|
| 基础类型 | `isString`, `isNumber`, `isBoolean`, `isFunction`, `isSymbol` |
| null/undefined | `isDefined`, `isNotNull`, `isPresent` |
| 对象/数组 | `isObject`, `isArray`, `isEmptyObject`, `isEmptyArray` |
| 字符串内容 | `isNonEmptyString`, `isValidUrl`, `isUuid` |

### 错误类

| 导出 | HTTP 状态 | 说明 |
|------|-----------|------|
| `VxtureError` | - | 基类 |
| `ValidationError` | 400 | 验证错误 |
| `UnauthorizedError` | 401 | 未授权 |
| `ForbiddenError` | 403 | 禁止访问 |
| `NotFoundError` | 404 | 未找到 |
| `ConflictError` | 409 | 冲突 |
| `InternalServerError` | 500 | 服务器错误 |
| `isVxtureError()` | - | 类型守卫 |

### 类型

| 导出 | 说明 |
|------|------|
| `Maybe<T>` | `T \| null \| undefined` |
| `Nullable<T>` | `T \| null` |
| `Optional<T>` | `T \| undefined` |
| `Class<T>` | 构造函数类型 |
| `FunctionType` | 任意函数类型 |
| `DeepPartial<T>` | 深度可选 |
| `DeepReadonly<T>` | 深度只读 |
| `Awaited<T>` | Promise 值类型 |
| `RequiredKeys<T, K>` | 指定 key 变为必填 |
| `PartialKeys<T, K>` | 指定 key 变为可选 |
| `LogRecord` | 日志记录类型 |
| `LoggerConfig` | Logger 配置类型 |
| `ErrorMetadata` | 错误元数据类型 |

---

## 目录结构

```
src/
├── utils/
│   ├── error.utils.ts          # 错误类
│   ├── logger.utils.ts         # 日志工具
│   ├── env.utils.ts            # 环境判断
│   ├── type-guards.utils.ts    # 类型守卫
│   └── index.ts
├── types/
│   ├── utils.types.ts          # 工具类型
│   └── index.ts
└── index.ts                    # 统一出口
```
