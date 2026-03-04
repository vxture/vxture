/**
 * contentService.ts
 *
 * 功能：
 * - 提供内容相关的高级业务逻辑和工具函数
 * - 封装常见的内容操作模式
 * - 支持批量操作、预加载、内容验证等
 *
 * 用途：
 * - 供组件和 Hook 使用的高级内容服务
 * - 处理复杂的内容加载场景
 * - 提供内容转换和验证功能
 *
 * 依赖/调用关系：
 * - 依赖 contentClient 进行底层数据获取
 * - 被组件和自定义 Hook 调用
 *
 * 设计规范：
 * - 只包含业务逻辑，不包含状态管理
 * - 所有方法都是纯函数或异步函数
 * - 提供清晰的错误处理
 *
 * @file contentService.ts
 * @desc 内容服务层，提供高级内容操作功能
 * @author vxture team
 * @created 2025-02-12
 * @lastModified 2025-02-12
 * @modifiedBy Claude
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies contentClient
 * @see src/clients/contentClient.ts
 * @tags content, service
 * @example
 *   import { contentService } from '@/infrastructure/adapters/content/contentService';
 *   const data = await contentService.preloadPageContent('home', 'zh-CN');
 * @remarks
 *   这是一个可选的服务层，用于处理复杂的内容操作场景
 * @todo
 *   - 添加内容预取策略
 *   - 支持内容版本管理
 *   - 添加内容分析工具
 */

import { contentClient } from '@/infrastructure/clients/contentClient';
import type {
  ContentKey,
  ContentTypeMap,
  AnyContent,
  FeaturesContent,
  SolutionsContent,
  CasesContent,
} from '@/shared/types/content.types';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 页面内容配置
 */
interface PageContentConfig {
  layout: Array<'header' | 'footer'>;
  sections: Array<'hero' | 'features' | 'solutions' | 'cases' | 'cta'>;
}

/**
 * 预定义的页面配置
 */
const PAGE_CONFIGS: Record<string, PageContentConfig> = {
  home: {
    layout: ['header', 'footer'],
    sections: ['hero', 'features', 'solutions', 'cases', 'cta'],
  },
  about: {
    layout: ['header', 'footer'],
    sections: ['hero', 'features'],
  },
  products: {
    layout: ['header', 'footer'],
    sections: ['hero', 'solutions'],
  },
  cases: {
    layout: ['header', 'footer'],
    sections: ['hero', 'cases'],
  },
};

/**
 * 批量加载结果
 */
interface BatchLoadResult {
  success: AnyContent[];
  errors: Array<{ key: string; error: Error }>;
}

/**
 * 内容验证结果
 */
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ============================================================================
// ContentService 类
// ============================================================================

class ContentService {
  /**
   * 批量获取多个内容
   * @param keys 内容键名数组
   * @param locale 语言
   * @returns 批量加载结果
   */
  async batchLoad(keys: ContentKey[], locale: string): Promise<BatchLoadResult> {
    const results = await Promise.allSettled(
      keys.map((key) => contentClient.getContent(key, locale))
    );

    const success: AnyContent[] = [];
    const errors: Array<{ key: string; error: Error }> = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        success.push(result.value as AnyContent);
      } else {
        errors.push({
          key: keys[index],
          error: result.reason,
        });
      }
    });

    return { success, errors };
  }

  /**
   * 预加载页面所需的所有内容
   * @param pageName 页面名称 (home, about, products, cases)
   * @param locale 语言
   * @returns 批量加载结果
   */
  async preloadPageContent(pageName: string, locale: string): Promise<BatchLoadResult> {
    const config = PAGE_CONFIGS[pageName];

    if (!config) {
      throw new Error(`Unknown page: ${pageName}. Available pages: ${Object.keys(PAGE_CONFIGS).join(', ')}`);
    }

    const allKeys = [...config.layout, ...config.sections] as ContentKey[];
    return this.batchLoad(allKeys, locale);
  }

  /**
   * 获取启用的内容（过滤掉 enabled: false 的内容）
   * @param key 内容键名
   * @param locale 语言
   * @returns 内容数据或 null
   */
  async getEnabledContent<K extends ContentKey>(
    key: K,
    locale: string
  ): Promise<ContentTypeMap[K] | null> {
    try {
      const content = await contentClient.getContent(key, locale);

      // 检查 enabled 字段
      if (typeof content === 'object' && content !== null && 'enabled' in content) {
        if (content.enabled === false) {
          console.info(`Content "${key}" is disabled`);
          return null;
        }
      }

      return content;
    } catch (error) {
      console.error(`Failed to load content: ${key}.${locale}`, error);
      throw error;
    }
  }

  /**
   * 验证内容数据结构
   * @param content 内容数据
   * @param key 内容键名
   * @returns 验证结果
   */
  validateContent(content: unknown, key: ContentKey): ValidationResult {
    const errors: string[] = [];

    // 基础验证
    if (typeof content !== 'object' || content === null) {
      errors.push('Content must be an object');
      return { valid: false, errors };
    }

    const data = content as Record<string, unknown>;

    // 验证必需字段
    if (!('key' in data)) {
      errors.push('Missing required field: key');
    } else if (data.key !== key) {
      errors.push(`Key mismatch: expected "${key}", got "${data.key}"`);
    }

    if (!('enabled' in data)) {
      errors.push('Missing required field: enabled');
    } else if (typeof data.enabled !== 'boolean') {
      errors.push('Field "enabled" must be a boolean');
    }

    // 根据内容类型进行特定验证
    switch (key) {
      case 'hero':
        if (!('title' in data)) errors.push('Hero: missing title');
        if (!('description' in data)) errors.push('Hero: missing description');
        break;
      case 'features':
        if (!('items' in data)) errors.push('Features: missing items array');
        break;
      case 'solutions':
        if (!('items' in data)) errors.push('Solutions: missing items array');
        break;
      case 'cases':
        if (!('items' in data)) errors.push('Cases: missing items array');
        break;
      case 'cta':
        if (!('actions' in data)) errors.push('CTA: missing actions array');
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 获取内容项数量（用于列表类内容）
   * @param content 内容数据
   * @returns 项数量
   */
  getItemCount(content: FeaturesContent | SolutionsContent | CasesContent): number {
    return content.items?.length || 0;
  }

  /**
   * 过滤内容项（根据条件）
   * @param content 内容数据
   * @param predicate 过滤条件
   * @returns 过滤后的内容
   */
  filterItems<T extends FeaturesContent | SolutionsContent | CasesContent>(
    content: T,
    predicate: (item: T['items'][number]) => boolean
  ): T {
    return {
      ...content,
      items: content.items.filter(predicate),
    };
  }

  /**
   * 按标签过滤内容（Solutions 和 Cases）
   * @param content 内容数据
   * @param tags 标签数组
   * @returns 过滤后的内容
   */
  filterByTags<T extends SolutionsContent | CasesContent>(
    content: T,
    tags: string[]
  ): T {
    return this.filterItems(content, (item) =>
      item.tags.some((tag) => tags.includes(tag))
    );
  }

  /**
   * 搜索内容项（根据标题和描述）
   * @param content 内容数据
   * @param query 搜索关键词
   * @returns 过滤后的内容
   */
  searchItems<T extends FeaturesContent | SolutionsContent | CasesContent>(
    content: T,
    query: string
  ): T {
    const lowerQuery = query.toLowerCase();

    return this.filterItems(content, (item) => {
      const titleMatch = item.title.toLowerCase().includes(lowerQuery);
      const descMatch = item.description?.toLowerCase().includes(lowerQuery);
      return titleMatch || descMatch || false;
    });
  }

  /**
   * 清除所有内容缓存
   */
  clearAllCache(): void {
    contentClient.clearCache();
  }

  /**
   * 清除特定内容的缓存
   * @param key 内容键名
   * @param locale 语言（可选）
   */
  clearCacheFor(key: ContentKey, locale?: string): void {
    contentClient.clearCacheFor(key, locale);
  }

  /**
   * 预热缓存（预加载常用内容）
   * @param locale 语言
   */
  async warmupCache(locale: string): Promise<void> {
    const commonKeys: ContentKey[] = ['header', 'footer', 'hero'];

    await Promise.allSettled(
      commonKeys.map((key) => contentClient.getContent(key, locale))
    );

    console.info(`Cache warmed up for locale: ${locale}`);
  }
}

// ============================================================================
// 导出单例
// ============================================================================

export const contentService = new ContentService();

// ============================================================================
// 便捷函数导出
// ============================================================================

/**
 * 批量加载内容
 */
export const batchLoadContent = (keys: ContentKey[], locale: string) =>
  contentService.batchLoad(keys, locale);

/**
 * 预加载页面内容
 */
export const preloadPageContent = (pageName: string, locale: string) =>
  contentService.preloadPageContent(pageName, locale);

/**
 * 获取启用的内容
 */
export const getEnabledContent = <K extends ContentKey>(key: K, locale: string) =>
  contentService.getEnabledContent(key, locale);

/**
 * 验证内容
 */
export const validateContent = (content: unknown, key: ContentKey) =>
  contentService.validateContent(content, key);

/**
 * 清除缓存
 */
export const clearContentCache = () => contentService.clearAllCache();

/**
 * 预热缓存
 */
export const warmupContentCache = (locale: string) => contentService.warmupCache(locale);
