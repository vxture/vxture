/**
 * api.types.ts - API 类型定义
 * @package @vxture/core-api
 */

// ============================================================================
// 标准响应类型
// ============================================================================

/**
 * 统一 API 响应包装
 * BFF 返回给前端的所有响应都遵循此结构
 */
export interface ApiResponse<T = unknown> {
  success:   boolean;
  data:      T | null;
  code:      string;
  message?:  string;
  requestId?: string;
  timestamp:  string;
}

/**
 * 分页查询参数
 * BFF router 接收前端的分页请求
 */
export interface PageQuery {
  page:       number;
  pageSize:   number;
  sortBy?:    string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页结果
 */
export interface PageResult<T = unknown> {
  items:       T[];
  total:       number;
  page:        number;
  pageSize:    number;
  totalPages:  number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * 标准错误响应体
 */
export interface ApiErrorBody {
  code:       string;
  message:    string;
  details?:   unknown;
  requestId?: string;
}

// ============================================================================
// HTTP 客户端配置
// ============================================================================

/**
 * VxHttpClient 单次请求配置
 * 覆盖全局配置或提供额外选项
 */
export interface RequestOptions {
  /** 覆盖全局 baseURL，用于第三方 API 调用 */
  baseURL?:  string;
  /** 额外的请求 headers，与全局 headers 合并 */
  headers?:  Record<string, string>;
  /** 超时时间（毫秒），覆盖全局配置 */
  timeout?:  number;
  /** 重试次数，覆盖全局配置 */
  retries?:  number;
  /** 是否跳过自动响应解包，直接返回原始 axios 响应 */
  raw?:      boolean;
  /** 响应类型，用于文件下载 */
  responseType?: 'json' | 'arraybuffer' | 'stream' | 'blob';
}

/**
 * 文件上传选项
 */
export interface UploadOptions extends RequestOptions {
  /** 上传进度回调 */
  onProgress?: (percent: number) => void;
}

// ============================================================================
// 拦截器上下文
// — 供各 BFF 构建上下文感知的 header 注入
// ============================================================================

/**
 * 请求上下文，包含需要透传的信息
 */
export interface RequestContext {
  /** Bearer token，自动注入 Authorization header */
  accessToken?: string;
  /** 租户 ID，自动注入 x-tenant-id header */
  tenantId?:    string;
  /** 请求 ID，用于链路追踪 */
  requestId?:   string;
}
