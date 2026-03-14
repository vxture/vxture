/**
 * error.utils.ts - error相关工具
 * @package @vxture/core-utils
 * @layer Infrastructure
 * @category Utils
 * @author AI-Generated
 * @date 2026-03-14
 * @copyright Vxture Team
 * @description
 *   文件功能描述
 */

import type { ErrorMetadata } from '../types/utils.types';

// ============================================================================
// 基础错误类
// ============================================================================

export class VxtureError extends Error {
  public readonly code:       string | undefined;
  public readonly status:     number | undefined;
  public readonly details:    unknown;
  public readonly timestamp:  Date;
  public readonly requestId:  string | undefined;

  constructor(message: string, metadata: ErrorMetadata = {}) {
    super(message);
    this.name      = 'VxtureError';
    this.code      = metadata.code;
    this.status    = metadata.status;
    this.details   = metadata.details;
    this.timestamp = new Date();
    this.requestId = metadata.requestId;

    // 保留正确的 stack trace（V8 专属）
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name:      this.name,
      message:   this.message,
      code:      this.code,
      status:    this.status,
      details:   this.details,
      requestId: this.requestId,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

// ============================================================================
// HTTP 语义错误子类
// ============================================================================

export class ValidationError extends VxtureError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super(message, { ...metadata, status: 400, code: metadata.code ?? 'VALIDATION_ERROR' });
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends VxtureError {
  constructor(message = 'Unauthorized', metadata: ErrorMetadata = {}) {
    super(message, { ...metadata, status: 401, code: metadata.code ?? 'UNAUTHORIZED' });
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends VxtureError {
  constructor(message = 'Forbidden', metadata: ErrorMetadata = {}) {
    super(message, { ...metadata, status: 403, code: metadata.code ?? 'FORBIDDEN' });
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends VxtureError {
  constructor(message = 'Resource not found', metadata: ErrorMetadata = {}) {
    super(message, { ...metadata, status: 404, code: metadata.code ?? 'NOT_FOUND' });
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends VxtureError {
  constructor(message = 'Conflict', metadata: ErrorMetadata = {}) {
    super(message, { ...metadata, status: 409, code: metadata.code ?? 'CONFLICT' });
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends VxtureError {
  constructor(message = 'Internal server error', metadata: ErrorMetadata = {}) {
    super(message, { ...metadata, status: 500, code: metadata.code ?? 'INTERNAL_ERROR' });
    this.name = 'InternalServerError';
  }
}

// ============================================================================
// 类型守卫
// ============================================================================

/** 判断是否为 VxtureError 实例 */
export function isVxtureError(err: unknown): err is VxtureError {
  return err instanceof VxtureError;
}