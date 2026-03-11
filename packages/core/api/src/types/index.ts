/**
 * types/index.ts - API 类型导出
 * @package @vxture/core-api
 *
 * Description: 类型定义的统一导出文件
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Types - API
 */

export type {
  ApiConfig, ApiResponse, PaginatedResponse,
  RequestInterceptor, ResponseInterceptor, ErrorInterceptor
} from './api.types';
export { ApiError, DEFAULT_API_CONFIG } from './api.types';
