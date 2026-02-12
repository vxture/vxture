/**
 * CasesMapper.ts - Cases 数据映射器
 *
 * Infrastructure Layer - Mappers
 *
 * 职责：
 * - 将 JSON 原始数据映射为 Domain 模型
 * - 数据验证和转换
 *
 * @layer Infrastructure
 * @category Mappers
 */

import type { CasesContent, CaseItem } from '@/domain/homepage/cases.model';
import type { Cover } from '@/domain/shared/types';

/**
 * JSON 原始数据结构
 */
interface CaseItemRaw {
  id: string;
  slug: string;
  title: string;
  description: string;
  intent: string;
  theme: string;
  variant: string;
  tags: string[];
  cover: {
    url: string;
    alt: string;
  };
  publishedAt: string;
}

interface CasesContentRaw {
  key: 'cases';
  enabled: boolean;
  title: string;
  subtitle: string;
  items: CaseItemRaw[];
}

/**
 * Cases 数据映射器
 */
export const CasesMapper = {
  /**
   * 映射 CaseItem
   */
  mapCaseItem: (raw: CaseItemRaw): CaseItem => {
    return {
      id: raw.id,
      slug: raw.slug,
      title: raw.title,
      description: raw.description,
      intent: raw.intent,
      theme: raw.theme,
      variant: raw.variant,
      tags: raw.tags,
      cover: CasesMapper.mapCover(raw.cover),
      publishedAt: raw.publishedAt,
    };
  },

  /**
   * 映射 Cover
   */
  mapCover: (raw: { url: string; alt: string }): Cover => {
    return {
      url: raw.url,
      alt: raw.alt,
    };
  },

  /**
   * 映射 CasesContent
   */
  toDomain: (raw: CasesContentRaw): CasesContent => {
    return {
      key: 'cases',
      enabled: raw.enabled,
      title: raw.title,
      subtitle: raw.subtitle,
      items: raw.items.map(CasesMapper.mapCaseItem),
    };
  },

  /**
   * 从 Domain 模型转回 JSON 格式（用于持久化）
   */
  fromDomain: (domain: CasesContent): CasesContentRaw => {
    return {
      key: 'cases',
      enabled: domain.enabled,
      title: domain.title,
      subtitle: domain.subtitle,
      items: domain.items.map(item => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: item.description,
        intent: item.intent,
        theme: item.theme,
        variant: item.variant,
        tags: item.tags,
        cover: {
          url: item.cover.url,
          alt: item.cover.alt,
        },
        publishedAt: item.publishedAt,
      })),
    };
  },
};