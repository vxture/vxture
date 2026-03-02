/**
 * HeaderMapper.ts - Header 数据映射器
 *
 * Infrastructure Layer - Mappers
 *
 * @layer Infrastructure
 * @category Mappers
 */

import type {
  HeaderContent,
  Logo,
  NavItem,
  Action,
  LanguageConfig,
  LanguageOption,
  ThemeConfig,
} from '@/domain/layout/header.model';

interface HeaderContentRaw {
  key: 'header';
  enabled: boolean;
  logo: {
    text: string;
    image: string;
    alt: string;
    href: string;
  };
  nav: Array<{
    label: string;
    href: string;
  }>;
  actions: Array<{
    label: string;
    href: string;
    variant: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon?: string;
  }>;
  language: {
    enabled: boolean;
    icon: string;
    title: string;
    options: Array<{
      code: string;
      label: string;
    }>;
  };
  theme: {
    enabled: boolean;
    icon: string;
    title: string;
    options: Array<{
      code: 'light' | 'dark';
      label: string;
    }>;
  };
}

export const HeaderMapper = {
  mapLogo: (raw: {
    text: string;
    image: string;
    alt: string;
    href: string;
  }): Logo => ({
    text: raw.text,
    image: raw.image,
    alt: raw.alt,
    href: raw.href,
  }),

  mapNavItem: (raw: { label: string; href: string }): NavItem => ({
    label: raw.label,
    href: raw.href,
  }),

  mapAction: (raw: {
    label: string;
    href: string;
    variant: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon?: string;
  }): Action => ({
    label: raw.label,
    href: raw.href,
    variant: raw.variant,
    icon: raw.icon,
  }),

  mapLanguageOption: (raw: { code: string; label: string }): LanguageOption => ({
    code: raw.code,
    label: raw.label,
  }),

  mapThemeConfig: (raw: {
    enabled: boolean;
    icon: string;
    title: string;
    options: Array<{ code: 'light' | 'dark'; label: string }>;
  }): ThemeConfig => ({
    enabled: raw.enabled,
    icon: raw.icon,
    title: raw.title,
    options: raw.options,
  }),

  mapLanguageConfig: (raw: {
    enabled: boolean;
    icon: string;
    title: string;
    options: Array<{ code: string; label: string }>;
  }): LanguageConfig => ({
    enabled: raw.enabled,
    icon: raw.icon,
    title: raw.title,
    options: raw.options.map(HeaderMapper.mapLanguageOption),
  }),

  toDomain: (raw: HeaderContentRaw): HeaderContent => ({
    key: 'header',
    enabled: raw.enabled,
    logo: HeaderMapper.mapLogo(raw.logo),
    nav: raw.nav.map(HeaderMapper.mapNavItem),
    actions: raw.actions.map(HeaderMapper.mapAction),
    language: HeaderMapper.mapLanguageConfig(raw.language),
    theme: HeaderMapper.mapThemeConfig(raw.theme),
  }),

  fromDomain: (domain: HeaderContent): HeaderContentRaw => ({
    key: 'header',
    enabled: domain.enabled,
    logo: {
      text: domain.logo.text,
      image: domain.logo.image,
      alt: domain.logo.alt,
      href: domain.logo.href,
    },
    nav: domain.nav.map(item => ({
      label: item.label,
      href: item.href,
    })),
    actions: domain.actions.map(action => ({
      label: action.label,
      href: action.href,
      variant: action.variant,
      icon: action.icon,
    })),
    language: {
      enabled: domain.language.enabled,
      icon: domain.language.icon,
      title: domain.language.title,
      options: domain.language.options.map(opt => ({
        code: opt.code,
        label: opt.label,
      })),
    },
    theme: {
      enabled: domain.theme.enabled,
      icon: domain.theme.icon,
      title: domain.theme.title,
      options: domain.theme.options.map(opt => ({
        code: opt.code,
        label: opt.label,
      })),
    },
  }),
};