/**
 * http.client.ts - VxHttpClient HTTP 客户端
 * @package @vxture/core-api
 *
 * 基于 @nestjs/axios 封装，提供类型安全的 HTTP 方法。
 * 通过 NestJS DI 注入，不使用全局单例。
 *
 * @example
 * // 在 BFF router 中注入使用
 * @Injectable()
 * export class BillingRouter {
 *   constructor(private readonly http: VxHttpClient) {}
 *
 *   async getInvoices(tenantId: string, token: string) {
 *     return this.http.get<Invoice[]>('/invoices', {
 *       headers: { authorization: `Bearer ${token}`, 'x-tenant-id': tenantId },
 *     });
 *   }
 * }
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService }         from '@nestjs/axios';
import { firstValueFrom }      from 'rxjs';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import FormData                from 'form-data';

import { normalizeHttpError, isRetryableError } from '../utils/error.utils';
import type { RequestOptions, UploadOptions, RequestContext } from '../types/api.types';
import { VX_HTTP_OPTIONS } from '../module/http.module';
import type { VxHttpModuleOptions } from '../module/http.module';

// ============================================================================
// VxHttpClient
// ============================================================================

@Injectable()
export class VxHttpClient {
  private readonly logger = new Logger(VxHttpClient.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(VX_HTTP_OPTIONS) private readonly options: VxHttpModuleOptions,
  ) {}

  // --------------------------------------------------------------------------
  // 标准 HTTP 方法
  // --------------------------------------------------------------------------

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  async post<T>(path: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, data, options);
  }

  async put<T>(path: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, data, options);
  }

  async patch<T>(path: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, data, options);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  // --------------------------------------------------------------------------
  // 文件上传
  // --------------------------------------------------------------------------

  /**
   * multipart/form-data 文件上传
   *
   * @example
   * const result = await this.http.upload<{ url: string }>(
   *   '/files/upload',
   *   buffer,
   *   'avatar.jpg',
   *   { headers: { authorization: `Bearer ${token}` } }
   * );
   */
  async upload<T>(
    path:     string,
    file:     Buffer | NodeJS.ReadableStream,
    filename: string,
    options?: UploadOptions,
  ): Promise<T> {
    const form = new FormData();
    form.append('file', file, filename);

    return this.request<T>('POST', path, form, {
      ...options,
      headers: {
        ...options?.headers,
        ...form.getHeaders(),
      },
    });
  }

  /**
   * 文件下载，返回 Buffer
   *
   * @example
   * const buffer = await this.http.download('/files/report.pdf', token);
   */
  async download(path: string, options?: RequestOptions): Promise<Buffer> {
    const response = await this.rawRequest<Buffer>('GET', path, undefined, {
      ...options,
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data as unknown as ArrayBuffer);
  }

  // --------------------------------------------------------------------------
  // 上下文感知请求（自动注入 token 和 tenantId）
  // --------------------------------------------------------------------------

  /**
   * 携带请求上下文的 GET，自动注入 Authorization 和 x-tenant-id
   *
   * @example
   * // 在 BFF 中透传前端的 token 和租户信息
   * return this.http.getWithContext<Invoice[]>('/invoices', {
   *   accessToken: user.token,
   *   tenantId:    tenant.id,
   * });
   */
  async getWithContext<T>(
    path:    string,
    context: RequestContext,
    options?: RequestOptions,
  ): Promise<T> {
    return this.get<T>(path, this.mergeContext(options, context));
  }

  async postWithContext<T>(
    path:    string,
    data:    unknown,
    context: RequestContext,
    options?: RequestOptions,
  ): Promise<T> {
    return this.post<T>(path, data, this.mergeContext(options, context));
  }

  // --------------------------------------------------------------------------
  // 原始响应访问（第三方 API，不强制解包）
  // --------------------------------------------------------------------------

  /**
   * 返回完整的 axios 响应，不做任何处理
   * 用于第三方 API 响应格式各异的场景
   */
  async rawRequest<T = unknown>(
    method:  string,
    path:    string,
    data?:   unknown,
    options?: RequestOptions,
  ): Promise<AxiosResponse<T>> {
    const config = this.buildConfig(method, path, data, options);
    const retries = options?.retries ?? this.options.retries ?? 2;

    return this.executeWithRetry<AxiosResponse<T>>(
      () => firstValueFrom(this.httpService.request<T>(config)),
      retries,
      `${method} ${path}`,
    );
  }

  // --------------------------------------------------------------------------
  // 内部核心方法
  // --------------------------------------------------------------------------

  private async request<T>(
    method:  string,
    path:    string,
    data?:   unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const response = await this.rawRequest<T>(method, path, data, options);
    // raw: true 时返回完整响应体，false 时只返回 data
    return (options?.raw ? response : response.data) as T;
  }

  private buildConfig(
    method:  string,
    path:    string,
    data?:   unknown,
    options?: RequestOptions,
  ): AxiosRequestConfig {
    return {
      method,
      url:          path,
      baseURL:      options?.baseURL ?? this.options.baseURL,
      data,
      headers:      options?.headers ?? this.options.headers,
      timeout:      options?.timeout ?? this.options.timeout ?? 30_000,
      responseType: options?.responseType ?? 'json',
    };
  }

  private mergeContext(
    options:  RequestOptions | undefined,
    context:  RequestContext,
  ): RequestOptions {
    const contextHeaders: Record<string, string> = {};

    if (context.accessToken) {
      contextHeaders['authorization'] = `Bearer ${context.accessToken}`;
    }
    if (context.tenantId) {
      contextHeaders['x-tenant-id'] = context.tenantId;
    }
    if (context.requestId) {
      contextHeaders['x-request-id'] = context.requestId;
    }

    return {
      ...options,
      headers: { ...contextHeaders, ...options?.headers },
    };
  }

  private async executeWithRetry<T>(
    fn:          () => Promise<T>,
    retries:     number,
    label:       string,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;

        const status      = this.extractStatus(err);
        const isNetwork   = this.isNetworkError(err);
        const shouldRetry = isRetryableError(status, isNetwork);

        if (!shouldRetry || attempt === retries) break;

        const delay = Math.min(1000 * 2 ** attempt, 8000);
        this.logger.warn(`[VxHttpClient] ${label} failed (attempt ${attempt + 1}), retrying in ${delay}ms`);
        await sleep(delay);
      }
    }

    throw this.normalizeError(lastError, label);
  }

  private normalizeError(err: unknown, label: string): Error {
    if (isAxiosError(err)) {
      const status    = err.response?.status;
      const body      = err.response?.data as Record<string, unknown> | undefined;
      const requestId = typeof body?.['requestId'] === 'string' ? body['requestId'] : undefined;

      this.logger.error(`[VxHttpClient] ${label} → ${status ?? 'network error'}`);

      return normalizeHttpError(
        status ?? 0,
        {
          message: typeof body?.['message'] === 'string' ? body['message'] : undefined,
          code:    typeof body?.['code']    === 'string' ? body['code']    : undefined,
          details: body?.['details'],
        },
        requestId,
      );
    }

    this.logger.error(`[VxHttpClient] ${label} → unknown error`, err);
    return err instanceof Error ? err : new Error(String(err));
  }

  private extractStatus(err: unknown): number | undefined {
    if (isAxiosError(err)) return err.response?.status;
    return undefined;
  }

  private isNetworkError(err: unknown): boolean {
    if (!isAxiosError(err)) return false;
    return !err.response && !!err.request;
  }
}

// ============================================================================
// 内部工具
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAxiosError(err: unknown): err is {
  response?: { status: number; data: unknown };
  request?:  unknown;
  message:   string;
  isAxiosError: boolean;
} {
  return (
    typeof err === 'object' &&
    err !== null &&
    'isAxiosError' in err &&
    (err as Record<string, unknown>)['isAxiosError'] === true
  );
}
