/**
 * http.module.ts - VxHttpModule
 * @package @vxture/core-api
 *
 * 全局 HTTP 模块，注册 VxHttpClient 供所有模块使用。
 *
 * @example
 * // 在 BFF 的 AppModule 中注册：
 * VxHttpModule.register({
 *   baseURL: 'http://agent01-server:3001',
 *   timeout: 30_000,
 *   retries: 2,
 * })
 *
 * // 在 agent-server 中调用第三方 API：
 * VxHttpModule.register({
 *   timeout: 60_000,
 *   retries: 1,
 * })
 */

import { DynamicModule, Global, Module } from '@nestjs/common';
import { HttpModule }                     from '@nestjs/axios';

import { VxHttpClient } from '../client/http.client';

export const VX_HTTP_OPTIONS = Symbol('VX_HTTP_OPTIONS');

export interface VxHttpModuleOptions {
  /** 全局 baseURL，BFF 调用 agent-server 时设置 */
  baseURL?:  string;
  /** 全局超时（毫秒），默认 30000 */
  timeout?:  number;
  /** 全局重试次数，默认 2 */
  retries?:  number;
  /** 全局默认 headers */
  headers?:  Record<string, string>;
}

@Global()
@Module({})
export class VxHttpModule {
  static register(options: VxHttpModuleOptions = {}): DynamicModule {
    return {
      module: VxHttpModule,
      imports: [
        HttpModule.register({
          baseURL:  options.baseURL,
          timeout:  options.timeout ?? 30_000,
          headers:  options.headers,
        }),
      ],
      providers: [
        { provide: VX_HTTP_OPTIONS, useValue: options },
        VxHttpClient,
      ],
      exports: [VxHttpClient],
    };
  }
}
