/**
 * authConfig.ts - Authentication Constants
 * @package @vxture/shared
 *
 * Description: Global authentication constants including storage keys, token
 * refresh timing, permission constants, and API endpoints. Used across
 * Core and Service layers for consistent authentication behavior.
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Shared
 * @category Constants
 *
 * @remarks
 * - No runtime logic
 * - Only configuration objects
 *
 * @example
 * ```ts
 * import { AUTH_CONSTANTS } from '@vxture/shared';
 *
 * const storageKey = AUTH_CONSTANTS.STORAGE_KEY;
 * const loginEndpoint = AUTH_CONSTANTS.API_ENDPOINTS.LOGIN;
 * ```
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
