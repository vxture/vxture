# @vxture/core-tenant — 多租户基础设施

> **面向开发人员/AI 的使用文档**
> 本文档详细说明如何使用 @vxture/core-tenant 包的功能和方法。
> 如需了解开发该包的约束和规范，请查看 `CLAUDE.md`。

---

## 🌟 包概述

多租户上下文管理：tenantId 解析、租户上下文传播、租户配置查询工具。
为所有后端层提供租户感知能力。

**核心特性：**
- 租户上下文管理
- 租户 ID 解析
- 租户上下文传播
- 租户配置查询
- 类型安全的 API 设计

---

## 📦 安装

```bash
pnpm add @vxture/core-tenant
```

---

## 🚀 使用示例

### 基础使用

```typescript
import { getTenantManager, type TenantContext, type TenantConfig } from '@vxture/core-tenant';

// 获取租户管理器
const tenantManager = getTenantManager();

// 设置租户上下文
const context: TenantContext = {
  tenantId: 'tenant-123',
  tenantName: 'Example Corp',
  isActive: true,
};
tenantManager.setTenantContext(context);

// 获取租户上下文
const currentContext = tenantManager.getTenantContext();
console.log(currentContext?.tenantId);

// 获取租户 ID
const tenantId = tenantManager.getTenantId();

// 检查是否有租户上下文
const hasTenant = tenantManager.hasTenantContext();

// 清除租户上下文
tenantManager.clearTenantContext();
```

### 租户 ID 解析

```typescript
import { TenantDetector, type TenantResolverOptions } from '@vxture/core-tenant';

// 创建租户检测器
const detector = new TenantDetector();

// 从请求头解析
const options: TenantResolverOptions = {
  headerName: 'X-Tenant-ID',
};
const result = detector.detectFromHeaders(request.headers, options);
if (result.found) {
  console.log('租户 ID:', result.tenantId);
}

// 从子域名解析
const domainResult = detector.detectFromHostname('tenant123.example.com');
if (domainResult.found) {
  console.log('租户 ID:', domainResult.tenantId);
}

// 从路径解析
const pathResult = detector.detectFromPath('/tenant-123/api/users');
if (pathResult.found) {
  console.log('租户 ID:', pathResult.tenantId);
}
```

### 租户隔离

```typescript
import { TenantIsolation, type TenantStorage } from '@vxture/core-tenant';

// 创建租户隔离器
const isolation = new TenantIsolation();

// 包装函数，自动处理租户上下文
const tenantAwareFn = isolation.wrap((data: unknown) => {
  const tenantId = getTenantManager().getTenantId();
  console.log('处理租户:', tenantId, data);
});

// 在不同租户上下文中执行
await isolation.runInTenantContext('tenant-1', () => {
  tenantAwareFn('数据 1');
});

await isolation.runInTenantContext('tenant-2', () => {
  tenantAwareFn('数据 2');
});
```

### 租户配置

```typescript
import { InMemoryTenantService, type TenantService } from '@vxture/core-tenant';

// 创建租户服务
const tenantService = new InMemoryTenantService();

// 添加租户配置
await tenantService.addTenant({
  tenantId: 'tenant-1',
  tenantName: 'Tenant One',
  config: {
    featureFlags: {
      premium: true,
    },
    limits: {
      users: 100,
    },
  },
});

// 获取租户配置
const tenant = await tenantService.getTenant('tenant-1');
console.log(tenant?.config.featureFlags.premium);

// 检查租户是否存在
const exists = await tenantService.tenantExists('tenant-1');

// 获取所有租户
const allTenants = await tenantService.getAllTenants();
```

---

## 📚 API 参考

### TenantManager

```typescript
/**
 * 租户管理器
 */
export class TenantManager {
  /**
   * 设置租户上下文
   * @param context - 租户上下文
   */
  setTenantContext(context: TenantContext): void

  /**
   * 获取租户上下文
   * @returns 租户上下文或 undefined
   */
  getTenantContext(): TenantContext | undefined

  /**
   * 获取租户 ID
   * @returns 租户 ID 或 undefined
   */
  getTenantId(): string | undefined

  /**
   * 检查是否有租户上下文
   * @returns 是否有租户上下文
   */
  hasTenantContext(): boolean

  /**
   * 清除租户上下文
   */
  clearTenantContext(): void
}
```

### TenantDetector

```typescript
/**
 * 租户检测器
 */
export class TenantDetector {
  /**
   * 从请求头检测租户
   * @param headers - 请求头
   * @param options - 解析选项
   * @returns 检测结果
   */
  detectFromHeaders(
    headers: Record<string, string | string[] | undefined>,
    options?: TenantResolverOptions
  ): TenantResolverResult

  /**
   * 从主机名检测租户
   * @param hostname - 主机名
   * @param options - 解析选项
   * @returns 检测结果
   */
  detectFromHostname(
    hostname: string,
    options?: TenantResolverOptions
  ): TenantResolverResult

  /**
   * 从路径检测租户
   * @param path - URL 路径
   * @param options - 解析选项
   * @returns 检测结果
   */
  detectFromPath(
    path: string,
    options?: TenantResolverOptions
  ): TenantResolverResult
}
```

### TenantIsolation

```typescript
/**
 * 租户隔离器
 */
export class TenantIsolation {
  /**
   * 在租户上下文中运行函数
   * @param tenantId - 租户 ID
   * @param fn - 要运行的函数
   * @returns 函数返回值
   */
  runInTenantContext<T>(tenantId: string, fn: () => T): Promise<T>

  /**
   * 包装函数，自动处理租户上下文
   * @param fn - 要包装的函数
   * @returns 包装后的函数
   */
  wrap<T extends (...args: unknown[]) => unknown>(fn: T): T
}
```

### 工厂函数

```typescript
/**
 * 获取租户管理器
 * @returns TenantManager 实例
 */
export function getTenantManager(): TenantManager
```

### 类型定义

```typescript
/**
 * 租户上下文
 */
export interface TenantContext {
  tenantId: string
  tenantName?: string
  isActive?: boolean
  config?: Record<string, unknown>
}

/**
 * 租户配置
 */
export interface TenantConfig {
  tenantId: string
  tenantName: string
  isActive: boolean
  config: Record<string, unknown>
}

/**
 * 租户解析选项
 */
export interface TenantResolverOptions {
  headerName?: string
  subdomainPattern?: RegExp
  pathPattern?: RegExp
}

/**
 * 租户解析结果
 */
export interface TenantResolverResult {
  found: boolean
  tenantId?: string
  source?: string
}

/**
 * 租户服务接口
 */
export interface TenantService {
  getTenant(tenantId: string): Promise<TenantConfig | undefined>
  tenantExists(tenantId: string): Promise<boolean>
  getAllTenants(): Promise<TenantConfig[]>
  addTenant(config: TenantConfig): Promise<void>
  updateTenant(config: TenantConfig): Promise<void>
  deleteTenant(tenantId: string): Promise<void>
}
```

---

## 🛠 开发注意事项

### 租户业务规则

本包只提供多租户基础设施，不包含任何租户业务规则：

```typescript
// ✅ 正确 - 租户上下文管理
const tenantId = tenantManager.getTenantId();

// ❌ 错误 - 租户业务规则
const canAccess = tenantManager.checkPermission('read'); // 应该在 service 层实现
```

### 导入路径

消费方只从 `@vxture/core-tenant` 导入，禁止深路径导入：

```typescript
// ✅ 正确
import { TenantManager, getTenantManager } from '@vxture/core-tenant';

// ❌ 错误
import { TenantManager } from '@vxture/core-tenant/src/context/tenant.context';
```

---

## 📁 目录结构

```
packages/core/tenant/
├── src/
│   ├── context/      # 租户上下文实现
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
- 实现 TenantManager 类
- 实现 TenantDetector 类
- 实现 TenantIsolation 类
- 添加类型定义
- 完善文档和规范
