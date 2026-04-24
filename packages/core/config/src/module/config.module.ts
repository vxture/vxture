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
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ZodError } from 'zod';

import { appSchema, databaseSchema, redisSchema, authSchema, aiSchema } from '../schemas';
import { VxConfigService } from '../service';

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
  private static envLoaded = false;

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
    VxConfigModule.loadEnvFiles();

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
      providers: [...providers, VxConfigService],
      exports: [...providers.map((p) => p.provide), VxConfigService],
    };
  }

  private static loadEnvFiles(): void {
    if (VxConfigModule.envLoaded) {
      return;
    }

    const rootDir = resolve(process.cwd(), '..', '..');
    const candidates = [
      join(rootDir, '.env.local'),
      join(rootDir, '.env'),
      resolve(process.cwd(), '.env.local'),
      resolve(process.cwd(), '.env'),
    ];

    for (const filePath of candidates) {
      if (!existsSync(filePath)) {
        continue;
      }

      try {
        const content = readFileSync(filePath, 'utf8');
        for (const rawLine of content.split(/\r?\n/)) {
          const line = rawLine.trim();
          if (!line || line.startsWith('#')) {
            continue;
          }

          const withoutInlineComment = stripInlineComment(line);
          const separatorIndex = withoutInlineComment.indexOf('=');
          if (separatorIndex < 0) {
            continue;
          }

          const key = withoutInlineComment.slice(0, separatorIndex).trim();
          let value = withoutInlineComment.slice(separatorIndex + 1).trim();

          if (!key || process.env[key] !== undefined) {
            continue;
          }

          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }

          process.env[key] = value;
        }
      } catch (error) {
        VxConfigModule.logger.warn(
          `[core-config] Failed to load env file "${filePath}": ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }

    VxConfigModule.envLoaded = true;
  }
}

function stripInlineComment(line: string): string {
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (char === '#' && !inSingleQuote && !inDoubleQuote) {
      const previous = index === 0 ? '' : (line[index - 1] ?? '');
      if (previous === '' || /\s/.test(previous)) {
        return line.slice(0, index).trimEnd();
      }
    }
  }

  return line;
}
