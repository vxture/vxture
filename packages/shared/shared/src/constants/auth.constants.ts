/**
 * auth.constants.ts - Authentication constants
 * @package @vxture/shared
 * @description Global configuration constants for authentication, shared across all layers. Contains storage keys, token configuration, and API endpoint constants.
 */

/**
 * Authentication related constants
 * @description Global configuration constants for authentication
 */
export const AUTH_CONSTANTS = {
  /** localStorage key */
  STORAGE_KEY: 'auth-storage',

  /** Platform-wide HttpOnly cookie keys */
  COOKIE_KEYS: {
    ACCESS_TOKEN: 'vx_access_token',
    REFRESH_TOKEN: 'vx_refresh_token',
  } as const,

  /** Session storage key prefix for server-side session adapters */
  SESSION_KEY_PREFIX: 'session:',

  /** Token refresh buffer time in milliseconds - refresh 30 seconds before expiry */
  TOKEN_REFRESH_BUFFER: 30 * 1000,

  /** Default token expiry in seconds - used if API doesn't return it */
  DEFAULT_TOKEN_EXPIRY: 3600,

  /** Auto logout countdown in milliseconds */
  AUTO_LOGOUT_COUNTDOWN: 5 * 1000,

  /** Permission constants */
  PERMISSIONS: {
    ADMIN: 'admin',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete',
  } as const,

  /** API endpoints */
  API_ENDPOINTS: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
    SESSION: '/api/auth/session',
  },
} as const;
