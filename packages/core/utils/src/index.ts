/**
 * index.ts - Vxture Core Utilities Package
 * @package @vxture/core-utils
 * @description
 *   Platform-level utilities for Vxture, including logging and error handling.
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
  LogLevel,
  DEFAULT_LOGGER_CONFIG,
} from './types/utils.types';

// ============================================
// Utils Functions & Classes
// ============================================

export {
  getNodeEnv,
  isProduction,
  isDevelopment,
  isTest,
  isStaging,
  isNode,
  isBrowser,
  VxLogger,
  logger,
  isString,
  isNumber,
  isBoolean,
  isFunction,
  isSymbol,
  isDefined,
  isNotNull,
  isPresent,
  isObject,
  isArray,
  isEmptyObject,
  isEmptyArray,
  isNonEmptyString,
  isValidUrl,
  isUuid,
  VxtureError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  isVxtureError,
} from './utils';
