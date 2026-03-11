/**
 * index.ts - Vxture Core API 入口
 * @package @vxture/core-api
 *
 * Description: Vxture 平台的核心 API 基础设施，提供统一的 API 客户端、
 * 请求/响应拦截器和 API 工具。
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Services - API
 *
 * @remarks
 * - 仅包含 HTTP 客户端基础设施，不包含具体业务接口
 * - 使用原生 fetch 实现，双端兼容
 *
 * @example
 * ```ts
 * import { ApiClient, ApiError, ApiResponse, getApiClient } from '@vxture/core-api';
 *
 * const client = getApiClient({ baseUrl: '/api' });
 * const response = await client.get<User>('/users/123');
 * ```
 */

// ============================================================================
// Types Exports
// ============================================================================

export type {
  ApiConfig,
  ApiResponse,
  PaginatedResponse,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from './types';
export { ApiError, DEFAULT_API_CONFIG } from './types';

// ============================================================================
// Client Exports
// ============================================================================

export * from './client';
export { ApiClient, ApiInterceptorManager } from './client';
export { getApiClient, getInterceptorManager } from './client';
