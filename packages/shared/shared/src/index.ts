/**
 * @vxture/shared - Vxture Shared Layer
 * @package @vxture/shared
 *
 * Description: This package provides shared utilities, TypeScript types, and global constants
 * for the Vxture platform. It remains framework-agnostic, lightweight, and contains no
 * business logic.
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Shared
 * @category Core
 *
 * @remarks
 * - Pure utilities only
 * - No React/Next.js dependencies
 * - No business logic
 * - Framework-agnostic
 * - Lightweight dependencies only
 *
 * @example
 * ```ts
 * // Import from the shared package
 * import { debugLog, AUTH_CONSTANTS, type UserInfo } from '@vxture/shared';
 * ```
 */

// ============================================================================
// Exports
// ============================================================================

// Type Exports
export type * from './types';

// Value Exports
export * from './constants';
export * from './utils';

// ============================================================================
// Example Usage (for documentation purposes)
// ============================================================================

/**
 * @example
 * // Core Layer imports
 * import { I18N_CONSTANTS, type LocaleType } from '@vxture/shared';
 *
 * // Service Layer imports
 * import { AUTH_CONSTANTS, type AuthState, debugLog } from '@vxture/shared';
 *
 * // Platform SDK imports
 * import { THEME_CONSTANTS, type ThemeType, resetWindowScrollTop } from '@vxture/shared';
 */

/**
 * @example
 * // Usage examples
 *
 * // Types
 * const user: UserInfo = {
 *   id: '123',
 *   name: 'John',
 *   email: 'john@example.com',
 *   permissions: ['view']
 * };
 *
 * // Constants
 * const storageKey = AUTH_CONSTANTS.STORAGE_KEY;
 *
 * // Utils
 * debugLog('Debug message');
 * resetWindowScrollTop('smooth');
 */
