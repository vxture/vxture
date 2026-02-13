/**
 * features.model.ts - Features 区块领域模型
 *
 * Domain Layer - Homepage Domain
 *
 * 职责：
 * - 定义核心能力展示区块的领域模型
 * - 封装特性项的业务逻辑
 *
 * @layer Domain
 * @category Homepage
 */

import type { ContentEntity, ContentItem } from '../shared/types/content.types';
import type { ValidationResult } from '../shared/types';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * Feature 项接口
 */
export interface FeatureItem extends ContentItem {
  readonly icon: string;
  readonly intent?: string;
  readonly theme: string;
  readonly variant: string;
  readonly highlights: string[];
  readonly cta: { label: string; href: string };
}

/**
 * Features 内容接口
 */
export interface FeaturesContent extends ContentEntity {
  readonly key: 'features';
  readonly title: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly tagline: string;
  readonly items: FeatureItem[];
}

// ============================================================================
// 纯函数辅助
// ============================================================================

/**
 * FeatureItem 辅助函数
 */
export const FeatureItemHelpers = {
  /**
   * 获取高亮点数量
   */
  getHighlightCount: (item: FeatureItem): number => {
    return item.highlights.length;
  },

  /**
   * 检查是否有特定高亮点
   */
  hasHighlight: (item: FeatureItem, text: string): boolean => {
    return item.highlights.some(h => h.toLowerCase().includes(text.toLowerCase()));
  },
};

/**
 * FeaturesContent 辅助函数
 */
export const FeaturesHelpers = {
  /**
   * 获取特性数量
   */
  getItemCount: (features: FeaturesContent): number => {
    return features.items.length;
  },

  /**
   * 根据 slug 查找特性
   */
  findBySlug: (features: FeaturesContent, slug: string): FeatureItem | undefined => {
    return features.items.find(item => item.slug === slug);
  },

  /**
   * 根据 ID 查找特性
   */
  findById: (features: FeaturesContent, id: string): FeatureItem | undefined => {
    return features.items.find(item => item.id === id);
  },

  /**
   * 根据主题过滤特性
   */
  filterByTheme: (features: FeaturesContent, theme: string): FeatureItem[] => {
    return features.items.filter(item => item.theme === theme);
  },

  /**
   * 验证 Features 内容
   */
  validate: (features: FeaturesContent): ValidationResult => {
    const errors: string[] = [];

    if (!features.title?.trim()) {
      errors.push('Features title is required');
    }

    if (!features.items || features.items.length === 0) {
      errors.push('Features must have at least one item');
    }

    return { valid: errors.length === 0, errors };
  },
};
