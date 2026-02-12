/**
 * solutions.model.ts - Solutions 区块领域模型
 *
 * Domain Layer - Homepage Domain
 *
 * 职责：
 * - 定义产品方案展示区块的领域模型
 * - 封装方案项的业务逻辑
 *
 * @layer Domain
 * @category Homepage
 */

import type { ContentEntity, ContentItem } from '../shared/types/content.types';
import type { ValidationResult, Cover } from '../shared/types';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * Solution 项接口
 */
export interface SolutionItem extends ContentItem {
  readonly subtitle: string;
  readonly intent: string;
  readonly theme: string;
  readonly variant: string;
  readonly tags: string[];
  readonly cover: Cover;
  readonly capabilities: string[];
}

/**
 * Solutions 内容接口
 */
export interface SolutionsContent extends ContentEntity {
  readonly key: 'solutions';
  readonly title: string;
  readonly subtitle: string;
  readonly items: SolutionItem[];
}

// ============================================================================
// 纯函数辅助
// ============================================================================

/**
 * SolutionItem 辅助函数
 */
export const SolutionItemHelpers = {
  /**
   * 检查是否有特定标签
   */
  hasTag: (item: SolutionItem, tag: string): boolean => {
    return item.tags.some(t => t.toLowerCase() === tag.toLowerCase());
  },

  /**
   * 检查是否有任意标签
   */
  hasAnyTag: (item: SolutionItem, tags: string[]): boolean => {
    return tags.some(tag => SolutionItemHelpers.hasTag(item, tag));
  },

  /**
   * 获取能力数量
   */
  getCapabilityCount: (item: SolutionItem): number => {
    return item.capabilities.length;
  },

  /**
   * 检查是否有特定能力
   */
  hasCapability: (item: SolutionItem, capability: string): boolean => {
    return item.capabilities.includes(capability);
  },
};

/**
 * SolutionsContent 辅助函数
 */
export const SolutionsHelpers = {
  /**
   * 获取方案数量
   */
  getItemCount: (solutions: SolutionsContent): number => {
    return solutions.items.length;
  },

  /**
   * 根据标签过滤方案
   */
  filterByTags: (solutions: SolutionsContent, tags: string[]): SolutionItem[] => {
    return solutions.items.filter(item => SolutionItemHelpers.hasAnyTag(item, tags));
  },

  /**
   * 根据 slug 查找方案
   */
  findBySlug: (solutions: SolutionsContent, slug: string): SolutionItem | undefined => {
    return solutions.items.find(item => item.slug === slug);
  },

  /**
   * 根据能力过滤方案
   */
  filterByCapability: (solutions: SolutionsContent, capability: string): SolutionItem[] => {
    return solutions.items.filter(item => SolutionItemHelpers.hasCapability(item, capability));
  },

  /**
   * 根据主题过滤方案
   */
  filterByTheme: (solutions: SolutionsContent, theme: string): SolutionItem[] => {
    return solutions.items.filter(item => item.theme === theme);
  },

  /**
   * 验证 Solutions 内容
   */
  validate: (solutions: SolutionsContent): ValidationResult => {
    const errors: string[] = [];

    if (!solutions.title?.trim()) {
      errors.push('Solutions title is required');
    }

    if (!solutions.items || solutions.items.length === 0) {
      errors.push('Solutions must have at least one item');
    }

    return { valid: errors.length === 0, errors };
  },
};
