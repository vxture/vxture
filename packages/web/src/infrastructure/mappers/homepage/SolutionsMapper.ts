/**
 * SolutionsMapper.ts - Solutions 数据映射器
 *
 * Infrastructure Layer - Mappers
 *
 * @layer Infrastructure
 * @category Mappers
 */

import type { SolutionsContent, SolutionItem } from '@/domain/homepage/solutions.model';
import type { Cover } from '@/domain/shared/types';

interface SolutionItemRaw {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  intent: string;
  theme: string;
  variant: string;
  tags: string[];
  cover: {
    url: string;
    alt: string;
  };
  capabilities: string[];
}

interface SolutionsContentRaw {
  key: 'solutions';
  enabled: boolean;
  title: string;
  subtitle: string;
  items: SolutionItemRaw[];
}

export const SolutionsMapper = {
  mapCover: (raw: { url: string; alt: string }): Cover => ({
    url: raw.url,
    alt: raw.alt,
  }),

  mapSolutionItem: (raw: SolutionItemRaw): SolutionItem => ({
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    subtitle: raw.subtitle,
    description: raw.description,
    intent: raw.intent,
    theme: raw.theme,
    variant: raw.variant,
    tags: raw.tags,
    cover: SolutionsMapper.mapCover(raw.cover),
    capabilities: raw.capabilities,
  }),

  toDomain: (raw: SolutionsContentRaw): SolutionsContent => ({
    key: 'solutions',
    enabled: raw.enabled,
    title: raw.title,
    subtitle: raw.subtitle,
    items: raw.items.map(SolutionsMapper.mapSolutionItem),
  }),

  fromDomain: (domain: SolutionsContent): SolutionsContentRaw => ({
    key: 'solutions',
    enabled: domain.enabled,
    title: domain.title,
    subtitle: domain.subtitle,
    items: domain.items.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      intent: item.intent,
      theme: item.theme,
      variant: item.variant,
      tags: item.tags,
      cover: {
        url: item.cover.url,
        alt: item.cover.alt,
      },
      capabilities: item.capabilities,
    })),
  }),
};