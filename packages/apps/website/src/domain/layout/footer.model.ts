/**
 * footer.model.ts - Footer 领域模型
 *
 * Domain Layer - Layout Domain
 *
 * 职责：
 * - 定义 Footer 的领域模型和业务规则
 * - 封装品牌信息、社交链接、版权等逻辑
 *
 * @layer Domain
 * @category Layout
 */

import type { ContentEntity } from '../shared/types/content.types';
import type { ValidationResult } from '../shared/types';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 品牌信息接口
 */
export interface BrandInfo {
  readonly logo?: string;
  readonly name: string;
  readonly shortname: string;
  readonly website: string;
  readonly description?: string;
  readonly foundedYear?: string;
  readonly address?: string;
  readonly timezone?: string;
}

/**
 * 联系方式接口
 */
export interface ContactInfo {
  readonly sales: {
    readonly phone: string;
    readonly email: string;
  };
  readonly service: {
    readonly phone: string;
    readonly email: string;
  };
  readonly chat?: {
    readonly link: string;
    readonly enabled: boolean;
  };
}

/**
 * 社交媒体链接接口
 */
export interface SocialLink {
  readonly name: string;
  readonly icon: string;
  readonly href: string;
  readonly ariaLabel: string;
}

/**
 * Footer 链接接口
 */
export interface FooterLink {
  readonly label: string;
  readonly href: string;
}

/**
 * Footer 区块接口
 */
export interface FooterSection {
  readonly id: string;
  readonly title: string;
  readonly links: FooterLink[];
}

/**
 * 备案信息接口
 */
export interface FilingInfo {
  readonly label: string;
  readonly text: string;
  readonly link: string;
}

/**
 * 版权信息接口
 */
export interface Copyright {
  readonly label: string;
  readonly text: string;
  readonly startYear: number;
  readonly endYear: number;
  readonly companyName: string;
  readonly allRightsReserved: boolean;
}

/**
 * Footer 内容接口
 */
export interface FooterContent extends ContentEntity {
  readonly key: 'footer';
  readonly brand: BrandInfo;
  readonly contact: ContactInfo;
  readonly social: SocialLink[];
  readonly sections: FooterSection[];
  readonly legal: FooterLink[];
  readonly icp: FilingInfo;
  readonly publicSecurity: FilingInfo;
  readonly copyright: Copyright;
}

// ============================================================================
// 纯函数辅助
// ============================================================================

/**
 * BrandInfo 辅助函数
 */
export const BrandInfoHelpers = {
  /**
   * 验证品牌信息
   */
  validate: (brand: BrandInfo): ValidationResult => {
    const errors: string[] = [];
    if (!brand.name?.trim()) errors.push('Brand name is required');
    if (!brand.shortname?.trim()) errors.push('Brand shortname is required');
    if (!brand.website?.trim()) errors.push('Brand website is required');
    return { valid: errors.length === 0, errors };
  },
};

/**
 * SocialLink 辅助函数
 */
export const SocialLinkHelpers = {
  /**
   * 检查是否为外部链接
   */
  isExternal: (link: SocialLink): boolean => {
    return link.href.startsWith('http://') || link.href.startsWith('https://');
  },
};

/**
 * FooterLink 辅助函数
 */
export const FooterLinkHelpers = {
  /**
   * 检查是否为外部链接
   */
  isExternal: (link: FooterLink): boolean => {
    return link.href.startsWith('http://') || link.href.startsWith('https://');
  },
};

/**
 * FooterSection 辅助函数
 */
export const FooterSectionHelpers = {
  /**
   * 获取链接数量
   */
  getLinkCount: (section: FooterSection): number => {
    return section.links.length;
  },

  /**
   * 根据标签查找链接
   */
  findLinkByLabel: (section: FooterSection, label: string): FooterLink | undefined => {
    return section.links.find((link) => link.label === label);
  },
};

/**
 * Copyright 辅助函数
 */
export const CopyrightHelpers = {
  /**
   * 检查年份是否有效
   */
  isValidYear: (copyright: Copyright): boolean => {
    const currentYear = new Date().getFullYear();
    return (
      copyright.startYear >= 2020 &&
      copyright.startYear <= copyright.endYear &&
      copyright.endYear <= currentYear
    );
  },
};

/**
 * FooterContent 辅助函数
 */
export const FooterHelpers = {
  /**
   * 获取社交链接数量
   */
  getSocialCount: (footer: FooterContent): number => {
    return footer.social.length;
  },

  /**
   * 获取所有链接总数
   */
  getTotalLinkCount: (footer: FooterContent): number => {
    return footer.sections.reduce(
      (total, section) => total + FooterSectionHelpers.getLinkCount(section),
      0
    );
  },

  /**
   * 根据名称查找社交链接
   */
  findSocialByName: (footer: FooterContent, name: string): SocialLink | undefined => {
    return footer.social.find((link) => link.name.toLowerCase() === name.toLowerCase());
  },

  /**
   * 根据标题查找区块
   */
  findSectionByTitle: (footer: FooterContent, title: string): FooterSection | undefined => {
    return footer.sections.find((section) => section.title === title);
  },

  /**
   * 验证 Footer 内容
   */
  validate: (footer: FooterContent): ValidationResult => {
    const errors: string[] = [];

    // 验证品牌信息
    const brandResult = BrandInfoHelpers.validate(footer.brand);
    if (!brandResult.valid) {
      errors.push(...brandResult.errors);
    }

    // 验证版权年份
    if (!CopyrightHelpers.isValidYear(footer.copyright)) {
      errors.push(`Invalid copyright year range: ${footer.copyright.startYear}-${footer.copyright.endYear}`);
    }

    return { valid: errors.length === 0, errors };
  },
};
