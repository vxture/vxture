/**
 * index.ts - Vxture Core Utilities Package
 * @package @vxture/core-utils
 *
 * Description: Platform-level utilities for Vxture, including logging and error handling.
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Services - Utils
 */

// ============================================
// Utils Types
// ============================================

export type {
  Maybe,
  Nullable,
  Optional,
  Class,
  FunctionType,
  DeepPartial,
  DeepReadonly,
  LogRecord,
  LoggerConfig,
  ErrorMetadata,
} from './types/utils.types';
export {
  VxtureError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
  DEFAULT_LOGGER_CONFIG,
} from './types/utils.types';
