/**
 * cases.model.ts - Cases 区块领域模型
 *
 * Domain Layer - Homepage Domain
 *
 * 职责：
 * - 定义最佳实践展示区块的领域模型
 * - 封装案例项的业务逻辑
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
 * Case 项接口
 */
export interface CaseItem extends ContentItem {
  readonly intent: string;
  readonly theme: string;
  readonly variant: string;
  readonly tags: string[];
  readonly cover: Cover;
  readonly publishedAt: string;
}

/**
 * Cases 内容接口
 */
export interface CasesContent extends ContentEntity {
  readonly key: 'cases';
  readonly title: string;
  readonly subtitle: string;
  readonly tagline: string;
  readonly ui?: {
    readonly viewDetails: string;
    readonly moreText: string;
  };
  readonly items: CaseItem[];
}

// ============================================================================
// 纯函数辅助
// ============================================================================

/**
 * CaseItem 辅助函数
 */
export const CaseItemHelpers = {
  /**
   * 检查是否有特定标签
   */
  hasTag: (item: CaseItem, tag: string): boolean => {
    return item.tags.some(t => t.toLowerCase() === tag.toLowerCase());
  },

  /**
   * 获取发布日期
   */
  getPublishedDate: (item: CaseItem): Date => {
    return new Date(item.publishedAt);
  },

  /**
   * 检查是否在指定日期之后发布
   */
  isPublishedAfter: (item: CaseItem, date: Date): boolean => {
    return CaseItemHelpers.getPublishedDate(item) > date;
  },

  /**
   * 检查是否在指定日期之前发布
   */
  isPublishedBefore: (item: CaseItem, date: Date): boolean => {
    return CaseItemHelpers.getPublishedDate(item) < date;
  },

  /**
   * 获取发布时间距今的天数
   */
  getDaysSincePublished: (item: CaseItem): number => {
    const now = new Date();
    const published = CaseItemHelpers.getPublishedDate(item);
    const diff = now.getTime() - published.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },
};

/**
 * CasesContent 辅助函数
 */
export const CasesHelpers = {
  /**
   * 获取案例数量
   */
  getItemCount: (cases: CasesContent): number => {
    return cases.items.length;
  },

  /**
   * 根据标签过滤案例
   */
  filterByTags: (cases: CasesContent, tags: string[]): CaseItem[] => {
    return cases.items.filter(item =>
      tags.some(tag => CaseItemHelpers.hasTag(item, tag))
    );
  },

  /**
   * 按发布日期排序（最新优先）
   */
  sortByPublishedDate: (cases: CasesContent, ascending = false): CaseItem[] => {
    return [...cases.items].sort((a, b) => {
      const dateA = CaseItemHelpers.getPublishedDate(a).getTime();
      const dateB = CaseItemHelpers.getPublishedDate(b).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  },

  /**
   * 获取最新的案例
   */
  getLatestCases: (cases: CasesContent, count: number): CaseItem[] => {
    return CasesHelpers.sortByPublishedDate(cases).slice(0, count);
  },

  /**
   * 获取指定日期范围内的案例
   */
  getCasesByDateRange: (cases: CasesContent, startDate: Date, endDate: Date): CaseItem[] => {
    return cases.items.filter(item => {
      const publishedDate = CaseItemHelpers.getPublishedDate(item);
      return publishedDate >= startDate && publishedDate <= endDate;
    });
  },

  /**
   * 根据 slug 查找案例
   */
  findBySlug: (cases: CasesContent, slug: string): CaseItem | undefined => {
    return cases.items.find(item => item.slug === slug);
  },

  /**
   * 验证 Cases 内容
   */
  validate: (cases: CasesContent): ValidationResult => {
    const errors: string[] = [];

    if (!cases.title?.trim()) {
      errors.push('Cases title is required');
    }

    if (!cases.items || cases.items.length === 0) {
      errors.push('Cases must have at least one item');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};