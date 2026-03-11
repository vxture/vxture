/**
 * api.types.ts - API 类型定义
 * @package @vxture/core-api
 *
 * Description: 核心 API 层的类型定义，包含配置、响应、拦截器等类型
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

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * API 配置选项
 */
export interface ApiConfig {
  /** API 基础 URL */
  baseUrl: string;
  /** 默认请求超时时间（毫秒） */
  timeout?: number;
  /** 默认请求头 */
  defaultHeaders?: Record<string, string>;
  /** 是否启用请求拦截 */
  enableInterceptors?: boolean;
  /** 是否启用请求日志 */
  enableLogging?: boolean;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * 通用 API 响应格式
 * @template T - 数据类型
 */
export interface ApiResponse<T = any> {
  /** 响应状态码 */
  status: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T;
  /** 时间戳 */
  timestamp: string;
}

/**
 * 分页 API 响应
 * @template T - 项类型
 */
export interface PaginatedResponse<T = any> {
  /** 当前页的项 */
  items: T[];
  /** 总项数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页项数 */
  perPage: number;
  /** 总页数 */
  totalPages: number;
}

// ============================================================================
// API Error
// ============================================================================

/**
 * API 错误类，用于处理 API 响应错误
 * @class ApiError
 * @extends Error
 */
export class ApiError extends Error {
  public status: number;
  public message: string;
  public details?: string;

  constructor(status: number, message: string, details?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.message = message;
    this.details = details;
  }

  /**
   * 检查错误是否为客户端错误（4xx）
   */
  public isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * 检查错误是否为服务器错误（5xx）
   */
  public isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * 检查错误是否为认证错误（401/403）
   */
  public isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * 检查错误是否为未找到错误（404）
   */
  public isNotFound(): boolean {
    return this.status === 404;
  }
}

// ============================================================================
// Interceptor Types
// ============================================================================

/**
 * 请求拦截器类型
 */
export type RequestInterceptor = (options: RequestInit) => Promise<RequestInit>;

/**
 * 响应拦截器类型
 */
export type ResponseInterceptor = (response: Response) => Promise<Response>;

/**
 * 错误拦截器类型
 */
export type ErrorInterceptor = (error: ApiError) => Promise<ApiError>;

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * 默认 API 配置
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: '/api',
  timeout: 30000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  enableInterceptors: true,
  enableLogging: true,
};
