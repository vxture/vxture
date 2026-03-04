/**
 * CTAMapper.ts - CTA 数据映射器
 *
 * Infrastructure Layer - Mappers
 *
 * @layer Infrastructure
 * @category Mappers
 */

import type {
  CTAContent,
  CTAFeature,
  CTAAction,
  CTAContact,
  ContactItem,
} from '@/domain/homepage/cta.model';

interface CTAContentRaw {
  key: 'cta';
  enabled: boolean;
  title: string;
  subtitle: string;
  features: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    theme: string;
  }>;
  actions: Array<{
    label: string;
    href: string;
    variant: 'primary' | 'secondary' | 'outline';
    icon?: string;
  }>;
  contact: {
    description: string;
    email: {
      icon: string;
      value: string;
    };
    phone: {
      icon: string;
      value: string;
    };
  };
}

export const CTAMapper = {
  mapFeature: (raw: {
    id: string;
    name: string;
    description: string;
    icon: string;
    theme: string;
  }): CTAFeature => ({
    id: raw.id,
    name: raw.name,
    description: raw.description,
    icon: raw.icon,
    theme: raw.theme,
  }),

  mapAction: (raw: {
    label: string;
    href: string;
    variant: 'primary' | 'secondary' | 'outline';
    icon?: string;
  }): CTAAction => ({
    label: raw.label,
    href: raw.href,
    variant: raw.variant,
    icon: raw.icon,
  }),

  mapContactItem: (raw: { icon: string; value: string }): ContactItem => ({
    icon: raw.icon,
    value: raw.value,
  }),

  mapContact: (raw: {
    description: string;
    email: { icon: string; value: string };
    phone: { icon: string; value: string };
  }): CTAContact => ({
    description: raw.description,
    email: CTAMapper.mapContactItem(raw.email),
    phone: CTAMapper.mapContactItem(raw.phone),
  }),

  toDomain: (raw: CTAContentRaw): CTAContent => ({
    key: 'cta',
    enabled: raw.enabled,
    title: raw.title,
    subtitle: raw.subtitle,
    features: raw.features.map(CTAMapper.mapFeature),
    actions: raw.actions.map(CTAMapper.mapAction),
    contact: CTAMapper.mapContact(raw.contact),
  }),

  fromDomain: (domain: CTAContent): CTAContentRaw => ({
    key: 'cta',
    enabled: domain.enabled,
    title: domain.title,
    subtitle: domain.subtitle,
    features: domain.features.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      icon: f.icon,
      theme: f.theme,
    })),
    actions: domain.actions.map(a => ({
      label: a.label,
      href: a.href,
      variant: a.variant,
      icon: a.icon,
    })),
    contact: {
      description: domain.contact.description,
      email: {
        icon: domain.contact.email.icon,
        value: domain.contact.email.value,
      },
      phone: {
        icon: domain.contact.phone.icon,
        value: domain.contact.phone.value,
      },
    },
  }),
};