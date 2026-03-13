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
    REFRESH_TOKEN: '/api/auth/refresh-token',
  },
} as const;
