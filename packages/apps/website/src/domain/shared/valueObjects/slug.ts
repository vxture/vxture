/**
 * slug.ts - URL 标识符值对象
 *
 * Domain Layer - Shared Value Objects
 *
 * @layer Domain
 * @category Shared - Value Objects
 */

/**
 * Slug 值对象接口
 */
export interface Slug {
  readonly value: string;
}

/**
 * Slug 相关的纯函数
 */
export const SlugHelpers = {
  /**
   * 创建 Slug 实例
   */
  create: (slug: string): Slug => {
    const normalized = SlugHelpers.normalize(slug);
    if (!SlugHelpers.isValid(normalized)) {
      throw new Error(`Invalid slug: ${slug}. Must be lowercase alphanumeric with hyphens.`);
    }
    return { value: normalized };
  },

  /**
   * 从标题生成 Slug
   */
  fromTitle: (title: string): Slug => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // 移除特殊字符
      .replace(/\s+/g, '-') // 空格转连字符
      .replace(/-+/g, '-'); // 多个连字符合并为一个
    return { value: slug };
  },

  /**
   * 标准化 Slug
   */
  normalize: (slug: string): string => {
    return slug.toLowerCase().trim();
  },

  /**
   * 验证 Slug 格式
   */
  isValid: (slug: string): boolean => {
    // 只允许小写字母、数字和连字符
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  },

  /**
   * 值相等性比较
   */
  equals: (a: Slug, b: Slug): boolean => {
    return a.value === b.value;
  },
};