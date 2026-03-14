/**
 * utils.types.ts - 工具类型定义
 * @package @vxture/core-utils
 *
 * Description: Core utilities types and constants
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Types - Utils
 */

// ============================================================================
// Utility Types
// ============================================================================

export type Maybe<T> = T | null | undefined;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type Class<T = any> = new (...args: any[]) => T;

export type FunctionType = (...args: any[]) => any;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// ============================================================================
// Log Types
// ============================================================================

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface LogRecord {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  metadata?: Record<string, unknown>;
}

export interface LoggerConfig {
  level?: LogLevel;
  enableTimestamp?: boolean;
  enableColors?: boolean;
  context?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ErrorMetadata {
  code?: string;
  status?: number;
  details?: any;
  timestamp?: Date;
  requestId?: string;
}

export class VxtureError extends Error {
  public readonly code?: string;
  public readonly status?: number;
  public readonly details?: any;
  public readonly timestamp: Date;
  public readonly requestId?: string;

  constructor(
    message: string,
    metadata: ErrorMetadata = {}
  ) {
    super(message);
    this.name = 'VxtureError';
    this.code = metadata.code;
    this.status = metadata.status;
    this.details = metadata.details;
    this.timestamp = new Date();
    this.requestId = metadata.requestId;
    
    // V8 专有 API，需要类型断言
    const ErrorWithCapture = Error as typeof Error & {
      captureStackTrace?: (target: object, constructor: unknown) => void;
    };
    ErrorWithCapture.captureStackTrace?.(this, new.target);
  }
}

export class ValidationError extends VxtureError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super(message, { ...metadata, status: 400, code: 'VALIDATION_ERROR' });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends VxtureError {
  constructor(message: string = 'Resource not found', metadata: ErrorMetadata = {}) {
    super(message, { ...metadata, status: 404, code: 'NOT_FOUND' });
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends VxtureError {
  constructor(message: string = 'Unauthorized', metadata: ErrorMetadata = {}) {
    super(message, { ...metadata, status: 401, code: 'UNAUTHORIZED' });
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends VxtureError {
  constructor(message: string = 'Forbidden', metadata: ErrorMetadata = {}) {
    super(message, { ...metadata, status: 403, code: 'FORBIDDEN' });
    this.name = 'ForbiddenError';
  }
}

export class InternalServerError extends VxtureError {
  constructor(message: string = 'Internal server error', metadata: ErrorMetadata = {}) {
    super(message, { ...metadata, status: 500, code: 'INTERNAL_ERROR' });
    this.name = 'InternalServerError';
  }
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  enableTimestamp: true,
  enableColors: true,
};
