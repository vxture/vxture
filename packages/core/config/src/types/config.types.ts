/**
 * config.types.ts - 配置类型定义
 * @package @vxture/core-config
 * @description Core config types and constants
 */

import type { AppConfig } from '../schemas/app.schema';
import type { AuthConfig } from '../schemas/auth.schema';
import type { DatabaseConfig } from '../schemas/database.schema';
import type { RedisConfig } from '../schemas/redis.schema';
import type { AiConfig } from '../schemas/ai.schema';

// ============================================================================
// Configuration Types
// ============================================================================

export interface VxConfig {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  auth: AuthConfig;
  ai: AiConfig;
}

export const CONFIG_TOKEN = {
  APP: Symbol('VX_CONFIG_APP'),
  DATABASE: Symbol('VX_CONFIG_DATABASE'),
  REDIS: Symbol('VX_CONFIG_REDIS'),
  AUTH: Symbol('VX_CONFIG_AUTH'),
  AI: Symbol('VX_CONFIG_AI'),
} as const;

export interface ConfigLoadResult {
  success: boolean;
  domains: string[];
  errors?: ConfigValidationError[];
}

export interface ConfigValidationError {
  field: string;
  message: string;
}
