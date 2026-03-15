/**
 * config.types.ts - Configuration type definitions
 * @package @vxture/core-config
 * @description
 *   Core config types and constants
 */

import type { 
  AppConfig,
  AuthConfig,
  DatabaseConfig,
  RedisConfig,
  AiConfig,
} from '../schemas';

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
