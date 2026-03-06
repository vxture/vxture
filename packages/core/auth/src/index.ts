/**
 * index.ts - Vxture Core Authentication and Authorization Package
 * @package @vxture/core-auth
 *
 * Description: Platform authentication and authorization utilities, providing
 * token management, session management, and role-based access control.
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Core
 * @category Services - Authentication
 */

// ============================================
// Auth Types
// ============================================

/**
 * User Information
 * @interface User
 */
export interface User {
  /** User ID */
  id: string;
  /** User email */
  email: string;
  /** User name */
  name: string;
  /** User avatar URL */
  avatar?: string;
  /** User role */
  role?: string;
  /** User permissions */
  permissions?: string[];
  /** Account status */
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  /** Last login timestamp */
  lastLogin?: Date;
  /** Additional user data */
  [key: string]: any;
}

/**
 * Auth Token
 * @interface AuthToken
 */
export interface AuthToken {
  /** Access token */
  accessToken: string;
  /** Refresh token */
  refreshToken?: string;
  /** Token type */
  tokenType?: string;
  /** Expiration time (in milliseconds) */
  expiresIn?: number;
  /** Expiration timestamp */
  expiresAt?: Date;
}

/**
 * Auth Session
 * @interface AuthSession
 */
export interface AuthSession {
  /** Session ID */
  id: string;
  /** User information */
  user: User;
  /** Auth token */
  token: AuthToken;
  /** Session start time */
  startTime: Date;
  /** Last activity time */
  lastActivityTime: Date;
  /** Session expiration time */
  expiresAt: Date;
  /** Device information */
  device?: string;
  /** IP address */
  ip?: string;
}

/**
 * Auth Configuration
 * @interface AuthConfig
 */
export interface AuthConfig {
  /** Enable/disable localStorage for token storage */
  enableLocalStorage?: boolean;
  /** Enable/disable session storage for session storage */
  enableSessionStorage?: boolean;
  /** Token key in storage */
  tokenKey?: string;
  /** Session key in storage */
  sessionKey?: string;
  /** Token type */
  tokenType?: string;
  /** Expiration margin in seconds */
  expirationMargin?: number;
  /** Auto-refresh token */
  autoRefreshToken?: boolean;
  /** Refresh token interval in seconds */
  refreshTokenInterval?: number;
}

/**
 * Permission Check Options
 * @interface PermissionCheckOptions
 */
export interface PermissionCheckOptions {
  /** Check for all permissions (AND) or any permission (OR) */
  checkType?: 'all' | 'any';
  /** Skip check if user is not logged in */
  skipIfNotLoggedIn?: boolean;
}

/**
 * Role Check Options
 * @interface RoleCheckOptions
 */
export interface RoleCheckOptions {
  /** Check for all roles (AND) or any role (OR) */
  checkType?: 'all' | 'any';
  /** Skip check if user is not logged in */
  skipIfNotLoggedIn?: boolean;
}

/**
 * Default auth configuration
 */
const DEFAULT_AUTH_CONFIG: AuthConfig = {
  enableLocalStorage: true,
  enableSessionStorage: true,
  tokenKey: 'auth-token',
  sessionKey: 'auth-session',
  tokenType: 'Bearer',
  expirationMargin: 600, // 10 minutes
  autoRefreshToken: true,
  refreshTokenInterval: 300, // 5 minutes
};

// ============================================
// Auth Manager
// ============================================

/**
 * Auth Manager class for managing authentication
 * @class AuthManager
 */
export class AuthManager {
  private readonly config: AuthConfig;
  private session: AuthSession | null = null;
  private refreshTokenTimer: NodeJS.Timeout | null = null;

  constructor(initialConfig?: Partial<AuthConfig>) {
    this.config = {
      ...DEFAULT_AUTH_CONFIG,
      ...initialConfig,
    };

    // Initialize from storage
    this.initializeFromStorage();
    // Setup auto-refresh
    this.setupAutoRefresh();
  }

  /**
   * Initialize from storage
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
   * Setup auto-refresh timer
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
   * Auto-refresh token
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
   * Refresh token
   */
  private async refreshToken(): Promise<void> {
    // In a real implementation, this would make an API call to refresh the token
    console.warn('Token refresh not implemented');
  }

  /**
   * Login user
   * @param user User information
   * @param token Auth token
   * @param options Additional options
   */
  public login(
    user: User,
    token: AuthToken,
    options?: { sessionId?: string; device?: string; ip?: string }
  ): void {
    // Create session
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
   * Logout user
   */
  public logout(): void {
    this.clearAuthData();
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!(this.session && !this.isSessionExpired());
  }

  /**
   * Get current user
   */
  public getUser(): User | undefined {
    return this.session?.user;
  }

  /**
   * Get current session
   */
  public getSession(): AuthSession | null {
    return this.session;
  }

  /**
   * Get auth token
   */
  public getToken(): AuthToken | undefined {
    return this.session?.token;
  }

  /**
   * Set session
   */
  public setSession(session: AuthSession): void {
    this.session = session;
    this.storeAuthData();
  }

  /**
   * Clear all auth data
   */
  public clearAuthData(): void {
    this.session = null;
    this.clearStoredData();
  }

  /**
   * Check if user has permission
   * @param permissions Permission(s) to check
   * @param options Check options
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
   * Check if user has role
   * @param roles Role(s) to check
   * @param options Check options
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
   * Check if user is admin
   */
  public isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if user is in a specific role
   * @param role Role to check
   */
  public isRole(role: string): boolean {
    return this.session?.user.role === role;
  }

  /**
   * Get user permissions
   */
  public getPermissions(): string[] {
    return this.session?.user.permissions ?? [];
  }

  /**
   * Get user role
   */
  public getRole(): string {
    return this.session?.user.role ?? '';
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Normalize token
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
   * Get token expiration
   */
  private getTokenExpiration(token: AuthToken): Date {
    if (token.expiresAt) {
      return token.expiresAt;
    }

    if (token.expiresIn) {
      return new Date(Date.now() + token.expiresIn * 1000);
    }

    // Default to 1 hour
    return new Date(Date.now() + 3600 * 1000);
  }

  /**
   * Check if session is expired
   */
  private isSessionExpired(): boolean {
    if (!this.session?.expiresAt) {
      return false;
    }

    return this.session.expiresAt < new Date();
  }

  /**
   * Store auth data in storage
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
   * Clear stored data
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
   * Get stored token
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
   * Get stored session
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
   * Update last activity time
   */
  public updateActivityTime(): void {
    if (this.session) {
      this.session.lastActivityTime = new Date();
    }
  }

  /**
   * Update user information
   * @param user User information
   */
  public updateUser(user: Partial<User>): void {
    if (this.session) {
      this.session.user = { ...this.session.user, ...user };
    }
  }

  /**
   * Update token
   * @param token Token information
   */
  public updateToken(token: Partial<AuthToken>): void {
    if (this.session) {
      this.session.token = { ...this.session.token, ...token };
      this.session.expiresAt = this.getTokenExpiration(this.session.token);
    }
  }

  /**
   * Check if token is expired or about to expire
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
   * Get time remaining until token expiration
   */
  public getTokenExpirationTime(): number | null {
    const token = this.getToken();
    if (!token || !token.expiresAt) {
      return null;
    }

    return token.expiresAt.getTime() - Date.now();
  }
}

// ============================================
// Auth Storage Helper
// ============================================

/**
 * Auth Storage Helper
 * @class AuthStorage
 */
export class AuthStorage {
  private static instance: AuthStorage;
  private readonly config: AuthConfig;

  private constructor(initialConfig?: Partial<AuthConfig>) {
    this.config = {
      ...DEFAULT_AUTH_CONFIG,
      ...initialConfig,
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(initialConfig?: Partial<AuthConfig>): AuthStorage {
    if (!AuthStorage.instance) {
      AuthStorage.instance = new AuthStorage(initialConfig);
    }
    return AuthStorage.instance;
  }

  /**
   * Set token in storage
   */
  public setToken(token: AuthToken): void {
    if (this.config.enableLocalStorage) {
      localStorage.setItem(this.config.tokenKey!, JSON.stringify(token));
    }
  }

  /**
   * Get token from storage
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
   * Remove token from storage
   */
  public removeToken(): void {
    if (this.config.enableLocalStorage) {
      localStorage.removeItem(this.config.tokenKey!);
    }
  }

  /**
   * Set session in storage
   */
  public setSession(session: Omit<AuthSession, 'token'>): void {
    if (this.config.enableSessionStorage) {
      localStorage.setItem(this.config.sessionKey!, JSON.stringify(session));
    }
  }

  /**
   * Get session from storage
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
   * Remove session from storage
   */
  public removeSession(): void {
    if (this.config.enableSessionStorage) {
      localStorage.removeItem(this.config.sessionKey!);
    }
  }

  /**
   * Clear all auth data from storage
   */
  public clear(): void {
    this.removeToken();
    this.removeSession();
  }
}

// ============================================
// Permission Manager
// ============================================

/**
 * Permission Manager class for managing permissions and roles
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
   * Get all permissions
   */
  public getPermissions(): Record<string, string[]> {
    return { ...this.permissions };
  }

  /**
   * Get all roles
   */
  public getRoles(): Record<string, string[]> {
    return { ...this.roles };
  }

  /**
   * Add a role
   */
  public addRole(name: string, permissions: string[]): void {
    this.roles[name] = permissions;
  }

  /**
   * Add permissions to a role
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
   * Remove a role
   */
  public removeRole(name: string): void {
    delete this.roles[name];
  }

  /**
   * Remove permissions from a role
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
   * Get role permissions
   */
  public getRolePermissions(name: string): string[] {
    return this.roles[name] || [];
  }

  /**
   * Check if role has permission
   */
  public roleHasPermission(name: string, permission: string): boolean {
    return this.getRolePermissions(name).includes(permission);
  }

  /**
   * Check if role has any of the permissions
   */
  public roleHasAnyPermission(name: string, permissions: string[]): boolean {
    return permissions.some((perm) => this.roleHasPermission(name, perm));
  }

  /**
   * Check if role has all of the permissions
   */
  public roleHasAllPermissions(name: string, permissions: string[]): boolean {
    return permissions.every((perm) => this.roleHasPermission(name, perm));
  }

  /**
   * Check user permissions based on roles and direct permissions
   */
  public checkUserPermissions(
    user: User,
    permissions: string[],
    checkType: 'all' | 'any' = 'any'
  ): boolean {
    const userPermissions = new Set<string>();

    // Add direct user permissions
    if (user.permissions) {
      user.permissions.forEach((perm) => userPermissions.add(perm));
    }

    // Add role permissions
    if (user.role && this.roles[user.role]) {
      this.roles[user.role].forEach((perm) => userPermissions.add(perm));
    }

    if (checkType === 'all') {
      return permissions.every((perm) => userPermissions.has(perm));
    }

    return permissions.some((perm) => userPermissions.has(perm));
  }

  /**
   * Check user roles
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

// ============================================
// Singleton Instance
// ============================================

let authManagerInstance: AuthManager | null = null;
let permissionManagerInstance: PermissionManager | null = null;

/**
 * Get or create the Auth Manager singleton
 * @param initialConfig Initial auth configuration
 * @returns AuthManager instance
 */
export function getAuthManager(initialConfig?: Partial<AuthConfig>): AuthManager {
  authManagerInstance ??= new AuthManager(initialConfig);
  return authManagerInstance;
}

/**
 * Get or create the Permission Manager singleton
 * @param initialPermissions Initial permissions
 * @param initialRoles Initial roles
 * @returns PermissionManager instance
 */
export function getPermissionManager(
  initialPermissions?: Record<string, string[]>,
  initialRoles?: Record<string, string[]>
): PermissionManager {
  permissionManagerInstance ??= new PermissionManager(initialPermissions, initialRoles);
  return permissionManagerInstance;
}