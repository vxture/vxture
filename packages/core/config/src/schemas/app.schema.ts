/**
 * app.schema.ts - Application configuration schema
 * @package @vxture/core-config
 * @description
 *   Zod schema for application configuration
 */

import { z } from 'zod';

// ============================================================================
// App Schema
// ============================================================================

export const AppEnvEnum = z.enum(['development', 'staging', 'production', 'test']);

export const appSchema = z.object({
  /** Current runtime environment */
  NODE_ENV: AppEnvEnum.default('development'),

  /** HTTP listening port */
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  /** Log level */
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),

  /** Application name, used for logging and monitoring identification */
  APP_NAME: z.string().min(1).default('vxture'),
});

export type AppConfig = z.infer<typeof appSchema>;
export type AppEnv = z.infer<typeof AppEnvEnum>;