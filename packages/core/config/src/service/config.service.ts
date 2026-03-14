/**
 * config.service.ts - 配置服务
 * @package @vxture/core-config
 * @description NestJS injectable service for typed config access
 */

import { Inject, Injectable, Optional } from '@nestjs/common';

import type { AppConfig, DatabaseConfig, RedisConfig, AuthConfig, AiConfig } from '../schemas';
import { CONFIG_TOKEN } from '../types';

// ============================================================================
// VxConfigService
//
// 消费方注入 VxConfigService 后通过强类型 getter 访问配置。
// 未注册的域（如 agent-server 没有注册 ai 域）调用对应 getter 会
// 在运行时抛出明确错误，而不是返回 undefined。
// ============================================================================

@Injectable()
export class VxConfigService {
  constructor(
    @Optional() @Inject(CONFIG_TOKEN.APP)      private readonly _app:      AppConfig,
    @Optional() @Inject(CONFIG_TOKEN.DATABASE) private readonly _database: DatabaseConfig,
    @Optional() @Inject(CONFIG_TOKEN.REDIS)    private readonly _redis:    RedisConfig,
    @Optional() @Inject(CONFIG_TOKEN.AUTH)     private readonly _auth:     AuthConfig,
    @Optional() @Inject(CONFIG_TOKEN.AI)       private readonly _ai:       AiConfig,
  ) {}

  get app(): AppConfig {
    this.assertLoaded(this._app, 'app');
    return this._app;
  }

  get database(): DatabaseConfig {
    this.assertLoaded(this._database, 'database');
    return this._database;
  }

  get redis(): RedisConfig {
    this.assertLoaded(this._redis, 'redis');
    return this._redis;
  }

  get auth(): AuthConfig {
    this.assertLoaded(this._auth, 'auth');
    return this._auth;
  }

  /** 仅 agent-server 注册了 ai 域时可用 */
  get ai(): AiConfig {
    this.assertLoaded(this._ai, 'ai');
    return this._ai;
  }

  /** 当前是否为生产环境 */
  get isProduction(): boolean {
    return this._app?.NODE_ENV === 'production';
  }

  /** 当前是否为开发环境 */
  get isDevelopment(): boolean {
    return this._app?.NODE_ENV === 'development';
  }

  /** 当前是否为测试环境 */
  get isTest(): boolean {
    return this._app?.NODE_ENV === 'test';
  }

  // --------------------------------------------------------------------------

  private assertLoaded(value: unknown, domain: string): void {
    if (value === undefined || value === null) {
      throw new Error(
        `[VxConfigService] Config domain "${domain}" is not loaded. ` +
        `Add "${domain}" to VxConfigModule.register({ domains: [...] }).`,
      );
    }
  }
}