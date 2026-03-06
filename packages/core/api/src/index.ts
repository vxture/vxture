/**
 * index.ts - Vxture Core API Base Package
 * @package @vxture/core-api
 *
 * Description: Centralized API infrastructure for Vxture platform, providing
 * base API client, request/response interceptors, and API utilities.
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Core
 * @category Services - API
 */

// ============================================
// API Configuration
// ============================================

/**
 * API Configuration Options
 * @interface ApiConfig
 */
export interface ApiConfig {
  /** API base URL */
  baseUrl: string;
  /** Default request timeout in milliseconds */
  timeout?: number;
  /** Default headers to include in all requests */
  defaultHeaders?: Record<string, string>;
  /** Enable/disable request interception */
  enableInterceptors?: boolean;
  /** Enable/disable request logging */
  enableLogging?: boolean;
}

/**
 * Default API configuration
 */
const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: '/api',
  timeout: 30000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  enableInterceptors: true,
  enableLogging: true,
};

// ============================================
// API Client
// ============================================

/**
 * API Client class for making HTTP requests
 * @class ApiClient
 */
export class ApiClient {
  private config: ApiConfig;

  constructor(config?: Partial<ApiConfig>) {
    this.config = {
      ...DEFAULT_API_CONFIG,
      ...config,
    };
  }

  /**
   * Make a GET request
   * @param endpoint API endpoint
   * @param params Query parameters
   * @param options Request options
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
   * Make a POST request
   * @param endpoint API endpoint
   * @param data Request body
   * @param options Request options
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
   * Make a PUT request
   * @param endpoint API endpoint
   * @param data Request body
   * @param options Request options
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
   * Make a DELETE request
   * @param endpoint API endpoint
   * @param params Query parameters
   * @param options Request options
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
   * Generic request method
   * @param url Complete URL
   * @param method HTTP method
   * @param data Request body
   * @param options Request options
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

      if (error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout');
      }

      throw new ApiError(500, 'Network error', String(error));
    }
  }

  /**
   * Build URL with query parameters
   * @param endpoint API endpoint
   * @param params Query parameters
   * @returns Complete URL
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
   * Log request information
   * @param method HTTP method
   * @param url Request URL
   * @param data Request body
   */
  private logRequest(method: string, url: string, data?: any): void {
    if (!this.config.enableLogging) return;

    console.debug(`[API] ${method} ${url}`, data);
  }

  /**
   * Log response information
   * @param method HTTP method
   * @param url Request URL
   * @param data Response data
   */
  private logResponse(method: string, url: string, data?: any): void {
    if (!this.config.enableLogging) return;

    console.debug(`[API] ${method} ${url} - Success`, data);
  }

  /**
   * Log error information
   * @param method HTTP method
   * @param url Request URL
   * @param error Error object
   */
  private logError(method: string, url: string, error: any): void {
    if (!this.config.enableLogging) return;

    console.error(`[API] ${method} ${url} - Error`, error);
  }
}

// ============================================
// API Error
// ============================================

/**
 * API Error class for handling API responses
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
   * Check if error is a client error (4xx)
   */
  public isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  public isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Check if error is an authentication error (401/403)
   */
  public isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if error is a not found error (404)
   */
  public isNotFound(): boolean {
    return this.status === 404;
  }
}

// ============================================
// API Response Types
// ============================================

/**
 * Generic API response format
 * @interface ApiResponse
 * @template T - Type of the data
 */
export interface ApiResponse<T = any> {
  /** Response status code */
  status: number;
  /** Response message */
  message: string;
  /** Response data */
  data: T;
  /** Timestamp */
  timestamp: string;
}

/**
 * Paginated API response
 * @interface PaginatedResponse
 * @template T - Type of the items
 */
export interface PaginatedResponse<T = any> {
  /** Items for the current page */
  items: T[];
  /** Total number of items */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  perPage: number;
  /** Total number of pages */
  totalPages: number;
}

// ============================================
// API Interceptor Types
// ============================================

/**
 * Request interceptor
 * @typedef RequestInterceptor
 */
export type RequestInterceptor = (options: RequestInit) => Promise<RequestInit>;

/**
 * Response interceptor
 * @typedef ResponseInterceptor
 */
export type ResponseInterceptor = (response: Response) => Promise<Response>;

/**
 * Error interceptor
 * @typedef ErrorInterceptor
 */
export type ErrorInterceptor = (error: ApiError) => Promise<ApiError>;

// ============================================
// API Interceptor Manager
// ============================================

/**
 * API interceptor manager
 * @class ApiInterceptorManager
 */
export class ApiInterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  /**
   * Add a request interceptor
   * @param interceptor Request interceptor
   * @returns Unsubscribe function
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
   * Add a response interceptor
   * @param interceptor Response interceptor
   * @returns Unsubscribe function
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
   * Add an error interceptor
   * @param interceptor Error interceptor
   * @returns Unsubscribe function
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
   * Apply request interceptors
   * @param options Request options
   * @returns Modified request options
   */
  async applyRequestInterceptors(options: RequestInit): Promise<RequestInit> {
    return this.requestInterceptors.reduce(
      async (prev, interceptor) => interceptor(await prev),
      Promise.resolve(options)
    );
  }

  /**
   * Apply response interceptors
   * @param response Response object
   * @returns Modified response
   */
  async applyResponseInterceptors(response: Response): Promise<Response> {
    return this.responseInterceptors.reduce(
      async (prev, interceptor) => interceptor(await prev),
      Promise.resolve(response)
    );
  }

  /**
   * Apply error interceptors
   * @param error Error object
   * @returns Modified error
   */
  async applyErrorInterceptors(error: ApiError): Promise<ApiError> {
    return this.errorInterceptors.reduce(
      async (prev, interceptor) => interceptor(await prev),
      Promise.resolve(error)
    );
  }
}

// ============================================
// Singleton Instance
// ============================================

let apiClientInstance: ApiClient | null = null;
let interceptorManagerInstance: ApiInterceptorManager | null = null;

/**
 * Get or create the API client singleton
 * @param config API configuration
 * @returns ApiClient instance
 */
export function getApiClient(config?: Partial<ApiConfig>): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(config);
  }
  return apiClientInstance;
}

/**
 * Get or create the interceptor manager singleton
 * @returns ApiInterceptorManager instance
 */
export function getInterceptorManager(): ApiInterceptorManager {
  if (!interceptorManagerInstance) {
    interceptorManagerInstance = new ApiInterceptorManager();
  }
  return interceptorManagerInstance;
}