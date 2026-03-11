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
  LogLevel,
  LogRecord,
  LoggerConfig,
  ErrorMetadata,
} from './types';
export {
  LogLevel,
  VxtureError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
  DEFAULT_LOGGER_CONFIG,
} from './types';

// ============================================
// Core Platform Utilities
// ============================================

// 注意：core-utils 应该只包含平台级工具（日志、错误处理基础）
// 其他通用工具应该放在 @vxture/shared

export * from './utils';
