/**
 * 布局组件数据规范化工具函数
 * @package @vxture/website
 * @layer Presentation
 * @category Components - Layout
 */

import type { HeaderData, FooterData } from '@/types/layout.types';
import { FALLBACK_HEADER_DATA, FALLBACK_FOOTER_DATA } from '@/fallback/layout.fallback';

// ============================================================================
// Header 数据规范化
// ============================================================================

/**
 * 规范化 Header 数据
 * 确保数据结构完整，避免渲染时出现 undefined 错误
 *
 * @param data 原始 Header 数据（可能来自 API 或本地存储）
 * @returns 规范化后的 Header 数据
 */
export function normalizeHeaderData(data?: Partial<HeaderData> | null): HeaderData {
  // 如果没有数据，返回备用数据
  if (!data) {
    return FALLBACK_HEADER_DATA;
  }

  // 合并备用数据，确保所有字段都存在
  return {
    enabled: data.enabled ?? FALLBACK_HEADER_DATA.enabled,
    logo: data.logo ?? FALLBACK_HEADER_DATA.logo,
    nav: data.nav ?? FALLBACK_HEADER_DATA.nav,
    theme: data.theme ?? FALLBACK_HEADER_DATA.theme,
    language: data.language ?? FALLBACK_HEADER_DATA.language,
    actions: data.actions ?? FALLBACK_HEADER_DATA.actions,
  };
}

// ============================================================================
// Footer 数据规范化
// ============================================================================

/**
 * 规范化 Footer 数据
 * 确保数据结构完整，避免渲染时出现 undefined 错误
 *
 * @param data 原始 Footer 数据（可能来自 API 或本地存储）
 * @returns 规范化后的 Footer 数据
 */
export function normalizeFooterData(data?: Partial<FooterData> | null): FooterData {
  // 如果没有数据，返回备用数据
  if (!data) {
    return FALLBACK_FOOTER_DATA;
  }

  // 合并备用数据，确保所有字段都存在
  return {
    enabled: data.enabled ?? FALLBACK_FOOTER_DATA.enabled,
    brand: {
      name: data.brand?.name ?? FALLBACK_FOOTER_DATA.brand.name,
      address: data.brand?.address ?? FALLBACK_FOOTER_DATA.brand.address,
    },
    contact: {
      sales: data.contact?.sales ?? FALLBACK_FOOTER_DATA.contact.sales,
      service: data.contact?.service ?? FALLBACK_FOOTER_DATA.contact.service,
    },
    social: data.social ?? FALLBACK_FOOTER_DATA.social,
    sections: data.sections ?? FALLBACK_FOOTER_DATA.sections,
    copyright: data.copyright ?? FALLBACK_FOOTER_DATA.copyright,
    legal: data.legal ?? FALLBACK_FOOTER_DATA.legal,
    icp: data.icp ?? FALLBACK_FOOTER_DATA.icp,
    publicSecurity: data.publicSecurity ?? FALLBACK_FOOTER_DATA.publicSecurity,
  };
}
