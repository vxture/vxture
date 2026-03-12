# @vxture/core-config — 配置管理基础设施

> **面向开发人员/AI 的使用文档**
> 本文档详细说明如何使用 @vxture/core-config 包的功能和方法。
> 如需了解开发该包的约束和规范，请查看 `CLAUDE.md`。

---

## 🌟 包概述

环境感知配置加载与类型化访问。支持多环境（dev / staging / production）。

**核心特性：**
- 多环境配置支持
- 类型化配置访问
- 配置验证
- 配置源抽象
- 类型安全的 API 设计

---

## 📦 安装

```bash
pnpm add @vxture/core-config
```

---

## 🚀 使用示例

### 基础使用

```typescript
import { getConfigManager, type ConfigManager, type EnvConfigSource } from '@vxture/core-config';

// 创建配置管理器
const configManager = getConfigManager({
  sources: [
    new EnvConfigSource(),
  ],
});

// 获取配置值
const apiUrl = configManager.get<string>('API_URL');
const port = configManager.get<number>('PORT', 3000);

// 获取必需配置
try {
  const databaseUrl = configManager.getRequired<string>('DATABASE_URL');
} catch (error) {
  console.error('必需配置缺失');
}

// 检查配置是否存在
const hasFeature = configManager.has('FEATURE_FLAG');
```

### 多环境配置

```typescript
import { createConfigManager, type ConfigSource, type ObjectConfigSource } from '@vxture/core-config';

// 环境配置
const devConfig = {
  API_URL: 'http://localhost:3000',
  DEBUG: true,
};

const prodConfig = {
  API_URL: 'https://api.example.com',
  DEBUG: false,
};

// 根据环境选择配置
const env = process.env.NODE_ENV || 'development';
const config = env === 'production' ? prodConfig : devConfig;

// 创建配置管理器
const configManager = createConfigManager({
  sources: [
    new ObjectConfigSource(config),
    new EnvConfigSource(),
  ],
});
```

### 配置验证

```typescript
import { type ValidationSchema, type ConfigValidationResult } from '@vxture/core-config';

// 定义验证 schema
const schema: ValidationSchema = {
  API_URL: {
    type: 'string',
    required: true,
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
  },
  PORT: {
    type: 'number',
    required: false,
    default: 3000,
    validate: (value) => value > 0 && value < 65536,
  },
};

// 验证配置
const result: ConfigValidationResult = configManager.validate(schema);

if (!result.valid) {
  console.error('配置验证失败:', result.errors);
  console.warn('配置警告:', result.warnings);
}
```

---

## 📚 API 参考

### ConfigManager

```typescript
/**
 * 配置管理器
 */
export class ConfigManager {
  /**
   * 获取配置值
   * @param key - 配置键
   * @param defaultValue - 默认值
   * @returns 配置值
   */
  get<T>(key: string, defaultValue?: T): T | undefined

  /**
   * 获取必需配置值
   * @param key - 配置键
   * @returns 配置值
   * @throws 配置缺失时抛出错误
   */
  getRequired<T>(key: string): T

  /**
   * 检查配置是否存在
   * @param key - 配置键
   * @returns 是否存在
   */
  has(key: string): boolean

  /**
   * 设置配置值
   * @param key - 配置键
   * @param value - 配置值
   */
  set<T>(key: string, value: T): void

  /**
   * 获取所有配置
   * @returns 配置对象
   */
  getAll(): Record<string, unknown>

  /**
   * 验证配置
   * @param schema - 验证 schema
   * @returns 验证结果
   */
  validate(schema: ValidationSchema): ConfigValidationResult

  /**
   * 监听配置变化
   * @param listener - 监听器
   * @returns 取消监听函数
   */
  onConfigChange(listener: ConfigListener): () => void
}
```

### 配置源

```typescript
/**
 * 环境变量配置源
 */
export class EnvConfigSource implements ConfigSource {
  constructor(options?: { prefix?: string })
  get(key: string): unknown
  has(key: string): boolean
  getAll(): Record<string, unknown>
}

/**
 * 对象配置源
 */
export class ObjectConfigSource implements ConfigSource {
  constructor(config: Record<string, unknown>)
  get(key: string): unknown
  has(key: string): boolean
  getAll(): Record<string, unknown>
}

/**
 * 内存配置源
 */
export class MemoryConfigSource implements ConfigSource {
  constructor()
  get(key: string): unknown
  set(key: string, value: unknown): void
  has(key: string): boolean
  getAll(): Record<string, unknown>
}
```

### 工厂函数

```typescript
/**
 * 获取配置管理器
 * @param options - 配置选项
 * @returns ConfigManager 实例
 */
export function getConfigManager(options?: ConfigOptions): ConfigManager

/**
 * 创建配置管理器
 * @param options - 配置选项
 * @returns ConfigManager 实例
 */
export function createConfigManager(options?: ConfigOptions): ConfigManager
```

### 类型定义

```typescript
/**
 * 配置源接口
 */
export interface ConfigSource {
  get(key: string): unknown
  has(key: string): boolean
  getAll(): Record<string, unknown>
}

/**
 * 配置选项
 */
export interface ConfigOptions {
  sources?: ConfigSource[]
  validationSchema?: ValidationSchema
}

/**
 * 验证 schema
 */
export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    required?: boolean
    default?: unknown
    validate?: (value: unknown) => boolean | string
  }
}

/**
 * 验证结果
 */
export interface ConfigValidationResult {
  valid: boolean
  errors: ConfigValidationError[]
  warnings: ConfigValidationWarning[]
}

/**
 * 验证错误
 */
export interface ConfigValidationError {
  key: string
  message: string
}

/**
 * 验证警告
 */
export interface ConfigValidationWarning {
  key: string
  message: string
}

/**
 * 配置监听器
 */
export type ConfigListener = (event: ConfigEvent) => void

/**
 * 配置事件
 */
export interface ConfigEvent {
  type: ConfigEventType
  key?: string
  value?: unknown
}

/**
 * 配置事件类型
 */
export type ConfigEventType = 'set' | 'change'
```

---

## 🛠 开发注意事项

### .env 文件

本包不负责加载 `.env` 文件，由上层应用负责：

```typescript
// ✅ 正确 - 只读取 process.env
const databaseUrl = configManager.get<string>('DATABASE_URL');

// ❌ 错误 - 不加载 .env 文件
require('dotenv').config(); // 应该在上层应用中
```

### 导入路径

消费方只从 `@vxture/core-config` 导入，禁止深路径导入：

```typescript
// ✅ 正确
import { ConfigManager, getConfigManager } from '@vxture/core-config';

// ❌ 错误
import { ConfigManager } from '@vxture/core-config/src/client/config.client';
```

---

## 📁 目录结构

```
packages/core/config/
├── src/
│   ├── client/       # 配置客户端实现
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
- 实现 ConfigManager 类
- 实现配置源抽象
- 实现配置验证
- 添加类型定义
- 完善文档和规范
