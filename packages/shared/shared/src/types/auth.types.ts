/**
 * auth.types.ts - Authentication Type Definitions
 * @package @vxture/shared
 *
 * Description: Shared authentication-related types including UserInfo,
 * LoginCredentials, LoginResponse, and AuthState. Used across Core and
 * Service layers for authentication and authorization logic.
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Shared
 * @category Types
 *
 * @remarks
 * - No React/Next.js dependencies
 * - Framework-agnostic types
 *
 * @example
 * ```ts
 * import { type UserInfo, type AuthState } from '@vxture/shared';
 *
 * const user: UserInfo = {
 *   id: '123',
 *   name: 'John',
 *   email: 'john@example.com',
 *   permissions: ['view']
 * };
 * ```
 */

// ============================================================================
// Authentication Types
// ============================================================================

/**
 * User information type
 * @description Describes authenticated user with basic info and permissions
 */
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  permissions: string[];
  lastLogin?: number;
  [key: string]: unknown;
}

/**
 * Login credentials type
 * @description Used for login API parameters
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login response type
 * @description Structure returned by login API
 */
export interface LoginResponse {
  user: UserInfo;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Authentication store state type
 * @description State structure for authentication Zustand store
 */
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
