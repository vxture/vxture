# @vxture/core-auth — 认证基础设施

> **面向开发人员/AI 的使用文档**
> 本文档详细说明如何使用 @vxture/core-auth 包的功能和方法。
> 如需了解开发该包的约束和规范，请查看 `CLAUDE.md`。

---

## 🌟 包概述

平台级认证原语：JWT token 验证、session 工具、角色权限基础类型。
只提供平台基础设施，不包含任何业务级权限逻辑（业务权限属于 Service 层）。

**核心特性：**
- JWT token 验证和解析
- Session 管理工具
- 角色权限基础类型
- 本地存储和会话存储支持
- 类型安全的 API 设计

---

## 📦 安装

```bash
pnpm add @vxture/core-auth
```

---

## 🚀 使用示例

### 基础使用

```typescript
import { getAuthManager, type User, type AuthToken } from '@vxture/core-auth';

// 获取认证管理器
const authManager = getAuthManager();

// 登录
const user: User = {
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'admin',
};
const token: AuthToken = {
  accessToken: 'abc123',
  refreshToken: 'def456',
  expiresAt: Date.now() + 3600000,
};

authManager.login(user, token);

// 获取当前用户
const currentUser = authManager.getCurrentUser();
console.log(currentUser?.name);

// 检查是否已认证
const isAuthenticated = authManager.isAuthenticated();

// 获取 access token
const accessToken = authManager.getAccessToken();

// 刷新 token
const newToken = await authManager.refreshToken();

// 登出
authManager.logout();
```

### 权限检查

```typescript
import { getPermissionManager, type PermissionCheckOptions } from '@vxture/core-auth';

const permissionManager = getPermissionManager();

// 检查角色
const hasAdminRole = permissionManager.hasRole('admin');
const hasAnyRole = permissionManager.hasAnyRole(['admin', 'editor']);

// 检查权限
const options: PermissionCheckOptions = {
  requireAll: true,
};
const hasPermission = permissionManager.hasPermission(['read', 'write'], options);
```

### Token 解析

```typescript
import { extractBearerToken, verifyToken } from '@vxture/core-auth';

// 从请求头提取 Bearer token
const authHeader = 'Bearer abc123';
const token = extractBearerToken(authHeader);

// 验证 JWT token
try {
  const payload = await verifyToken(token, 'secret');
  console.log(payload.userId);
} catch (error) {
  console.error('Token 验证失败');
}
```

---

## 📚 API 参考

### AuthManager

```typescript
/**
 * 认证管理器
 */
export class AuthManager {
  /**
   * 登录
   * @param user - 用户信息
   * @param token - 认证令牌
   */
  login(user: User, token: AuthToken): void

  /**
   * 登出
   */
  logout(): void

  /**
   * 获取当前用户
   * @returns 用户信息或 null
   */
  getCurrentUser(): User | null

  /**
   * 检查是否已认证
   * @returns 是否已认证
   */
  isAuthenticated(): boolean

  /**
   * 获取 access token
   * @returns access token 或 null
   */
  getAccessToken(): string | null

  /**
   * 获取 refresh token
   * @returns refresh token 或 null
   */
  getRefreshToken(): string | null

  /**
   * 刷新 token
   * @returns 新的认证令牌
   */
  refreshToken(): Promise<AuthToken>

  /**
   * 检查 token 是否过期
   * @returns 是否已过期
   */
  isTokenExpired(): boolean
}
```

### PermissionManager

```typescript
/**
 * 权限管理器
 */
export class PermissionManager {
  /**
   * 检查角色
   * @param role - 角色
   * @returns 是否拥有该角色
   */
  hasRole(role: string): boolean

  /**
   * 检查是否拥有任一角色
   * @param roles - 角色列表
   * @returns 是否拥有任一角色
   */
  hasAnyRole(roles: string[]): boolean

  /**
   * 检查权限
   * @param permissions - 权限列表
   * @param options - 检查选项
   * @returns 是否拥有权限
   */
  hasPermission(permissions: string[], options?: PermissionCheckOptions): boolean
}
```

### 工厂函数

```typescript
/**
 * 获取认证管理器
 * @param config - 认证配置
 * @returns AuthManager 实例
 */
export function getAuthManager(config?: AuthConfig): AuthManager

/**
 * 获取权限管理器
 * @returns PermissionManager 实例
 */
export function getPermissionManager(): PermissionManager
```

### 工具函数

```typescript
/**
 * 从 Authorization header 提取 Bearer token
 * @param authHeader - Authorization header
 * @returns token 或 null
 */
export function extractBearerToken(authHeader: string): string | null

/**
 * 验证 JWT token
 * @param token - JWT token
 * @param secret - 密钥
 * @returns token payload
 */
export function verifyToken(token: string, secret: string): Promise<TokenPayload>

/**
 * 签名 JWT token
 * @param payload - token payload
 * @param secret - 密钥
 * @param expiresIn - 过期时间
 * @returns JWT token
 */
export function signToken(payload: TokenPayload, secret: string, expiresIn: string): string
```

### 类型定义

```typescript
/**
 * 用户信息
 */
export interface User {
  id: string
  email: string
  name: string
  role: string
  permissions?: string[]
}

/**
 * 认证令牌
 */
export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

/**
 * Token payload
 */
export interface TokenPayload {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}

/**
 * 认证配置
 */
export interface AuthConfig {
  storageType?: 'localStorage' | 'sessionStorage'
  tokenKey?: string
  userKey?: string
}

/**
 * 权限检查选项
 */
export interface PermissionCheckOptions {
  requireAll?: boolean
}
```

---

## 🛠 开发注意事项

### 业务权限逻辑

本包只提供平台级认证基础设施，不包含任何业务级权限逻辑：

```typescript
// ✅ 正确 - 平台级角色检查
const isAdmin = permissionManager.hasRole('admin');

// ❌ 错误 - 业务权限逻辑
const canPurchase = permissionManager.hasPermission('purchase'); // 应该在 service 层实现
```

### 导入路径

消费方只从 `@vxture/core-auth` 导入，禁止深路径导入：

```typescript
// ✅ 正确
import { AuthManager, getAuthManager } from '@vxture/core-auth';

// ❌ 错误
import { AuthManager } from '@vxture/core-auth/src/client/auth.client';
```

---

## 📁 目录结构

```
packages/core/auth/
├── src/
│   ├── client/       # 认证客户端实现
│   ├── types/        # 类型定义
│   ├── utils/        # 工具函数
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
- 实现 AuthManager 类
- 实现 PermissionManager 类
- 实现 JWT token 工具
- 添加类型定义
- 完善文档和规范
