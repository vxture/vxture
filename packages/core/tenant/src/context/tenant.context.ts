/**
 * tenant.context.ts - 租户上下文管理
 * @package @vxture/core-tenant
 *
 * Description: Core tenant context management with TenantManager and TenantDetector
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Context - Tenant
 */

import type { TenantConfig, TenantContext, TenantStorage, TenantService } from '../types';
import { DEFAULT_TENANT_CONFIG } from '../types';

// ============================================================================
// Tenant Manager
// ============================================================================

/**
 * Tenant Manager class for managing tenant context
 * @class TenantManager
 */
export class TenantManager {
  private readonly context: TenantContext;

  constructor(initialConfig?: Partial<TenantConfig>) {
    this.context = {
      config: {
        ...DEFAULT_TENANT_CONFIG,
        ...initialConfig,
      },
      isolationKey: this.generateIsolationKey(initialConfig?.id),
      initialized: true,
    };
  }

  /**
   * Get current tenant configuration
   */
  public getConfig(): TenantConfig {
    return this.context.config;
  }

  /**
   * Get tenant ID
   */
  public getId(): string {
    return this.context.config.id;
  }

  /**
   * Get tenant name
   */
  public getName(): string {
    return this.context.config.name;
  }

  /**
   * Get tenant isolation key
   */
  public getIsolationKey(): string {
    return this.context.isolationKey;
  }

  /**
   * Check if tenant context is initialized
   */
  public isInitialized(): boolean {
    return this.context.initialized;
  }

  /**
   * Update tenant configuration
   * @param config Partial tenant configuration
   */
  public updateConfig(config: Partial<TenantConfig>): void {
    this.context.config = {
      ...this.context.config,
      ...config,
    };

    // Regenerate isolation key if tenant ID changes
    if (config.id && config.id !== this.context.config.id) {
      this.context.isolationKey = this.generateIsolationKey(config.id);
    }
  }

  /**
   * Check if a feature is enabled for the current tenant
   * @param feature Feature name
   * @returns Boolean indicating if feature is enabled
   */
  public isFeatureEnabled(feature: string): boolean {
    return this.context.config.features?.[feature] ?? false;
  }

  /**
   * Get tenant configuration value
   * @param key Configuration key
   * @param defaultValue Default value if key not found
   * @returns Configuration value
   */
  public getConfigValue<T>(key: string, defaultValue?: T): T | undefined {
    return this.context.config.config?.[key] ?? defaultValue;
  }

  /**
   * Set tenant configuration value
   * @param key Configuration key
   * @param value Configuration value
   */
  public setConfigValue(key: string, value: any): void {
    if (!this.context.config.config) {
      this.context.config.config = {};
    }

    this.context.config.config[key] = value;
  }

  /**
   * Generate tenant isolation key
   * @param tenantId Tenant ID
   * @returns Isolation key
   */
  private generateIsolationKey(tenantId?: string): string {
    return tenantId || 'default';
  }
}

// ============================================================================
// Tenant Detector
// ============================================================================

/**
 * Tenant Detector class for detecting tenant from various sources
 * @class TenantDetector
 */
export class TenantDetector {
  /**
   * Detect tenant from hostname
   * @param hostname Hostname
   * @returns Tenant ID or undefined
   */
  public static detectFromHostname(hostname: string): string | undefined {
    // Example implementation: extract tenant from subdomain
    const parts = hostname.split('.');

    if (parts.length > 2 && parts[0] !== 'www') {
      return parts[0];
    }

    return undefined;
  }

  /**
   * Detect tenant from URL
   * @param url URL string
   * @returns Tenant ID or undefined
   */
  public static detectFromUrl(url: string): string | undefined {
    try {
      const urlObj = new URL(url);
      return this.detectFromHostname(urlObj.hostname);
    } catch {
      return undefined;
    }
  }

  /**
   * Detect tenant from request headers
   * @param headers Request headers
   * @returns Tenant ID or undefined
   */
  public static detectFromHeaders(headers: Record<string, string>): string | undefined {
    return headers['x-tenant-id'] || headers['X-Tenant-Id'];
  }

  /**
   * Detect tenant from query parameters
   * @param params Query parameters
   * @returns Tenant ID or undefined
   */
  public static detectFromQueryParams(params: Record<string, string>): string | undefined {
    return params['tenant'] || params['tenantId'];
  }

  /**
   * Detect tenant from cookie
   * @param cookies Cookie string
   * @returns Tenant ID or undefined
   */
  public static detectFromCookie(cookies: string): string | undefined {
    const tenantCookie = 'tenant-id';
    const regex = new RegExp(`${tenantCookie}=([^;]+)`);
    const match = regex.exec(cookies);

    return match?.[1];
  }

  /**
   * Detect tenant from local storage
   * @returns Tenant ID or undefined
   */
  public static detectFromLocalStorage(): string | undefined {
    if (typeof localStorage !== 'undefined') {
      const value = localStorage.getItem('tenant-id');
      return value || undefined;
    }

    return undefined;
  }
}

// ============================================================================
// Tenant Isolation
// ============================================================================

/**
 * Tenant Isolation helper functions
 * @class TenantIsolation
 */
export class TenantIsolation {
  /**
   * Generate tenant-isolated key
   * @param key Original key
   * @param isolationKey Tenant isolation key
   * @returns Isolated key
   */
  public static generateIsolatedKey(key: string, isolationKey: string): string {
    return `${isolationKey}:${key}`;
  }

  /**
   * Isolate storage key for tenant
   * @param key Original key
   * @param isolationKey Tenant isolation key
   * @returns Isolated key
   */
  public static isolateStorageKey(key: string, isolationKey: string): string {
    return this.generateIsolatedKey(key, isolationKey);
  }

  /**
   * Isolate cache key for tenant
   * @param key Original key
   * @param isolationKey Tenant isolation key
   * @returns Isolated key
   */
  public static isolateCacheKey(key: string, isolationKey: string): string {
    return this.generateIsolatedKey(key, isolationKey);
  }

  /**
   * Isolate event name for tenant
   * @param event Original event name
   * @param isolationKey Tenant isolation key
   * @returns Isolated event name
   */
  public static isolateEventName(event: string, isolationKey: string): string {
    return this.generateIsolatedKey(event, isolationKey);
  }

  /**
   * Extract original key from isolated key
   * @param isolatedKey Isolated key
   * @returns Original key or undefined
   */
  public static extractOriginalKey(isolatedKey: string): string | undefined {
    const parts = isolatedKey.split(':');
    if (parts.length > 1) {
      return parts.slice(1).join(':');
    }

    return undefined;
  }

  /**
   * Extract isolation key from isolated key
   * @param isolatedKey Isolated key
   * @returns Isolation key or undefined
   */
  public static extractIsolationKey(isolatedKey: string): string | undefined {
    const parts = isolatedKey.split(':');
    if (parts.length > 1) {
      return parts[0];
    }

    return undefined;
  }
}

// ============================================================================
// Tenant Storage Implementation
// ============================================================================

/**
 * Tenant Storage implementation
 * @class TenantStorageImpl
 * @implements TenantStorage
 */
export class TenantStorageImpl implements TenantStorage {
  private readonly storage: Storage;
  private readonly isolationKey: string;

  constructor(storage: Storage, isolationKey: string) {
    this.storage = storage;
    this.isolationKey = isolationKey;
  }

  /**
   * Get item from storage
   * @param key Item key
   * @returns Item value or null
   */
  public getItem(key: string): string | null {
    const isolatedKey = TenantIsolation.isolateStorageKey(key, this.isolationKey);
    return this.storage.getItem(isolatedKey);
  }

  /**
   * Set item in storage
   * @param key Item key
   * @param value Item value
   */
  public setItem(key: string, value: string): void {
    const isolatedKey = TenantIsolation.isolateStorageKey(key, this.isolationKey);
    this.storage.setItem(isolatedKey, value);
  }

  /**
   * Remove item from storage
   * @param key Item key
   */
  public removeItem(key: string): void {
    const isolatedKey = TenantIsolation.isolateStorageKey(key, this.isolationKey);
    this.storage.removeItem(isolatedKey);
  }

  /**
   * Clear all tenant items from storage
   */
  public clear(): void {
    const prefix = `${this.isolationKey}:`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => this.storage.removeItem(key));
  }
}

// ============================================================================
// Tenant Service Implementation
// ============================================================================

/**
 * In-memory Tenant Service implementation
 * @class InMemoryTenantService
 * @implements TenantService
 */
export class InMemoryTenantService implements TenantService {
  private readonly tenants: Map<string, TenantConfig>;

  constructor(initialTenants: TenantConfig[] = []) {
    this.tenants = new Map();

    initialTenants.forEach((tenant) => {
      this.tenants.set(tenant.id, tenant);

      if (tenant.domain) {
        this.tenants.set(tenant.domain, tenant);
      }

      if (tenant.subdomain) {
        this.tenants.set(tenant.subdomain, tenant);
      }
    });
  }

  /**
   * Load tenant configuration by ID
   * @param id Tenant ID
   * @returns Promise<TenantConfig>
   */
  public async loadConfig(id: string): Promise<TenantConfig> {
    const tenant = this.tenants.get(id);

    if (!tenant) {
      throw new Error(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  /**
   * Load tenant configuration by domain
   * @param domain Domain name
   * @returns Promise<TenantConfig | undefined>
   */
  public async loadConfigByDomain(domain: string): Promise<TenantConfig | undefined> {
    return this.tenants.get(domain);
  }

  /**
   * Load tenant configuration by subdomain
   * @param subdomain Subdomain name
   * @returns Promise<TenantConfig | undefined>
   */
  public async loadConfigBySubdomain(subdomain: string): Promise<TenantConfig | undefined> {
    return this.tenants.get(subdomain);
  }

  /**
   * Add a tenant to the service
   * @param tenant Tenant configuration
   */
  public addTenant(tenant: TenantConfig): void {
    this.tenants.set(tenant.id, tenant);

    if (tenant.domain) {
      this.tenants.set(tenant.domain, tenant);
    }

    if (tenant.subdomain) {
      this.tenants.set(tenant.subdomain, tenant);
    }
  }

  /**
   * Remove a tenant from the service
   * @param id Tenant ID
   */
  public removeTenant(id: string): void {
    const tenant = this.tenants.get(id);

    if (tenant) {
      this.tenants.delete(id);

      if (tenant.domain) {
        this.tenants.delete(tenant.domain);
      }

      if (tenant.subdomain) {
        this.tenants.delete(tenant.subdomain);
      }
    }
  }

  /**
   * List all tenants
   * @returns All tenant configurations
   */
  public listTenants(): TenantConfig[] {
    const uniqueTenants = new Map<string, TenantConfig>();

    for (const [, value] of this.tenants) {
      // Only include unique tenants (each tenant has an ID)
      if (!uniqueTenants.has(value.id)) {
        uniqueTenants.set(value.id, value);
      }
    }

    return Array.from(uniqueTenants.values());
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let tenantManagerInstance: TenantManager | null = null;

/**
 * Get or create the Tenant Manager singleton
 * @param initialConfig Initial tenant configuration
 * @returns TenantManager instance
 */
export function getTenantManager(initialConfig?: Partial<TenantConfig>): TenantManager {
  tenantManagerInstance ??= new TenantManager(initialConfig);
  return tenantManagerInstance;
}
