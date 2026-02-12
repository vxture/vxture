/**
 * metadata.ts - SEO Metadata 生成工具
 *
 * Application Layer - SEO
 *
 * 职责：
 * - 根据内容数据生成 SEO Metadata
 * - 支持 Open Graph、Twitter Card
 * - 支持多语言
 *
 * @layer Application
 * @category SEO
 */

import type { HeroContent } from '@/domain/homepage/hero.model';
import type { HeaderContent } from '@/domain/layout/header.model';

/**
 * 页面 Metadata 配置
 */
export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  openGraph?: OpenGraphMetadata;
  twitter?: TwitterMetadata;
  canonical?: string;
  robots?: string;
}

/**
 * Open Graph Metadata
 */
export interface OpenGraphMetadata {
  title: string;
  description: string;
  type: 'website' | 'article' | 'product';
  url?: string;
  image?: string;
  locale: string;
  siteName?: string;
}

/**
 * Twitter Card Metadata
 */
export interface TwitterMetadata {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  title: string;
  description: string;
  image?: string;
  site?: string;
  creator?: string;
}

/**
 * 从 Hero 内容生成 Metadata
 */
export const generateMetadataFromHero = (
  hero: HeroContent,
  locale: string,
  options?: {
    siteName?: string;
    siteUrl?: string;
    twitterSite?: string;
  }
): PageMetadata => {
  const { siteName = 'Vxture', siteUrl = 'https://vxture.com', twitterSite = '@vxture' } = options || {};

  return {
    title: hero.title,
    description: hero.description,
    keywords: hero.keywords,
    openGraph: {
      title: hero.title,
      description: hero.description,
      type: 'website',
      url: siteUrl,
      image: hero.backgroundImage,
      locale: locale,
      siteName: siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: hero.title,
      description: hero.description,
      image: hero.backgroundImage,
      site: twitterSite,
    },
    canonical: siteUrl,
    robots: 'index, follow',
  };
};

/**
 * 生成首页 Metadata
 */
export const generateHomeMetadata = (
  hero: HeroContent,
  header: HeaderContent,
  locale: string
): PageMetadata => {
  return generateMetadataFromHero(hero, locale, {
    siteName: header.logo.alt,
  });
};

/**
 * 生成产品页 Metadata
 */
export const generateProductMetadata = (
  title: string,
  description: string,
  image: string,
  locale: string,
  slug: string
): PageMetadata => {
  return {
    title: `${title} - Vxture`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'product',
      url: `https://vxture.com/products/${slug}`,
      image: image,
      locale: locale,
      siteName: 'Vxture',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      image: image,
      site: '@vxture',
    },
    canonical: `https://vxture.com/products/${slug}`,
    robots: 'index, follow',
  };
};

/**
 * 生成案例页 Metadata
 */
export const generateCaseMetadata = (
  title: string,
  description: string,
  image: string,
  locale: string,
  slug: string,
  publishedAt: string
): PageMetadata => {
  return {
    title: `${title} - Vxture Cases`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'article',
      url: `https://vxture.com/cases/${slug}`,
      image: image,
      locale: locale,
      siteName: 'Vxture',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      image: image,
      site: '@vxture',
    },
    canonical: `https://vxture.com/cases/${slug}`,
    robots: 'index, follow',
  };
};

/**
 * 将 Metadata 转换为 HTML meta 标签
 */
export const metadataToHtmlTags = (metadata: PageMetadata): string => {
  const tags: string[] = [];

  // Basic meta tags
  tags.push(`<title>${metadata.title}</title>`);
  tags.push(`<meta name="description" content="${metadata.description}" />`);

  if (metadata.keywords) {
    tags.push(`<meta name="keywords" content="${metadata.keywords.join(', ')}" />`);
  }

  if (metadata.author) {
    tags.push(`<meta name="author" content="${metadata.author}" />`);
  }

  if (metadata.robots) {
    tags.push(`<meta name="robots" content="${metadata.robots}" />`);
  }

  if (metadata.canonical) {
    tags.push(`<link rel="canonical" href="${metadata.canonical}" />`);
  }

  // Open Graph
  if (metadata.openGraph) {
    const og = metadata.openGraph;
    tags.push(`<meta property="og:title" content="${og.title}" />`);
    tags.push(`<meta property="og:description" content="${og.description}" />`);
    tags.push(`<meta property="og:type" content="${og.type}" />`);
    tags.push(`<meta property="og:locale" content="${og.locale}" />`);

    if (og.url) tags.push(`<meta property="og:url" content="${og.url}" />`);
    if (og.image) tags.push(`<meta property="og:image" content="${og.image}" />`);
    if (og.siteName) tags.push(`<meta property="og:site_name" content="${og.siteName}" />`);
  }

  // Twitter
  if (metadata.twitter) {
    const tw = metadata.twitter;
    tags.push(`<meta name="twitter:card" content="${tw.card}" />`);
    tags.push(`<meta name="twitter:title" content="${tw.title}" />`);
    tags.push(`<meta name="twitter:description" content="${tw.description}" />`);

    if (tw.image) tags.push(`<meta name="twitter:image" content="${tw.image}" />`);
    if (tw.site) tags.push(`<meta name="twitter:site" content="${tw.site}" />`);
    if (tw.creator) tags.push(`<meta name="twitter:creator" content="${tw.creator}" />`);
  }

  return tags.join('\n');
};