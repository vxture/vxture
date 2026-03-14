/**
 * index.ts - 公共导出入口
 * @package @vxture/core-config
 * @description Environment-aware typed configuration (zod + NestJS)
 */

// ============================================
// Schemas & Types
// ============================================

// Schema 导出（明确列出，便于维护）
export { 
    appSchema,
    AppEnvEnum,
    databaseSchema,
    redisSchema,
    authSchema,
    aiSchema,
} from './schemas';

// Type 导出（明确列出，便于维护）
export type {
    AppConfig,
    AppEnv,
    DatabaseConfig,
    RedisConfig,
    AuthConfig,
} from './schemas';

export type { VxConfig, ConfigLoadResult, ConfigValidationError } from './types';
export { CONFIG_TOKEN } from './types';

// ============================================
// Module & Service
// ============================================

export { VxConfigModule } from './module';
export type { VxConfigModuleOptions } from './module';

export { VxConfigService } from './service';

// ============================================
// Utils
// ============================================

export {
    deepMerge,
    deepClone,
    isPlainObject
} from './utils';
