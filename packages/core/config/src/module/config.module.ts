/**
 * config.module.ts - 配置模块
 * @package @vxture/core-config
 * @description
 *   NestJS 配置模块，负责加载和解析环境变量
 */

import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import { ZodError } from 'zod';

import { appSchema, databaseSchema, redisSchema, authSchema, aiSchema } from '../schemas';

import { CONFIG_TOKEN } from '../types';
import type { ConfigLoadResult, ConfigValidationError } from '../types';

// ============================================================================
// 域定义表 — 新增域只需在这里追加一行
// ============================================================================

const CONFIG_DOMAINS = [
  { token: CONFIG_TOKEN.APP,      schema: appSchema,      name: 'app'      },
  { token: CONFIG_TOKEN.DATABASE, schema: databaseSchema, name: 'database' },
  { token: CONFIG_TOKEN.REDIS,    schema: redisSchema,    name: 'redis'    },
  { token: CONFIG_TOKEN.AUTH,     schema: authSchema,     name: 'auth'     },
  { token: CONFIG_TOKEN.AI,       schema: aiSchema,       name: 'ai'       },
] as const;

// ============================================================================
// 域注册选项
// ============================================================================

export interface VxConfigModuleOptions {
  /**
   * 需要加载的配置域
   * - 默认：['app', 'database', 'redis', 'auth']
   * - agent-server 额外加：'ai'
   * - 未注册的域不会被 parse，也不能被注入
   */
  domains?: Array<'app' | 'database' | 'redis' | 'auth' | 'ai'>;

  /**
   * 是否在缺少必填变量时抛出异常退出进程
   * - 默认：true（fail-fast，不带错配置运行）
   * - 设为 false 仅用于测试或 CI lint 场景
   */
  strict?: boolean;
}

// ============================================================================
// VxConfigModule
// ============================================================================

@Global()
@Module({})
export class VxConfigModule {
  private static readonly logger = new Logger('VxConfigModule');

  /**
   * 在 AppModule 的 imports 中调用：
   *
   * ```ts
   * // BFF / service（不需要 AI 配置）
   * VxConfigModule.register({ domains: ['app', 'database', 'redis', 'auth'] })
   *
   * // agent-server（需要 AI 配置）
   * VxConfigModule.register({ domains: ['app', 'database', 'redis', 'auth', 'ai'] })
   * ```
   */
  static register(options: VxConfigModuleOptions = {}): DynamicModule {
    const {
      domains = ['app', 'database', 'redis', 'auth'],
      strict = true,
    } = options;

    const result: ConfigLoadResult = { success: true, domains: [], errors: [] };
    const providers = [];

    for (const domain of CONFIG_DOMAINS) {
      if (!domains.includes(domain.name as never)) continue;

      let parsed: unknown;

      try {
        parsed = domain.schema.parse(process.env);
        result.domains.push(domain.name);
      } catch (err) {
        if (err instanceof ZodError) {
          const errors: ConfigValidationError[] = err.errors.map((e) => ({
            field: `${domain.name.toUpperCase()}.${e.path.join('.')}`,
            message: e.message,
          }));

          result.success = false;
          result.errors!.push(...errors);

          if (strict) {
            VxConfigModule.logger.error(
              `[core-config] Validation failed for domain "${domain.name}":\n` +
              errors.map((e) => `  • ${e.field}: ${e.message}`).join('\n'),
            );
            process.exit(1);
          }
        }
      }

      providers.push({
        provide: domain.token,
        useValue: parsed ?? {},
      });
    }

    if (result.success) {
      VxConfigModule.logger.log(
        `[core-config] Loaded domains: [${result.domains.join(', ')}]`,
      );
    }

    return {
      module: VxConfigModule,
      providers,
      exports: providers.map((p) => p.provide),
    };
  }
}