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
  readonly text: string;
  readonly email: string;
  readonly phone: string;
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
  readonly title: string;
  readonly links: FooterLink[];
}

/**
 * 版权信息接口
 */
export interface Copyright {
  readonly text: string;
  readonly year: number;
}

/**
 * Footer 内容接口
 */
export interface FooterContent extends ContentEntity {
  readonly key: 'footer';
  readonly brand: BrandInfo;
  readonly social: SocialLink[];
  readonly sections: FooterSection[];
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
    if (!brand.text?.trim()) errors.push('Brand text is required');
    if (!brand.email || !BrandInfoHelpers.isValidEmail(brand.email)) {
      errors.push('Valid brand email is required');
    }
    return { valid: errors.length === 0, errors };
  },

  /**
   * 简单的邮箱验证
   */
  isValidEmail: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    return section.links.find(link => link.label === label);
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
    return copyright.year >= 2020 && copyright.year <= currentYear;
  },

  /**
   * 获取格式化的版权文本
   */
  getFormattedText: (copyright: Copyright): string => {
    return `${copyright.text} ${copyright.year}`;
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
    return footer.social.find(link => link.name.toLowerCase() === name.toLowerCase());
  },

  /**
   * 根据标题查找区块
   */
  findSectionByTitle: (footer: FooterContent, title: string): FooterSection | undefined => {
    return footer.sections.find(section => section.title === title);
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
      errors.push(`Invalid copyright year: ${footer.copyright.year}`);
    }

    return { valid: errors.length === 0, errors };
  },
};