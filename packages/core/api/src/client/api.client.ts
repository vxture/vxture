/**
 * api.client.ts - API 客户端实现
 * @package @vxture/core-api
 *
 * Description: API 客户端类，用于发起 HTTP 请求
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

import type { ApiConfig } from '../types/api.types';
import { ApiError } from '../types/api.types';
import type { RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from '../types/api.types';

// ============================================================================
// API Client
// ============================================================================

/**
 * API 客户端类，用于发起 HTTP 请求
 * @class ApiClient
 */
export class ApiClient {
  private config: ApiConfig;

  constructor(config?: Partial<ApiConfig>) {
    this.config = {
      baseUrl: '/api',
      timeout: 30000,
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
      enableInterceptors: true,
      enableLogging: true,
      ...config,
    };
  }

  /**
   * 发起 GET 请求
   * @param endpoint API 端点
   * @param params 查询参数
   * @param options 请求选项
   * @returns Promise<Response>
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    options?: RequestInit
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>(url, 'GET', undefined, options);
  }

  /**
   * 发起 POST 请求
   * @param endpoint API 端点
   * @param data 请求体
   * @param options 请求选项
   * @returns Promise<Response>
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(this.buildUrl(endpoint), 'POST', data, options);
  }

  /**
   * 发起 PUT 请求
   * @param endpoint API 端点
   * @param data 请求体
   * @param options 请求选项
   * @returns Promise<Response>
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(this.buildUrl(endpoint), 'PUT', data, options);
  }

  /**
   * 发起 DELETE 请求
   * @param endpoint API 端点
   * @param params 查询参数
   * @param options 请求选项
   * @returns Promise<Response>
   */
  async delete<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    options?: RequestInit
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>(url, 'DELETE', undefined, options);
  }

  /**
   * 通用请求方法
   * @param url 完整 URL
   * @param method HTTP 方法
   * @param data 请求体
   * @param options 请求选项
   * @returns Promise<Response>
   */
  private async request<T>(
    url: string,
    method: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    try {
      this.logRequest(method, url, data);

      const requestOptions: RequestInit = {
        method,
        headers: {
          ...this.config.defaultHeaders,
          ...options?.headers,
        },
        ...options,
      };

      if (data) {
        requestOptions.body = JSON.stringify(data);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(response.status, response.statusText, await response.text());
      }

      const responseData = await response.json();
      this.logResponse(method, url, responseData);

      return responseData;
    } catch (error) {
      this.logError(method, url, error);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout');
      }

      throw new ApiError(500, 'Network error', String(error));
    }
  }

  /**
   * 构建带有查询参数的 URL
   * @param endpoint API 端点
   * @param params 查询参数
   * @returns 完整 URL
   */
  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number>
  ): string {
    const base = this.config.baseUrl.endsWith('/')
      ? this.config.baseUrl.slice(0, -1)
      : this.config.baseUrl;

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let url = `${base}${path}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    return url;
  }

  /**
   * 记录请求信息
   * @param method HTTP 方法
   * @param url 请求 URL
   * @param data 请求体
   */
  private logRequest(method: string, url: string, data?: any): void {
    if (!this.config.enableLogging) return;

    console.debug(`[API] ${method} ${url}`, data);
  }

  /**
   * 记录响应信息
   * @param method HTTP 方法
   * @param url 请求 URL
   * @param data 响应数据
   */
  private logResponse(method: string, url: string, data?: any): void {
    if (!this.config.enableLogging) return;

    console.debug(`[API] ${method} ${url} - Success`, data);
  }

  /**
   * 记录错误信息
   * @param method HTTP 方法
   * @param url 请求 URL
   * @param error 错误对象
   */
  private logError(method: string, url: string, error: any): void {
    if (!this.config.enableLogging) return;

    console.error(`[API] ${method} ${url} - Error`, error);
  }
}

// ============================================================================
// API Interceptor Manager
// ============================================================================

/**
 * API 拦截器管理器
 * @class ApiInterceptorManager
 */
export class ApiInterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  /**
   * 添加请求拦截器
   * @param interceptor 请求拦截器
   * @returns 取消订阅函数
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * 添加响应拦截器
   * @param interceptor 响应拦截器
   * @returns 取消订阅函数
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * 添加错误拦截器
   * @param interceptor 错误拦截器
   * @returns 取消订阅函数
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * 应用请求拦截器
   * @param options 请求选项
   * @returns 已修改的请求选项
   */
  async applyRequestInterceptors(options: RequestInit): Promise<RequestInit> {
    return this.requestInterceptors.reduce(
      async (prev, interceptor) => interceptor(await prev),
      Promise.resolve(options)
    );
  }

  /**
   * 应用响应拦截器
   * @param response 响应对象
   * @returns 已修改的响应
   */
  async applyResponseInterceptors(response: Response): Promise<Response> {
    return this.responseInterceptors.reduce(
      async (prev, interceptor) => interceptor(await prev),
      Promise.resolve(response)
    );
  }

  /**
   * 应用错误拦截器
   * @param error 错误对象
   * @returns 已修改的错误
   */
  async applyErrorInterceptors(error: ApiError): Promise<ApiError> {
    return this.errorInterceptors.reduce(
      async (prev, interceptor) => interceptor(await prev),
      Promise.resolve(error)
    );
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let apiClientInstance: ApiClient | null = null;
let interceptorManagerInstance: ApiInterceptorManager | null = null;

/**
 * 获取或创建 API 客户端单例
 * @param config API 配置
 * @returns ApiClient 实例
 */
export function getApiClient(config?: Partial<ApiConfig>): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(config);
  }
  return apiClientInstance;
}

/**
 * 获取或创建拦截器管理器单例
 * @returns ApiInterceptorManager 实例
 */
export function getInterceptorManager(): ApiInterceptorManager {
  if (!interceptorManagerInstance) {
    interceptorManagerInstance = new ApiInterceptorManager();
  }
  return interceptorManagerInstance;
}
