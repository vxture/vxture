/**
 * error.utils.ts - HTTP 错误归一化
 * @package @vxture/core-api
 *
 * 将 axios 错误和 HTTP 状态码映射为 VxtureError 子类。
 * 消费方只需处理 VxtureError，不需要关心底层 HTTP 细节。
 */

import {
  VxtureError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} from '@vxture/core-utils';

import type { ApiErrorBody } from '../types/api.types';

// ============================================================================
// HTTP status → VxtureError
// ============================================================================

/**
 * 将 HTTP 状态码和错误信息转换为对应的 VxtureError 子类
 *
 * @example
 * // 在 axios 响应拦截器中使用
 * if (error.response) {
 *   throw normalizeHttpError(error.response.status, error.response.data);
 * }
 */
export function normalizeHttpError(
  status:    number,
  body?:     Partial<ApiErrorBody>,
  requestId?: string,
): VxtureError {
  const message   = body?.message ?? defaultMessageForStatus(status);
  const code      = body?.code    ?? `HTTP_${status}`;
  const details   = body?.details;
  const metadata  = { code, status, details, requestId };

  switch (status) {
    case 400: return new ValidationError(message,     metadata);
    case 401: return new UnauthorizedError(message,   metadata);
    case 403: return new ForbiddenError(message,      metadata);
    case 404: return new NotFoundError(message,       metadata);
    case 409: return new ConflictError(message,       metadata);
    case 422: return new ValidationError(message,     metadata);
    case 429: return new VxtureError(message,         { ...metadata, code: 'RATE_LIMITED' });
    case 503: return new VxtureError(message,         { ...metadata, code: 'SERVICE_UNAVAILABLE' });
    default:
      if (status >= 500) return new InternalServerError(message, metadata);
      return new VxtureError(message, metadata);
  }
}

/**
 * 判断是否应该重试（网络错误或 5xx）
 */
export function isRetryableError(status?: number, isNetworkError = false): boolean {
  if (isNetworkError) return true;
  if (!status) return false;
  // 429 Too Many Requests 和 5xx 可以重试，4xx 客户端错误不重试
  return status === 429 || status >= 500;
}

// ============================================================================
// 内部工具
// ============================================================================

function defaultMessageForStatus(status: number): string {
  const messages: Record<number, string> = {
    400: 'Bad request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not found',
    409: 'Conflict',
    422: 'Unprocessable entity',
    429: 'Too many requests',
    500: 'Internal server error',
    502: 'Bad gateway',
    503: 'Service unavailable',
    504: 'Gateway timeout',
  };
  return messages[status] ?? `HTTP error ${status}`;
}
