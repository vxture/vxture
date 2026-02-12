/**
 * layout.aggregate.ts - Layout 聚合根
 *
 * Domain Layer - Aggregate
 *
 * 职责：
 * - 定义 Layout 聚合根（Header + Footer）
 * - 提供 Layout 相关的业务逻辑 Helpers
 *
 * @layer Domain
 * @category Layout - Aggregate
 */

import type { HeaderContent } from './header.model';
import type { FooterContent } from './footer.model';
import type { ValidationResult } from '../shared/types/validation.types';

/**
 * Layout 聚合根
 * 包含 Header 和 Footer
 */
export interface LayoutAggregate {
  readonly header: HeaderContent;
  readonly footer: FooterContent;
}

/**
 * Layout Helpers - 纯函数工具
 */
export const LayoutHelpers = {
  /**
   * 验证 Layout 数据完整性
   */
  validate: (layout: LayoutAggregate): ValidationResult => {
    const errors: string[] = [];

    // 验证 header
    if (!layout.header) {
      errors.push('Header is required');
    } else {
      if (!layout.header.enabled) {
        errors.push('Header is disabled');
      }
      if (!layout.header.logo) {
        errors.push('Header logo is required');
      }
      if (!layout.header.navigation || layout.header.navigation.length === 0) {
        errors.push('Header navigation is required');
      }
    }

    // 验证 footer
    if (!layout.footer) {
      errors.push('Footer is required');
    } else {
      if (!layout.footer.enabled) {
        errors.push('Footer is disabled');
      }
      if (!layout.footer.sections || layout.footer.sections.length === 0) {
        errors.push('Footer sections are required');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * 检查 Layout 是否完全启用
   */
  isEnabled: (layout: LayoutAggregate): boolean => {
    return layout.header.enabled && layout.footer.enabled;
  },

  /**
   * 获取所有导航链接
   */
  getAllNavigationLinks: (layout: LayoutAggregate): Array<{ label: string; href: string }> => {
    const headerLinks = layout.header.navigation.map((item) => ({
      label: item.label,
      href: item.href,
    }));

    const footerLinks = layout.footer.sections.flatMap((section) =>
      section.links.map((link) => ({
        label: link.label,
        href: link.href,
      }))
    );

    return [...headerLinks, ...footerLinks];
  },
};