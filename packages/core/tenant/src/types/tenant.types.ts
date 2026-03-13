/**
 * tenant.types.ts - 租户类型定义
 * @package @vxture/core-tenant
 *
 * Description: Core tenant types and constants
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Types - Tenant
 */

// ============================================================================
// Tenant Types
// ============================================================================

export interface TenantConfig {
  id: string;
  name: string;
  domain?: string;
  subdomain?: string;
  logo?: string;
  primaryColor?: string;
  features?: Record<string, boolean>;
  config?: Record<string, any>;
}

export interface TenantContext {
  config: TenantConfig;
  isolationKey: string;
  initialized: boolean;
}

export interface TenantStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export interface TenantService {
  loadConfig(id: string): Promise<TenantConfig>;
  loadConfigByDomain(domain: string): Promise<TenantConfig | undefined>;
  loadConfigBySubdomain(subdomain: string): Promise<TenantConfig | undefined>;
}

export interface TenantResolverOptions {
  useDomain?: boolean;
  useSubdomain?: boolean;
  useCookie?: boolean;
  useQueryParam?: boolean;
}

export interface TenantResolverResult {
  id: string;
  resolver: string;
  domain?: string;
  subdomain?: string;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  id: 'default',
  name: 'Default Tenant',
};

export const DEFAULT_TENANT_CONTEXT: TenantContext = {
  config: DEFAULT_TENANT_CONFIG,
  isolationKey: 'default',
  initialized: false,
};

export const DEFAULT_RESOLVER_OPTIONS: TenantResolverOptions = {
  useDomain: true,
  useSubdomain: true,
  useCookie: false,
  useQueryParam: false,
};
