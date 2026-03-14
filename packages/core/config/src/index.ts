/**
 * index.ts - @vxture/core-config
 * @package @vxture/core-config
 * @description Environment-aware typed configuration (zod + NestJS)
 */

// ============================================
// Schemas & Types
// ============================================

// Schema 导出（明确列出，便于维护）
export { appSchema, AppEnvEnum } from './schemas';
export { databaseSchema } from './schemas';
export { redisSchema } from './schemas';
export { authSchema } from './schemas';
export { aiSchema } from './schemas';

// Type 导出
export type { AppConfig, AppEnv } from './schemas';
export type { DatabaseConfig } from './schemas';
export type { RedisConfig } from './schemas';
export type { AuthConfig } from './schemas';
export type { AiConfig, DoubaoConfig, ClaudeConfig, CustomModelConfig } from './schemas';
export type { VxConfig } from './types/config.types';
export { CONFIG_TOKEN } from './types/config.types';

// ============================================
// Module & Service
// ============================================

export { VxConfigModule } from './module';
export type { VxConfigModuleOptions } from './module';

export { VxConfigService } from './service';
