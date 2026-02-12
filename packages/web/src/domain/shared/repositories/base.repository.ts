/**
 * base.repository.ts - 仓储基础接口
 *
 * Domain Layer - Shared Repositories
 *
 * 职责：
 * - 定义所有仓储的基础契约
 * - 提供通用的 CRUD 操作接口
 *
 * @layer Domain
 * @category Shared - Repositories
 */

/**
 * 仓储基础接口
 * 所有具体仓储接口都应该继承此接口
 */
export interface IRepository<T, K = string> {
  /**
   * 根据 ID 查找实体
   */
  findById(id: K): Promise<T | null>;

  /**
   * 查找所有实体
   */
  findAll(): Promise<T[]>;

  /**
   * 检查实体是否存在
   */
  exists(id: K): Promise<boolean>;

  /**
   * 清除缓存
   */
  clearCache(id?: K): void;
}

/**
 * 内容仓储基础接口
 * 针对内容类型的特殊接口
 */
export interface IContentRepository<T> {
  /**
   * 根据语言获取内容
   */
  getByLocale(locale: string): Promise<T>;

  /**
   * 批量获取多个语言的内容
   */
  getBatchByLocales(locales: string[]): Promise<Map<string, T>>;

  /**
   * 检查内容是否存在
   */
  exists(locale: string): Promise<boolean>;

  /**
   * 清除缓存
   */
  clearCache(locale?: string): void;
}