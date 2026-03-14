/**
 * index.ts - @vxture/core-config
 * @package @vxture/core-config
 * @description Environment-aware typed configuration (zod + NestJS)
 */

// ============================================
// Schemas & Types
// ============================================

export * from './schemas';
export type { VxConfig } from './types/config.types';
export { CONFIG_TOKEN } from './types/config.types';

// ============================================
// Module & Service
// ============================================

export { VxConfigModule } from './module';
export type { VxConfigModuleOptions } from './module';

export { VxConfigService } from './service';
