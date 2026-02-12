/**
 * HeroMapper.ts - Hero 数据映射器
 *
 * Infrastructure Layer - Mappers
 *
 * @layer Infrastructure
 * @category Mappers
 */

import type { HeroContent, CTA } from '@/domain/homepage/hero.model';
import type { Media } from '@/domain/shared/types';

interface HeroContentRaw {
  key: 'hero';
  enabled: boolean;
  title: string;
  titleHighlight: string;
  description: string;
  theme: string;
  intent: string;
  variant: string;
  cta: {
    label: string;
    href: string;
  };
  media: {
    type: 'image' | 'video';
    url?: string;
    videoUrl?: string;
    posterImage?: string;
    alt?: string;
  };
}

export const HeroMapper = {
  mapCTA: (raw: { label: string; href: string }): CTA => ({
    label: raw.label,
    href: raw.href,
  }),

  mapMedia: (raw: {
    type: 'image' | 'video';
    url?: string;
    videoUrl?: string;
    posterImage?: string;
    alt?: string;
  }): Media => ({
    type: raw.type,
    url: raw.url,
    videoUrl: raw.videoUrl,
    posterImage: raw.posterImage,
    alt: raw.alt,
  }),

  toDomain: (raw: HeroContentRaw): HeroContent => ({
    key: 'hero',
    enabled: raw.enabled,
    title: raw.title,
    titleHighlight: raw.titleHighlight,
    description: raw.description,
    theme: raw.theme,
    intent: raw.intent,
    variant: raw.variant,
    cta: HeroMapper.mapCTA(raw.cta),
    media: HeroMapper.mapMedia(raw.media),
  }),

  fromDomain: (domain: HeroContent): HeroContentRaw => ({
    key: 'hero',
    enabled: domain.enabled,
    title: domain.title,
    titleHighlight: domain.titleHighlight,
    description: domain.description,
    theme: domain.theme,
    intent: domain.intent,
    variant: domain.variant,
    cta: {
      label: domain.cta.label,
      href: domain.cta.href,
    },
    media: {
      type: domain.media.type,
      url: domain.media.url,
      videoUrl: domain.media.videoUrl,
      posterImage: domain.media.posterImage,
      alt: domain.media.alt,
    },
  }),
};