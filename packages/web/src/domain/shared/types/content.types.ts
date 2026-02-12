/**
 * content.types.ts - 内容领域核心类型
 *
 * Domain Layer - Shared Types
 *
 * 职责：
 * - 定义所有内容实体的核心类型
 * - 提供内容相关的纯函数辅助
 *
 * @layer Domain
 * @category Shared - Types
 */

import type { ValidationResult } from './validation.types';

/**
 * 内容实体基础接口
 * 所有内容类型的共同属性
 */
export interface ContentEntity {
  readonly key: string;
  readonly enabled: boolean;
}

/**
 * 内容项基础接口
 * 用于列表类内容项（Features、Solutions、Cases）
 */
export interface ContentItem {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
}

/**
 * 内容实体辅助函数
 */
export const ContentEntityHelpers = {
  /**
   * 检查内容是否启用
   */
  isEnabled: (entity: ContentEntity): boolean => {
    return entity.enabled;
  },

  /**
   * 验证内容实体
   */
  validate: (entity: ContentEntity): ValidationResult => {
    const errors: string[] = [];

    if (!entity.key || entity.key.trim() === '') {
      errors.push('Content key is required');
    }

    if (typeof entity.enabled !== 'boolean') {
      errors.push('Enabled must be a boolean');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

/**
 * 内容项辅助函数
 */
export const ContentItemHelpers = {
  /**
   * 验证内容项
   */
  validate: (item: ContentItem): ValidationResult => {
    const errors: string[] = [];

    if (!item.id || item.id.trim() === '') {
      errors.push('Item ID is required');
    }

    if (!item.slug || item.slug.trim() === '') {
      errors.push('Item slug is required');
    }

    if (!item.title || item.title.trim() === '') {
      errors.push('Item title is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * 检查 slug 是否匹配
   */
  matchesSlug: (item: ContentItem, slug: string): boolean => {
    return item.slug === slug;
  },

  /**
   * 获取显示标题
   */
  getDisplayTitle: (item: ContentItem): string => {
    return item.title;
  },
};