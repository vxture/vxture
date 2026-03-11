/**
 * client/index.ts - API 客户端导出
 * @package @vxture/core-api
 *
 * Description: API 客户端类和工具的统一导出文件
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Client - API
 */

export * from './api.client';
export { ApiClient, ApiInterceptorManager } from './api.client';
export { getApiClient, getInterceptorManager } from './api.client';
