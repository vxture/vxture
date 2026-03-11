/**
 * index.ts - Vxture Core Configuration Package
 * @package @vxture/core-config
 *
 * Description: Platform configuration management for Vxture, providing
 * environment-based config, config validation, and config merging.
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Services - Configuration
 */

// ============================================
// Configuration Types
// ============================================

export type {
  ConfigSource,
  ConfigOptions,
  ValidationSchema,
  ConfigValue,
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning,
  ConfigEventType,
  ConfigEvent,
  ConfigListener,
} from './types';

// ============================================
// Configuration Client
// ============================================

export * from './client';
export {
  ConfigManager,
  MemoryConfigSource,
  EnvConfigSource,
  ObjectConfigSource,
} from './client';
export { getConfigManager, createConfigManager } from './client';

// ============================================
// Configuration Utils
// ============================================

// TODO: 将来需要迁移的工具函数放这里
