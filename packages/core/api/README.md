# @vxture/core-api — HTTP 客户端基础设施

> **面向开发人员/AI 的使用文档**
> 本文档详细说明如何使用 @vxture/core-api 包的功能和方法。
> 如需了解开发该包的约束和规范，请查看 `CLAUDE.md`。

---

## 🌟 包概述

统一 HTTP 请求基础设施：请求封装、拦截器、错误标准化、retry / timeout。
供 BFF、Service、Agent Server 层使用。必须双端可运行（Node.js + 浏览器）。

**核心特性：**
- 基于原生 fetch 封装，双端兼容
- 请求/响应拦截器机制
- 统一错误标准化
- 支持 retry 和 timeout 配置
- 类型安全的 API 设计

---

## 📦 安装

```bash
pnpm add @vxture/core-api
```

---

## 🚀 使用示例

### 基础使用

```typescript
import { getApiClient, type ApiResponse, type ApiError } from '@vxture/core-api';

// 创建 API 客户端
const client = getApiClient({
  baseUrl: '/api',
  timeout: 10000,
});

// 发送 GET 请求
const response = await client.get<User>('/users/123');
console.log(response.data);

// 发送 POST 请求
const created = await client.post<User>('/users', { name: 'John Doe' });

// 错误处理
try {
  await client.get('/protected');
} catch (error) {
  const apiError = error as ApiError;
  console.error(apiError.message, apiError.statusCode);
}
```

### 拦截器

```typescript
import { getInterceptorManager, type RequestInterceptor, type ResponseInterceptor } from '@vxture/core-api';

const interceptorManager = getInterceptorManager();

// 添加请求拦截器
const requestInterceptor: RequestInterceptor = async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

interceptorManager.addRequestInterceptor(requestInterceptor);

// 添加响应拦截器
const responseInterceptor: ResponseInterceptor = async (response) => {
  if (response.status === 401) {
    // 处理未授权
  }
  return response;
};

interceptorManager.addResponseInterceptor(responseInterceptor);
```

---

## 📚 API 参考

### ApiClient

```typescript
/**
 * API 客户端类
 */
export class ApiClient {
  /**
   * 发送 GET 请求
   * @param url - 请求 URL
   * @param config - 请求配置
   * @returns Promise<ApiResponse<T>>
   */
  async get<T>(url: string, config?: ApiConfig): Promise<ApiResponse<T>>

  /**
   * 发送 POST 请求
   * @param url - 请求 URL
   * @param data - 请求数据
   * @param config - 请求配置
   * @returns Promise<ApiResponse<T>>
   */
  async post<T>(url: string, data?: unknown, config?: ApiConfig): Promise<ApiResponse<T>>

  /**
   * 发送 PUT 请求
   * @param url - 请求 URL
   * @param data - 请求数据
   * @param config - 请求配置
   * @returns Promise<ApiResponse<T>>
   */
  async put<T>(url: string, data?: unknown, config?: ApiConfig): Promise<ApiResponse<T>>

  /**
   * 发送 DELETE 请求
   * @param url - 请求 URL
   * @param config - 请求配置
   * @returns Promise<ApiResponse<T>>
   */
  async delete<T>(url: string, config?: ApiConfig): Promise<ApiResponse<T>>
}
```

### 工厂函数

```typescript
/**
 * 获取 API 客户端实例
 * @param config - API 配置
 * @returns ApiClient 实例
 */
export function getApiClient(config?: ApiConfig): ApiClient

/**
 * 获取拦截器管理器
 * @returns ApiInterceptorManager 实例
 */
export function getInterceptorManager(): ApiInterceptorManager
```

### 类型定义

```typescript
/**
 * API 配置
 */
export interface ApiConfig {
  baseUrl?: string
  timeout?: number
  headers?: Record<string, string>
  retry?: {
    maxRetries: number
    retryDelay: number
  }
}

/**
 * API 响应
 */
export interface ApiResponse<T> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

/**
 * API 错误
 */
export class ApiError extends Error {
  statusCode: number
  response?: ApiResponse<unknown>
  code?: string
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

---

## 🛠 开发注意事项

### 双端兼容

所有代码必须同时兼容浏览器和 Node.js 环境：

```typescript
// ✅ 正确 - 使用原生 fetch
const response = await fetch(url, options);

// ❌ 错误 - 使用 Node.js 专用 API
const response = await http.request(url, options);
```

### 导入路径

消费方只从 `@vxture/core-api` 导入，禁止深路径导入：

```typescript
// ✅ 正确
import { ApiClient, getApiClient } from '@vxture/core-api';

// ❌ 错误
import { ApiClient } from '@vxture/core-api/src/client/api.client';
```

---

## 📁 目录结构

```
packages/core/api/
├── src/
│   ├── client/       # API 客户端实现
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
- 实现 ApiClient 类
- 实现请求/响应拦截器
- 实现错误标准化
- 添加类型定义
- 完善文档和规范
