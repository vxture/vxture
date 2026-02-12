/**
 * structuredData.ts - JSON-LD 结构化数据生成工具
 *
 * Application Layer - SEO
 *
 * 职责：
 * - 生成 Schema.org 结构化数据
 * - 支持 Organization、WebSite、BreadcrumbList
 * - 提高搜索引擎理解
 *
 * @layer Application
 * @category SEO
 */

import type { HeaderContent } from '@/domain/layout/header.model';
import type { FooterContent } from '@/domain/layout/footer.model';
import type { CaseItem } from '@/domain/homepage/cases.model';

/**
 * Organization 结构化数据
 */
export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description?: string;
  contactPoint?: ContactPoint[];
  sameAs?: string[];
}

/**
 * 联系方式
 */
export interface ContactPoint {
  '@type': 'ContactPoint';
  telephone: string;
  contactType: string;
  email?: string;
  availableLanguage?: string[];
}

/**
 * WebSite 结构化数据
 */
export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  inLanguage?: string[];
}

/**
 * BreadcrumbList 结构化数据
 */
export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

/**
 * Article 结构化数据
 */
export interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  author: {
    '@type': 'Organization';
    name: string;
  };
}

/**
 * 生成 Organization 结构化数据
 */
export const generateOrganizationSchema = (
  header: HeaderContent,
  footer: FooterContent
): OrganizationSchema => {
  // 从 footer 提取社交媒体链接
  const socialLinks = footer.sections
    .flatMap((section) => section.links)
    .filter((link) => link.href.includes('twitter') || link.href.includes('linkedin'))
    .map((link) => link.href);

  // 从 footer 提取联系信息
  const contactInfo = footer.sections
    .flatMap((section) => section.links)
    .find((link) => link.href.includes('tel:') || link.href.includes('mailto:'));

  const contactPoint: ContactPoint[] = [];

  if (contactInfo) {
    contactPoint.push({
      '@type': 'ContactPoint',
      telephone: contactInfo.href.replace('tel:', ''),
      contactType: 'customer service',
      availableLanguage: ['zh-CN', 'en-US'],
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: header.logo.alt,
    url: 'https://vxture.com',
    logo: `https://vxture.com${header.logo.image}`,
    contactPoint: contactPoint.length > 0 ? contactPoint : undefined,
    sameAs: socialLinks.length > 0 ? socialLinks : undefined,
  };
};

/**
 * 生成 WebSite 结构化数据
 */
export const generateWebSiteSchema = (
  header: HeaderContent,
  description: string
): WebSiteSchema => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: header.logo.alt,
    url: 'https://vxture.com',
    description: description,
    inLanguage: ['zh-CN', 'en-US'],
  };
};

/**
 * 生成 BreadcrumbList 结构化数据
 */
export const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; path: string }>): BreadcrumbListSchema => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `https://vxture.com${crumb.path}`,
    })),
  };
};

/**
 * 生成 Article 结构化数据（用于案例页）
 */
export const generateArticleSchema = (caseItem: CaseItem, organizationName: string): ArticleSchema => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: caseItem.title,
    description: caseItem.description,
    image: caseItem.cover.image,
    datePublished: caseItem.publishedAt,
    author: {
      '@type': 'Organization',
      name: organizationName,
    },
  };
};

/**
 * 将结构化数据转换为 JSON-LD script 标签
 */
export const structuredDataToScript = (schema: any): string => {
  return `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>`;
};

/**
 * 生成完整的首页结构化数据
 */
export const generateHomeStructuredData = (
  header: HeaderContent,
  footer: FooterContent,
  description: string
): string => {
  const organization = generateOrganizationSchema(header, footer);
  const website = generateWebSiteSchema(header, description);

  return `${structuredDataToScript(organization)}
${structuredDataToScript(website)}`;
};