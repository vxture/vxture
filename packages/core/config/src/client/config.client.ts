/**
 * config.client.ts - 配置客户端实现
 * @package @vxture/core-config
 *
 * Description: Core configuration client with multiple config sources and validation
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Client - Config
 */

import type {
  ConfigSource,
  ConfigOptions,
  ValidationSchema,
  ConfigEventType,
  ConfigEvent,
  ConfigListener,
  ConfigValidationResult,


} from '../types';

// ============================================================================
// Memory Config Source
// ============================================================================

/**
 * In-Memory Configuration Source
 * @class MemoryConfigSource
 * @implements ConfigSource
 */
export class MemoryConfigSource implements ConfigSource {
  public readonly name: string;
  public readonly priority: number;
  public readonly required: boolean;
  public readonly mutable: boolean;
  private config: Record<string, any>;

  constructor(
    name: string = 'memory',
    priority: number = 100,
    required: boolean = false,
    mutable: boolean = true,
    initialConfig: Record<string, any> = {}
  ) {
    this.name = name;
    this.priority = priority;
    this.required = required;
    this.mutable = mutable;
    this.config = initialConfig;
  }

  /**
   * Get configuration value
   */
  public get<T>(key: string): T | undefined {
    return this.getNestedValue(this.config, key) as T;
  }

  /**
   * Get all configuration values
   */
  public getAll(): Record<string, any> {
    return deepClone(this.config);
  }

  /**
   * Check if configuration key exists
   */
  public has(key: string): boolean {
    return this.getNestedValue(this.config, key) !== undefined;
  }

  /**
   * Set configuration value
   */
  public set(key: string, value: any): void {
    if (this.mutable) {
      this.setNestedValue(this.config, key, value);
    }
  }

  /**
   * Remove configuration key
   */
  public remove(key: string): void {
    if (this.mutable) {
      const parts = key.split('.');
      let current = this.config;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];

        if (current[part] === undefined) {
          return;
        }

        current = current[part];
      }

      delete current[parts[parts.length - 1]];
    }
  }

  /**
   * Clear all configuration
   */
  public clear(): void {
    if (this.mutable) {
      this.config = {};
    }
  }

  /**
   * Merge configuration
   */
  public merge(config: Record<string, any>): void {
    if (this.mutable) {
      this.config = deepMerge(this.config, config);
    }
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, key: string): any {
    const parts = key.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      current = current[part];
    }

    return current;
  }

  /**
   * Set nested value in object
   */
  private setNestedValue(obj: any, key: string, value: any): void {
    const parts = key.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];

      if (current[part] === undefined) {
        current[part] = {};
      }

      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }
}

// ============================================================================
// Environment Config Source
// ============================================================================

/**
 * Environment Configuration Source
 * @class EnvConfigSource
 * @implements ConfigSource
 */
export class EnvConfigSource implements ConfigSource {
  public readonly name: string;
  public readonly priority: number;
  public readonly required: boolean;
  public readonly mutable: boolean;
  private envPrefix: string;
  private cachedConfig: Record<string, any> | null = null;

  constructor(
    name: string = 'env',
    priority: number = 200,
    required: boolean = false,
    envPrefix: string = 'VX_'
  ) {
    this.name = name;
    this.priority = priority;
    this.required = required;
    this.mutable = false;
    this.envPrefix = envPrefix;
  }

  /**
   * Get configuration value
   */
  public get<T>(key: string): T | undefined {
    const envKey = this.toEnvKey(key);

    if (typeof process !== 'undefined' && process.env) {
      return process.env[envKey] as T;
    }

    if (this.cachedConfig) {
      return this.cachedConfig[key] as T;
    }

    return undefined;
  }

  /**
   * Get all configuration values
   */
  public getAll(): Record<string, any> {
    const config: Record<string, any> = {};

    if (typeof process !== 'undefined' && process.env) {
      for (const key in process.env) {
        if (key.startsWith(this.envPrefix)) {
          const configKey = this.fromEnvKey(key);
          config[configKey] = process.env[key];
        }
      }
    } else if (this.cachedConfig) {
      return { ...this.cachedConfig };
    }

    return config;
  }

  /**
   * Check if configuration key exists
   */
  public has(key: string): boolean {
    const envKey = this.toEnvKey(key);

    if (typeof process !== 'undefined' && process.env) {
      return envKey in process.env;
    }

    if (this.cachedConfig) {
      return key in this.cachedConfig;
    }

    return false;
  }

  /**
   * Convert config key to environment key
   */
  private toEnvKey(key: string): string {
    return this.envPrefix + key.toUpperCase().replace(/\./g, '_');
  }

  /**
   * Convert environment key to config key
   */
  private fromEnvKey(envKey: string): string {
    return envKey.slice(this.envPrefix.length).toLowerCase().replace(/_/g, '.');
  }
}

// ============================================================================
// Object Config Source
// ============================================================================

/**
 * Object Configuration Source
 * @class ObjectConfigSource
 * @implements ConfigSource
 */
export class ObjectConfigSource implements ConfigSource {
  public readonly name: string;
  public readonly priority: number;
  public readonly required: boolean;
  public readonly mutable: boolean;
  private config: Record<string, any>;

  constructor(
    name: string = 'object',
    priority: number = 50,
    required: boolean = false,
    mutable: boolean = false,
    initialConfig: Record<string, any> = {}
  ) {
    this.name = name;
    this.priority = priority;
    this.required = required;
    this.mutable = mutable;
    this.config = initialConfig;
  }

  /**
   * Get configuration value
   */
  public get<T>(key: string): T | undefined {
    return this.getNestedValue(this.config, key) as T;
  }

  /**
   * Get all configuration values
   */
  public getAll(): Record<string, any> {
    return deepClone(this.config);
  }

  /**
   * Check if configuration key exists
   */
  public has(key: string): boolean {
    return this.getNestedValue(this.config, key) !== undefined;
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, key: string): any {
    const parts = key.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      current = current[part];
    }

    return current;
  }

  /**
   * Set configuration value
   */
  public set(key: string, value: any): void {
    if (this.mutable) {
      this.setNestedValue(this.config, key, value);
    }
  }

  /**
   * Set nested value in object
   */
  private setNestedValue(obj: any, key: string, value: any): void {
    const parts = key.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];

      if (current[part] === undefined) {
        current[part] = {};
      }

      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * Remove configuration key
   */
  public remove(key: string): void {
    if (this.mutable) {
      const parts = key.split('.');
      let current = this.config;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];

        if (current[part] === undefined) {
          return;
        }

        current = current[part];
      }

      delete current[parts[parts.length - 1]];
    }
  }

  /**
   * Clear all configuration
   */
  public clear(): void {
    if (this.mutable) {
      this.config = {};
    }
  }

  /**
   * Merge configuration
   */
  public merge(config: Record<string, any>): void {
    if (this.mutable) {
      this.config = deepMerge(this.config, config);
    }
  }
}

// ============================================================================
// Config Manager
// ============================================================================

/**
 * Configuration Manager
 * @class ConfigManager
 */
export class ConfigManager {
  private readonly sources: ConfigSource[];
  private readonly options: ConfigOptions;
  private mergedConfig: Record<string, any> | null = null;
  private schema?: ValidationSchema;
  private listeners: Map<ConfigEventType, Set<ConfigListener>> = new Map();

  constructor(options?: Partial<ConfigOptions>) {
    this.options = {
      ...DEFAULT_CONFIG_OPTIONS,
      ...options,
    };

    this.sources = [];
  }

  /**
   * Add configuration source
   * @param source Configuration source
   */
  public addSource(source: ConfigSource): void {
    this.sources.push(source);
    this.sources.sort((a, b) => b.priority - a.priority);
    this.mergedConfig = null;
  }

  /**
   * Remove configuration source
   * @param name Source name
   */
  public removeSource(name: string): void {
    const index = this.sources.findIndex((source) => source.name === name);

    if (index !== -1) {
      this.sources.splice(index, 1);
      this.mergedConfig = null;
    }
  }

  /**
   * Get configuration source
   * @param name Source name
   * @returns Configuration source or undefined
   */
  public getSource(name: string): ConfigSource | undefined {
    return this.sources.find((source) => source.name === name);
  }

  /**
   * Get all configuration sources
   * @returns Array of configuration sources
   */
  public getSources(): ConfigSource[] {
    return [...this.sources];
  }

  /**
   * Set configuration schema
   * @param schema Configuration schema
   */
  public setSchema(schema: ValidationSchema): void {
    this.schema = schema;
  }

  /**
   * Get configuration value
   * @param key Configuration key
   * @param defaultValue Default value
   * @returns Configuration value
   */
  public get<T>(key: string, defaultValue?: T): T | undefined {
    const config = this.getMergedConfig();

    if (key in config) {
      return config[key] as T;
    }

    if (this.schema && this.schema[key] && this.schema[key].default !== undefined) {
      return this.schema[key].default as T;
    }

    return defaultValue;
  }

  /**
   * Get string configuration value
   * @param key Configuration key
   * @param defaultValue Default value
   * @returns String value
   */
  public getString(key: string, defaultValue?: string): string | undefined {
    const value = this.get(key, defaultValue);
    return value !== undefined ? String(value) : undefined;
  }

  /**
   * Get number configuration value
   * @param key Configuration key
   * @param defaultValue Default value
   * @returns Number value
   */
  public getNumber(key: string, defaultValue?: number): number | undefined {
    const value = this.get(key, defaultValue);

    if (value !== undefined) {
      const num = Number(value);

      if (!isNaN(num)) {
        return num;
      }
    }

    return defaultValue;
  }

  /**
   * Get boolean configuration value
   * @param key Configuration key
   * @param defaultValue Default value
   * @returns Boolean value
   */
  public getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
    const value = this.get(key, defaultValue);

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const lowerValue = (value as string).toLowerCase();
      return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
    }

    if (typeof value === 'number') {
      return value === 1;
    }

    return defaultValue;
  }

  /**
   * Get array configuration value
   * @param key Configuration key
   * @param defaultValue Default value
   * @returns Array value
   */
  public getArray<T>(key: string, defaultValue?: T[]): T[] | undefined {
    const value = this.get(key, defaultValue);

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Ignore parse errors
      }
    }

    return defaultValue;
  }

  /**
   * Get object configuration value
   * @param key Configuration key
   * @param defaultValue Default value
   * @returns Object value
   */
  public getObject<T extends object>(
    key: string,
    defaultValue?: T
  ): T | undefined {
    const value = this.get(key, defaultValue);

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value as T;
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);

        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          return parsed as T;
        }
      } catch {
        // Ignore parse errors
      }
    }

    return defaultValue;
  }

  /**
   * Check if configuration key exists
   * @param key Configuration key
   * @returns Boolean indicating if key exists
   */
  public has(key: string): boolean {
    const config = this.getMergedConfig();
    return key in config;
  }

  /**
   * Get all configuration values
   * @returns Merged configuration
   */
  public getAll(): Record<string, any> {
    return this.getMergedConfig();
  }

  /**
   * Set configuration value (in highest priority mutable source)
   * @param key Configuration key
   * @param value Configuration value
   */
  public set(key: string, value: any): void {
    const mutableSource = this.sources.find((source) => source.mutable);

    if (mutableSource) {
      const oldValue = this.get(key);

      if (mutableSource instanceof MemoryConfigSource ||
          mutableSource instanceof ObjectConfigSource) {
        mutableSource.set(key, value);
      }

      this.mergedConfig = null;

      this.emitEvent({
        type: 'set',
        key,
        oldValue,
        newValue: value,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Remove configuration value (from highest priority mutable source)
   * @param key Configuration key
   */
  public remove(key: string): void {
    const mutableSource = this.sources.find((source) => source.mutable);

    if (mutableSource) {
      const oldValue = this.get(key);

      if (mutableSource instanceof MemoryConfigSource ||
          mutableSource instanceof ObjectConfigSource) {
        mutableSource.remove(key);
      }

      this.mergedConfig = null;

      this.emitEvent({
        type: 'remove',
        key,
        oldValue,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Clear all configuration (from highest priority mutable source)
   */
  public clear(): void {
    const mutableSource = this.sources.find((source) => source.mutable);

    if (mutableSource) {
      if (mutableSource instanceof MemoryConfigSource ||
          mutableSource instanceof ObjectConfigSource) {
        mutableSource.clear();
      }

      this.mergedConfig = null;

      this.emitEvent({
        type: 'clear',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Validate configuration against schema
   * @returns Validation result
   */
  public validate(): ConfigValidationResult {
    const result: ConfigValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    if (!this.schema) {
      return result;
    }

    const config = this.getMergedConfig();

    for (const key in this.schema) {
      const schemaItem = this.schema[key];
      const value = config[key];

      // Check required
      if (schemaItem.required && (value === undefined || value === null)) {
        result.valid = false;
        result.errors.push({
          key,
          message: `Missing required configuration: ${key}`,
        });
      }

      // Check type
      if (schemaItem.type && value !== undefined && value !== null) {
        let valid = true;

        switch (schemaItem.type) {
          case 'string':
            valid = typeof value === 'string';
            break;
          case 'number':
            valid = typeof value === 'number' || !isNaN(Number(value));
            break;
          case 'boolean':
            valid = typeof value === 'boolean' ||
                    ['true', 'false', '1', '0', 'yes', 'no'].includes(String(value).toLowerCase());
            break;
          case 'object':
            valid = typeof value === 'object' && value !== null && !Array.isArray(value);
            break;
          case 'array':
            valid = Array.isArray(value);
            break;
        }

        if (!valid) {
          result.valid = false;
          result.errors.push({
            key,
            message: `Invalid type for ${key}: expected ${schemaItem.type}`,
          });
        }
      }

      // Check validate function
      if (schemaItem.validate && value !== undefined) {
        try {
          if (!schemaItem.validate(value)) {
            result.valid = false;
            result.errors.push({
              key,
              message: `Validation failed for ${key}`,
            });
          }
        } catch (error) {
          result.valid = false;
          result.errors.push({
            key,
            message: `Validation error for ${key}: ${error}`,
          });
        }
      }
    }

    // Check for unknown keys
    const knownKeys = Object.keys(this.schema);
    const configKeys = Object.keys(config);

    for (const key of configKeys) {
      if (!knownKeys.includes(key)) {
        result.warnings.push({
          key,
          message: `Unknown configuration key: ${key}`,
        });
      }
    }

    return result;
  }

  /**
   * Add event listener
   * @param type Event type
   * @param listener Event listener
   * @returns Unsubscribe function
   */
  public on(type: ConfigEventType, listener: ConfigListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)!.add(listener);

    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  /**
   * Remove event listener
   * @param type Event type
   * @param listener Event listener
   */
  public off(type: ConfigEventType, listener: ConfigListener): void {
    this.listeners.get(type)?.delete(listener);
  }

  /**
   * Get merged configuration
   * @returns Merged configuration
   */
  private getMergedConfig(): Record<string, any> {
    if (this.mergedConfig !== null) {
      return this.mergedConfig;
    }

    let config: Record<string, any> = {};

    for (const source of this.sources) {
      config = deepMerge(config, source.getAll());
    }

    this.mergedConfig = config;
    return config;
  }

  /**
   * Emit event
   * @param event Configuration event
   */
  private emitEvent(event: ConfigEvent): void {
    if (this.options.enableLogging) {
      console.debug(`[Config] ${event.type}`, event);
    }

    const listeners = this.listeners.get(event.type);

    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Deep merge two objects
 * @param target Target object
 * @param source Source object
 * @returns Merged object
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const targetValue = result[key as keyof T];
    const sourceValue = source[key as keyof T];

    if (
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue) &&
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue)
    ) {
      result[key as keyof T] = deepMerge(
        targetValue as unknown as object,
        sourceValue as unknown as object
      ) as unknown as T[keyof T];
    } else if (sourceValue !== undefined) {
      result[key as keyof T] = sourceValue as T[keyof T];
    }
  }

  return result;
}

/**
 * Deep clone object
 * @param obj Object to clone
 * @returns Cloned object
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const clonedObj: any = {};

    for (const key in obj) {
      if (obj[key] !== undefined) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }

    return clonedObj as T;
  }

  return obj;
}

// ============================================================================
// Singleton Instance
// ============================================================================

let configManagerInstance: ConfigManager | null = null;

/**
 * Get or create the Config Manager singleton
 * @param options Initial config options
 * @returns ConfigManager instance
 */
export function getConfigManager(options?: Partial<ConfigOptions>): ConfigManager {
  if (!configManagerInstance) {
    configManagerInstance = new ConfigManager(options);
  }

  return configManagerInstance;
}

/**
 * Create a new Config Manager instance
 * @param options Initial config options
 * @returns ConfigManager instance
 */
export function createConfigManager(options?: Partial<ConfigOptions>): ConfigManager {
  return new ConfigManager(options);
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_CONFIG_OPTIONS: ConfigOptions = {
  envPrefix: 'VX_',
  defaultEnv: 'development',
  validateOnInit: true,
  enableLogging: true,
};
