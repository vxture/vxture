/**
 * FeaturesMapper.ts - Features 数据映射器
 *
 * Infrastructure Layer - Mappers
 *
 * @layer Infrastructure
 * @category Mappers
 */

import type { FeaturesContent, FeatureItem } from '@/domain/homepage/features.model';

interface FeatureItemRaw {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description?: string;
  icon: string;
  intent?: string;
  theme: string;
  variant: string;
  highlights: string[];
}

interface FeaturesContentRaw {
  key: 'features';
  enabled: boolean;
  title: string;
  subtitle: string;
  icon: string;
  cta: {
    label: string;
    href: string;
  };
  items: FeatureItemRaw[];
}

export const FeaturesMapper = {
  mapFeatureItem: (raw: FeatureItemRaw): FeatureItem => ({
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    subtitle: raw.subtitle,
    description: raw.description || '',
    icon: raw.icon,
    intent: raw.intent,
    theme: raw.theme,
    variant: raw.variant,
    highlights: raw.highlights,
  }),

  toDomain: (raw: FeaturesContentRaw): FeaturesContent => ({
    key: 'features',
    enabled: raw.enabled,
    title: raw.title,
    subtitle: raw.subtitle,
    icon: raw.icon,
    cta: {
      label: raw.cta.label,
      href: raw.cta.href,
    },
    items: raw.items.map(FeaturesMapper.mapFeatureItem),
  }),

  fromDomain: (domain: FeaturesContent): FeaturesContentRaw => ({
    key: 'features',
    enabled: domain.enabled,
    title: domain.title,
    subtitle: domain.subtitle,
    icon: domain.icon,
    cta: {
      label: domain.cta.label,
      href: domain.cta.href,
    },
    items: domain.items.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      icon: item.icon,
      intent: item.intent,
      theme: item.theme,
      variant: item.variant,
      highlights: item.highlights,
    })),
  }),
};