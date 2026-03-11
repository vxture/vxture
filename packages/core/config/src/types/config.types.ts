/**
 * config.types.ts - 配置类型定义
 * @package @vxture/core-config
 *
 * Description: Core config types and constants
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Types - Config
 */

// ============================================================================
// Configuration Types
// ============================================================================

export interface ConfigSource {
  name: string;
  priority: number;
  required?: boolean;
  mutable?: boolean;
  get<T>(key: string): T | undefined;
  getAll(): Record<string, any>;
  has(key: string): boolean;
  set?(key: string, value: any): void;
  remove?(key: string): void;
  clear?(): void;
  merge?(config: Record<string, any>): void;
}

export interface ConfigOptions {
  envPrefix?: string;
  defaultEnv?: string;
  validateOnInit?: boolean;
  enableLogging?: boolean;
}

export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    default?: any;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
    validate?: (value: any) => boolean;
    description?: string;
    example?: any;
  };
}

export interface ConfigValue {
  value: any;
  source: string;
  immutable: boolean;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: ConfigValidationError[];
  warnings: ConfigValidationWarning[];
}

export interface ConfigValidationError {
  key: string;
  message: string;
}

export interface ConfigValidationWarning {
  key: string;
  message: string;
}

export type ConfigEventType = 'set' | 'remove' | 'clear' | 'load' | 'save';

export interface ConfigEvent {
  type: ConfigEventType;
  key?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
}

export type ConfigListener = (event: ConfigEvent) => void;

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_CONFIG_OPTIONS: ConfigOptions = {
  envPrefix: 'VX_',
  defaultEnv: 'development',
  validateOnInit: true,
  enableLogging: true,
};
