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
  description?: string;
  icon: string;
  intent?: string;
  theme: string;
  variant: string;
  highlights: string[];
  cta: {
    label: string;
    href: string;
  };
}

interface FeaturesContentRaw {
  key: 'features';
  enabled: boolean;
  title: string;
  subtitle: string;
  icon: string;
  tagline: string;
  items: FeatureItemRaw[];
}

export const FeaturesMapper = {
  mapFeatureItem: (raw: FeatureItemRaw): FeatureItem => ({
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description || '',
    icon: raw.icon,
    intent: raw.intent,
    theme: raw.theme,
    variant: raw.variant,
    highlights: raw.highlights,
    cta: {
      label: raw.cta.label,
      href: raw.cta.href,
    },
  }),

  toDomain: (raw: FeaturesContentRaw): FeaturesContent => ({
    key: 'features',
    enabled: raw.enabled,
    title: raw.title,
    subtitle: raw.subtitle,
    icon: raw.icon,
    tagline: raw.tagline,
    items: raw.items.map(FeaturesMapper.mapFeatureItem),
  }),

  fromDomain: (domain: FeaturesContent): FeaturesContentRaw => ({
    key: 'features',
    enabled: domain.enabled,
    title: domain.title,
    subtitle: domain.subtitle,
    icon: domain.icon,
    tagline: domain.tagline,
    items: domain.items.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      icon: item.icon,
      intent: item.intent,
      theme: item.theme,
      variant: item.variant,
      highlights: item.highlights,
      cta: {
        label: item.cta.label,
        href: item.cta.href,
      },
    })),
  }),
};