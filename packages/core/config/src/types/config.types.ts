/**
 * config.types.ts - Configuration type definitions
 * @package @vxture/core-config
 * @description
 *   Core config types and constants
 *
 * @author AI-Generated
 * @date 2026-03-15
 */

import type {
  AppConfig,
  AuthConfig,
  DatabaseConfig,
  RedisConfig,
  AiConfig,
  OauthConfig,
  PlatformConfig,
  MailEnvConfig,
  VelaConfig,
} from "../schemas";

// ============================================================================
// Configuration Types
// ============================================================================

export interface VxConfig {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  auth: AuthConfig;
  ai: AiConfig;
  oauth: OauthConfig;
  platform: PlatformConfig;
  mail: MailEnvConfig;
  vela: VelaConfig;
}

export const CONFIG_TOKEN = {
  APP: Symbol("VX_CONFIG_APP"),
  DATABASE: Symbol("VX_CONFIG_DATABASE"),
  REDIS: Symbol("VX_CONFIG_REDIS"),
  AUTH: Symbol("VX_CONFIG_AUTH"),
  AI: Symbol("VX_CONFIG_AI"),
  OAUTH: Symbol("VX_CONFIG_OAUTH"),
  PLATFORM: Symbol("VX_CONFIG_PLATFORM"),
  MAIL: Symbol("VX_CONFIG_MAIL"),
  VELA: Symbol("VX_CONFIG_VELA"),
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
