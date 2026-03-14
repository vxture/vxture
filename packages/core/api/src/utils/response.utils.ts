/**
 * response.utils.ts - 响应处理工具
 * @package @vxture/core-api
 *
 * 响应解包和分页构建的纯函数工具。
 */

import type { ApiResponse, PageResult, PageQuery } from '../types/api.types';

// ============================================================================
// 响应构建（BFF 用于构建标准响应）
// ============================================================================

/**
 * 构建成功响应
 *
 * @example
 * return ok(billingData);
 * // { success: true, data: billingData, code: 'OK', timestamp: '...' }
 */
export function ok<T>(data: T, requestId?: string): ApiResponse<T> {
  return {
    success:   true,
    data,
    code:      'OK',
    timestamp: new Date().toISOString(),
    requestId,
  };
}

/**
 * 构建失败响应
 *
 * @example
 * return fail('NOT_FOUND', 'User not found');
 */
export function fail(
  code:       string,
  message:    string,
  requestId?: string,
): ApiResponse<null> {
  return {
    success:   false,
    data:      null,
    code,
    message,
    timestamp: new Date().toISOString(),
    requestId,
  };
}

// ============================================================================
// 分页工具
// ============================================================================

/**
 * 构建分页结果
 *
 * @example
 * const result = buildPageResult(users, total, { page: 1, pageSize: 20 });
 */
export function buildPageResult<T>(
  items:    T[],
  total:    number,
  query:    PageQuery,
): PageResult<T> {
  const totalPages = Math.ceil(total / query.pageSize);

  return {
    items,
    total,
    page:        query.page,
    pageSize:    query.pageSize,
    totalPages,
    hasNextPage: query.page < totalPages,
    hasPrevPage: query.page > 1,
  };
}

/**
 * 计算分页的 offset（用于 Prisma skip）
 *
 * @example
 * const skip = pageToOffset({ page: 2, pageSize: 20 }); // → 20
 */
export function pageToOffset(query: PageQuery): number {
  return (query.page - 1) * query.pageSize;
}

/**
 * 验证分页参数，返回安全的分页参数
 * 防止 page=0 或 pageSize 过大
 */
export function safePageQuery(query: Partial<PageQuery>): PageQuery {
  return {
    page:      Math.max(1, query.page      ?? 1),
    pageSize:  Math.min(100, Math.max(1, query.pageSize ?? 20)),
    sortBy:    query.sortBy,
    sortOrder: query.sortOrder ?? 'desc',
  };
}
