// ============================================================================
// @vxture/core-api — 公共导出入口
// ============================================================================

// Types
export type {
  ApiResponse,
  PageQuery,
  PageResult,
  ApiErrorBody,
  RequestOptions,
  UploadOptions,
  RequestContext,
} from './types';

// NestJS Module & Client
export { VxHttpModule }              from './module';
export type { VxHttpModuleOptions }  from './module';
export { VxHttpClient }              from './client';

// Utils
export {
  normalizeHttpError,
  isRetryableError,
  ok,
  fail,
  buildPageResult,
  pageToOffset,
  safePageQuery,
} from './utils';
