/**
 * tenant.service.ts - 租户查询服务（admin 读取场景）
 * @package @vxture/service-organization
 * @layer Domain
 * @category Service
 *
 * @description
 *   提供平台运营视角的租户搜索与详情查询，供 Vela admin surface 工具调用。
 *   当前实现使用内存 mock 数据，与 billing / subscription 服务保持一致的分层模式。
 *   真实环境接入时将 mock 数据层替换为 PgOrganizationRepository 调用即可，对外接口不变。
 *
 * @author AI-Generated
 * @date 2026-05-02
 */

import type { TenantContextView } from '../types/organization.types';

// ============================================================================
// Mock 数据
// ============================================================================

const mockTenants: TenantContextView[] = [
  {
    tenantId:      'tenant_acme',
    tenantCode:    'acme',
    tenantName:    'ACME Corp',
    displayName:   'ACME Corp',
    tenantType:    'company',
    status:        'active',
    language:      'zh-CN',
    timeZone:      'Asia/Shanghai',
    companyName:   'ACME 科技有限公司',
    primaryDomain: 'acme.example.com',
    workspace:     'ACME',
  },
  {
    tenantId:      'tenant_demo',
    tenantCode:    'demo',
    tenantName:    '演示租户',
    displayName:   '演示租户',
    tenantType:    'company',
    status:        'trial',
    language:      'zh-CN',
    timeZone:      'Asia/Shanghai',
    companyName:   null,
    primaryDomain: null,
    workspace:     'DEMO',
  },
  {
    tenantId:      'tenant_beta',
    tenantCode:    'beta',
    tenantName:    'Beta Team',
    displayName:   'Beta Team',
    tenantType:    'company',
    status:        'active',
    language:      'en-US',
    timeZone:      'UTC',
    companyName:   'Beta Technologies Ltd.',
    primaryDomain: 'beta.io',
    workspace:     'BETA',
  },
  {
    tenantId:      'tenant_suspended',
    tenantCode:    'suspended-co',
    tenantName:    '已暂停企业',
    displayName:   '已暂停企业',
    tenantType:    'company',
    status:        'suspended',
    language:      'zh-CN',
    timeZone:      'Asia/Shanghai',
    companyName:   '暂停企业有限公司',
    primaryDomain: null,
    workspace:     'SUSPENDED-CO',
  },
];

// ============================================================================
// TenantService
// ============================================================================

export class TenantService {
  /**
   * 按名称或 ID 搜索租户。
   * 大小写不敏感，同时匹配 tenantName / tenantCode / tenantId。
   *
   * @param query  搜索关键词
   * @param limit  最大返回条数（上限 50）
   * @throws {Error} 当 query 为空时
   */
  async searchTenants(query: string, limit = 10): Promise<TenantContextView[]> {
    if (!query.trim()) {
      throw new Error('搜索关键词不能为空');
    }

    const q = query.trim().toLowerCase();
    const cap = Math.min(limit, 50);

    return mockTenants
      .filter(
        (t) =>
          t.tenantName.toLowerCase().includes(q) ||
          t.tenantCode.toLowerCase().includes(q) ||
          t.tenantId.toLowerCase().includes(q),
      )
      .slice(0, cap);
  }

  /**
   * 按 tenantId 精确查询租户上下文。
   *
   * @param tenantId  租户 ID
   * @throws {Error}  当 tenantId 为空时
   */
  async getTenantById(tenantId: string): Promise<TenantContextView | null> {
    if (!tenantId.trim()) {
      throw new Error('tenantId 不能为空');
    }

    return mockTenants.find((t) => t.tenantId === tenantId) ?? null;
  }
}

/** 导出单例实例，与 billingService / subscriptionService 保持一致的使用模式 */
export const tenantService = new TenantService();
