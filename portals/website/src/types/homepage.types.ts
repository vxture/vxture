/**
 * 首页相关类型定义
 * @package @vxture/website
 * @layer Presentation
 * @category Types
 */

// ============================================================================
// Hero 区块类型
// ============================================================================

export interface HeroMedia {
  readonly type: 'video' | 'image' | 'none';
  readonly videoUrl?: string;
  readonly posterImage?: string;
  readonly url?: string;
  readonly alt?: string;
}

export interface HeroCTA {
  readonly label: string;
  readonly href: string;
}

export interface HeroScrollIndicator {
  readonly enabled: boolean;
  readonly text?: string;
}

export interface HeroData {
  readonly key?: string;
  readonly enabled: boolean;
  readonly title: string;
  readonly titleHighlight?: string;
  readonly description?: string;
  readonly media: HeroMedia;
  readonly cta?: HeroCTA;
  readonly scrollIndicator?: HeroScrollIndicator;
}

// ============================================================================
// Features 区块类型
// ============================================================================

export interface FeatureItem {
  readonly id: string;
  readonly slug: string;
  readonly icon?: string;
  readonly intent?: string;
  readonly theme?: string;
  readonly variant?: string;
  readonly title: string;
  readonly description: string;
  readonly highlights: readonly string[];
  readonly cta: { readonly label: string; readonly href: string };
}

export interface FeaturesData {
  readonly key?: string;
  readonly enabled: boolean;
  readonly icon?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly tagline?: string;
  readonly items: readonly FeatureItem[];
}

// ============================================================================
// Cases 区块类型
// ============================================================================

export interface CaseItem {
  readonly id: string;
  readonly slug: string;
  readonly intent?: string;
  readonly theme?: string;
  readonly variant?: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly cover: {
    readonly url: string;
    readonly alt: string;
  };
  readonly customer?: string;
  readonly publishedAt: string;
  readonly cta: {
    readonly href: string;
  };
}

export interface CasesUI {
  readonly viewDetails: string;
}

export interface CasesData {
  readonly key?: string;
  readonly enabled: boolean;
  readonly icon?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly tagline?: string;
  readonly items: readonly CaseItem[];
  readonly ui: CasesUI;
}

// ============================================================================
// CTA 区块类型
// ============================================================================

export interface CTAAction {
  readonly label: string;
  readonly href: string;
  readonly variant: 'primary' | 'secondary';
  readonly icon?: string;
}

export interface CTAFeature {
  readonly id: string;
  readonly icon?: string;
  readonly name: string;
  readonly description: string;
  readonly theme?: string;
}

export interface CTAContact {
  readonly description: string;
  readonly email?: {
    readonly icon?: string;
    readonly value: string;
  };
  readonly phone?: {
    readonly icon?: string;
    readonly value: string;
  };
}

export interface CTAData {
  readonly key?: string;
  readonly enabled: boolean;
  readonly title: string;
  readonly subtitle?: string;
  readonly features?: readonly CTAFeature[];
  readonly actions: readonly CTAAction[];
  readonly contact?: CTAContact;
}

// ============================================================================
// Solution 区块类型
// ============================================================================

export interface SolutionItem {
  readonly id: string;
  readonly slug: string;
  readonly icon?: string;
  readonly intent?: string;
  readonly theme?: string;
  readonly variant?: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly capabilities?: readonly string[];
  readonly cover: {
    readonly url: string;
    readonly alt: string;
  };
  readonly bgImage?: {
    readonly url: string;
    readonly alt: string;
  };
  readonly cta: {
    readonly href: string;
  };
}

export interface SolutionsData {
  readonly key?: string;
  readonly enabled: boolean;
  readonly icon?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly tagline?: string;
  readonly featuresTitle?: string;
  readonly items: readonly SolutionItem[];
  readonly ui: {
    readonly viewDetails: string;
    readonly prev: string;
    readonly next: string;
  };
}
