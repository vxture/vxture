/**
 * FooterMapper.ts - Footer 数据映射器
 *
 * Infrastructure Layer - Mappers
 *
 * @layer Infrastructure
 * @category Mappers
 */

import type {
  FooterContent,
  BrandInfo,
  SocialLink,
  FooterSection,
  FooterLink,
  Copyright,
} from '@/domain/layout/footer.model';

interface FooterContentRaw {
  key: 'footer';
  enabled: boolean;
  brand: {
    text: string;
    email: string;
    phone: string;
  };
  social: Array<{
    name: string;
    icon: string;
    href: string;
    ariaLabel: string;
  }>;
  sections: Array<{
    title: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  }>;
  copyright: {
    text: string;
    year: number;
  };
}

export const FooterMapper = {
  mapBrandInfo: (raw: { text: string; email: string; phone: string }): BrandInfo => ({
    text: raw.text,
    email: raw.email,
    phone: raw.phone,
  }),

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

  mapFooterLink: (raw: { label: string; href: string }): FooterLink => ({
    label: raw.label,
    href: raw.href,
  }),

  mapFooterSection: (raw: {
    title: string;
    links: Array<{ label: string; href: string }>;
  }): FooterSection => ({
    title: raw.title,
    links: raw.links.map(FooterMapper.mapFooterLink),
  }),

  mapCopyright: (raw: { text: string; year: number }): Copyright => ({
    text: raw.text,
    year: raw.year,
  }),

  toDomain: (raw: FooterContentRaw): FooterContent => ({
    key: 'footer',
    enabled: raw.enabled,
    brand: FooterMapper.mapBrandInfo(raw.brand),
    social: raw.social.map(FooterMapper.mapSocialLink),
    sections: raw.sections.map(FooterMapper.mapFooterSection),
    copyright: FooterMapper.mapCopyright(raw.copyright),
  }),

  fromDomain: (domain: FooterContent): FooterContentRaw => ({
    key: 'footer',
    enabled: domain.enabled,
    brand: {
      text: domain.brand.text,
      email: domain.brand.email,
      phone: domain.brand.phone,
    },
    social: domain.social.map((link) => ({
      name: link.name,
      icon: link.icon,
      href: link.href,
      ariaLabel: link.ariaLabel,
    })),
    sections: domain.sections.map((section) => ({
      title: section.title,
      links: section.links.map((link) => ({
        label: link.label,
        href: link.href,
      })),
    })),
    copyright: {
      text: domain.copyright.text,
      year: domain.copyright.year,
    },
  }),
};
