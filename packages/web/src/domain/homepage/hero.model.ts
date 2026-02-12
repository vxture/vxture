/**
 * hero.model.ts - Hero 区块领域模型
 *
 * Domain Layer - Homepage Domain
 *
 * 职责：
 * - 定义 Hero 区块的领域模型和业务规则
 * - 封装首屏展示逻辑
 *
 * @layer Domain
 * @category Homepage
 */

import type { ContentEntity } from '../shared/types/content.types';
import type { ValidationResult, Media } from '../shared/types';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * CTA 按钮接口
 */
export interface CTA {
  readonly label: string;
  readonly href: string;
}

/**
 * Hero 内容接口
 */
export interface HeroContent extends ContentEntity {
  readonly key: 'hero';
  readonly title: string;
  readonly titleHighlight: string;
  readonly description: string;
  readonly theme: string;
  readonly intent: string;
  readonly variant: string;
  readonly cta: CTA;
  readonly media: Media;
}

// ============================================================================
// 纯函数辅助
// ============================================================================

/**
 * CTA 辅助函数
 */
export const CTAHelpers = {
  /**
   * 验证 CTA
   */
  validate: (cta: CTA): ValidationResult => {
    const errors: string[] = [];
    if (!cta.label?.trim()) errors.push('CTA label is required');
    if (!cta.href?.trim()) errors.push('CTA href is required');
    return { valid: errors.length === 0, errors };
  },
};

/**
 * HeroContent 辅助函数
 */
export const HeroHelpers = {
  /**
   * 获取完整标题（包含高亮部分）
   */
  getFullTitle: (hero: HeroContent): string => {
    return `${hero.title} ${hero.titleHighlight}`;
  },

  /**
   * 检查是否有视频媒体
   */
  hasVideo: (hero: HeroContent): boolean => {
    return hero.media.type === 'video' && !!hero.media.videoUrl;
  },

  /**
   * 检查是否有图片媒体
   */
  hasImage: (hero: HeroContent): boolean => {
    return hero.media.type === 'image' && !!hero.media.url;
  },

  /**
   * 验证 Hero 内容
   */
  validate: (hero: HeroContent): ValidationResult => {
    const errors: string[] = [];

    if (!hero.title?.trim()) {
      errors.push('Hero title is required');
    }

    if (!hero.description?.trim()) {
      errors.push('Hero description is required');
    }

    // 验证 CTA
    const ctaResult = CTAHelpers.validate(hero.cta);
    if (!ctaResult.valid) {
      errors.push(...ctaResult.errors);
    }

    // 验证媒体
    if (!hero.media) {
      errors.push('Hero media is required');
    } else if (hero.media.type === 'video' && !hero.media.videoUrl) {
      errors.push('Video URL is required for video media');
    } else if (hero.media.type === 'image' && !hero.media.url) {
      errors.push('Image URL is required for image media');
    }

    return { valid: errors.length === 0, errors };
  },
};
