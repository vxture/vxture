/**
 * FooterMapper.ts - Footer 数据映射器
 *
 * Infrastructure Layer - Mappers
 *
 * 职责：
 * - 在 JSON 原始数据与 Domain 模型之间进行双向映射
 * - 实现数据转换的纯函数，无副作用
 * - 隔离数据存储格式与领域模型的差异
 *
 * @layer Infrastructure
 * @category Mappers
 */

import type {
  FooterContent,
  BrandInfo,
  ContactInfo,
  SocialLink,
  FooterSection,
  FooterLink,
  FilingInfo,
  Copyright,
} from '@/domain/layout/footer.model';

/**
 * JSON 原始数据类型定义
 * 对应 public/data/layout/footer/*.json 文件的结构
 */
interface FooterContentRaw {
  key: 'footer';
  enabled: boolean;
  brand: {
    logo?: string;
    name: string;
    shortname: string;
    website: string;
    description?: string;
    foundedYear?: string;
    address?: string;
    timezone?: string;
  };
  contact: {
    sales: { phone: string; email: string };
    service: { phone: string; email: string };
    chat?: { link: string; enabled: boolean };
  };
  social: Array<{
    name: string;
    icon: string;
    href: string;
    ariaLabel: string;
  }>;
  sections: Array<{
    id: string;
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
  legal: Array<{ label: string; href: string }>;
  icp: {
    label: string;
    text: string;
    link: string;
  };
  publicSecurity: {
    label: string;
    text: string;
    link: string;
  };
  copyright: {
    label: string;
    text: string;
    startYear: number;
    endYear: number;
    companyName: string;
    allRightsReserved: boolean;
  };
}

/**
 * Footer 数据映射器对象
 * 提供原始数据与领域模型之间的转换方法
 */
export const FooterMapper = {
  /**
   * 映射品牌信息
   * 将 JSON 中的品牌数据转换为 BrandInfo 领域模型
   *
   * @param raw - JSON 原始品牌数据
   * @returns BrandInfo 领域模型对象
   */
  mapBrandInfo: (raw: {
    logo?: string;
    name: string;
    shortname: string;
    website: string;
    description?: string;
    foundedYear?: string;
    address?: string;
    timezone?: string;
  }): BrandInfo => ({
    logo: raw.logo,
    name: raw.name,
    shortname: raw.shortname,
    website: raw.website,
    description: raw.description,
    foundedYear: raw.foundedYear,
    address: raw.address,
    timezone: raw.timezone,
  }),

  /**
   * 映射联系方式信息
   * 将 JSON 中的联系数据转换为 ContactInfo 领域模型
   *
   * @param raw - JSON 原始联系数据
   * @returns ContactInfo 领域模型对象
   */
  mapContactInfo: (raw: {
    sales: { phone: string; email: string };
    service: { phone: string; email: string };
    chat?: { link: string; enabled: boolean };
  }): ContactInfo => ({
    sales: raw.sales,
    service: raw.service,
    chat: raw.chat,
  }),

  /**
   * 映射社交媒体链接
   * 将 JSON 中的社交链接数据转换为 SocialLink 领域模型
   *
   * @param raw - JSON 原始社交链接数据
   * @returns SocialLink 领域模型对象
   */
  mapSocialLink: (raw: {
    name: string;
    icon: string;
    href: string;
    ariaLabel: string;
  }): SocialLink => ({
    name: raw.name,
    icon: raw.icon,
    href: raw.href,
    ariaLabel: raw.ariaLabel,
  }),

  /**
   * 映射 Footer 链接
   * 将 JSON 中的链接数据转换为 FooterLink 领域模型
   *
   * @param raw - JSON 原始链接数据
   * @returns FooterLink 领域模型对象
   */
  mapFooterLink: (raw: { label: string; href: string }): FooterLink => ({
    label: raw.label,
    href: raw.href,
  }),

  /**
   * 映射 Footer 区块
   * 将 JSON 中的区块数据转换为 FooterSection 领域模型
   * 内部会递归调用 mapFooterLink 处理链接列表
   *
   * @param raw - JSON 原始区块数据
   * @returns FooterSection 领域模型对象
   */
  mapFooterSection: (raw: {
    id: string;
    title: string;
    links: Array<{ label: string; href: string }>;
  }): FooterSection => ({
    id: raw.id,
    title: raw.title,
    links: raw.links.map(FooterMapper.mapFooterLink),
  }),

  /**
   * 映射备案信息
   * 将 JSON 中的备案数据转换为 FilingInfo 领域模型
   * 用于 ICP 备案和公安备案
   *
   * @param raw - JSON 原始备案数据
   * @returns FilingInfo 领域模型对象
   */
  mapFilingInfo: (raw: {
    label: string;
    text: string;
    link: string;
  }): FilingInfo => ({
    label: raw.label,
    text: raw.text,
    link: raw.link,
  }),

  /**
   * 映射版权信息
   * 将 JSON 中的版权数据转换为 Copyright 领域模型
   *
   * @param raw - JSON 原始版权数据
   * @returns Copyright 领域模型对象
   */
  mapCopyright: (raw: {
    label: string;
    text: string;
    startYear: number;
    endYear: number;
    companyName: string;
    allRightsReserved: boolean;
  }): Copyright => ({
    label: raw.label,
    text: raw.text,
    startYear: raw.startYear,
    endYear: raw.endYear,
    companyName: raw.companyName,
    allRightsReserved: raw.allRightsReserved,
  }),

  /**
   * 将 JSON 原始数据转换为领域模型
   * 这是主要的入口方法，用于从 JSON 文件读取数据后转换为 Domain 层可用的模型
   *
   * @param raw - JSON 原始完整数据
   * @returns FooterContent 领域模型完整对象
   */
  toDomain: (raw: FooterContentRaw): FooterContent => ({
    key: 'footer',
    enabled: raw.enabled,
    brand: FooterMapper.mapBrandInfo(raw.brand),
    contact: FooterMapper.mapContactInfo(raw.contact),
    social: raw.social.map(FooterMapper.mapSocialLink),
    sections: raw.sections.map(FooterMapper.mapFooterSection),
    legal: raw.legal.map(FooterMapper.mapFooterLink),
    icp: FooterMapper.mapFilingInfo(raw.icp),
    publicSecurity: FooterMapper.mapFilingInfo(raw.publicSecurity),
    copyright: FooterMapper.mapCopyright(raw.copyright),
  }),

  /**
   * 将领域模型转换回 JSON 原始数据
   * 用于持久化或序列化场景，将 Domain 模型转换回可存储的 JSON 格式
   *
   * @param domain - FooterContent 领域模型完整对象
   * @returns JSON 原始完整数据
   */
  fromDomain: (domain: FooterContent): FooterContentRaw => ({
    key: 'footer',
    enabled: domain.enabled,
    brand: {
      logo: domain.brand.logo,
      name: domain.brand.name,
      shortname: domain.brand.shortname,
      website: domain.brand.website,
      description: domain.brand.description,
      foundedYear: domain.brand.foundedYear,
      address: domain.brand.address,
      timezone: domain.brand.timezone,
    },
    contact: {
      sales: domain.contact.sales,
      service: domain.contact.service,
      chat: domain.contact.chat,
    },
    social: domain.social.map((link) => ({
      name: link.name,
      icon: link.icon,
      href: link.href,
      ariaLabel: link.ariaLabel,
    })),
    sections: domain.sections.map((section) => ({
      id: section.id,
      title: section.title,
      links: section.links.map((link) => ({
        label: link.label,
        href: link.href,
      })),
    })),
    legal: domain.legal.map((link) => ({
      label: link.label,
      href: link.href,
    })),
    icp: {
      label: domain.icp.label,
      text: domain.icp.text,
      link: domain.icp.link,
    },
    publicSecurity: {
      label: domain.publicSecurity.label,
      text: domain.publicSecurity.text,
      link: domain.publicSecurity.link,
    },
    copyright: {
      label: domain.copyright.label,
      text: domain.copyright.text,
      startYear: domain.copyright.startYear,
      endYear: domain.copyright.endYear,
      companyName: domain.copyright.companyName,
      allRightsReserved: domain.copyright.allRightsReserved,
    },
  }),
};
