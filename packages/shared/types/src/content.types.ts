/**
 * content.types.ts
 *
 * 功能：
 * - 统一管理所有内容数据相关类型，便于集中维护
 * - 提供各类内容区块的类型定义（Hero、Features、Solutions 等）
 *
 * 用途：
 * - 供 contentClient、useContent Hook、页面组件统一复用
 * - 确保内容数据结构的类型安全
 *
 * 依赖/调用关系：
 * - 被 src/clients/contentClient.ts 用作返回类型
 * - 被 src/hooks/useContent.ts 用于泛型约束
 * - 被页面组件用于 Props 类型
 *
 * 设计规范：
 * - 只存放类型声明，不包含业务逻辑
 * - 类型名称与 JSON 文件结构严格对应
 *
 * @file content.types.ts
 * @desc 内容数据类型定义，与 public/data/ 中的 JSON 结构对应
 * @author vxture team
 * @created 2025-02-12
 * @lastModified 2025-02-12
 * @modifiedBy Claude
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies None
 * @see public/data/ JSON 数据文件
 * @tags content, types, interface
 * @example
 *   import type { HeroContent } from '@/types/content.types';
 *   const hero: HeroContent = ...;
 * @remarks
 *   类型定义应与 JSON Schema 保持同步
 * @todo
 *   - 添加 JSON Schema 验证
 *   - 支持内容版本控制
 */

// ============================================================================
// 基础类型定义
// ============================================================================

/**
 * 内容主题类型
 */
export type ContentTheme = 'primary' | 'secondary' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

/**
 * 内容意图类型
 */
export type ContentIntent = 'cta' | 'solution' | 'case' | 'simulation' | 'feature';

/**
 * 内容变体类型
 */
export type ContentVariant = 'card' | 'grid' | 'list' | 'highlight' | 'default';

/**
 * 按钮变体类型
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';

/**
 * 媒体类型
 */
export type MediaType = 'image' | 'video';

/**
 * 图标名称类型（根据实际使用的图标库定义）
 */
export type IconName = string;

// ============================================================================
// 通用组件类型
// ============================================================================

/**
 * 链接对象
 */
export interface Link {
  label: string;
  href: string;
}

/**
 * 行动按钮
 */
export interface Action extends Link {
  variant: ButtonVariant;
  icon?: IconName;
}

/**
 * CTA 按钮
 */
export interface CTA {
  label: string;
  href: string;
}

/**
 * 媒体对象
 */
export interface Media {
  type: MediaType;
  url?: string;
  videoUrl?: string;
  posterImage?: string;
  alt?: string;
}

/**
 * 封面图片
 */
export interface Cover {
  url: string;
  alt: string;
}

/**
 * 联系方式项
 */
export interface ContactItem {
  icon: IconName;
  value: string;
}

// ============================================================================
// Layout 布局类型
// ============================================================================

/**
 * Logo 配置
 */
export interface Logo {
  text: string;
  image: string;
  alt: string;
  href: string;
}

/**
 * 导航项
 */
export interface NavItem {
  label: string;
  href: string;
}

/**
 * 语言选项
 */
export interface LanguageOption {
  code: string;
  label: string;
}

/**
 * 语言切换配置
 */
export interface LanguageConfig {
  enabled: boolean;
  icon: IconName;
  title: string;
  options: LanguageOption[];
}

/**
 * Header 导航栏数据
 */
export interface HeaderContent {
  key: 'header';
  enabled: boolean;
  logo: Logo;
  nav: NavItem[];
  actions: Action[];
  language: LanguageConfig;
}

/**
 * 品牌信息
 */
export interface BrandInfo {
  text: string;
  email: string;
  phone: string;
}

/**
 * 社交媒体链接
 */
export interface SocialLink {
  name: string;
  icon: IconName;
  href: string;
  ariaLabel: string;
}

/**
 * Footer 区块
 */
export interface FooterSection {
  title: string;
  links: Link[];
}

/**
 * 版权信息
 */
export interface Copyright {
  text: string;
  year: number;
}

/**
 * Footer 页脚数据
 */
export interface FooterContent {
  key: 'footer';
  enabled: boolean;
  brand: BrandInfo;
  social: SocialLink[];
  sections: FooterSection[];
  copyright: Copyright;
}

// ============================================================================
// Sections 页面区块类型
// ============================================================================

/**
 * Hero 英雄区数据
 */
export interface HeroContent {
  key: 'hero';
  enabled: boolean;
  title: string;
  titleHighlight: string;
  description: string;
  theme: ContentTheme;
  intent: ContentIntent;
  variant: ContentVariant;
  cta: CTA;
  media: Media;
}

/**
 * Feature 特性项
 */
export interface FeatureItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description?: string;
  icon: IconName;
  intent?: ContentIntent;
  theme: ContentTheme;
  variant: ContentVariant;
  highlights: string[];
}

/**
 * Features 核心能力数据
 */
export interface FeaturesContent {
  key: 'features';
  enabled: boolean;
  title: string;
  subtitle: string;
  icon: IconName;
  cta: CTA;
  items: FeatureItem[];
}

/**
 * Solution 产品方案项
 */
export interface SolutionItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  intent: ContentIntent;
  theme: ContentTheme;
  variant: ContentVariant;
  tags: string[];
  cover: Cover;
  capabilities: string[];
}

/**
 * Solutions 产品方案数据
 */
export interface SolutionsContent {
  key: 'solutions';
  enabled: boolean;
  title: string;
  subtitle: string;
  items: SolutionItem[];
}

/**
 * Case 案例项
 */
export interface CaseItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  intent: ContentIntent;
  theme: ContentTheme;
  variant: ContentVariant;
  tags: string[];
  cover: Cover;
  publishedAt: string;
  cta?: CTA;
}

/**
 * Cases 最佳实践数据
 */
export interface CasesContent {
  key: 'cases';
  enabled: boolean;
  title: string;
  subtitle: string;
  items: CaseItem[];
}

/**
 * CTA 特性项
 */
export interface CTAFeature {
  name: string;
  description: string;
  icon: IconName;
  theme: ContentTheme;
}

/**
 * CTA 联系方式
 */
export interface CTAContact {
  description: string;
  email: ContactItem;
  phone: ContactItem;
}

/**
 * CTA 行动号召数据
 */
export interface CTAContent {
  key: 'cta';
  enabled: boolean;
  title: string;
  subtitle: string;
  features: CTAFeature[];
  actions: Action[];
  contact: CTAContact;
}

// ============================================================================
// 联合类型和工具类型
// ============================================================================

/**
 * 所有内容类型的联合类型
 */
export type AnyContent =
  | HeaderContent
  | FooterContent
  | HeroContent
  | FeaturesContent
  | SolutionsContent
  | CasesContent
  | CTAContent;

/**
 * 内容键名类型
 */
export type ContentKey = AnyContent['key'];

/**
 * 根据键名获取对应的内容类型
 */
export type ContentByKey<K extends ContentKey> = Extract<AnyContent, { key: K }>;

/**
 * 内容类型映射
 */
export interface ContentTypeMap {
  header: HeaderContent;
  footer: FooterContent;
  hero: HeroContent;
  features: FeaturesContent;
  solutions: SolutionsContent;
  cases: CasesContent;
  cta: CTAContent;
}

// ============================================================================
// API 响应类型
// ============================================================================

/**
 * API 成功响应
 */
export interface ContentResponse<T = AnyContent> {
  success: true;
  data: T;
  timestamp: number;
}

/**
 * API 错误响应
 */
export interface ContentError {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: number;
}

/**
 * API 响应类型（成功或失败）
 */
export type ContentAPIResponse<T = AnyContent> = ContentResponse<T> | ContentError;
