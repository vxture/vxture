/**
 * seo.types.ts - SEO 相关类型定义
 *
 * Domain Layer - Shared Types
 *
 * @layer Domain
 * @category Shared - Types
 */

/**
 * SEO 元数据
 */
export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
}

/**
 * 结构化数据类型
 */
export type StructuredDataType = 'Article' | 'Organization' | 'WebSite' | 'BreadcrumbList';

/**
 * 结构化数据
 */
export interface StructuredData {
  '@context': 'https://schema.org';
  '@type': StructuredDataType;
  [key: string]: unknown;
}