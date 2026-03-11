/**
 * index.ts - Vxture Core Multi-Tenant Support Package
 * @package @vxture/core-tenant
 *
 * Description: Multi-tenant support for Vxture platform, providing tenant
 * context management, tenant isolation, and tenant configuration utilities.
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Services - Tenant
 */

// ============================================
// Tenant Types
// ============================================

export type {
  TenantConfig,
  TenantContext,
  TenantResolverOptions,
  TenantResolverResult,
  TenantStorage,
  TenantService,
} from './types';
export {
  DEFAULT_TENANT_CONFIG,
  DEFAULT_TENANT_CONTEXT,
  DEFAULT_RESOLVER_OPTIONS,
} from './types';

// ============================================
// Tenant Context
// ============================================

export * from './context';
export {
  TenantManager,
  TenantDetector,
  TenantIsolation,
  TenantStorageImpl,
  InMemoryTenantService,
} from './context';
export { getTenantManager } from './context';

// ============================================
// Tenant Utils
// ============================================

// TODO: 将来需要迁移的工具函数放这里
