/**
 * app.schema.ts - 应用配置schema
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
  /** 当前运行环境 */
  NODE_ENV: AppEnvEnum.default('development'),

  /** HTTP 监听端口 */
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  /** 日志级别 */
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),

  /** 应用名称，用于日志和监控标识 */
  APP_NAME: z.string().min(1).default('vxture'),
});

export type AppConfig = z.infer<typeof appSchema>;
export type AppEnv = z.infer<typeof AppEnvEnum>;