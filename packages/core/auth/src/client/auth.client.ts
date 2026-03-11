/**
 * auth.client.ts - 认证客户端实现
 * @package @vxture/core-auth
 *
 * Description: 提供认证管理器、存储助手和权限管理器的实现
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Client - Auth
 */

import type { User, AuthToken, AuthSession, AuthConfig } from '../types/auth.types';
import type { PermissionCheckOptions, RoleCheckOptions } from '../types/auth.types';

// ============================================================================
// Auth Manager
// ============================================================================

/**
 * 认证管理器类，用于管理用户认证和会话
 * @class AuthManager
 */
export class AuthManager {
  private readonly config: AuthConfig;
  private session: AuthSession | null = null;
  private refreshTokenTimer: NodeJS.Timeout | null = null;

  constructor(initialConfig?: Partial<AuthConfig>) {
    this.config = {
      enableLocalStorage: true,
      enableSessionStorage: true,
      tokenKey: 'auth-token',
      sessionKey: 'auth-session',
      tokenType: 'Bearer',
      expirationMargin: 600,
      autoRefreshToken: true,
      refreshTokenInterval: 300,
      ...initialConfig,
    };

    this.initializeFromStorage();
    this.setupAutoRefresh();
  }

  /**
   * 从存储初始化
   */
  private initializeFromStorage(): void {
    const storedToken = this.getStoredToken();
    const storedSession = this.getStoredSession();

    if (storedToken && storedSession) {
      try {
        this.setSession(storedSession);
      } catch (error) {
        console.error('Failed to initialize auth session:', error);
        this.clearAuthData();
      }
    }
  }

  /**
   * 设置自动刷新计时器
   */
  private setupAutoRefresh(): void {
    if (!this.config.autoRefreshToken) {
      return;
    }

    this.refreshTokenTimer = setInterval(() => {
      this.autoRefreshToken();
    }, this.config.refreshTokenInterval! * 1000);
  }

  /**
   * 自动刷新令牌
   */
  private async autoRefreshToken(): Promise<void> {
    if (!this.session || !this.session.token.refreshToken) {
      return;
    }

    const expiresAt = this.session.token.expiresAt;
    if (!expiresAt) {
      return;
    }

    const margin = this.config.expirationMargin! * 1000;
    const now = Date.now();
    const expiresIn = expiresAt.getTime() - now;

    if (expiresIn <= margin) {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('Failed to refresh token:', error);
        this.logout();
      }
    }
  }

  /**
   * 刷新令牌
   */
  private async refreshToken(): Promise<void> {
    console.warn('Token refresh not implemented');
  }

  /**
   * 用户登录
   * @param user 用户信息
   * @param token 认证令牌
   * @param options 附加选项
   */
  public login(
    user: User,
    token: AuthToken,
    options?: { sessionId?: string; device?: string; ip?: string }
  ): void {
    const session: AuthSession = {
      id: options?.sessionId || this.generateSessionId(),
      user,
      token: this.normalizeToken(token),
      startTime: new Date(),
      lastActivityTime: new Date(),
      expiresAt: this.getTokenExpiration(token),
      device: options?.device,
      ip: options?.ip,
    };

    this.setSession(session);
  }

  /**
   * 用户登出
   */
  public logout(): void {
    this.clearAuthData();
  }

  /**
   * 检查用户是否已认证
   */
  public isAuthenticated(): boolean {
    return !!(this.session && !this.isSessionExpired());
  }

  /**
   * 获取当前用户信息
   */
  public getUser(): User | undefined {
    return this.session?.user;
  }

  /**
   * 获取当前会话
   */
  public getSession(): AuthSession | null {
    return this.session;
  }

  /**
   * 获取认证令牌
   */
  public getToken(): AuthToken | undefined {
    return this.session?.token;
  }

  /**
   * 设置会话
   */
  public setSession(session: AuthSession): void {
    this.session = session;
    this.storeAuthData();
  }

  /**
   * 清除所有认证数据
   */
  public clearAuthData(): void {
    this.session = null;
    if (this.refreshTokenTimer) {
      clearInterval(this.refreshTokenTimer);
      this.refreshTokenTimer = null;
    }
    this.clearStoredData();
  }

  /**
   * 检查用户是否有权限
   */
  public hasPermission(
    permissions: string | string[],
    options?: PermissionCheckOptions
  ): boolean {
    if (!this.isAuthenticated()) {
      return options?.skipIfNotLoggedIn ?? false;
    }

    const userPermissions = this.session?.user.permissions ?? [];
    const permissionsToCheck = Array.isArray(permissions) ? permissions : [permissions];
    const checkType = options?.checkType ?? 'any';

    if (checkType === 'all') {
      return permissionsToCheck.every((perm) => userPermissions.includes(perm));
    }

    return permissionsToCheck.some((perm) => userPermissions.includes(perm));
  }

  /**
   * 检查用户是否有特定角色
   */
  public hasRole(
    roles: string | string[],
    options?: RoleCheckOptions
  ): boolean {
    if (!this.isAuthenticated()) {
      return options?.skipIfNotLoggedIn ?? false;
    }

    const userRole = this.session?.user.role ?? '';
    const rolesToCheck = Array.isArray(roles) ? roles : [roles];
    const checkType = options?.checkType ?? 'any';

    if (checkType === 'all') {
      return rolesToCheck.includes(userRole);
    }

    return rolesToCheck.includes(userRole);
  }

  /**
   * 检查用户是否是管理员
   */
  public isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * 检查用户是否有特定角色
   */
  public isRole(role: string): boolean {
    return this.session?.user.role === role;
  }

  /**
   * 获取用户权限列表
   */
  public getPermissions(): string[] {
    return this.session?.user.permissions ?? [];
  }

  /**
   * 获取用户角色
   */
  public getRole(): string {
    return this.session?.user.role ?? '';
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 规范化令牌格式
   */
  private normalizeToken(token: AuthToken): AuthToken {
    return {
      ...token,
      tokenType: token.tokenType || this.config.tokenType,
      expiresAt: token.expiresAt || (token.expiresIn
        ? new Date(Date.now() + token.expiresIn * 1000)
        : undefined),
    };
  }

  /**
   * 获取令牌过期时间
   */
  private getTokenExpiration(token: AuthToken): Date {
    if (token.expiresAt) {
      return token.expiresAt;
    }

    if (token.expiresIn) {
      return new Date(Date.now() + token.expiresIn * 1000);
    }

    return new Date(Date.now() + 3600 * 1000);
  }

  /**
   * 检查会话是否过期
   */
  private isSessionExpired(): boolean {
    if (!this.session?.expiresAt) {
      return false;
    }

    return this.session.expiresAt < new Date();
  }

  /**
   * 存储认证数据到存储中
   */
  private storeAuthData(): void {
    const { token, user, id } = this.session!;

    if (this.config.enableLocalStorage) {
      localStorage.setItem(this.config.tokenKey!, JSON.stringify(token));
    }

    if (this.config.enableSessionStorage) {
      localStorage.setItem(this.config.sessionKey!, JSON.stringify({ id, user }));
    }
  }

  /**
   * 清除存储中的数据
   */
  private clearStoredData(): void {
    if (this.config.enableLocalStorage) {
      localStorage.removeItem(this.config.tokenKey!);
    }

    if (this.config.enableSessionStorage) {
      localStorage.removeItem(this.config.sessionKey!);
    }
  }

  /**
   * 从存储获取令牌
   */
  private getStoredToken(): AuthToken | null {
    if (!this.config.enableLocalStorage) {
      return null;
    }

    try {
      const tokenStr = localStorage.getItem(this.config.tokenKey!);
      return tokenStr ? JSON.parse(tokenStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * 从存储获取会话
   */
  private getStoredSession(): AuthSession | null {
    if (!this.config.enableSessionStorage) {
      return null;
    }

    try {
      const sessionStr = localStorage.getItem(this.config.sessionKey!);
      return sessionStr ? JSON.parse(sessionStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * 更新最后活动时间
   */
  public updateActivityTime(): void {
    if (this.session) {
      this.session.lastActivityTime = new Date();
    }
  }

  /**
   * 更新用户信息
   */
  public updateUser(user: Partial<User>): void {
    if (this.session) {
      this.session.user = { ...this.session.user, ...user };
    }
  }

  /**
   * 更新令牌
   */
  public updateToken(token: Partial<AuthToken>): void {
    if (this.session) {
      this.session.token = { ...this.session.token, ...token };
      this.session.expiresAt = this.getTokenExpiration(this.session.token);
    }
  }

  /**
   * 检查令牌是否已过期或即将过期
   */
  public isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token || !token.expiresAt) {
      return false;
    }

    const margin = this.config.expirationMargin! * 1000;
    const now = Date.now();
    const expiresAt = token.expiresAt.getTime();

    return expiresAt - now <= margin;
  }

  /**
   * 获取令牌剩余有效期
   */
  public getTokenExpirationTime(): number | null {
    const token = this.getToken();
    if (!token || !token.expiresAt) {
      return null;
    }

    return token.expiresAt.getTime() - Date.now();
  }
}

// ============================================================================
// Auth Storage Helper
// ============================================================================

/**
 * 认证存储助手类，用于管理认证数据的存储
 * @class AuthStorage
 */
export class AuthStorage {
  private static instance: AuthStorage;
  private readonly config: AuthConfig;

  private constructor(initialConfig?: Partial<AuthConfig>) {
    this.config = {
      enableLocalStorage: true,
      enableSessionStorage: true,
      tokenKey: 'auth-token',
      sessionKey: 'auth-session',
      tokenType: 'Bearer',
      expirationMargin: 600,
      autoRefreshToken: true,
      refreshTokenInterval: 300,
      ...initialConfig,
    };
  }

  /**
   * 获取单例实例
   */
  public static getInstance(initialConfig?: Partial<AuthConfig>): AuthStorage {
    if (!AuthStorage.instance) {
      AuthStorage.instance = new AuthStorage(initialConfig);
    }
    return AuthStorage.instance;
  }

  /**
   * 设置令牌到存储
   */
  public setToken(token: AuthToken): void {
    if (this.config.enableLocalStorage) {
      localStorage.setItem(this.config.tokenKey!, JSON.stringify(token));
    }
  }

  /**
   * 从存储获取令牌
   */
  public getToken(): AuthToken | null {
    if (!this.config.enableLocalStorage) {
      return null;
    }

    try {
      const tokenStr = localStorage.getItem(this.config.tokenKey!);
      return tokenStr ? JSON.parse(tokenStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * 从存储删除令牌
   */
  public removeToken(): void {
    if (this.config.enableLocalStorage) {
      localStorage.removeItem(this.config.tokenKey!);
    }
  }

  /**
   * 设置会话到存储
   */
  public setSession(session: Omit<AuthSession, 'token'>): void {
    if (this.config.enableSessionStorage) {
      localStorage.setItem(this.config.sessionKey!, JSON.stringify(session));
    }
  }

  /**
   * 从存储获取会话
   */
  public getSession(): Omit<AuthSession, 'token'> | null {
    if (!this.config.enableSessionStorage) {
      return null;
    }

    try {
      const sessionStr = localStorage.getItem(this.config.sessionKey!);
      return sessionStr ? JSON.parse(sessionStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * 从存储删除会话
   */
  public removeSession(): void {
    if (this.config.enableSessionStorage) {
      localStorage.removeItem(this.config.sessionKey!);
    }
  }

  /**
   * 清除存储中的所有认证数据
   */
  public clear(): void {
    this.removeToken();
    this.removeSession();
  }
}

// ============================================================================
// Permission Manager
// ============================================================================

/**
 * 权限管理器类，用于管理用户权限和角色
 * @class PermissionManager
 */
export class PermissionManager {
  private permissions: Record<string, string[]>;
  private roles: Record<string, string[]>;

  constructor(
    initialPermissions: Record<string, string[]> = {},
    initialRoles: Record<string, string[]> = {}
  ) {
    this.permissions = { ...initialPermissions };
    this.roles = { ...initialRoles };
  }

  /**
   * 获取所有权限配置
   */
  public getPermissions(): Record<string, string[]> {
    return { ...this.permissions };
  }

  /**
   * 获取所有角色配置
   */
  public getRoles(): Record<string, string[]> {
    return { ...this.roles };
  }

  /**
   * 添加角色
   */
  public addRole(name: string, permissions: string[]): void {
    this.roles[name] = permissions;
  }

  /**
   * 为角色添加权限
   */
  public addRolePermissions(name: string, permissions: string[]): void {
    if (!this.roles[name]) {
      this.roles[name] = [];
    }

    permissions.forEach((perm) => {
      if (!this.roles[name].includes(perm)) {
        this.roles[name].push(perm);
      }
    });
  }

  /**
   * 移除角色
   */
  public removeRole(name: string): void {
    delete this.roles[name];
  }

  /**
   * 移除角色权限
   */
  public removeRolePermissions(name: string, permissions: string[]): void {
    if (!this.roles[name]) {
      return;
    }

    this.roles[name] = this.roles[name].filter(
      (perm) => !permissions.includes(perm)
    );
  }

  /**
   * 获取角色权限
   */
  public getRolePermissions(name: string): string[] {
    return this.roles[name] || [];
  }

  /**
   * 检查角色是否有特定权限
   */
  public roleHasPermission(name: string, permission: string): boolean {
    return this.getRolePermissions(name).includes(permission);
  }

  /**
   * 检查角色是否有任何一个指定权限
   */
  public roleHasAnyPermission(name: string, permissions: string[]): boolean {
    return permissions.some((perm) => this.roleHasPermission(name, perm));
  }

  /**
   * 检查角色是否有所有指定权限
   */
  public roleHasAllPermissions(name: string, permissions: string[]): boolean {
    return permissions.every((perm) => this.roleHasPermission(name, perm));
  }

  /**
   * 检查用户权限（基于角色和直接权限）
   */
  public checkUserPermissions(
    user: User,
    permissions: string[],
    checkType: 'all' | 'any' = 'any'
  ): boolean {
    const userPermissions = new Set<string>();

    if (user.permissions) {
      user.permissions.forEach((perm) => userPermissions.add(perm));
    }

    if (user.role && this.roles[user.role]) {
      this.roles[user.role].forEach((perm) => userPermissions.add(perm));
    }

    if (checkType === 'all') {
      return permissions.every((perm) => userPermissions.has(perm));
    }

    return permissions.some((perm) => userPermissions.has(perm));
  }

  /**
   * 检查用户角色
   */
  public checkUserRoles(
    user: User,
    roles: string[],
    checkType: 'all' | 'any' = 'any'
  ): boolean {
    if (!user.role) {
      return false;
    }

    if (checkType === 'all') {
      return roles.includes(user.role);
    }

    return roles.includes(user.role);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let authManagerInstance: AuthManager | null = null;
let permissionManagerInstance: PermissionManager | null = null;

/**
 * 获取或创建认证管理器单例
 * @param initialConfig 初始配置
 * @returns AuthManager 实例
 */
export function getAuthManager(initialConfig?: Partial<AuthConfig>): AuthManager {
  authManagerInstance ??= new AuthManager(initialConfig);
  return authManagerInstance;
}

/**
 * 获取或创建权限管理器单例
 * @param initialPermissions 初始权限配置
 * @param initialRoles 初始角色配置
 * @returns PermissionManager 实例
 */
export function getPermissionManager(
  initialPermissions: Record<string, string[]> = {},
  initialRoles: Record<string, string[]> = {}
): PermissionManager {
  permissionManagerInstance ??= new PermissionManager(initialPermissions, initialRoles);
  return permissionManagerInstance;
}
