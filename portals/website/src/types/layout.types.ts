/**
 * 布局组件类型定义
 * @package @vxture/website
 * @layer Presentation
 * @category Types
 */

// ============================================================================
// Header 类型
// ============================================================================

export interface HeaderLogo {
  readonly image: string;
  readonly alt: string;
  readonly text: string;
  readonly href?: string;
}

export interface HeaderNavItem {
  readonly href: string;
  readonly label: string;
}

export interface HeaderThemeOption {
  readonly code: string;
  readonly label: string;
}

export interface HeaderTheme {
  readonly title: string;
  readonly enabled?: boolean;
  readonly icon?: string;
  readonly options?: readonly HeaderThemeOption[];
}

export interface HeaderLanguageOption {
  readonly code: string;
  readonly label: string;
}

export interface HeaderLanguage {
  readonly enabled: boolean;
  readonly title: string;
  readonly icon?: string;
  readonly options: readonly HeaderLanguageOption[];
}

export interface HeaderAction {
  readonly href: string;
  readonly label: string;
  readonly variant?: 'primary' | 'secondary';
}

export interface HeaderData {
  readonly key?: string;
  readonly enabled: boolean;
  readonly logo: HeaderLogo | null;
  readonly nav: readonly HeaderNavItem[];
  readonly theme: HeaderTheme;
  readonly language: HeaderLanguage | null;
  readonly actions: readonly HeaderAction[];
}

// ============================================================================
// Footer 类型
// ============================================================================

export interface FooterBrand {
  readonly name: string;
  readonly shortname?: string;
  readonly logo?: string;
  readonly website?: string;
  readonly description?: string;
  readonly foundedYear?: string;
  readonly address?: string;
  readonly timezone?: string;
}

export interface FooterContactItem {
  readonly phone?: string;
  readonly email?: string;
}

export interface FooterContact {
  readonly sales?: FooterContactItem;
  readonly service?: FooterContactItem;
  readonly chat?: {
    readonly link?: string;
    readonly enabled?: boolean;
  };
}

export interface FooterSocial {
  readonly name: string;
  readonly icon: string;
  readonly href: string;
  readonly ariaLabel: string;
}

export interface FooterLink {
  readonly href: string;
  readonly label: string;
}

export interface FooterSection {
  readonly id: string;
  readonly title: string;
  readonly links: readonly FooterLink[];
}

export interface FooterCopyright {
  readonly text: string;
  readonly label?: string;
  readonly startYear?: number;
  readonly endYear?: number;
  readonly companyName?: string;
  readonly allRightsReserved?: boolean;
}

export interface FooterICP {
  readonly text: string;
  readonly link: string;
  readonly label?: string;
}

export interface FooterData {
  readonly key?: string;
  readonly enabled: boolean;
  readonly brand: FooterBrand;
  readonly contact: FooterContact;
  readonly social: readonly FooterSocial[];
  readonly sections: readonly FooterSection[];
  readonly copyright: FooterCopyright;
  readonly legal: readonly FooterLink[];
  readonly icp?: FooterICP | null;
  readonly publicSecurity?: FooterICP | null;
}
