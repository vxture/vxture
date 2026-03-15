/**
 * config.module.ts - Configuration module
 * @package @vxture/core-config
 * @description
 *   NestJS configuration module responsible for loading and parsing environment variables
 * 
 * @author AI-Generated
 * @date 2026-03-15
 */

import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import { ZodError } from 'zod';

import { appSchema, databaseSchema, redisSchema, authSchema, aiSchema } from '../schemas';

import { CONFIG_TOKEN } from '../types';
import type { ConfigLoadResult, ConfigValidationError } from '../types';

// ============================================================================
// Domain Definition Table — Add new domains here
// ============================================================================

const CONFIG_DOMAINS = [
  { token: CONFIG_TOKEN.APP,      schema: appSchema,      name: 'app'      },
  { token: CONFIG_TOKEN.DATABASE, schema: databaseSchema, name: 'database' },
  { token: CONFIG_TOKEN.REDIS,    schema: redisSchema,    name: 'redis'    },
  { token: CONFIG_TOKEN.AUTH,     schema: authSchema,     name: 'auth'     },
  { token: CONFIG_TOKEN.AI,       schema: aiSchema,       name: 'ai'       },
] as const;

// ============================================================================
// Domain Registration Options
// ============================================================================

export interface VxConfigModuleOptions {
  /**
   * Configuration domains to load
   * - Default: ['app', 'database', 'redis', 'auth']
   * - agent-server adds: 'ai'
   * - Unregistered domains won't be parsed or injectable
   */
  domains?: Array<'app' | 'database' | 'redis' | 'auth' | 'ai'>;

  /**
   * Whether to throw and exit process on missing required variables
   * - Default: true (fail-fast, don't run with invalid config)
   * - Set to false only for testing or CI linting scenarios
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
   * Call in AppModule imports:
   *
   * ```ts
   * // BFF / service (no AI config needed)
   * VxConfigModule.register({ domains: ['app', 'database', 'redis', 'auth'] })
   *
   * // agent-server (needs AI config)
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